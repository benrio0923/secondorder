'use client'
import { useState } from 'react'
import { Btn } from './parts'
import { MILESTONES } from '@/lib/so/aftership'
import type { RiskResult } from '@/lib/so/signals'

export function AfterShip({ risk, buyer, market }: { risk: RiskResult; buyer?: string; market?: string }) {
  const [open, setOpen] = useState<number | null>(30)
  const [copied, setCopied] = useState(false)

  function asChecklist(): string {
    const head = `【首单跟进清单】${buyer ?? '（买家未具名）'}${market ? '　' + market : ''}　套利风险 ${risk.score}/100`
    const body = MILESTONES.map((m) => {
      const star = m.criticalWhenRisky && risk.level !== 'low' ? '　★这个买家特别要盯' : ''
      return [
        `${m.label}　${m.title}${star}`,
        ...m.todo.map((t) => `　　□ ${t}`),
        `　　防的是：${m.guards}`,
        m.clause ? `　　依据条款：${m.clause}` : '',
      ]
        .filter(Boolean)
        .join('\n')
    }).join('\n\n')
    return [head, '', body, '', '（日期从合同条款推出，发货日为 D+0。请以实际发货日为准往后排。）'].join('\n')
  }
  const risky = risk.level !== 'low'
  const max = MILESTONES[MILESTONES.length - 1].day

  return (
    <div>
      <p className="mb-4 max-w-[72ch] text-[13px] leading-relaxed text-stone">
        这个工具叫「第二单」，但如果功能停在报价与签约，它其实只做了第一单之前的事。
        <span className="text-bone">真正决定有没有第二单的，是货到了之后那三个月</span>
        ——而这段时间多数中小酒企什么都不做，直到某天发现货被折价倒回国内。
        下面每个节点的日期都不是随便定的，是从你上一步选的合同条款里推出来的。
      </p>

      {/* 时间轴 */}
      <div className="relative mb-5 h-[52px]">
        <div className="absolute inset-x-0 top-[21px] h-[2px] rounded bg-white/10" />
        {MILESTONES.map((m, i) => {
          const on = open === i
          const pos = (m.day / max) * 100
          const crit = m.criticalWhenRisky && risky
          return (
            <button
              key={m.day}
              onClick={() => setOpen(on ? null : i)}
              className="absolute top-0 -translate-x-1/2 text-center"
              style={{ left: `${Math.min(97, Math.max(3, pos))}%` }}
            >
              <span
                className={`mx-auto block h-[14px] w-[14px] rounded-full border-2 transition ${
                  on
                    ? 'border-amber bg-amber'
                    : crit
                      ? 'border-rose-400 bg-ink'
                      : 'border-white/35 bg-ink hover:border-white/60'
                }`}
                style={{ marginTop: 15 }}
              />
              <span
                className={`mt-1.5 block whitespace-nowrap font-mono text-[10px] ${
                  on ? 'text-amber' : crit ? 'text-rose-300/80' : 'text-stone/70'
                }`}
              >
                {m.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* 节点内容 */}
      <div className="grid gap-px overflow-hidden rounded border border-white/10 bg-white/8">
        {MILESTONES.map((m, i) => {
          const on = open === i
          const crit = m.criticalWhenRisky && risky
          return (
            <div key={m.day} className="bg-ink2/60">
              <button
                onClick={() => setOpen(on ? null : i)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-white/[0.02]"
              >
                <span className={`w-[46px] shrink-0 font-mono text-[11px] ${crit ? 'text-rose-300' : 'text-amber'}`}>
                  {m.label}
                </span>
                <span className="flex-1 text-[13px] text-bone">{m.title}</span>
                {crit && (
                  <span className="shrink-0 rounded border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 font-mono text-[9.5px] text-rose-300">
                    这个买家特别要盯
                  </span>
                )}
                {m.clause && (
                  <span className="hidden shrink-0 font-mono text-[10px] text-stone/60 sm:inline">
                    ← {m.clause}
                  </span>
                )}
                <span className={`shrink-0 text-[11px] text-stone/50 transition ${on ? 'rotate-90' : ''}`}>▸</span>
              </button>
              {on && (
                <div className="border-t border-white/8 px-4 pb-3.5 pt-3">
                  <ul className="mb-2.5 space-y-1.5">
                    {m.todo.map((t) => (
                      <li key={t} className="flex gap-2.5 text-[12.5px] leading-snug text-bone">
                        <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-amber" />
                        {t}
                      </li>
                    ))}
                  </ul>
                  <p className="text-[12px] leading-relaxed text-stone">
                    <span className="text-stone/60">这一步在防：</span>
                    {m.guards}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-3">
        <Btn
          size="sm"
          variant="ghost"
          onClick={() => {
            navigator.clipboard?.writeText(asChecklist())
            setCopied(true)
            setTimeout(() => setCopied(false), 1800)
          }}
        >
          {copied ? '已拷贝，贴进日历或群里' : '拷贝成待办清单'}
        </Btn>
        <span className="text-[11.5px] text-stone">
          带勾选框的纯文本，可以直接贴进企业微信群或日历备注——发货那天贴一次，后面三个月就有人盯了。
        </span>
      </div>

      {risky && (
        <p className="mt-3 rounded border-l-2 border-l-rose-500/60 bg-rose-950/15 px-3.5 py-2.5 text-[12px] leading-relaxed text-stone">
          这个买家的套利风险是 <span className="font-mono text-rose-300">{risk.score}</span>，
          <span className="text-bone">D+7 的到货确认和 D+30 的动销检查不能省</span>
          ——这两个节点是唯一能在货折价倒流之前发现问题的机会。
        </p>
      )}
    </div>
  )
}
