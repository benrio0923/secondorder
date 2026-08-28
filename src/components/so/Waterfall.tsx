'use client'
import type { PriceResult } from '@/lib/so/pricing'
import type { Market } from '@/lib/so/types'
import { Num, SourceTag } from './parts'

const fmt = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 0 })

export function Waterfall({ p, m }: { p: PriceResult; m: Market }) {
  const max = p.retail
  const rows: { label: string; amount: number; cum: number; kind: 'china' | 'tax' | 'channel' | 'mark'; note?: string; src?: string; asOf?: string; changing?: string }[] = []

  rows.push({ label: '离岸报价', amount: p.fob, cum: p.fob, kind: 'china', note: `保本线 ${fmt(p.breakeven)} 元＋加成` })
  rows.push({ label: '物流与杂费', amount: p.cif - p.fob, cum: p.cif, kind: 'china', note: '每瓶分摊' })
  let cum = p.cif
  for (const t of p.taxes) {
    cum += t.amount
    rows.push({ label: t.label, amount: t.amount, cum, kind: 'tax', note: `${t.rate}｜基数：${t.basis}`, src: t.source, asOf: t.asOf, changing: t.changing })
  }
  rows.push({ label: '完税落地成本', amount: 0, cum, kind: 'mark', note: '进口商拿到货的成本' })
  for (const c of p.channel) {
    cum = c.to
    rows.push({ label: `${c.label}加价`, amount: c.to - c.from, cum, kind: 'channel', note: `毛利率 ${Math.round(c.rate * 100)}%${c.note ? '｜' + c.note : ''}` })
  }
  rows.push({ label: '终端零售价', amount: 0, cum: p.retail, kind: 'mark', note: '消费者看到的价格' })

  const color = (k: string) =>
    k === 'china' ? 'bg-amber/70' : k === 'tax' ? 'bg-rose-500/60' : k === 'channel' ? 'bg-sky-500/45' : 'bg-white/25'

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[10px] text-stone">
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-amber/70" />你的成本</span>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-rose-500/60" />目的国税费</span>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-sky-500/45" />通路加价</span>
      </div>

      <div className="space-y-[3px]">
        {rows.map((r, i) => {
          const isMark = r.kind === 'mark'
          const w = Math.max(1.5, (r.cum / max) * 100)
          const seg = Math.max(0.6, (r.amount / max) * 100)
          const start = w - seg
          return (
            <div key={i} className={`grid grid-cols-[minmax(96px,132px)_1fr_auto] items-center gap-2.5 ${isMark ? 'py-1' : ''}`}>
              <div className={`truncate text-[11.5px] ${isMark ? 'font-medium text-bone' : 'text-stone'}`} title={r.label}>
                {r.label}
                {r.src && <SourceTag source={r.src} asOf={r.asOf} />}
              </div>
              <div className="relative h-[18px] overflow-hidden rounded-sm bg-white/[0.04]">
                {isMark ? (
                  <div className="absolute inset-y-0 left-0 border-r-2 border-white/45" style={{ width: `${w}%` }} />
                ) : (
                  <>
                    <div className="absolute inset-y-0 left-0 bg-white/[0.05]" style={{ width: `${start}%` }} />
                    <div
                      className={`absolute inset-y-0 ${color(r.kind)}`}
                      style={{ left: `${start}%`, width: `${seg}%`, transition: 'width .5s ease, left .5s ease' }}
                    />
                  </>
                )}
              </div>
              <div className="w-[92px] text-right">
                {isMark ? (
                  <span className="font-mono text-[12.5px] font-semibold tabular-nums text-bone">{fmt(r.cum)}</span>
                ) : (
                  <span className="font-mono text-[11.5px] tabular-nums text-stone">＋{fmt(r.amount)}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 space-y-1.5 border-t border-white/8 pt-3 text-[11.5px] leading-relaxed text-stone">
        {rows
          .filter((r) => r.changing)
          .map((r, i) => (
            <p key={i} className="text-amber">
              ⚠ {r.label}将调整：{r.changing}
            </p>
          ))}
        <p>
          终端零售约 <Num className="text-bone">{fmt(p.retailLocal)}</Num> {m.currency}
          ，是内销开票价的 <Num className="text-bone">{p.multiple}</Num> 倍；落地税负占 到岸价 的{' '}
          <Num className="text-bone">{Math.round((p.taxTotal / p.cif) * 100)}%</Num>。
        </p>
      </div>

      <div className="mt-4 rounded border border-white/10 bg-white/[0.02] p-3.5">
        <div className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-stone">
          在 {m.name} 的货架上，它会和这些酒站在一起
        </div>
        <div className="space-y-1.5">
          {[...m.benchmarks, { name: '★ 你的酒（本次测算）', priceLocal: p.retailLocal, note: '' }]
            .sort((a, b) => a.priceLocal - b.priceLocal)
            .map((b, i) => {
              const mine = b.name.startsWith('★')
              const bmax = Math.max(p.retailLocal, ...m.benchmarks.map((x) => x.priceLocal))
              return (
                <div key={i} className="grid grid-cols-[1fr_auto] items-center gap-3">
                  <div className="min-w-0">
                    <div className={`mb-1 truncate text-[11.5px] ${mine ? 'font-medium text-amber' : 'text-stone'}`}>{b.name}</div>
                    <div className="h-[7px] overflow-hidden rounded-sm bg-white/[0.05]">
                      <div
                        className={`h-full rounded-sm ${mine ? 'bg-amber' : 'bg-white/20'}`}
                        style={{ width: `${Math.max(2, (b.priceLocal / bmax) * 100)}%`, transition: 'width .6s ease' }}
                      />
                    </div>
                  </div>
                  <span className={`w-[104px] shrink-0 text-right font-mono text-[11px] tabular-nums ${mine ? 'text-amber' : 'text-stone/70'}`}>
                    {fmt(b.priceLocal)} {m.currency}
                  </span>
                </div>
              )
            })}
        </div>
        <p className="mt-2.5 text-[10.5px] leading-snug text-stone/60">
          对标酒款为示意价，用于量级对照，非即时报价。汇率为估算值。
        </p>
      </div>
    </div>
  )
}
