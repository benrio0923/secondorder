'use client'
import { useState } from 'react'
import type { Brief, Extracted, Market } from '@/lib/so/types'
import type { RiskResult } from '@/lib/so/signals'
import type { PriceResult } from '@/lib/so/pricing'
import { Bottle } from './Bottle'

const fmt = (n: number) => Math.round(n).toLocaleString('en-US')

const TONE = {
  hold: { c: 'var(--color-halt)', word: '暂缓', sub: '这瓶里装的不是酒' },
  probe: { c: 'var(--color-probe)', word: '追问', sub: '还没看清楚是什么' },
  go: { c: 'var(--color-go)', word: '可谈', sub: '这是来买酒的' },
} as const

export function Verdict({
  ex, m, risk, brief, price, abv, verdict, busy, onCopyReply, onCopyAll, copied, copiedAll, onRetry,
}: {
  ex: Extracted; m: Market; risk: RiskResult; brief: Brief | null; price: PriceResult; abv: number
  verdict: Brief['verdict']
  busy: boolean; onCopyReply: () => void; onCopyAll: () => void
  copied: boolean; copiedAll: boolean; onRetry: () => void
}) {
  const [done, setDone] = useState<Set<number>>(new Set())
  const t = TONE[verdict]
  const headline = (brief?.headline ?? '').replace(/^(暂缓|追问后再定|追问|可谈)[，、,：:\s]*/, '') || brief?.headline || ''
  const containerValue = price.fob * 12000
  const reflux = containerValue * 0.3

  return (
    <section
      className="corners relative overflow-hidden rounded-[2px] border border-line bg-card"
      style={{ boxShadow: `0 30px 90px -50px ${t.c}` }}
    >
      <div className="h-[2px] w-full widen" style={{ background: t.c }} />

      <div className="grid gap-8 px-6 py-7 sm:grid-cols-[168px_1fr] sm:gap-10 sm:px-8">
        {/* 瓶 */}
        <div className="flex justify-center sm:justify-start">
          <Bottle score={risk.score} level={risk.level} abv={abv} />
        </div>

        {/* 判定 */}
        <div className="min-w-0">
          <div className="rise" style={{ animationDelay: '80ms' }}>
            <h2 className="font-serif text-[22px] leading-tight text-ink">{ex.company ?? '（对话中未具名）'}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-ink2">
              <span className="text-ink2">{m.flag} {m.name}</span>
              {ex.role && <><span className="text-ink3">／</span><span>{ex.role}</span></>}
              {ex.contact && <><span className="text-ink3">／</span><span>{ex.contact}</span></>}
              <span className="text-ink3">／</span>
              <span className={risk.thin ? 'text-probe' : ''}>信号 {risk.answered}/6</span>
            </div>
          </div>

          {busy ? (
            <div className="flex items-center gap-3 py-10">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber" />
              </span>
              <span className="text-[13px] text-ink2">正在给判定与回信…</span>
            </div>
          ) : brief ? (
            <>
              <div className="jolt mb-7 mt-7 flex flex-wrap items-center gap-x-8 gap-y-4" style={{ animationDelay: '300ms' }}>
                <span
                  className="slam seal shrink-0 text-[36px]"
                  style={{ color: t.c, animationDelay: '300ms' }}
                >
                  {t.word}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="tag mb-1.5" style={{ color: t.c }}>{t.sub}</div>
                  <div className="text-[17px] leading-snug text-ink">{headline}</div>
                </div>
              </div>

              <ul className="grid gap-x-8 gap-y-2.5 lg:grid-cols-2">
                {brief.reasons?.slice(0, 4).map((r, i) => (
                  <li key={i} className="rise flex gap-3 text-[13.5px] leading-relaxed text-ink2" style={{ animationDelay: `${560 + i * 70}ms` }}>
                    <span className="mt-[8px] h-[3px] w-[3px] shrink-0 rounded-full" style={{ background: t.c }} />
                    {r}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      </div>

      {brief && !busy && (
        <>
          <div className="rise border-t border-line px-6 py-5 sm:px-8" style={{ animationDelay: '820ms' }}>
            <div className="mb-3.5 flex items-baseline justify-between gap-3">
              <span className="tag text-amber">先问这几个问题</span>
              <span className="tag text-ink3">{done.size}／{brief.questions?.length ?? 0} 已问</span>
            </div>
            <ol className="grid gap-px overflow-hidden rounded-[2px] border border-line bg-paper2 sm:grid-cols-2">
              {brief.questions?.slice(0, 6).map((q, i, arr) => {
                const on = done.has(i)
                const last = i === arr.length - 1 && arr.length % 2 === 1
                return (
                  <li key={i} className={last ? 'sm:col-span-2' : ''}>
                    <button
                      onClick={() => setDone((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n })}
                      className="group flex w-full items-start gap-3 bg-card px-3.5 py-3 text-left transition hover:bg-paper2"
                    >
                      <span className={`mt-[2px] flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-[2px] border text-[9px] transition ${
                        on ? 'border-amber bg-amber text-paper' : 'border-line2 text-transparent group-hover:border-line2'}`}>✓</span>
                      <span className={`text-[13px] leading-snug transition ${on ? 'text-ink3 line-through' : 'text-ink'}`}>{q}</span>
                    </button>
                  </li>
                )
              })}
            </ol>
          </div>

          <div className="rise grid gap-px border-t border-line bg-paper2 sm:grid-cols-3" style={{ animationDelay: '900ms' }}>
            {[
              { k: '这一柜的货值', v: fmt(containerValue), u: '元', c: 'text-ink' },
              { k: '卖不掉折价倒回国内', v: '−' + fmt(reflux), u: '元', c: 'text-halt' },
              { k: '终端零售', v: fmt(price.retail), u: '元／瓶', c: 'text-ink' },
            ].map((x) => (
              <div key={x.k} className="bg-card px-6 py-5 sm:px-8">
                <div className="tag mb-2 text-ink3">{x.k}</div>
                <div className={`num text-[30px] leading-none ${x.c}`}>
                  {x.v}<span className="ml-1.5 font-sans text-[11px] font-normal text-ink3">{x.u}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="rise flex flex-wrap items-center gap-2.5 border-t border-line px-6 py-4 sm:px-8" style={{ animationDelay: '960ms' }}>
            <button onClick={onCopyReply} className="rounded-[2px] bg-amber px-4 py-2 text-[12.5px] font-medium text-paper transition hover:bg-gold">
              {copied ? '回信已拷贝' : '拷贝回信'}
            </button>
            <button onClick={onCopyAll} className="rounded-[2px] border border-line px-3.5 py-2 text-[12.5px] text-ink transition hover:border-line2 hover:bg-paper2">
              {copiedAll ? '整份已拷贝' : '拷贝整份简报'}
            </button>
            <button onClick={onRetry} className="rounded-[2px] px-2.5 py-2 text-[12.5px] text-ink2 transition hover:text-ink">重新生成</button>
            <details className="ml-auto w-full sm:w-auto">
              <summary className="tag cursor-pointer list-none py-2 text-ink2 transition hover:text-ink">展开回信草稿</summary>
              <pre className="mt-2 max-w-[64ch] whitespace-pre-wrap rounded-[2px] border border-line bg-paper p-4 font-sans text-[12.5px] leading-relaxed text-ink2">{brief.reply}</pre>
            </details>
          </div>
        </>
      )}
    </section>
  )
}
