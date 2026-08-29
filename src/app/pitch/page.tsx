'use client'
import { useState } from 'react'
import { useSession } from '@/lib/so/session'
import { Shell, PageHead } from '@/components/so/Shell'
import { Sec } from '@/components/so/parts'
import { PitchKit } from '@/components/so/PitchKit'
import { BAIJIU_BY_ID } from '@/lib/so/baijiu'

export default function PitchPage() {
  const s = useSession()
  const [copied, setCopied] = useState(false)

  return (
    <Shell>
      <PageHead
        title="怎么跟他讲这支酒"
        lede="53 度、酱香、一年一个周期——这些话对他没用。要讲的是这支酒在他那边怎么进菜单、配什么、卖给谁。"
      />

      {/* 第一口的真实反应 */}
      <section className="band mb-3 rounded-[3px]">
        <div className="shot" style={{ backgroundImage: 'url(/img/pour.png)' }} />
        <div className="wash" />
        <div className="inner px-5 py-7 sm:px-7">
          <span className="tag text-gold">先有个心理准备</span>
          <p className="mt-2.5 max-w-[52ch] text-[14.5px] leading-[1.85] text-paper/90">
            海外买家第一次喝酱香，最常给出的五个形容词是
            <span className="font-medium text-gold">臭起司、八角、菠萝、麝香、汽油</span>。
            这不是他不懂酒——是这套风味在他的参照系里没有位置。
            <span className="text-paper">别急着解释工艺，先给他一个吃法。</span>
          </p>
        </div>
      </section>

      <div className="sheet mb-3 rounded-[3px] px-5 py-6 sm:px-7">
        <PitchKit
          market={s.market}
          m={s.m}
          aroma={s.aroma}
          setAroma={s.setAroma}
          bottle={s.bottleId ? BAIJIU_BY_ID[s.bottleId] : null}
        />
      </div>

      <div className="sheet rounded-[3px] px-5 py-6 sm:px-7">
        <Sec
          title="第一封回信"
          meta={
            <button
              onClick={() => {
                navigator.clipboard?.writeText(s.brief?.reply ?? '')
                setCopied(true)
                setTimeout(() => setCopied(false), 1600)
              }}
              className="rounded-[2px] bg-amber2 px-3.5 py-1.5 text-[12px] font-medium text-paper transition hover:bg-amber"
            >
              {copied ? '已拷贝' : '拷贝回信'}
            </button>
          }
        />
        <pre className="max-w-[64ch] whitespace-pre-wrap rounded-[2px] border border-line bg-paper2/60 p-4 font-sans text-[13px] leading-[1.9] text-ink2">
          {s.brief?.reply ?? '（还没生成回信）'}
        </pre>
      </div>
    </Shell>
  )
}
