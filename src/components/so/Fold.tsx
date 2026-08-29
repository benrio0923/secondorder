'use client'
import { useState, type ReactNode } from 'react'

/** 折叠块：产品里绝大多数内容是「要用的时候才看」，不是一直摊开 */
export function Fold({
  title, meta, children, defaultOpen = false, tone,
}: {
  title: string
  meta?: ReactNode
  children: ReactNode
  defaultOpen?: boolean
  tone?: 'warn'
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={`overflow-hidden rounded border ${tone === 'warn' ? 'border-rose-900/40' : 'border-white/10'} bg-white/[0.02]`}>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/[0.03]"
      >
        <span className={`shrink-0 font-mono text-[11px] transition ${open ? 'rotate-90 text-amber' : 'text-stone/50'}`}>▸</span>
        <span className="flex-1 text-[13.5px] font-medium text-bone">{title}</span>
        {meta && <span className="shrink-0 text-[12px] text-stone">{meta}</span>}
      </button>
      {open && <div className="border-t border-white/8 px-4 py-4">{children}</div>}
    </div>
  )
}
