'use client'
import type { ReactNode } from 'react'

export function Panel({
  title, eyebrow, children, right, tone = 'default',
}: { title?: string; eyebrow?: string; children: ReactNode; right?: ReactNode; tone?: 'default' | 'warn' | 'ok' }) {
  const ring =
    tone === 'warn' ? 'border-rose-900/50' : tone === 'ok' ? 'border-emerald-900/50' : 'border-white/10'
  return (
    <section className={`rounded-lg border ${ring} bg-white/[0.025] backdrop-blur-sm`}>
      {(title || eyebrow) && (
        <header className="flex items-start justify-between gap-4 border-b border-white/8 px-5 py-3.5">
          <div className="min-w-0">
            {eyebrow && (
              <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-amber">{eyebrow}</div>
            )}
            {title && <h3 className="font-serif text-[15px] leading-snug text-bone">{title}</h3>}
          </div>
          {right && <div className="shrink-0">{right}</div>}
        </header>
      )}
      <div className="px-5 py-4">{children}</div>
    </section>
  )
}

export function Chip({ tone = 'neutral', children }: { tone?: 'good' | 'bad' | 'neutral' | 'warn'; children: ReactNode }) {
  const c =
    tone === 'good'
      ? 'bg-emerald-500/12 text-emerald-300 border-emerald-500/25'
      : tone === 'bad'
        ? 'bg-rose-500/12 text-rose-300 border-rose-500/25'
        : tone === 'warn'
          ? 'bg-amber-500/12 text-amber-200 border-amber-500/25'
          : 'bg-white/6 text-stone border-white/12'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-[10.5px] tracking-wide ${c}`}>
      {children}
    </span>
  )
}

export function Num({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`font-mono tabular-nums ${className}`}>{children}</span>
}

export function SourceTag({ source, asOf }: { source: string; asOf?: string }) {
  return (
    <span className="group relative inline-flex cursor-help items-center">
      <span className="ml-1.5 inline-block h-3 w-3 rounded-full border border-white/25 text-center font-mono text-[8px] leading-[10px] text-stone">
        i
      </span>
      <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded border border-white/15 bg-ink2 px-3 py-2 text-[11px] leading-relaxed text-stone opacity-0 shadow-2xl transition group-hover:opacity-100">
        <b className="text-bone">来源：</b>
        {source}
        {asOf && (
          <>
            <br />
            <b className="text-bone">版本：</b>
            {asOf}
          </>
        )}
      </span>
    </span>
  )
}

export function Stat({ label, value, unit, sub, tone }: { label: string; value: string; unit?: string; sub?: string; tone?: 'good' | 'bad' | 'warn' }) {
  const c = tone === 'bad' ? 'text-rose-300' : tone === 'good' ? 'text-emerald-300' : tone === 'warn' ? 'text-amber' : 'text-bone'
  return (
    <div className="min-w-0">
      <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-stone">{label}</div>
      <div className={`font-serif text-2xl leading-none ${c}`}>
        <Num>{value}</Num>
        {unit && <span className="ml-1 font-sans text-[11px] text-stone">{unit}</span>}
      </div>
      {sub && <div className="mt-1.5 text-[11px] leading-snug text-stone">{sub}</div>}
    </div>
  )
}

export function Btn({
  children, onClick, disabled, variant = 'primary', size = 'md',
}: { children: ReactNode; onClick?: () => void; disabled?: boolean; variant?: 'primary' | 'ghost'; size?: 'sm' | 'md' }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded font-medium transition disabled:cursor-not-allowed disabled:opacity-40'
  const v =
    variant === 'primary'
      ? 'bg-amber text-ink hover:bg-amber/85'
      : 'border border-white/15 text-bone hover:border-white/35 hover:bg-white/5'
  const s = size === 'sm' ? 'px-3 py-1.5 text-[12px]' : 'px-4 py-2.5 text-[13px]'
  return (
    <button className={`${base} ${v} ${s}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}
