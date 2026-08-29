'use client'
import { useState } from 'react'
import { useSession } from '@/lib/so/session'
import { Shell, PageHead } from '@/components/so/Shell'
import { Sec } from '@/components/so/parts'
import { AfterShip } from '@/components/so/AfterShip'

export default function DeliverPage() {
  const s = useSession()
  const [copied, setCopied] = useState(false)

  return (
    <Shell>
      <PageHead
        title="签之前写死，发出去之后盯住"
        lede="首单出问题不是在报关那天，是在合同少写的那两行、和第 30 天没人回的那封邮件。"
        right={
          <button
            onClick={() => {
              navigator.clipboard?.writeText(s.fullBrief())
              setCopied(true)
              setTimeout(() => setCopied(false), 1800)
            }}
            className="rounded-[2px] bg-amber2 px-4 py-2 text-[12.5px] font-medium text-paper transition hover:bg-amber"
          >
            {copied ? '整份简报已拷贝' : '拷贝整份简报'}
          </button>
        }
      />

      <div className="sheet mb-3 rounded-[3px] px-5 py-6 sm:px-7">
        <Sec title="该写进第一份合同的条款" meta={`${s.clauses.length} 条 · 按这个买家的负向信号挑的`} />
        <div className="grid gap-2 sm:grid-cols-2">
          {s.clauses.map((c) => (
            <div key={c.id} className="rounded-[2px] border border-line bg-paper2/50 p-4">
              <div className="text-[13.5px] font-medium text-ink">{c.title}</div>
              <div className="mt-1 text-[11.5px] text-halt">挡掉：{c.blocks}</div>
              <p className="mt-2.5 border-l-[3px] border-amber/50 pl-3 text-[12px] leading-relaxed text-ink2">{c.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="sheet rounded-[3px] px-5 py-6 sm:px-7">
        <Sec
          title="首单发出之后的 90 天"
          meta={s.risk.level !== 'low' ? <span className="text-halt">D+7 与 D+30 要盯紧</span> : '七个节点'}
        />
        <AfterShip risk={s.risk} buyer={s.ex?.company ?? undefined} market={`${s.m.flag} ${s.m.name}`} />
      </div>

      <section className="band mt-3 rounded-[3px]">
        <div className="shot" style={{ backgroundImage: 'url(/img/cups.jpg)' }} />
        <div className="wash" />
        <div className="inner px-5 py-7 sm:px-7">
          <span className="tag text-gold">为什么这个工具叫「第二单」</span>
          <p className="mt-2.5 max-w-[50ch] text-[14.5px] leading-[1.85] text-paper/90">
            第一单靠展会、靠人情、靠一次降价，多数酒厂都签得下来。
            <span className="font-medium text-gold">卡住的是第二单</span>——
            货在他仓里没动，他就不会再下单，而你到那时才知道，已经晚了九十天。
          </p>
        </div>
      </section>
    </Shell>
  )
}
