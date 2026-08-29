'use client'
import { SIGNALS } from '@/lib/so/signals'
import type { RiskResult } from '@/lib/so/signals'

export function RiskDial({ risk }: { risk: RiskResult }) {
  const pct = risk.score
  const color = risk.level === 'high' ? "#BE3A2E" : risk.level === "mid" ? "#9A5414" : "#217A57"
  const R = 52
  const C = Math.PI * R // 半圆周长
  const dash = (pct / 100) * C
  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 130 76" className="w-[150px] shrink-0" role="img" aria-label={`套利风险 ${pct} 分`}>
        <path d={`M 13 66 A ${R} ${R} 0 0 1 117 66`} fill="none" stroke="rgba(28,22,19,.10)" strokeWidth="9" strokeLinecap="round" />
        <path
          d={`M 13 66 A ${R} ${R} 0 0 1 117 66`}
          fill="none" stroke={color} strokeWidth="9" strokeLinecap="round"
          strokeDasharray={`${dash} ${C}`}
          style={{ transition: 'stroke-dasharray .8s cubic-bezier(.2,.8,.2,1), stroke .4s' }}
        />
        <text x="65" y="58" textAnchor="middle" className="font-mono" fontSize="26" fill="#1C1613" fontWeight="600">{pct}</text>
        <text x="65" y="72" textAnchor="middle" fontSize="8.5" fill="#8B7F6F" letterSpacing="1.6">风险 / 100</text>
      </svg>
      <div className="min-w-0">
        <div className="font-serif text-lg leading-tight" style={{ color }}>{risk.label}</div>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink2">{risk.summary}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-[10.5px]">
          <span className="text-ink3">
            已判定 {risk.answered}／{SIGNALS.length} 项信号
          </span>
          {risk.thin && (
            <span className="rounded border border-amber/30 bg-amber/10 px-2 py-0.5 text-amber">
              覆盖不足，分数仅供参考
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export function SignalGrid({
  verdicts, onToggle,
}: { verdicts: Record<string, boolean | null>; onToggle: (id: string, v: boolean | null) => void }) {
  return (
    <div className="grid gap-px overflow-hidden rounded border border-line bg-line sm:grid-cols-2">
      {SIGNALS.map((s) => {
        const v = verdicts[s.id]
        return (
          <div key={s.id} className="bg-card p-3.5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-[13px] font-medium text-ink">{s.label}</span>
              <div className="flex shrink-0 gap-1">
                {([true, null, false] as const).map((opt) => {
                  const on = v === opt
                  const label = opt === true ? '正' : opt === false ? '负' : '？'
                  const cls = on
                    ? opt === true
                      ? 'bg-go/45 text-go border-go/45'
                      : opt === false
                        ? 'bg-halt/45 text-halt border-halt/45'
                        : 'bg-line2 text-ink border-line2'
                    : 'border-line text-ink3 hover:border-line2 hover:text-ink2'
                  return (
                    <button
                      key={String(opt)}
                      onClick={() => onToggle(s.id, opt)}
                      className={`h-6 w-7 rounded border font-mono text-[11px] transition ${cls}`}
                      title={opt === true ? s.good : opt === false ? s.bad : '信息不足'}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
            <p className={`text-[11.5px] leading-snug ${v === false ? 'text-halt' : v === true ? 'text-go' : 'text-ink3'}`}>
              {v === false ? s.bad : v === true ? s.good : '尚未判定'}
            </p>
          </div>
        )
      })}
    </div>
  )
}
