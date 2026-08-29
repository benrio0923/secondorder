'use client'
import { useMemo } from 'react'
import { BAIJIU_BY_ID, groupedByZone } from '@/lib/so/baijiu'
import { AROMAS } from '@/lib/so/aroma'

export function BottlePicker({
  id, onPick,
}: { id: string | null; onPick: (id: string | null) => void }) {
  const groups = useMemo(() => groupedByZone(), [])
  const b = id ? BAIJIU_BY_ID[id] : null

  return (
    <div className="rounded border border-line bg-paper2 p-4">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-amber">你家要出的是哪一支</span>
        <select
          value={id ?? ''}
          onChange={(e) => onPick(e.target.value || null)}
          className="min-w-[220px] flex-1 rounded border border-line bg-card px-2.5 py-1.5 text-[12.5px] text-ink outline-none focus:border-amber/50"
        >
          <option value="">自己填参数（不选具体品项）</option>
          {groups.map((g) => (
            <optgroup key={g.zone} label={g.zone}>
              {g.items.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}　{x.aromaLabel}　{x.abv}°
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <span className="font-mono text-[10.5px] text-ink3">共 56 支</span>
      </div>

      {b ? (
        <div className="grid gap-px overflow-hidden rounded border border-line bg-line sm:grid-cols-[1.1fr_1fr]">
          <div className="bg-card p-3.5">
            <div className="mb-1 flex flex-wrap items-baseline gap-2">
              <span className="font-serif text-[16px] text-ink">{b.name}</span>
              {b.en && <span className="font-mono text-[10.5px] text-ink2">{b.en}</span>}
            </div>
            <div className="mb-2.5 text-[11.5px] leading-relaxed text-ink2">
              {b.company}
              {b.origin && <>　·　{b.origin}</>}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded border border-amber/25 bg-amber/10 px-2 py-0.5 font-mono text-[10.5px] text-amber">
                {b.aromaLabel ?? AROMAS[b.aroma === 'other' ? 'other' : b.aroma].name}
              </span>
              <span className="rounded border border-line px-2 py-0.5 font-mono text-[10.5px] text-ink2">
                {b.abvAll.join('° / ')}°
              </span>
              {b.status && (
                <span className="rounded border border-line px-2 py-0.5 font-mono text-[10.5px] text-ink2">{b.status}</span>
              )}
            </div>
            {b.craft && (
              <p className="mt-2.5 border-t border-line pt-2.5 text-[11.5px] leading-relaxed text-ink2">
                <span className="text-ink3">工艺：</span>
                {b.craft}
              </p>
            )}
          </div>
          <div className="bg-card p-3.5">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink2">
              这支酒自己的风味描述
            </div>
            {b.nose && (
              <p className="mb-1.5 text-[12px] leading-relaxed text-ink">
                <span className="text-ink3">香气　</span>
                {b.nose}
              </p>
            )}
            {b.palate && (
              <p className="mb-1.5 text-[12px] leading-relaxed text-ink">
                <span className="text-ink3">口感　</span>
                {b.palate}
              </p>
            )}
            {b.products && (
              <p className="mt-2.5 border-t border-line pt-2.5 text-[11.5px] leading-relaxed text-ink2">
                <span className="text-ink3">代表产品：</span>
                {b.products}
              </p>
            )}
            {b.trust && b.trust !== '已查证' && (
              <p className="mt-2 font-mono text-[10px] text-amber/80">资料可信度：{b.trust}</p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-[11.5px] leading-relaxed text-ink2">
          选一支之后，<span className="text-ink">香型与酒精度会自动带进落地价测算与卖点弹药</span>——
          因为税是按度数收的，而香型决定了你能怎么跟对方讲这支酒。
        </p>
      )}
    </div>
  )
}
