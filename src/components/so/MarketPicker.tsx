'use client'
import { MARKET_LIST } from '@/lib/so/markets'
import { useSession } from '@/lib/so/session'
import type { MarketId } from '@/lib/so/types'

/** 市场是税则与牌照的开关。放在页头，不是埋在折叠区里。 */
export function MarketPicker() {
  const s = useSession()
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="tag mr-1 text-ink3">市场</span>
      {MARKET_LIST.map((x) => {
        const on = s.market === x.id
        return (
          <button
            key={x.id}
            onClick={() => { s.setMarket(x.id as MarketId); s.setMarkup(undefined) }}
            className={`rounded-[2px] border px-2.5 py-1.5 text-[12.5px] leading-none transition ${
              on ? 'border-amber bg-amber/[0.08] text-amber2' : 'border-line text-ink2 hover:border-line2 hover:bg-paper2'
            }`}
          >
            {x.flag} {x.name}
          </button>
        )
      })}
    </div>
  )
}
