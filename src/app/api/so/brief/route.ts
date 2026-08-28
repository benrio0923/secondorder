import { NextResponse } from 'next/server'
import { chatJSON } from '@/lib/llm'
import { deepSimplify } from '@/lib/so/zh'
import { MARKETS } from '@/lib/so/markets'
import type { Brief, Extracted, MarketId } from '@/lib/so/types'

export const runtime = 'nodejs'
export const maxDuration = 60

const SYSTEM = `你是中国白酒出口业务的谈判顾问，服务对象是贵州仁怀一家中小酒企的外贸专员。
你要根据尽职调查结果，产出一份「首单决策简报」。只输出 JSON，一律繁体中文。

判定（verdict）已经由规则引擎算好，会在输入里告诉你。
你的工作不是重新判断，而是**照这个判定写出理由与行动**——
把它原样放进输出的 verdict 栏位，headline 与 reasons 必须与它一致，不得唱反调。
  go = 可进入首单谈判｜probe = 有疑点，先问清楚再决定｜hold = 暂缓

questions 是「必问清单」——写成可以直接复制贴给对方的问句，每则不超过 40 字，最多 6 则。
必须针对这个买家的具体缺口来问，不要写通用问题。

reply 是给对方的第一封回信草稿：
- 语言跟对方来讯的语言一致（对方用英文就用英文，用简体中文就用简体中文）。
- 300 字以内，专业、不卑不亢、不过度热情。
- 内容要包含：回应对方的具体要求、把必问清单里最关键的 2–3 个问题自然带进去、提一句下一步。
- 不要出现「非常荣幸」「期待合作」这类空话。

输出格式：
{"verdict":"go|probe|hold","headline":"一句话结论，不超过 30 字","reasons":["支撑这个判定的理由，每则不超过 40 字，3–4 则"],"questions":["..."],"reply":"..."}`

export async function POST(req: Request) {
  const body = (await req.json()) as {
    extracted?: Extracted
    market?: MarketId
    verdict?: 'go' | 'probe' | 'hold'
    riskScore?: number
    riskLabel?: string
    badSignals?: string[]
    price?: { fob: number; landed: number; retail: number; retailLocal: number; taxRate: number; multiple: number }
    raw?: string
  }
  const m = body.market ? MARKETS[body.market] : null

  const ctx = [
    `买家：${body.extracted?.company ?? '未知'}（${body.extracted?.role ?? '身分不明'}）`,
    m ? `目标市场：${m.name}｜买方必备资质：${m.gate}` : '目标市场：未确定',
    m
      ? `该市场买方必须持有：${m.licences.filter((l) => l.who === 'buyer').map((l) => l.name).join('、')}`
      : '',
    m
      ? `你这一侧必须备齐：${m.licences.filter((l) => l.who === 'you').map((l) => l.name).join('、')}`
      : '',
    `规则引擎的判定：${body.verdict ?? 'probe'}（这是定案，照着写）`,
    `套利风险评分：${body.riskScore ?? '未评'}／100（${body.riskLabel ?? ''}）`,
    body.badSignals?.length ? `负向信号：${body.badSignals.join('、')}` : '负向信号：无',
    body.extracted?.redFlags?.length ? `红旗：${body.extracted.redFlags.join('；')}` : '',
    body.extracted?.askedFor?.length ? `对方要求你提供：${body.extracted.askedFor.join('；')}` : '',
    body.price
      ? `落地价测算：离岸价 ${body.price.fob} 元／瓶，完税落地 ${body.price.landed} 元，终端零售约 ${body.price.retail} 元（${body.price.retailLocal} ${m?.currency ?? ''}），落地税负约 ${body.price.taxRate}%，终端价为内销开票价的 ${body.price.multiple} 倍`
      : '',
    body.raw ? `\n对话原文：\n${body.raw.slice(0, 2000)}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  const out = await chatJSON<Brief>(SYSTEM, ctx, 45000)
  if (!out) return NextResponse.json({ error: 'llm_unavailable' }, { status: 503 })
  // 判定归规则，模型只负责文案——即使它写错了也以规则为准
  const brief: Brief = deepSimplify({ ...out, verdict: body.verdict ?? out.verdict })
  return NextResponse.json({ brief, source: 'ai' })
}
