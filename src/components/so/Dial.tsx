'use client'
import { useEffect, useState } from 'react'

/** 风险表盘：刻度环 + 进度弧 + 中心数字。数字会滚上去，像仪表指针归位。 */
export function Dial({ score, level }: { score: number; level: 'low' | 'mid' | 'high' }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    let raf = 0
    const t0 = performance.now()
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / 900)
      const eased = 1 - Math.pow(1 - k, 3)
      setN(Math.round(score * eased))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [score])

  const color = level === 'high' ? 'var(--color-halt)' : level === 'mid' ? 'var(--color-probe)' : 'var(--color-go)'
  const R = 62
  const C = 2 * Math.PI * R
  const arc = 0.72 // 只画 72% 的圆，留缺口
  const dash = (score / 100) * C * arc

  return (
    <div className="relative h-[168px] w-[168px] shrink-0">
      <svg viewBox="0 0 168 168" className="h-full w-full -rotate-[126deg]">
        {/* 刻度 */}
        {Array.from({ length: 41 }).map((_, i) => {
          const on = i / 40 <= score / 100
          const a = (i / 40) * arc * 360
          return (
            <line
              key={i}
              x1="84" y1="10" x2="84" y2={i % 5 === 0 ? 19 : 15}
              stroke={on ? color : "rgba(28,22,19,.16)"}
              strokeWidth={i % 5 === 0 ? 1.6 : 1}
              transform={`rotate(${a} 84 84)`}
              style={{ transition: 'stroke .5s', transitionDelay: `${i * 12}ms` }}
            />
          )
        })}
        {/* 底弧 */}
        <circle
          cx="84" cy="84" r={R} fill="none"
          stroke="rgba(28,22,19,.09)" strokeWidth="7" strokeLinecap="round"
          strokeDasharray={`${C * arc} ${C}`}
        />
        {/* 进度弧 */}
        <circle
          cx="84" cy="84" r={R} fill="none"
          stroke={color} strokeWidth="7" strokeLinecap="round"
          strokeDasharray={`${dash} ${C}`}
          style={{ transition: 'stroke-dasharray .9s cubic-bezier(.2,.8,.2,1), stroke .4s' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="num text-[52px] leading-none" style={{ color }}>{n}</span>
        <span className="tag mt-1.5 text-ink3">套利风险</span>
      </div>
    </div>
  )
}
