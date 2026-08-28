'use client'
import { useMemo } from 'react'
import { computePrice } from '@/lib/so/pricing'
import type { PriceResult } from '@/lib/so/pricing'
import type { MarketId } from '@/lib/so/types'
import type { RiskResult } from '@/lib/so/signals'

const fmt = (n: number) => Math.round(n).toLocaleString('en-US')
/** 首单试销与整柜两个尺度。整柜数量为估算：20 尺柜可用容积约 28m³、每箱约 0.014m³ */
const TRIAL_CASES = 100
const FULL_CASES = 2000
const PER_CASE = 6

export function Stakes({
  price, risk, market, dp, ml, abv, logi, margin, chan,
}: {
  price: PriceResult
  risk: RiskResult
  market: MarketId
  dp: number; ml: number; abv: number; logi: number; margin: number
  chan: 'retail' | 'onPremise'
}) {
  const cbmaGap = useMemo(() => {
    if (market !== 'us') return 0
    const a = computePrice({ domesticPrice: dp, ml, abv, logistics: logi, market: 'us', exportMargin: margin, channel: chan })
    const b = computePrice({ domesticPrice: dp, ml, abv, logistics: logi, market: 'us', exportMargin: margin, channel: chan, cbmaAssigned: true })
    return a.landed - b.landed
  }, [market, dp, ml, abv, logi, margin, chan])

  const trialBottles = TRIAL_CASES * PER_CASE
  const fullBottles = FULL_CASES * PER_CASE
  const trialValue = price.fob * trialBottles
  const fullValue = price.fob * fullBottles
  // 卖不掉折价回流：业内常见折价幅度取 30%，另加已付的物流沉没
  const refluxLoss = fullValue * 0.3 + logi * fullBottles

  const rows = [
    {
      k: '试销一单（100 箱）的货值',
      v: trialValue,
      note: `离岸报价 ${fmt(price.fob)} 元 × ${fmt(trialBottles)} 瓶。展会方案常见的「首单保障」就是这个量级。`,
      tone: 'neutral' as const,
    },
    {
      k: '整柜一单（约 2,000 箱）的货值',
      v: fullValue,
      note: `${fmt(fullBottles)} 瓶。开口就要三个柜的买家，谈的是这个数字的三倍。`,
      tone: 'neutral' as const,
    },
    {
      k: '这一柜卖不掉、折价倒回国内的损失',
      v: refluxLoss,
      note: '按折价 30% 加上已付物流估算。还没算价格体系被砸之后，你在这个市场的下一次机会。',
      tone: 'bad' as const,
    },
    ...(cbmaGap > 0
      ? [
          {
            k: '没把 CBMA 额度指派给进口商，白送出去的钱',
            v: cbmaGap * fullBottles,
            note: `每瓶 ${fmt(cbmaGap)} 元 × ${fmt(fullBottles)} 瓶。这个动作不花你一毛钱，只是没人告诉过你要做。`,
            tone: 'bad' as const,
          },
        ]
      : []),
  ]

  return (
    <div className="rounded border border-white/10 bg-white/[0.02] p-4">
      <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-amber">这一单如果判断错了，代价是多少</div>
      <p className="mb-3.5 max-w-[72ch] text-[12px] leading-relaxed text-stone">
        花三分钟看完这份简报的理由，就是下面这几个数字。
        <span className="text-bone">它们不是营销话术，是用你刚才填的报价直接乘出来的。</span>
      </p>
      <div className="space-y-px overflow-hidden rounded border border-white/10 bg-white/8">
        {rows.map((r) => (
          <div key={r.k} className="grid gap-1.5 bg-ink2/60 p-3.5 sm:grid-cols-[1fr_auto] sm:items-start sm:gap-5">
            <div className="min-w-0">
              <div className={`mb-1 text-[12.5px] ${r.tone === 'bad' ? 'text-rose-200' : 'text-bone'}`}>{r.k}</div>
              <p className="text-[11.5px] leading-relaxed text-stone">{r.note}</p>
            </div>
            <span
              className={`shrink-0 font-mono text-[17px] tabular-nums sm:w-[136px] sm:text-right ${
                r.tone === 'bad' ? 'text-rose-300' : 'text-bone'
              }`}
            >
              {fmt(r.v)}
              <span className="ml-1 font-sans text-[10.5px] text-stone">元</span>
            </span>
          </div>
        ))}
      </div>
      {risk.level === 'high' && (
        <p className="mt-3 text-[12px] leading-relaxed text-amber">
          这个买家的套利风险是 {risk.score}。
          <span className="text-bone">上面第三行不是假设，是这一类买家最常见的结局。</span>
        </p>
      )}
      <p className="mt-2.5 text-[10.5px] leading-snug text-stone/55">
        柜量为估算（20 尺柜可用容积约 28m³、每箱 6 瓶 × {ml}ml 约 0.014m³），折价幅度取业内常见的 30%。
        这几个数字用来判断量级，不是报价单。
      </p>
    </div>
  )
}
