'use client'
import { useState, type ReactNode } from 'react'

export function Fold({
  title, meta, children, defaultOpen = false, accent,
}: { title: string; meta?: ReactNode; children: ReactNode; defaultOpen?: boolean; accent?: string }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={`group overflow-hidden rounded-[3px] border transition ${open ? 'border-white/15 bg-ink2/60' : 'border-white/[.07] bg-white/[.015] hover:border-white/12'}`}>
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-0 text-left">
        <span
          className="h-[46px] w-[2px] shrink-0 transition-all"
          style={{ background: open ? (accent ?? 'var(--color-amber)') : 'transparent' }}
        />
        <span className="flex flex-1 items-center gap-3 px-4 py-3">
          <span className={`shrink-0 text-[10px] transition-transform ${open ? 'rotate-90 text-amber' : 'text-stone2 group-hover:text-stone'}`}>▶</span>
          <span className={`flex-1 text-[13.5px] transition ${open ? 'text-bone' : 'text-bone/85'}`}>{title}</span>
          {meta && <span className="shrink-0 text-[12px] text-stone">{meta}</span>}
        </span>
      </button>
      {open && <div className="border-t border-white/[.07] px-4 py-5 sm:px-5">{children}</div>}
    </div>
  )
}
