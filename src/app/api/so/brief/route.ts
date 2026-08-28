import { NextResponse } from 'next/server'
import { chatJSON } from '@/lib/llm'
import { MARKETS } from '@/lib/so/markets'
import type { Brief, Extracted, MarketId } from '@/lib/so/types'

export const runtime = 'nodejs'
export const maxDuration = 60

const SYSTEM = `你是中國白酒出口業務的談判顧問，服務對象是貴州仁懷一家中小酒企的外貿專員。
你要根據盡職調查結果，產出一份「首單決策簡報」。只輸出 JSON，一律繁體中文。

判定規則：
- verdict = "go"：訊號一致正向，可進入首單談判。
- verdict = "probe"：有疑點但可談，先問清楚再決定。
- verdict = "hold"：高度疑似套利型買家，或關鍵合規缺口未解，暫緩。

questions 是「必問清單」——寫成可以直接複製貼給對方的問句，每則不超過 40 字，最多 6 則。
必須針對這個買家的具體缺口來問，不要寫通用問題。

reply 是給對方的第一封回信草稿：
- 語言跟對方來訊的語言一致（對方用英文就用英文，用簡體中文就用簡體中文）。
- 300 字以內，專業、不卑不亢、不過度熱情。
- 內容要包含：回應對方的具體要求、把必問清單裡最關鍵的 2–3 個問題自然帶進去、提一句下一步。
- 不要出現「非常榮幸」「期待合作」這類空話。

輸出格式：
{"verdict":"go|probe|hold","headline":"一句話結論，不超過 30 字","reasons":["支撐這個判定的理由，每則不超過 40 字，3–4 則"],"questions":["..."],"reply":"..."}`

export async function POST(req: Request) {
  const body = (await req.json()) as {
    extracted?: Extracted
    market?: MarketId
    riskScore?: number
    riskLabel?: string
    badSignals?: string[]
    price?: { fob: number; landed: number; retail: number; retailLocal: number; taxRate: number; multiple: number }
    raw?: string
  }
  const m = body.market ? MARKETS[body.market] : null

  const ctx = [
    `買家：${body.extracted?.company ?? '未知'}（${body.extracted?.role ?? '身分不明'}）`,
    m ? `目標市場：${m.name}｜買方必備資質：${m.gate}` : '目標市場：未確定',
    m
      ? `該市場買方必須持有：${m.licences.filter((l) => l.who === 'buyer').map((l) => l.name).join('、')}`
      : '',
    m
      ? `你這一側必須備齊：${m.licences.filter((l) => l.who === 'you').map((l) => l.name).join('、')}`
      : '',
    `套利風險評分：${body.riskScore ?? '未評'}／100（${body.riskLabel ?? ''}）`,
    body.badSignals?.length ? `負向訊號：${body.badSignals.join('、')}` : '負向訊號：無',
    body.extracted?.redFlags?.length ? `紅旗：${body.extracted.redFlags.join('；')}` : '',
    body.extracted?.askedFor?.length ? `對方要求你提供：${body.extracted.askedFor.join('；')}` : '',
    body.price
      ? `落地價測算：FOB ${body.price.fob} 元／瓶，完稅落地 ${body.price.landed} 元，終端零售約 ${body.price.retail} 元（${body.price.retailLocal} ${m?.currency ?? ''}），落地稅負約 ${body.price.taxRate}%，終端價為內銷開票價的 ${body.price.multiple} 倍`
      : '',
    body.raw ? `\n對話原文：\n${body.raw.slice(0, 2000)}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  const out = await chatJSON<Brief>(SYSTEM, ctx, 45000)
  if (!out) return NextResponse.json({ error: 'llm_unavailable' }, { status: 503 })
  return NextResponse.json({ brief: out, source: 'ai' })
}
