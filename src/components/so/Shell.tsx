'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { useSession } from '@/lib/so/session'

export const TABS = [
  { href: '/verdict', label: '判定', hint: '该不该做' },
  { href: '/signals', label: '信号', hint: '凭什么这么判' },
  { href: '/price', label: '落地价', hint: '卖多少钱' },
  { href: '/gate', label: '门槛', hint: '他有没有牌照' },
  { href: '/pitch', label: '话术', hint: '怎么跟他讲' },
  { href: '/deliver', label: '交付', hint: '合同与 90 天' },
] as const

const SEAL = {
  hold: { w: '暂缓', c: 'var(--color-halt)' },
  probe: { w: '追问', c: 'var(--color-probe)' },
  go: { w: '可谈', c: 'var(--color-go)' },
} as const

/** 卷宗外壳：顶上是这份单子的抬头，下面是索引舌。每个舌头一页，不用往下滚。 */
export function Shell({ children }: { children: ReactNode }) {
  const s = useSession()
  const path = usePathname()
  const router = useRouter()

  if (!s.ready) return <div className="mx-auto max-w-[1080px] px-5 py-24 text-[13px] text-ink3">载入中…</div>

  if (!s.ex) {
    return (
      <div className="mx-auto max-w-[1080px] px-5 py-24 text-center">
        <p className="font-serif text-[22px] text-ink">这份单子还没有买家。</p>
        <p className="mt-2 text-[13px] text-ink2">先贴一段对话，扫过之后这几页才有内容。</p>
        <Link href="/" className="mt-6 inline-flex rounded-[2px] bg-amber2 px-5 py-2.5 text-[13px] font-medium text-paper transition hover:bg-amber">
          去扫一个买家
        </Link>
      </div>
    )
  }

  const seal = SEAL[s.ruleVerdict]
  const idx = TABS.findIndex((t) => t.href === path)
  const prev = idx > 0 ? TABS[idx - 1] : null
  const next = idx >= 0 && idx < TABS.length - 1 ? TABS[idx + 1] : null

  return (
    <div className="mx-auto max-w-[1080px] px-5 pb-16 pt-6 sm:px-8">
      {/* 抬头 */}
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Link href="/" className="font-serif text-[19px] font-black leading-none tracking-tight text-ink transition hover:text-amber">
          第二单
        </Link>
        <span className="h-[18px] w-px bg-line2" />
        <span className="min-w-0 truncate text-[14px] text-ink">
          {s.m.flag} {s.ex.company ?? '（未具名买家）'}
        </span>
        <span
          className="tag rounded-[2px] border px-2 py-[3px]"
          style={{ color: seal.c, borderColor: seal.c, background: `color-mix(in srgb, ${seal.c} 8%, transparent)` }}
        >
          {seal.w}
        </span>
        <button
          onClick={() => { s.reset(); router.push('/') }}
          className="tag ml-auto text-ink3 transition hover:text-amber"
        >
          换一个买家
        </button>
      </div>

      {/* 索引舌 */}
      <nav className="tabs -mx-5 mb-6 overflow-x-auto px-5 sm:mx-0 sm:px-0">
        <div className="flex min-w-max items-end gap-1 border-b border-line2">
          {TABS.map((t) => {
            const on = path === t.href
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`group relative -mb-px rounded-t-[3px] border border-b-0 px-4 py-2.5 transition ${
                  on
                    ? 'border-line2 bg-card'
                    : 'border-transparent bg-transparent hover:bg-paper2'
                }`}
              >
                {on && <span className="absolute inset-x-0 top-0 h-[2px] bg-amber" />}
                {on && <span className="absolute inset-x-0 -bottom-px h-px bg-card" />}
                <span className={`block text-[13.5px] leading-none ${on ? 'text-ink' : 'text-ink2 group-hover:text-ink'}`}>
                  {t.label}
                </span>
                <span className={`mt-1 block text-[10.5px] leading-none ${on ? 'text-amber' : 'text-ink3'}`}>{t.hint}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {s.aiNote && <p className="mb-4 rounded-[2px] border border-amber/40 bg-amber/[0.06] px-3.5 py-2 text-[12px] text-amber2">{s.aiNote}</p>}

      <div key={path} className="page-in">{children}</div>

      {/* 翻页 */}
      <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-5">
        {prev ? (
          <Link href={prev.href} className="group flex items-center gap-2 text-[13px] text-ink2 transition hover:text-amber">
            <span className="text-ink3 transition group-hover:text-amber">←</span>
            {prev.label}
          </Link>
        ) : <span />}
        {next ? (
          <Link href={next.href} className="group flex items-center gap-2 rounded-[2px] bg-amber2 px-4 py-2 text-[13px] font-medium text-paper transition hover:bg-amber">
            {next.label}
            <span className="opacity-70">→</span>
          </Link>
        ) : (
          <Link href="/" className="text-[13px] text-ink2 transition hover:text-amber">回到扫描 →</Link>
        )}
      </div>
    </div>
  )
}

/** 每页统一的标题条：一句话说清这页在回答什么 */
export function PageHead({ title, lede, right }: { title: string; lede: string; right?: ReactNode }) {
  return (
    <div className="rise mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
      <div className="min-w-0">
        <h1 className="font-serif text-[26px] font-bold leading-none text-ink">{title}</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-ink2">{lede}</p>
      </div>
      {right && <div className="min-w-0 max-w-full">{right}</div>}
    </div>
  )
}
