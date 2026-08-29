'use client'
import { useSession } from '@/lib/so/session'
import { Shell, PageHead } from '@/components/so/Shell'
import { Stat, SourceTag, NumField, Sec } from '@/components/so/parts'
import { Waterfall } from '@/components/so/Waterfall'
import { SpecAdvisor } from '@/components/so/SpecAdvisor'
import { BottlePicker } from '@/components/so/BottlePicker'
import { MarketPicker } from '@/components/so/MarketPicker'
import { computePrice } from '@/lib/so/pricing'

const fmt = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 0 })

export default function PricePage() {
  const s = useSession()
  const p = s.price

  return (
    <Shell>
      <PageHead
        title="这瓶酒到他货架上要卖多少钱"
        lede="从你的内销开票价一路算到消费者手里，每一层税都标了税则来源与版本。"
        right={<MarketPicker />}
      />

      {/* 四个关键数 */}
      <div className="sheet mb-3 grid grid-cols-2 gap-px rounded-[3px] bg-line sm:grid-cols-4">
        <div className="bg-card px-4 py-5 sm:px-5">
          <Stat label="出口保本线" value={fmt(p.breakeven)} unit="元" sub="低于此价这单亏" />
        </div>
        <div className="bg-card px-4 py-5 sm:px-5">
          <Stat label="离岸报价" value={fmt(p.fob)} unit="元" sub={`加成 ${Math.round(s.margin * 100)}%`} />
        </div>
        <div className="bg-card px-4 py-5 sm:px-5">
          <Stat label="完税落地" value={fmt(p.landed)} unit="元" tone="warn" sub={`目的国税负 ${s.taxRate}%`} />
        </div>
        <div className="bg-card px-4 py-5 sm:px-5">
          <Stat label="终端零售" value={fmt(p.retail)} unit="元" tone={p.multiple > 6 ? 'bad' : undefined} sub={`${p.multiple} 倍于内销`} />
        </div>
      </div>

      {/* 瀑布 */}
      <div className="sheet mb-3 rounded-[3px] px-5 py-6 sm:px-7">
        <Sec title="钱是在哪一层被拿走的" meta={`到岸价 ${fmt(p.cif)} 元 → 终端 ${fmt(p.retail)} 元`} />
        <Waterfall p={p} m={s.m} />
      </div>

      {/* 参数 */}
      <div className="sheet mb-3 rounded-[3px] px-5 py-6 sm:px-7">
        <Sec title="换一支酒，或者改参数" meta="上面的数字会跟着重算" />

        <div className="mb-5">
          <BottlePicker id={s.bottleId} onPick={s.pickBottle} />
        </div>

        <div className="mb-5 grid gap-3 rounded-[2px] border border-line bg-paper2/50 p-3.5 sm:grid-cols-5">
          <NumField label="内销开票价" value={s.dp} set={s.setDp} step={20} unit="元" />
          <NumField label="容量" value={s.ml} set={s.setMl} step={50} unit="ml" />
          <NumField label="酒精度" value={s.abv} set={s.setAbv} step={1} unit="%" />
          <NumField label="物流分摊" value={s.logi} set={s.setLogi} step={2} unit="元" />
          <div>
            <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink2">出口加成</div>
            <input
              type="range" min={0} max={0.6} step={0.05} value={s.margin}
              onChange={(e) => s.setMargin(Number(e.target.value))}
              className="w-full accent-[#9A5414]"
            />
            <div className="mt-0.5 font-mono text-[11px] text-ink">{Math.round(s.margin * 100)}%</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="tag text-amber2">他打算怎么卖</span>
          {([['onPremise', '餐饮'], ['retail', '零售']] as const).map(([k, label]) => (
            <button
              key={k}
              onClick={() => { s.setChan(k); s.setMarkup(undefined) }}
              className={`rounded-[2px] border px-3.5 py-1.5 text-[12.5px] transition ${
                s.chan === k ? 'border-amber bg-amber/[0.08] text-amber2' : 'border-line text-ink2 hover:border-line2 hover:bg-paper2'
              }`}
            >
              {label}
            </button>
          ))}
          <span className="text-[11.5px] text-ink3">餐饮端毛利率 75–85%，零售 20–23%，终端价差三倍以上</span>
          <div className="ml-auto flex flex-wrap gap-2">
            {p.channel.map((c, i) => (
              <label key={c.label} className="flex items-center gap-1">
                <span className="text-[11px] text-ink2">{c.label}</span>
                <input
                  type="number" min={0} max={95}
                  value={Math.round(c.rate * 100)}
                  onChange={(e) => {
                    const v = Math.min(95, Math.max(0, Number(e.target.value) || 0)) / 100
                    const next = p.channel.map((x) => x.rate)
                    next[i] = v
                    s.setMarkup(next)
                  }}
                  className="w-[46px] rounded border border-line bg-paper2/60 px-1 py-0.5 text-right font-mono text-[11.5px] tabular-nums text-ink outline-none focus:border-amber/60"
                />
                <span className="text-[10px] text-ink3">%</span>
              </label>
            ))}
          </div>
        </div>

        {s.market === 'us' && (
          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-[2px] border border-amber/45 bg-amber/[0.06] p-3.5">
            <input
              type="checkbox" checked={s.cbma}
              onChange={(e) => s.setCbma(e.target.checked)}
              className="mt-0.5 accent-[#9A5414]"
            />
            <span className="text-[12.5px] leading-relaxed text-ink">
              把 CBMA 额度指派给这家进口商
              <span className="font-medium text-amber2">
                {' '}值 {fmt(
                  computePrice({ domesticPrice: s.dp, ml: s.ml, abv: s.abv, logistics: s.logi, market: 'us', exportMargin: s.margin, channel: s.chan }).landed
                  - computePrice({ domesticPrice: s.dp, ml: s.ml, abv: s.abv, logistics: s.logi, market: 'us', exportMargin: s.margin, channel: s.chan, cbmaAssigned: true }).landed,
                )} 元／瓶
              </span>
              ，一柜十几万，不花你一毛钱——但必须由中国生产商主动指派，进口商自己拿不到。
            </span>
          </label>
        )}
      </div>

      {/* 规格建议 */}
      <div className="sheet mb-3 rounded-[3px] px-5 py-6 sm:px-7">
        <Sec title="同样一支酒，报什么规格最划算" meta="税制在哪个点上折" />
        <SpecAdvisor
          market={s.market} m={s.m} domesticPrice={s.dp}
          logistics={s.logi} margin={s.margin} cbma={s.cbma} channel={s.chan}
        />
      </div>

      {/* 套利池 */}
      <div className="sheet rounded-[3px] border-l-[3px] border-l-halt px-5 py-5 sm:px-7">
        <p className="text-[13px] leading-[1.9] text-ink2">
          内销开票 {fmt(s.dp)} 元里，消费税约 {fmt(p.consumptionTaxSaved)} 元出口免征
          <SourceTag source="消费税：20% 从价 ＋ 0.5 元／500ml 从量；出口免征不退" />
          ，另可退增值税 {fmt(p.vatRebate)} 元
          <SourceTag source="白酒出口增值税退税率 13%" />
          。合计 <span className="num text-[18px] text-halt">{fmt(p.arbitragePool)}</span> 元／瓶——
          <span className="font-medium text-ink">套利型买家真正要的是这笔钱，跟酒卖不卖得掉无关。</span>
        </p>
      </div>
    </Shell>
  )
}
