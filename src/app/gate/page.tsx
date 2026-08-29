'use client'
import { useSession } from '@/lib/so/session'
import { Shell, PageHead } from '@/components/so/Shell'
import { Chip, SourceTag, Sec } from '@/components/so/parts'
import { MarketPicker } from '@/components/so/MarketPicker'
import { SampleCheck } from '@/components/so/SampleCheck'
import { wantsSample } from '@/lib/so/sample'

export default function GatePage() {
  const s = useSession()
  const m = s.m

  return (
    <Shell>
      <PageHead
        title={`${m.name}的门槛`}
        lede="他手上没有这些证，货到了也进不去——这一层查在签约之前，不是查在报关那天。"
        right={<MarketPicker />}
      />

      <div className="sheet mb-3 rounded-[3px]">
        <div className="border-b border-line bg-amber/[0.05] px-5 py-4 sm:px-7">
          <span className="tag text-amber2">买方必须持有</span>
          <p className="mt-1.5 text-[14px] leading-snug text-ink">{m.gate}</p>
        </div>
        <div className="grid gap-px bg-line sm:grid-cols-2">
          {m.licences.map((l, i) => (
            <div key={i} className="bg-card p-4 sm:p-5">
              <div className="mb-2 flex items-center gap-2">
                <Chip tone={l.who === 'buyer' ? 'warn' : 'neutral'}>{l.who === 'buyer' ? '买方' : '你方'}</Chip>
                {l.form && <span className="font-mono text-[10px] text-ink3">{l.form}</span>}
              </div>
              <div className="text-[13.5px] font-medium leading-snug text-ink">
                {l.name}
                <SourceTag source={l.source} />
              </div>
              <p className="mt-2 text-[11.5px] leading-relaxed text-halt">缺了：{l.ifMissing}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="sheet mb-3 rounded-[3px] px-5 py-6 sm:px-7">
        <Sec title="这个市场还有几件事值得知道" meta={`${m.insights.length} 条`} />
        <div className="space-y-2">
          {m.insights.map((ins, i) => (
            <div
              key={i}
              className={`rounded-[2px] border-l-[3px] px-4 py-3 ${
                ins.tone === 'warn' ? 'border-l-halt bg-halt/[0.05]'
                : ins.tone === 'edge' ? 'border-l-amber bg-amber/[0.05]'
                : 'border-l-line2 bg-paper2/60'
              }`}
            >
              <div className="text-[13px] font-medium text-ink">{ins.title}</div>
              <p className="mt-1.5 text-[12px] leading-relaxed text-ink2">{ins.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="sheet rounded-[3px] px-5 py-6 sm:px-7">
        <Sec
          title="寄样品之前"
          meta={<span className={s.abv >= 24 ? 'text-halt' : 'text-go'}>{s.abv >= 24 ? '按危险品走' : '可按普货寄'}</span>}
        />
        <SampleCheck abv={s.abv} asked={wantsSample(s.raw, s.ex?.askedFor)} />
      </div>
    </Shell>
  )
}
