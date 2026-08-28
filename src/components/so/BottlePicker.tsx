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
    <div className="rounded border border-white/10 bg-white/[0.02] p-4">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-amber">你家要出的是哪一支</span>
        <select
          value={id ?? ''}
          onChange={(e) => onPick(e.target.value || null)}
          className="min-w-[220px] flex-1 rounded border border-white/15 bg-ink2 px-2.5 py-1.5 text-[12.5px] text-bone outline-none focus:border-amber/50"
        >
          <option value="">自己填參數（不選具體品項）</option>
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
        <span className="font-mono text-[10.5px] text-stone/60">共 56 支</span>
      </div>

      {b ? (
        <div className="grid gap-px overflow-hidden rounded border border-white/10 bg-white/8 sm:grid-cols-[1.1fr_1fr]">
          <div className="bg-ink2/70 p-3.5">
            <div className="mb-1 flex flex-wrap items-baseline gap-2">
              <span className="font-serif text-[16px] text-bone">{b.name}</span>
              {b.en && <span className="font-mono text-[10.5px] text-stone">{b.en}</span>}
            </div>
            <div className="mb-2.5 text-[11.5px] leading-relaxed text-stone">
              {b.company}
              {b.origin && <>　·　{b.origin}</>}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded border border-amber/25 bg-amber/10 px-2 py-0.5 font-mono text-[10.5px] text-amber">
                {b.aromaLabel ?? AROMAS[b.aroma === 'other' ? 'other' : b.aroma].name}
              </span>
              <span className="rounded border border-white/12 px-2 py-0.5 font-mono text-[10.5px] text-stone">
                {b.abvAll.join('° / ')}°
              </span>
              {b.status && (
                <span className="rounded border border-white/12 px-2 py-0.5 font-mono text-[10.5px] text-stone">{b.status}</span>
              )}
            </div>
            {b.craft && (
              <p className="mt-2.5 border-t border-white/8 pt-2.5 text-[11.5px] leading-relaxed text-stone">
                <span className="text-stone/60">工藝：</span>
                {b.craft}
              </p>
            )}
          </div>
          <div className="bg-ink2/70 p-3.5">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-stone">
              這支酒自己的風味描述
            </div>
            {b.nose && (
              <p className="mb-1.5 text-[12px] leading-relaxed text-bone">
                <span className="text-stone/60">香氣　</span>
                {b.nose}
              </p>
            )}
            {b.palate && (
              <p className="mb-1.5 text-[12px] leading-relaxed text-bone">
                <span className="text-stone/60">口感　</span>
                {b.palate}
              </p>
            )}
            {b.products && (
              <p className="mt-2.5 border-t border-white/8 pt-2.5 text-[11.5px] leading-relaxed text-stone">
                <span className="text-stone/60">代表產品：</span>
                {b.products}
              </p>
            )}
            {b.trust && b.trust !== '已查證' && (
              <p className="mt-2 font-mono text-[10px] text-amber/80">資料可信度：{b.trust}</p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-[11.5px] leading-relaxed text-stone">
          選一支之後，<span className="text-bone">香型與酒精度會自動帶進落地價測算與賣點彈藥</span>——
          因為稅是按度數收的，而香型決定了你能怎麼跟對方講這支酒。
        </p>
      )}
    </div>
  )
}
