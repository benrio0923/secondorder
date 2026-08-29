'use client'
import type { Brief, Extracted, Market } from '@/lib/so/types'
import type { RiskResult } from '@/lib/so/signals'
import type { PriceResult } from '@/lib/so/pricing'
import { Btn } from './parts'

const fmt = (n: number) => Math.round(n).toLocaleString('en-US')

export function Verdict({
  ex, m, risk, brief, price, busy, onCopyReply, onCopyAll, copied, copiedAll, onRetry,
}: {
  ex: Extracted
  m: Market
  risk: RiskResult
  brief: Brief | null
  price: PriceResult
  busy: boolean
  onCopyReply: () => void
  onCopyAll: () => void
  copied: boolean
  copiedAll: boolean
  onRetry: () => void
}) {
  const v = brief?.verdict
  const tone =
    v === 'hold'
      ? { bar: 'bg-rose-500', text: 'text-rose-300', ring: 'border-rose-900/45', word: '暂缓' }
      : v === 'probe'
        ? { bar: 'bg-amber', text: 'text-amber', ring: 'border-amber/30', word: '追问后再定' }
        : { bar: 'bg-emerald-500', text: 'text-emerald-300', ring: 'border-emerald-900/45', word: '可谈' }
  const riskColor = risk.level === 'high' ? 'text-rose-300' : risk.level === 'mid' ? 'text-amber' : 'text-emerald-300'
  const containerValue = price.fob * 12000
  const refluxLoss = containerValue * 0.3

  return (
    <div className={`overflow-hidden rounded-lg border ${tone.ring} bg-white/[0.03]`}>
      <div className={`h-[3px] w-full ${tone.bar}`} />
      <div className="p-5 sm:p-6">
        {/* 买家 + 风险 */}
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="font-serif text-[19px] leading-tight text-bone">{ex.company ?? '（对话中未具名）'}</div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-stone">
              <span>{m.flag} {m.name}</span>
              {ex.role && <span>· {ex.role}</span>}
              {ex.contact && <span>· {ex.contact}</span>}
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className={`font-mono text-[30px] leading-none ${riskColor}`}>{risk.score}</div>
            <div className={`mt-1 text-[11.5px] ${riskColor}`}>{risk.label}</div>
          </div>
        </div>

        {/* 判定 */}
        {busy ? (
          <div className="flex items-center gap-3 py-6">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber" />
            </span>
            <span className="text-[13px] text-stone">正在生成判定与回信…</span>
          </div>
        ) : brief ? (
          <>
            <div className="mb-5">
              <div className="mb-2 flex items-baseline gap-2.5">
                <span className={`font-serif text-[26px] leading-none ${tone.text}`}>{tone.word}</span>
                <span className="text-[15px] text-bone">{brief.headline}</span>
              </div>
              <ul className="space-y-1">
                {brief.reasons?.slice(0, 4).map((r, i) => (
                  <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-stone">
                    <span className="mt-[8px] h-1 w-1 shrink-0 rounded-full bg-stone/50" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            {/* 现在该做什么 */}
            <div className="mb-5 rounded border border-white/10 bg-ink/40 p-4">
              <div className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-amber">先问这几个问题</div>
              <ol className="space-y-2">
                {brief.questions?.slice(0, 5).map((q, i) => (
                  <li key={i} className="flex gap-2.5 text-[13px] leading-snug text-bone">
                    <span className="mt-[1px] shrink-0 font-mono text-[11px] text-amber">{i + 1}</span>
                    {q}
                  </li>
                ))}
              </ol>
            </div>

            {/* 代价 */}
            <div className="mb-5 flex flex-wrap gap-x-8 gap-y-3 rounded border border-white/10 bg-ink/30 px-4 py-3">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-stone">这一柜的货值</div>
                <div className="mt-1 font-mono text-[17px] text-bone">{fmt(containerValue)} <span className="text-[11px] text-stone">元</span></div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-stone">卖不掉折价倒回国内</div>
                <div className="mt-1 font-mono text-[17px] text-rose-300">−{fmt(refluxLoss)} <span className="text-[11px] text-stone">元</span></div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-stone">终端零售</div>
                <div className="mt-1 font-mono text-[17px] text-bone">{fmt(price.retail)} <span className="text-[11px] text-stone">元／瓶</span></div>
              </div>
            </div>

            {/* 回信 */}
            <details className="mb-4 rounded border border-white/10 bg-ink/40">
              <summary className="cursor-pointer list-none px-4 py-2.5 text-[13px] text-bone">
                <span className="mr-2 text-amber">▸</span>
                第一封回信草稿
              </summary>
              <pre className="whitespace-pre-wrap border-t border-white/8 px-4 py-3.5 font-sans text-[12.5px] leading-relaxed text-stone">
                {brief.reply}
              </pre>
            </details>

            <div className="flex flex-wrap gap-2.5">
              <Btn size="sm" onClick={onCopyReply}>{copied ? '回信已拷贝' : '拷贝回信'}</Btn>
              <Btn size="sm" variant="ghost" onClick={onCopyAll}>{copiedAll ? '整份已拷贝' : '拷贝整份简报'}</Btn>
              <Btn size="sm" variant="ghost" onClick={onRetry}>重新生成</Btn>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
