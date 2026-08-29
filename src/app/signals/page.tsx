'use client'
import { useSession } from '@/lib/so/session'
import { Shell, PageHead } from '@/components/so/Shell'
import { SignalGrid } from '@/components/so/Gauge'
import { Dial } from '@/components/so/Dial'
import { SIGNALS } from '@/lib/so/signals'

export default function SignalsPage() {
  const s = useSession()
  return (
    <Shell>
      <PageHead
        title="凭什么这么判"
        lede="六项信号，模型只给初判。你觉得哪一项判错了就点掉——判定、条款、必问清单会跟着重算。"
      />

      <div className="sheet rounded-[3px]">
        <div className="flex flex-col items-center gap-7 border-b border-line px-5 py-7 sm:flex-row sm:px-7">
          <Dial score={s.risk.score} level={s.risk.level} />
          <div className="min-w-0 flex-1">
            <div
              className="font-serif text-[20px] font-bold leading-none"
              style={{
                color:
                  s.risk.level === 'high' ? 'var(--color-halt)'
                  : s.risk.level === 'mid' ? 'var(--color-probe)'
                  : 'var(--color-go)',
              }}
            >
              {s.risk.label}
            </div>
            <p className="mt-3 text-[13.5px] leading-relaxed text-ink2">{s.risk.summary}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-[10.5px]">
              <span className="text-ink3">已判定 {s.risk.answered}／{SIGNALS.length} 项</span>
              {s.risk.thin && (
                <span className="rounded-[2px] border border-amber/45 bg-amber/[0.07] px-2 py-0.5 text-amber2">
                  覆盖不足 · 分数已按「追问」封顶，信号不足不等于安全
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="px-5 py-6 sm:px-7">
          <SignalGrid
            verdicts={s.verdicts}
            onToggle={(id, v) => s.setVerdicts((x) => ({ ...x, [id]: v }))}
          />
          <p className="mt-4 rounded-[2px] border border-line bg-paper2/60 p-3.5 text-[12px] leading-relaxed text-ink2">
            权重不是拍脑袋来的：<span className="text-ink">下游去向、目的地、动销</span>三项是关键项，
            任何一项没答上来，整份判定就不会给到「可谈」——业务员最容易吃亏的地方，
            正是把「他没说」当成「没问题」。
          </p>
        </div>
      </div>
    </Shell>
  )
}
