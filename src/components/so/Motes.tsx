'use client'
import { useEffect, useRef } from 'react'

/**
 * 窖池那道光柱里的浮尘。
 * 只在光束附近才亮——离开光柱就看不见，跟真实的丁达尔效应一样。
 */
export function Motes({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const g = cv.getContext('2d')
    if (!g) return

    let w = 0
    let h = 0
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    type M = { x: number; y: number; r: number; vx: number; vy: number; p: number; sp: number }
    let motes: M[] = []

    const seed = () => {
      const n = Math.round(Math.min(150, (w * h) / 9000))
      motes = Array.from({ length: n }, () => ({
        x: Math.random(), y: Math.random(),
        r: 0.5 + Math.random() * 1.9,
        vx: (Math.random() - 0.5) * 0.00016,
        vy: -0.00006 - Math.random() * 0.00013,
        p: Math.random() * Math.PI * 2,
        sp: 0.5 + Math.random(),
      }))
    }

    const resize = () => {
      const r = cv.getBoundingClientRect()
      w = r.width
      h = r.height
      cv.width = Math.round(w * dpr)
      cv.height = Math.round(h * dpr)
      g.setTransform(dpr, 0, 0, dpr, 0, 0)
      seed()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(cv)

    // 光柱：照片里那道从右上斜下来的天光
    const BEAM_TOP = 0.66
    const BEAM_BOT = 0.44
    const beam = (x: number, y: number) => {
      const cx = BEAM_TOP + (BEAM_BOT - BEAM_TOP) * y
      const half = 0.055 + y * 0.10
      const d = Math.abs(x - cx) / half
      return Math.max(0, 1 - d * d) * (1 - y * 0.45)
    }

    let raf = 0
    const loop = (now: number) => {
      const t = now / 1000
      g.clearRect(0, 0, w, h)
      g.globalCompositeOperation = 'lighter'
      for (const m of motes) {
        m.x += m.vx
        m.y += m.vy
        if (m.y < -0.02) { m.y = 1.02; m.x = Math.random() }
        if (m.x < -0.02) m.x = 1.02
        if (m.x > 1.02) m.x = -0.02
        const a = beam(m.x, m.y) * (0.42 + 0.58 * Math.sin(t * m.sp + m.p) ** 2)
        if (a < 0.015) continue
        const px = m.x * w
        const py = m.y * h
        const rad = g.createRadialGradient(px, py, 0, px, py, m.r * 3.4)
        rad.addColorStop(0, `rgba(255,228,178,${a * 0.9})`)
        rad.addColorStop(1, 'rgba(255,228,178,0)')
        g.fillStyle = rad
        g.beginPath()
        g.arc(px, py, m.r * 3.4, 0, Math.PI * 2)
        g.fill()
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [])

  return <canvas ref={ref} aria-hidden className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />
}
