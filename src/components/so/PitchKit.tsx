'use client'
import { AROMA_LIST, AROMAS, FIRST_IMPRESSION, GLOBAL_HOOK, PRINCIPLE, USE_CASES } from '@/lib/so/aroma'
import type { AromaId } from '@/lib/so/aroma'
import type { Market } from '@/lib/so/types'
import type { Baijiu } from '@/lib/so/baijiu'
import { Chip } from './parts'

export function PitchKit({
  market, m, aroma, setAroma, bottle,
}: { market: string; m: Market; aroma: AromaId; setAroma: (a: AromaId) => void; bottle?: Baijiu | null }) {
  const a = AROMAS[aroma]
  const cases = USE_CASES[market] ?? []

  return (
    <div className="space-y-4">
      {/* 香型选择 */}
      <div className="flex flex-wrap gap-2">
        {AROMA_LIST.map((x) => (
          <button
            key={x.id}
            onClick={() => setAroma(x.id)}
            className={`rounded border px-3 py-1.5 text-left text-[12.5px] transition ${
              aroma === x.id
                ? 'border-amber/60 bg-amber/10 text-amber'
                : 'border-line text-ink2 hover:border-line2 hover:text-ink'
            }`}
          >
            {x.name}
            <span className="ml-1.5 font-mono text-[10px] opacity-60">{x.nameEn}</span>
          </button>
        ))}
        <span className="self-center text-[11px] text-ink3">你要出的是哪一支</span>
      </div>

      {/* 香型 → 料理 */}
      <div className="grid gap-px overflow-hidden rounded border border-line bg-line sm:grid-cols-[1.1fr_1fr]">
        <div className="bg-card p-4">
          <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-amber">
            {a.name} · {a.nameEn}
            {bottle && <span className="ml-2 text-ink2">／{bottle.name}</span>}
          </div>
          <div className="mb-2 text-[13px] text-ink">{bottle?.nose ?? a.profile}</div>
          {bottle?.palate && <div className="mb-2 text-[12.5px] text-ink2">{bottle.palate}</div>}
          <div className="mb-3 text-[11.5px] text-ink2">代表：{a.rep}</div>
          <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink2">配什么吃</div>
          <div className="flex flex-wrap gap-1.5">
            {a.dishes.map((d) => (
              <Chip key={d}>{d}</Chip>
            ))}
          </div>
        </div>
        <div className="bg-card p-4">
          <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-amber">一句话怎么讲</div>
          <p className="text-[13px] leading-relaxed text-ink">{a.pitch}</p>
          <p className="mt-3 border-t border-line pt-3 text-[11.5px] leading-relaxed text-ink2">{PRINCIPLE}</p>
        </div>
      </div>

      {/* 心理准备 */}
      <div className="rounded border-l-2 border-l-halt bg-halt/[0.06] px-4 py-3.5">
        <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-halt">
          上场前先知道：非华人第一次闻到白酒，会说什么
        </div>
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {FIRST_IMPRESSION.words.map((w) => (
            <span key={w} className="rounded border border-halt/45 bg-halt/45 px-2 py-0.5 text-[11.5px] text-halt">
              「{w}」
            </span>
          ))}
        </div>
        <p className="text-[12px] leading-relaxed text-ink2">{FIRST_IMPRESSION.note}</p>
        <p className="mt-2 text-[12px] leading-relaxed text-ink">→ {FIRST_IMPRESSION.advice}</p>
      </div>

      {/* 该市场已验证的用法 */}
      <div className="rounded border border-line bg-paper2 p-4">
        <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-amber">
          在{m.name}，白酒已经有人这样用
        </div>
        {cases.length ? (
          <div className="space-y-2.5">
            {cases.map((c, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-[136px_1fr] sm:gap-4">
                <div className="min-w-0">
                  <div className="truncate text-[12.5px] font-medium text-ink" title={c.place}>{c.place}</div>
                  <span
                    className={`mt-1 inline-block font-mono text-[9.5px] uppercase tracking-[0.1em] ${
                      c.strength === 'high' ? 'text-go' : c.strength === 'mid' ? 'text-amber/80' : 'text-ink3'
                    }`}
                  >
                    证据 {c.strength === 'high' ? '高' : c.strength === 'mid' ? '中' : '低'}｜{c.source}
                  </span>
                </div>
                <p className="text-[12px] leading-relaxed text-ink2">{c.what}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[12.5px] leading-relaxed text-ink2">
            这个市场我们还没查到公开记录的白酒入食／调饮案例。
            <span className="text-ink">这不代表没有，是代表你可以是第一个——</span>
            但也意味着谈第一单时，市场教育的成本要算进报价里。
          </p>
        )}
        <div className="mt-4 border-t border-line pt-3">
          <div className="mb-1 text-[12.5px] font-medium text-ink">现成的落地活动：{GLOBAL_HOOK.name}</div>
          <p className="text-[11.5px] leading-relaxed text-ink2">{GLOBAL_HOOK.detail}</p>
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-amber">{GLOBAL_HOOK.use}</p>
        </div>
      </div>
    </div>
  )
}
