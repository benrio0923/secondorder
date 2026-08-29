'use client'
import type { ReactNode } from 'react'

export function Chip({ tone = 'neutral', children }: { tone?: 'good' | 'bad' | 'neutral' | 'warn'; children: ReactNode }) {
  const c =
    tone === 'good' ? 'text-go border-go/30 bg-go/10'
    : tone === 'bad' ? 'text-halt border-halt/30 bg-halt/10'
    : tone === 'warn' ? 'text-amber border-amber/30 bg-amber/10'
    : 'text-ink2 border-line bg-paper2'
  return <span className={`tag inline-flex items-center gap-1.5 rounded-[2px] border px-2 py-[3px] ${c}`}>{children}</span>
}

export function SourceTag({ source, asOf }: { source: string; asOf?: string }) {
  return (
    <span className="group/s relative ml-1.5 inline-flex cursor-help items-center align-middle">
      <span className="inline-block h-[13px] w-[13px] rounded-full border border-line2 text-center font-mono text-[8px] leading-[11px] text-ink3">i</span>
      <span className="pointer-events-none fixed inset-x-3 bottom-3 z-50 w-auto rounded-[2px] border border-line2 bg-card px-3 py-2 sm:absolute sm:bottom-full sm:left-1/2 sm:right-auto sm:mb-2 sm:w-[17rem] sm:-translate-x-1/2 text-left text-[11px] font-normal leading-relaxed text-ink2 opacity-0 shadow-2xl transition group-hover/s:opacity-100">
        <b className="text-ink">来源</b> {source}
        {asOf && (<><br /><b className="text-ink">版本</b> {asOf}</>)}
      </span>
    </span>
  )
}

export function Stat({ label, value, unit, sub, tone }: { label: string; value: string; unit?: string; sub?: string; tone?: 'good' | 'bad' | 'warn' }) {
  const c = tone === 'bad' ? 'text-halt' : tone === 'good' ? 'text-go' : tone === 'warn' ? 'text-amber' : 'text-ink'
  return (
    <div className="min-w-0">
      <div className="tag mb-2 text-ink3">{label}</div>
      <div className={`num text-[21px] leading-none ${c}`}>
        {value}
        {unit && <span className="ml-1 font-sans text-[10.5px] font-normal text-ink3">{unit}</span>}
      </div>
      {sub && <div className="mt-1.5 text-[11px] leading-snug text-ink3">{sub}</div>}
    </div>
  )
}

export function Btn({
  children, onClick, disabled, variant = 'primary', size = 'md',
}: { children: ReactNode; onClick?: () => void; disabled?: boolean; variant?: 'primary' | 'ghost'; size?: 'sm' | 'md' }) {
  const v = variant === 'primary'
    ? 'bg-amber text-paper hover:bg-gold'
    : 'border border-line text-ink hover:border-line2 hover:bg-paper2'
  const s = size === 'sm' ? 'px-3.5 py-1.5 text-[12px]' : 'px-5 py-2.5 text-[13px]'
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-[2px] font-medium transition disabled:cursor-not-allowed disabled:opacity-35 ${v} ${s}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export function Num({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`num ${className}`}>{children}</span>
}

export function NumField({ label, value, set, step, unit }: { label: string; value: number; set: (n: number) => void; step: number; unit: string }) {
  return (
    <div>
      <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink2">{label}</div>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={value}
          step={step}
          onChange={(e) => set(Math.max(0, Number(e.target.value) || 0))}
          className="w-full rounded border border-line bg-paper2/60 px-2 py-1.5 font-mono text-[12.5px] tabular-nums text-ink outline-none focus:border-amber/60 focus:bg-card"
        />
        <span className="shrink-0 text-[10.5px] text-ink2">{unit}</span>
      </div>
    </div>
  )
}

/** 页内小节标题：白单子上的横杠，不用再包一层卡片 */
export function Sec({ title, meta }: { title: string; meta?: ReactNode }) {
  return (
    <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line pb-2">
      <h2 className="font-serif text-[16px] font-bold leading-none text-ink">{title}</h2>
      {meta && <span className="text-[12px] text-ink2">{meta}</span>}
    </div>
  )
}
