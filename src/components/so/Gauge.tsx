'use client'
import { SIGNALS } from '@/lib/so/signals'

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
