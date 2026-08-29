'use client'
import { ABV_THRESHOLDS, classifySample } from '@/lib/so/sample'

export function SampleCheck({ abv, asked }: { abv: number; asked: boolean }) {
  const r = classifySample(abv)
  const tone =
    r.band === 'free'
      ? { border: 'border-l-go', bg: 'bg-go/[0.06]', text: 'text-go' }
      : r.band === 'class3'
        ? { border: 'border-l-halt', bg: 'bg-halt/[0.06]', text: 'text-halt' }
        : { border: 'border-l-halt', bg: 'bg-halt/[0.06]', text: 'text-halt' }

  return (
    <div className={`rounded border-l-2 ${tone.border} ${tone.bg} px-4 py-3.5`}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className={`font-mono text-[10px] uppercase tracking-[0.14em] ${tone.text}`}>寄样品之前</span>
        {asked && (
          <span className="rounded border border-amber/30 bg-amber/10 px-2 py-0.5 font-mono text-[10px] text-amber">
            对方已经开口要样品了
          </span>
        )}
      </div>
      <div className="mb-1.5 text-[13.5px] font-medium text-ink">{r.title}</div>
      <p className="mb-2.5 text-[12px] leading-relaxed text-ink2">{r.detail}</p>

      {r.band !== 'free' && (
        <>
          <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink2">你得先备齐</div>
          <ul className="mb-2.5 space-y-1">
            {r.needs.map((n) => (
              <li key={n} className="flex gap-2 text-[12px] leading-snug text-ink">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-halt" />
                {n}
              </li>
            ))}
          </ul>
          <p className="text-[12px] leading-relaxed text-amber">
            展会上最容易脱口而出的一句是「我寄两支给你试试」。
            <span className="text-ink">先问清楚对方能不能收，再答应寄</span>
            ——不然货会卡在仓库，而对方以为你在拖。
          </p>
        </>
      )}

      <div className="mt-3 border-t border-line pt-3">
        <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink2">
          度数的三条线，放在一起才看得出它决定了多少事
        </div>
        <div className="relative h-[38px]">
          <div className="absolute inset-x-0 top-[15px] h-[3px] rounded bg-line" />
          <div
            className="absolute top-[15px] h-[3px] rounded bg-amber/70"
            style={{ left: 0, width: `${Math.min(100, (abv / 75) * 100)}%`, transition: 'width .4s' }}
          />
          {ABV_THRESHOLDS.map((t) => {
            // 靠边的提示框往内展开，不然窄屏上会把整页撑宽
            const pos = (t.abv / 75) * 100
            const align = pos > 70 ? 'right-0' : pos < 30 ? 'left-0' : 'left-1/2 -translate-x-1/2'
            return (
              <div key={t.abv} className="group absolute top-0" style={{ left: `${pos}%` }}>
                <div className="h-[33px] w-px -translate-x-1/2 bg-line2" />
                <span className="absolute left-0 top-[34px] -translate-x-1/2 font-mono text-[9.5px] text-ink2">
                  {t.abv}°
                </span>
                <span
                  className={`pointer-events-none absolute bottom-full ${align} z-40 mb-1 w-[min(13rem,70vw)] rounded border border-line bg-card px-2.5 py-1.5 text-[11px] leading-snug text-ink2 opacity-0 shadow-2xl transition group-hover:opacity-100`}
                >
                  <b className="text-ink">{t.label}</b>
                  <br />
                  {t.detail}
                </span>
              </div>
            )
          })}
          <div
            className="absolute top-[9px] h-[15px] w-[3px] -translate-x-1/2 rounded bg-amber"
            style={{ left: `${Math.min(100, (abv / 75) * 100)}%`, transition: 'left .4s' }}
            title={`你的酒 ${abv} 度`}
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[10.5px] text-ink3">
          {ABV_THRESHOLDS.map((t) => (
            <span key={t.abv}>
              <b className="text-ink2">{t.abv}°</b> {t.label}
            </span>
          ))}
        </div>
      </div>
      <p className="mt-2.5 text-[10.5px] leading-snug text-ink3">依据：{r.source}。实际以承运商与目的国规定为准。</p>
    </div>
  )
}
