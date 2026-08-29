'use client'
import type { ReactNode } from 'react'

export function Chip({ tone = 'neutral', children }: { tone?: 'good' | 'bad' | 'neutral' | 'warn'; children: ReactNode }) {
  const c =
    tone === 'good' ? 'text-go border-go/30 bg-go/10'
    : tone === 'bad' ? 'text-halt border-halt/30 bg-halt/10'
    : tone === 'warn' ? 'text-amber border-amber/30 bg-amber/10'
    : 'text-stone border-white/12 bg-white/[.04]'
  return <span className={`tag inline-flex items-center gap-1.5 rounded-[2px] border px-2 py-[3px] ${c}`}>{children}</span>
}

export function SourceTag({ source, asOf }: { source: string; asOf?: string }) {
  return (
    <span className="group/s relative ml-1.5 inline-flex cursor-help items-center align-middle">
      <span className="inline-block h-[13px] w-[13px] rounded-full border border-white/22 text-center font-mono text-[8px] leading-[11px] text-stone2">i</span>
      <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-[min(17rem,72vw)] -translate-x-1/2 rounded-[2px] border border-white/15 bg-ink3 px-3 py-2 text-left text-[11px] font-normal leading-relaxed text-stone opacity-0 shadow-2xl transition group-hover/s:opacity-100">
        <b className="text-bone">来源</b> {source}
        {asOf && (<><br /><b className="text-bone">版本</b> {asOf}</>)}
      </span>
    </span>
  )
}

export function Stat({ label, value, unit, sub, tone }: { label: string; value: string; unit?: string; sub?: string; tone?: 'good' | 'bad' | 'warn' }) {
  const c = tone === 'bad' ? 'text-halt' : tone === 'good' ? 'text-go' : tone === 'warn' ? 'text-amber' : 'text-bone'
  return (
    <div className="min-w-0">
      <div className="tag mb-2 text-stone2">{label}</div>
      <div className={`num text-[21px] leading-none ${c}`}>
        {value}
        {unit && <span className="ml-1 font-sans text-[10.5px] font-normal text-stone2">{unit}</span>}
      </div>
      {sub && <div className="mt-1.5 text-[11px] leading-snug text-stone2">{sub}</div>}
    </div>
  )
}

export function Btn({
  children, onClick, disabled, variant = 'primary', size = 'md',
}: { children: ReactNode; onClick?: () => void; disabled?: boolean; variant?: 'primary' | 'ghost'; size?: 'sm' | 'md' }) {
  const v = variant === 'primary'
    ? 'bg-amber text-ink hover:bg-gold'
    : 'border border-white/15 text-bone hover:border-white/35 hover:bg-white/5'
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
