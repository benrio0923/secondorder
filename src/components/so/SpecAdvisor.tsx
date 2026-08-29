'use client'
import { useMemo } from 'react'
import { computePrice } from '@/lib/so/pricing'
import type { MarketId, Market } from '@/lib/so/types'
import { Num } from './parts'

const fmt = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 0 })

const SPECS = [
  { abv: 53, ml: 500, label: '53° / 500ml', note: '传统酱香主力规格' },
  { abv: 43, ml: 500, label: '43° / 500ml', note: '降度版' },
  { abv: 38, ml: 500, label: '38° / 500ml', note: '低度版' },
  { abv: 19, ml: 500, label: '19° / 500ml', note: '越南 20 度分界以下' },
  { abv: 53, ml: 100, label: '53° / 100ml', note: '小容量尝鲜装（按每 100ml 比价）' },
]

export function SpecAdvisor({
  market, m, domesticPrice, logistics, margin, cbma, channel,
}: { market: MarketId; m: Market; domesticPrice: number; logistics: number; margin: number; cbma: boolean; channel: 'retail' | 'onPremise' }) {
  const rows = useMemo(
    () =>
      SPECS.map((sp) => {
        // 小容量按比例缩放内销开票价
        const dp = domesticPrice * (sp.ml / 500)
        const logi = logistics * (sp.ml === 500 ? 1 : 0.55)
        const r = computePrice({
          domesticPrice: dp, ml: sp.ml, abv: sp.abv, logistics: logi,
          market, exportMargin: margin, cbmaAssigned: cbma, channel,
        })
        return { ...sp, r, taxRate: Math.round((r.taxTotal / r.cif) * 100), per100: r.retailLocal / (sp.ml / 100) }
      }),
    [market, domesticPrice, logistics, margin, cbma, channel],
  )
  const base = rows[0]
  const best = [...rows].sort((a, b) => a.taxRate - b.taxRate)[0]
  const maxTax = Math.max(...rows.map((r) => r.taxRate))

  return (
    <div className="rounded border border-line bg-paper2 p-4">
      <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-amber">
        反推：为了{m.name}这个市场，你该出什么规格的酒
      </div>
      <p className="mb-3.5 max-w-[74ch] text-[11.5px] leading-relaxed text-ink2">
        低度化在产业里常被讲成「迎合年轻人口味」。但在出海这件事上，它首先是一笔帐——
        <span className="text-ink">税是按度数和纯酒精量收的，不是按你的情怀收的。</span>
      </p>

      <div className="space-y-1.5">
        {rows.map((row) => {
          const isBase = row.label === base.label
          const isBest = row.label === best.label && best.taxRate < base.taxRate
          const sameSize = row.ml === base.ml
          const diff = sameSize ? row.r.retailLocal - base.r.retailLocal : row.per100 - base.per100
          return (
            <div
              key={row.label}
              className={`grid grid-cols-[104px_1fr_auto] items-center gap-3 rounded px-2 py-1.5 ${
                isBest ? 'bg-go/45] ring-1 ring-inset ring-emerald-500/25' : isBase ? 'bg-paper2' : ''
              }`}
            >
              <div className="min-w-0">
                <div className={`font-mono text-[11.5px] ${isBest ? 'text-go' : isBase ? 'text-ink' : 'text-ink2'}`}>
                  {row.label}
                </div>
                <div className="truncate text-[10px] text-ink3">{row.note}</div>
              </div>
              <div>
                <div className="mb-1 h-[9px] overflow-hidden rounded-sm bg-paper2">
                  <div
                    className={`h-full rounded-sm ${isBest ? 'bg-go/45' : isBase ? 'bg-amber/70' : 'bg-line2'}`}
                    style={{ width: `${Math.max(2, (row.taxRate / maxTax) * 100)}%`, transition: 'width .5s' }}
                  />
                </div>
                <div className="font-mono text-[10.5px] text-ink3">
                  落地税负 {row.taxRate}% · 终端 {fmt(row.r.retailLocal)} {m.currency}
                  {!sameSize && <span className="text-ink3">（折算每 100ml {fmt(row.per100)}）</span>}
                </div>
              </div>
              <div className="w-[86px] shrink-0 text-right">
                {isBase ? (
                  <span className="font-mono text-[10.5px] text-ink3">现况</span>
                ) : (
                  <span className={`font-mono text-[11.5px] tabular-nums ${diff < 0 ? 'text-go' : 'text-halt'}`}>
                    {diff < 0 ? '−' : '+'}
                    {fmt(Math.abs(diff))}
                    <span className="ml-0.5 text-[9px] text-ink3">{sameSize ? m.currency : '/100ml'}</span>
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-3.5 border-t border-line pt-3 text-[12px] leading-relaxed text-ink2">
        {best.taxRate < base.taxRate ? (
          <>
            在{m.name}，把主力规格从 <Num className="text-ink">{base.label}</Num> 换成{' '}
            <Num className="text-go">{best.label}</Num>，落地税负从{' '}
            <Num className="text-ink">{base.taxRate}%</Num> 降到 <Num className="text-go">{best.taxRate}%</Num>
            ，终端价低 <Num className="text-go">{fmt(Math.abs(best.r.retailLocal - base.r.retailLocal))} {m.currency}</Num>。
            {market === 'vn' && best.abv < 20 && (
              <span className="text-amber">
                {' '}越南的 特别消费税 以 20 度为分界：20 度以上 65%，以下 35%。一度之差，税率差近一半。
              </span>
            )}
            {market === 'sg' && (
              <span className="text-amber"> 新加坡按纯酒精量课税，降度数等于直接少缴税。</span>
            )}
          </>
        ) : (
          <>在{m.name}，税是按货值课的，降度数省不到税——这个市场的解法在定价与渠道层级，不在酒体。</>
        )}
        <p className="mt-1.5 text-[10.5px] leading-snug text-ink3">
          小容量规格的内销开票价按容量比例估算、物流按 0.55 系数估算，仅供规格方向比较。
        </p>
      </div>
    </div>
  )
}
