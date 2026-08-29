'use client'
import { useState, type ReactNode } from 'react'

export function Fold({
  title, meta, children, defaultOpen = false, accent,
}: { title: string; meta?: ReactNode; children: ReactNode; defaultOpen?: boolean; accent?: string }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={`group overflow-hidden rounded-[3px] border transition ${open ? 'border-line bg-card' : 'border-line bg-paper2 hover:border-line2'}`}>
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-0 text-left">
        <span
          className="h-[46px] w-[2px] shrink-0 transition-all"
          style={{ background: open ? (accent ?? 'var(--color-amber)') : 'transparent' }}
        />
        <span className="flex flex-1 items-center gap-3 px-4 py-3">
          <span className={`shrink-0 text-[10px] transition-transform ${open ? 'rotate-90 text-amber' : 'text-ink3 group-hover:text-ink2'}`}>▶</span>
          <span className={`flex-1 text-[13.5px] transition ${open ? 'text-ink' : 'text-ink2'}`}>{title}</span>
          {meta && <span className="shrink-0 text-[12px] text-ink2">{meta}</span>}
        </span>
      </button>
      {open && <div className="border-t border-line px-4 py-5 sm:px-5">{children}</div>}
    </div>
  )
}
