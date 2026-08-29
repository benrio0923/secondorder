'use client'
import { useState } from 'react'
import type { Brief, Extracted, Market } from '@/lib/so/types'
import type { RiskResult } from '@/lib/so/signals'
import type { PriceResult } from '@/lib/so/pricing'
import { Dial } from './Dial'

const fmt = (n: number) => Math.round(n).toLocaleString('en-US')

const TONE = {
  hold: { c: 'var(--color-halt)', word: '暂缓', cls: 'text-halt' },
  probe: { c: 'var(--color-probe)', word: '追问', cls: 'text-probe' },
  go: { c: 'var(--color-go)', word: '可谈', cls: 'text-go' },
} as const

export function Verdict({
  ex, m, risk, brief, price, busy, onCopyReply, onCopyAll, copied, copiedAll, onRetry,
}: {
  ex: Extracted; m: Market; risk: RiskResult; brief: Brief | null; price: PriceResult
  busy: boolean; onCopyReply: () => void; onCopyAll: () => void
  copied: boolean; copiedAll: boolean; onRetry: () => void
}) {
  const [done, setDone] = useState<Set<number>>(new Set())
  const t = TONE[brief?.verdict ?? 'probe']
  // 封条已经写着「暂缓」，标题就别再说一次
  const headline = (brief?.headline ?? '').replace(/^(暂缓|追问后再定|追问|可谈)[，、,：:\s]*/, '') || brief?.headline || ''
  const containerValue = price.fob * 12000
  const reflux = containerValue * 0.3

  return (
    <section
      className="relative overflow-hidden rounded-[3px] border border-white/[.09] bg-ink2/70"
      style={{ boxShadow: `inset 0 1px 0 rgba(242,237,230,.05), 0 24px 60px -32px ${t.c}40` }}
    >
      <div className="h-[2px] w-full widen" style={{ background: t.c }} />

      <div className="grid gap-7 p-6 sm:grid-cols-[168px_1fr] sm:gap-9 sm:p-7 sm:pb-6">
        {/* 表盘 */}
        <div className="rise flex justify-center sm:justify-start" style={{ animationDelay: '60ms' }}>
          <Dial score={risk.score} level={risk.level} />
        </div>

        {/* 判定 */}
        <div className="min-w-0">
          <div className="rise mb-5" style={{ animationDelay: '120ms' }}>
            <h2 className="font-serif text-[21px] leading-tight text-bone">{ex.company ?? '（对话中未具名）'}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-stone">
              <span className="text-bone/80">{m.flag} {m.name}</span>
              {ex.role && <><span className="text-stone2">／</span><span>{ex.role}</span></>}
              {ex.contact && <><span className="text-stone2">／</span><span>{ex.contact}</span></>}
              <span className="text-stone2">／</span>
              <span className={risk.thin ? 'text-probe' : ''}>信号 {risk.answered}/6</span>
            </div>
          </div>

          {busy ? (
            <div className="flex items-center gap-3 py-8">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber" />
              </span>
              <span className="text-[13px] text-stone">正在给判定与回信…</span>
            </div>
          ) : brief ? (
            <>
              <div className="rise mb-6 flex flex-wrap items-center gap-x-8 gap-y-5" style={{ animationDelay: '200ms' }}>
                <span className="seal ml-4 text-[32px]" style={{ color: t.c }}>{t.word}</span>
                <span className="flex-1 text-[17px] leading-snug text-bone">{headline}</span>
              </div>

              <ul className="rise mb-1 space-y-2.5" style={{ animationDelay: '260ms' }}>
                {brief.reasons?.slice(0, 4).map((r, i) => (
                  <li key={i} className="flex gap-3 text-[13.5px] leading-relaxed text-stone">
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
          {/* 该做什么 */}
          <div className="rise border-t border-white/[.07] px-6 py-5 sm:px-8" style={{ animationDelay: '320ms' }}>
            <div className="mb-3.5 flex items-baseline justify-between gap-3">
              <span className="tag text-amber">先问这几个问题</span>
              <span className="tag text-stone2">{done.size}／{brief.questions?.length ?? 0} 已问</span>
            </div>
            <ol className="grid gap-px overflow-hidden rounded-[2px] border border-white/[.07] bg-white/[.06] sm:grid-cols-2">
              {brief.questions?.slice(0, 6).map((q, i, arr) => {
                const on = done.has(i)
                const last = i === arr.length - 1 && arr.length % 2 === 1
                return (
                  <li key={i} className={last ? 'sm:col-span-2' : ''}>
                    <button
                      onClick={() => setDone((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n })}
                      className="group flex w-full items-start gap-3 bg-ink2 px-3.5 py-3 text-left transition hover:bg-ink3"
                    >
                      <span
                        className={`mt-[2px] flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-[2px] border text-[9px] transition ${
                          on ? 'border-amber bg-amber text-ink' : 'border-white/25 text-transparent group-hover:border-white/45'
                        }`}
                      >
                        ✓
                      </span>
                      <span className={`text-[13px] leading-snug transition ${on ? 'text-stone2 line-through' : 'text-bone'}`}>
                        {q}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
          </div>

          {/* 代价 */}
          <div className="rise grid gap-px border-t border-white/[.07] bg-white/[.06] sm:grid-cols-3" style={{ animationDelay: '380ms' }}>
            {[
              { k: '这一柜的货值', v: fmt(containerValue), u: '元', c: 'text-bone' },
              { k: '卖不掉折价倒回国内', v: '−' + fmt(reflux), u: '元', c: 'text-halt' },
              { k: '终端零售', v: fmt(price.retail), u: '元／瓶', c: 'text-bone' },
            ].map((x) => (
              <div key={x.k} className="bg-ink2 px-6 py-4 sm:px-8">
                <div className="tag mb-2 text-stone2">{x.k}</div>
                <div className={`num text-[30px] leading-none ${x.c}`}>
                  {x.v}
                  <span className="ml-1.5 font-sans text-[11px] font-normal text-stone2">{x.u}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 动作 */}
          <div className="rise flex flex-wrap items-center gap-2.5 border-t border-white/[.07] px-6 py-4 sm:px-8" style={{ animationDelay: '440ms' }}>
            <button
              onClick={onCopyReply}
              className="rounded-[2px] bg-amber px-4 py-2 text-[12.5px] font-medium text-ink transition hover:bg-gold"
            >
              {copied ? '回信已拷贝' : '拷贝回信'}
            </button>
            <button
              onClick={onCopyAll}
              className="rounded-[2px] border border-white/15 px-3.5 py-2 text-[12.5px] text-bone transition hover:border-white/35 hover:bg-white/5"
            >
              {copiedAll ? '整份已拷贝' : '拷贝整份简报'}
            </button>
            <button
              onClick={onRetry}
              className="rounded-[2px] px-2.5 py-2 text-[12.5px] text-stone transition hover:text-bone"
            >
              重新生成
            </button>
            <details className="ml-auto w-full sm:w-auto">
              <summary className="tag cursor-pointer list-none py-2 text-stone transition hover:text-bone">
                展开回信草稿
              </summary>
              <pre className="mt-2 max-w-[64ch] whitespace-pre-wrap rounded-[2px] border border-white/10 bg-ink/60 p-4 font-sans text-[12.5px] leading-relaxed text-stone">
                {brief.reply}
              </pre>
            </details>
          </div>
        </>
      )}
    </section>
  )
}
