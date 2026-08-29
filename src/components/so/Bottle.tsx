'use client'
import { useEffect, useState } from 'react'

/**
 * 一瓶酒，液面高度就是套利风险。
 *
 * 梗在这里：扫码验茅台真假人人都会——这个工具反过来用，扫的不是酒，是买家。
 * 而高风险时，瓶里装的根本不是酒，是那 33% 的税差
 * （消费税 20% 从价 ＋ 增值税退税 13%），这才是套利型买家真正要的东西。
 */
export function Bottle({ score, level, abv = 53 }: { score: number; level: 'low' | 'mid' | 'high'; abv?: number }) {
  const [fill, setFill] = useState(0)
  const [n, setN] = useState(0)

  useEffect(() => {
    let raf = 0
    const t0 = performance.now()
    const run = (t: number) => {
      const k = Math.min(1, (t - t0) / 1400)
      const e = 1 - Math.pow(1 - k, 4)
      const slosh = k < 0.6 ? Math.sin(k * Math.PI / 0.6) * 6 * (1 - k) : 0
      setFill(score * e + slosh)
      setN(Math.round(score * e))
      if (k < 1) raf = requestAnimationFrame(run)
    }
    raf = requestAnimationFrame(run)
    return () => cancelAnimationFrame(raf)
  }, [score])

  const hi = level === 'high'
  const mid = level === 'mid'
  const glow = hi ? '#D6453F' : mid ? '#E08A2E' : '#B8781F'

  // 瓶子永远是满的——变的是里面装什么。
  // 琥珀是酒，红色是税差，从瓶底把酒顶上来。
  const TOP = 88, BOT = 236
  const y = BOT - (Math.max(0, Math.min(104, fill)) / 100) * (BOT - TOP)

  const OUT = 'M68 22 L68 50 Q68 58 62 64 L42 82 Q34 90 34 102 L34 228 Q34 242 48 242 L112 242 Q126 242 126 228 L126 102 Q126 90 118 82 L98 64 Q92 58 92 50 L92 22 Z'
  const IN  = 'M71 26 L71 51 Q71 60 64 67 L45 84 Q39 91 39 102 L39 227 Q39 237 49 237 L111 237 Q121 237 121 227 L121 102 Q121 91 115 84 L96 67 Q89 60 89 51 L89 26 Z'

  return (
    <div className="relative flex flex-col items-center">
      <svg viewBox="0 0 160 262" className="h-[248px] w-[152px] overflow-visible">
        <defs>
          <clipPath id="bin"><path d={IN} /></clipPath>
          <linearGradient id="amber" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#D9A244" />
            <stop offset=".5" stopColor="#B8781F" />
            <stop offset="1" stopColor="#96601A" />
          </linearGradient>
          <linearGradient id="gap" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#E04A44" />
            <stop offset=".5" stopColor="#B32A25" />
            <stop offset="1" stopColor="#8E211D" />
          </linearGradient>
          <linearGradient id="glass" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="rgba(242,237,230,.13)" />
            <stop offset=".22" stopColor="rgba(242,237,230,.035)" />
            <stop offset=".64" stopColor="rgba(242,237,230,.02)" />
            <stop offset="1" stopColor="rgba(242,237,230,.1)" />
          </linearGradient>
          <filter id="soft" x="-70%" y="-70%" width="240%" height="240%">
            <feGaussianBlur stdDeviation="11" />
          </filter>
        </defs>

        <ellipse cx="80" cy={y + 26} rx="56" ry="38" fill={glow} opacity=".17" filter="url(#soft)" style={{ transition: 'cy .18s linear' }} />

        {/* 瓶身 */}
        <path d={OUT} fill="url(#glass)" stroke="rgba(242,237,230,.22)" strokeWidth="1.5" />

        {/* 液体 */}
        <g clipPath="url(#bin)">
          {/* 底层：酒。瓶子始终是满的 */}
          <rect x="30" y={TOP} width="100" height="262" fill="url(#amber)" />
          <path d={`M-40 ${TOP} q 24 -4 48 0 t 48 0 t 48 0 t 48 0 t 48 0 L 240 262 L -40 262 Z`} fill="#D9A244" opacity=".55">
            <animateTransform attributeName="transform" type="translate" values="0 0;96 0" dur="5.2s" repeatCount="indefinite" />
          </path>

          {/* 上层：税差，从瓶底把酒顶上来 */}
          <g style={{ opacity: fill > 1.5 ? 1 : 0, transition: 'opacity .25s' }}>
          <rect x="30" y={y} width="100" height="262" fill="url(#gap)" />
          <path d={`M-40 ${y} q 24 -5 48 0 t 48 0 t 48 0 t 48 0 t 48 0 L 240 262 L -40 262 Z`} fill="#E04A44" opacity=".82">
            <animateTransform attributeName="transform" type="translate" values="0 0;96 0" dur="3.2s" repeatCount="indefinite" />
          </path>
          <path d={`M-40 ${y + 2.5} q 20 4 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 L 240 262 L -40 262 Z`} fill="#B32A25" opacity=".9">
            <animateTransform attributeName="transform" type="translate" values="80 0;0 0" dur="4.4s" repeatCount="indefinite" />
          </path>
          </g>

          <rect x="44" y={TOP} width="6" height="262" fill="rgba(255,255,255,.13)" />
        </g>

        {/* 瓶口 */}
        <rect x="64" y="10" width="32" height="14" rx="2.5" fill="rgba(242,237,230,.09)" stroke="rgba(242,237,230,.24)" strokeWidth="1.4" />

        {/* 标签：装的是什么，就写什么 */}
        <g style={{ opacity: fill >= 0 ? 1 : 0, transition: 'opacity .4s .6s' }}>
          <rect x="44" y="148" width="72" height="44" rx="1.5" fill="rgba(11,9,8,.88)" stroke={glow} strokeWidth="1.1" />
          <text x="80" y="170" textAnchor="middle" fill={glow} className="num" fontSize="20">{hi ? '33' : abv}</text>
          <text x="80" y="183.5" textAnchor="middle" fill="var(--color-stone)" fontSize="7.5" letterSpacing="1.6">
            {hi ? '税差 %' : mid ? '存疑 °' : '酱香 °'}
          </text>
        </g>

        {/* 刻度：液面到哪，税差就占了多少 */}
        {[0, 25, 55, 75, 100].map((v) => {
          const ty = BOT - (v / 100) * (BOT - TOP)
          const key = v === 25 || v === 55
          return (
            <g key={v}>
              <line x1="129" y1={ty} x2={key ? 139 : 135} y2={ty} stroke={key ? 'rgba(242,237,230,.3)' : 'rgba(242,237,230,.14)'} strokeWidth="1" />
              <text x="143" y={ty + 3} fill="var(--color-stone2)" fontSize="7.5" className="num">{v}</text>
            </g>
          )
        })}
      </svg>

      <div className="mt-2.5 text-center">
        <div className="flex items-baseline justify-center gap-2">
          <span className="num text-[40px] leading-none" style={{ color: glow }}>{n}</span>
          <span className="tag text-stone2">套利风险</span>
        </div>
        <p className="mx-auto mt-2 max-w-[15em] text-[11px] leading-relaxed text-stone2">
          {hi ? '红的是税差。他要的不是这瓶酒，是那 33%。'
              : mid ? '还看不清瓶里装的是什么，先问清楚。'
              : '瓶里是酒，不是税差。这是来买酒的。'}
        </p>
      </div>
    </div>
  )
}
