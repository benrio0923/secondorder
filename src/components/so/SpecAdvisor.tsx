'use client'
import { useMemo } from 'react'
import { computePrice } from '@/lib/so/pricing'
import type { MarketId, Market } from '@/lib/so/types'
import { Num } from './parts'

const fmt = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 0 })

const SPECS = [
  { abv: 53, ml: 500, label: '53° / 500ml', note: '傳統醬香主力規格' },
  { abv: 43, ml: 500, label: '43° / 500ml', note: '降度版' },
  { abv: 38, ml: 500, label: '38° / 500ml', note: '低度版' },
  { abv: 19, ml: 500, label: '19° / 500ml', note: '越南 20 度分界以下' },
  { abv: 53, ml: 100, label: '53° / 100ml', note: '小容量嘗鮮裝（按每 100ml 比價）' },
]

export function SpecAdvisor({
  market, m, domesticPrice, logistics, margin, cbma,
}: { market: MarketId; m: Market; domesticPrice: number; logistics: number; margin: number; cbma: boolean }) {
  const rows = useMemo(
    () =>
      SPECS.map((sp) => {
        // 小容量按比例縮放內銷開票價
        const dp = domesticPrice * (sp.ml / 500)
        const logi = logistics * (sp.ml === 500 ? 1 : 0.55)
        const r = computePrice({
          domesticPrice: dp, ml: sp.ml, abv: sp.abv, logistics: logi,
          market, exportMargin: margin, cbmaAssigned: cbma,
        })
        return { ...sp, r, taxRate: Math.round((r.taxTotal / r.cif) * 100), per100: r.retailLocal / (sp.ml / 100) }
      }),
    [market, domesticPrice, logistics, margin, cbma],
  )
  const base = rows[0]
  const best = [...rows].sort((a, b) => a.taxRate - b.taxRate)[0]
  const maxTax = Math.max(...rows.map((r) => r.taxRate))

  return (
    <div className="rounded border border-white/10 bg-white/[0.02] p-4">
      <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-amber">
        反推：為了{m.name}這個市場，你該出什麼規格的酒
      </div>
      <p className="mb-3.5 max-w-[74ch] text-[11.5px] leading-relaxed text-stone">
        低度化在產業裡常被講成「迎合年輕人口味」。但在出海這件事上，它首先是一筆帳——
        <span className="text-bone">稅是按度數和純酒精量收的，不是按你的情懷收的。</span>
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
                isBest ? 'bg-emerald-500/[0.07] ring-1 ring-inset ring-emerald-500/25' : isBase ? 'bg-white/[0.03]' : ''
              }`}
            >
              <div className="min-w-0">
                <div className={`font-mono text-[11.5px] ${isBest ? 'text-emerald-300' : isBase ? 'text-bone' : 'text-stone'}`}>
                  {row.label}
                </div>
                <div className="truncate text-[10px] text-stone/60">{row.note}</div>
              </div>
              <div>
                <div className="mb-1 h-[9px] overflow-hidden rounded-sm bg-white/[0.05]">
                  <div
                    className={`h-full rounded-sm ${isBest ? 'bg-emerald-500/70' : isBase ? 'bg-amber/70' : 'bg-white/22'}`}
                    style={{ width: `${Math.max(2, (row.taxRate / maxTax) * 100)}%`, transition: 'width .5s' }}
                  />
                </div>
                <div className="font-mono text-[10.5px] text-stone/70">
                  落地稅負 {row.taxRate}% · 終端 {fmt(row.r.retailLocal)} {m.currency}
                  {!sameSize && <span className="text-stone/50">（折算每 100ml {fmt(row.per100)}）</span>}
                </div>
              </div>
              <div className="w-[86px] shrink-0 text-right">
                {isBase ? (
                  <span className="font-mono text-[10.5px] text-stone/60">現況</span>
                ) : (
                  <span className={`font-mono text-[11.5px] tabular-nums ${diff < 0 ? 'text-emerald-300' : 'text-rose-300/80'}`}>
                    {diff < 0 ? '−' : '+'}
                    {fmt(Math.abs(diff))}
                    <span className="ml-0.5 text-[9px] text-stone/50">{sameSize ? m.currency : '/100ml'}</span>
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-3.5 border-t border-white/8 pt-3 text-[12px] leading-relaxed text-stone">
        {best.taxRate < base.taxRate ? (
          <>
            在{m.name}，把主力規格從 <Num className="text-bone">{base.label}</Num> 換成{' '}
            <Num className="text-emerald-300">{best.label}</Num>，落地稅負從{' '}
            <Num className="text-bone">{base.taxRate}%</Num> 降到 <Num className="text-emerald-300">{best.taxRate}%</Num>
            ，終端價低 <Num className="text-emerald-300">{fmt(Math.abs(best.r.retailLocal - base.r.retailLocal))} {m.currency}</Num>。
            {market === 'vn' && best.abv < 20 && (
              <span className="text-amber">
                {' '}越南的 SCT 以 20 度為分界：20 度以上 65%，以下 35%。一度之差，稅率差近一半。
              </span>
            )}
            {market === 'sg' && (
              <span className="text-amber"> 新加坡按純酒精量課稅，降度數等於直接少繳稅。</span>
            )}
          </>
        ) : (
          <>在{m.name}，稅是按貨值課的，降度數省不到稅——這個市場的解法在定價與通路層級，不在酒體。</>
        )}
        <p className="mt-1.5 text-[10.5px] leading-snug text-stone/55">
          小容量規格的內銷開票價按容量比例估算、物流按 0.55 係數估算，僅供規格方向比較。
        </p>
      </div>
    </div>
  )
}
