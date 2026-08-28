'use client'
import { SIGNALS } from '@/lib/so/signals'
import type { RiskResult } from '@/lib/so/signals'

export function RiskDial({ risk }: { risk: RiskResult }) {
  const pct = risk.score
  const color = risk.level === 'high' ? '#F5657A' : risk.level === 'mid' ? '#D9873F' : '#4ADE9B'
  const R = 52
  const C = Math.PI * R // 半圆周长
  const dash = (pct / 100) * C
  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 130 76" className="w-[150px] shrink-0" role="img" aria-label={`套利风险 ${pct} 分`}>
        <path d={`M 13 66 A ${R} ${R} 0 0 1 117 66`} fill="none" stroke="rgba(255,255,255,.10)" strokeWidth="9" strokeLinecap="round" />
        <path
          d={`M 13 66 A ${R} ${R} 0 0 1 117 66`}
          fill="none" stroke={color} strokeWidth="9" strokeLinecap="round"
          strokeDasharray={`${dash} ${C}`}
          style={{ transition: 'stroke-dasharray .8s cubic-bezier(.2,.8,.2,1), stroke .4s' }}
        />
        <text x="65" y="58" textAnchor="middle" className="font-mono" fontSize="26" fill="#EFEAE0" fontWeight="600">{pct}</text>
        <text x="65" y="72" textAnchor="middle" fontSize="8.5" fill="#8B928B" letterSpacing="1.6">风险 / 100</text>
      </svg>
      <div className="min-w-0">
        <div className="font-serif text-lg leading-tight" style={{ color }}>{risk.label}</div>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-stone">{risk.summary}</p>
        <div className="mt-2 font-mono text-[10.5px] text-stone/70">
          已判定 {risk.answered}／{SIGNALS.length} 项信号
        </div>
      </div>
    </div>
  )
}

export function SignalGrid({
  verdicts, onToggle,
}: { verdicts: Record<string, boolean | null>; onToggle: (id: string, v: boolean | null) => void }) {
  return (
    <div className="grid gap-px overflow-hidden rounded border border-white/10 bg-white/8 sm:grid-cols-2">
      {SIGNALS.map((s) => {
        const v = verdicts[s.id]
        return (
          <div key={s.id} className="bg-ink2/80 p-3.5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-[13px] font-medium text-bone">{s.label}</span>
              <div className="flex shrink-0 gap-1">
                {([true, null, false] as const).map((opt) => {
                  const on = v === opt
                  const label = opt === true ? '正' : opt === false ? '负' : '？'
                  const cls = on
                    ? opt === true
                      ? 'bg-emerald-500/25 text-emerald-200 border-emerald-500/40'
                      : opt === false
                        ? 'bg-rose-500/25 text-rose-200 border-rose-500/40'
                        : 'bg-white/12 text-bone border-white/25'
                    : 'border-white/10 text-stone/50 hover:border-white/25 hover:text-stone'
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
            <p className={`text-[11.5px] leading-snug ${v === false ? 'text-rose-300/85' : v === true ? 'text-emerald-300/75' : 'text-stone/60'}`}>
              {v === false ? s.bad : v === true ? s.good : '尚未判定'}
            </p>
          </div>
        )
      })}
    </div>
  )
}
