'use client'
import { useState } from 'react'
import { useSession } from '@/lib/so/session'
import { Shell } from '@/components/so/Shell'
import { Verdict } from '@/components/so/Verdict'

export default function VerdictPage() {
  const s = useSession()
  const [copied, setCopied] = useState(false)
  const [copiedAll, setCopiedAll] = useState(false)

  return (
    <Shell>
      {s.ex && (
        <>
          {s.uncovered && (
            <div className="mb-3 rounded-[2px] border border-halt/45 bg-halt/[0.06] px-4 py-3">
              <span className="tag text-halt">规则库未涵盖</span>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink">
                这个买家看起来在<span className="font-medium text-halt">「{s.uncovered}」</span>，
                规则库只涵盖香港、新加坡、越南、美国、韩国。「落地价」与「门槛」两页
                <span className="font-medium text-halt">不适用于他</span>，请在那两页手动选一个最接近的市场参考。
              </p>
            </div>
          )}

          <Verdict
            ex={s.ex}
            m={s.m}
            risk={s.risk}
            brief={s.brief}
            price={s.price}
            abv={s.abv}
            verdict={s.ruleVerdict}
            busy={s.briefBusy}
            copied={copied}
            copiedAll={copiedAll}
            onCopyReply={() => {
              navigator.clipboard?.writeText(s.brief?.reply ?? '')
              setCopied(true)
              setTimeout(() => setCopied(false), 1600)
            }}
            onCopyAll={() => {
              navigator.clipboard?.writeText(s.fullBrief())
              setCopiedAll(true)
              setTimeout(() => setCopiedAll(false), 1800)
            }}
            onRetry={() => void s.makeBrief()}
          />
        </>
      )}
    </Shell>
  )
}
