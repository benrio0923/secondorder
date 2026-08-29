'use client'
import { useRouter } from 'next/navigation'
import { CASES } from '@/lib/so/cases'
import { MARKETS } from '@/lib/so/markets'
import { scoreRisk } from '@/lib/so/signals'
import { useSession } from '@/lib/so/session'
import { Motes } from '@/components/so/Motes'

const CRAFT = [
  { img: '/img/grain.png', k: '红缨子高粱', v: '本地糯高粱，支链淀粉高，经得起九次蒸煮' },
  { img: '/img/qu.png', k: '高温大曲', v: '端午制曲、重阳下沙，一年一个生产周期' },
  { img: '/img/river.png', k: '赤水河', v: '离了这条河的水土，同样的工艺出不来同样的酒' },
]

export default function Scan() {
  const s = useSession()
  const router = useRouter()

  async function go() {
    const ok = await s.analyze()
    if (ok) router.push('/verdict')
  }

  return (
    <div>
      {/* ── 酒厂实景 banner ── */}
      <section className="band">
        <div className="shot" style={{ backgroundImage: 'url(/img/cellar.png)' }} />
        <div className="wash" />
        <Motes />
        <div className="inner mx-auto grid max-w-[1080px] items-center gap-8 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1fr_300px] lg:gap-4">
          <div className="min-w-0">
            <div className="rise flex items-center gap-3">
              <span className="font-serif text-[19px] font-black leading-none tracking-tight text-paper">第二单</span>
              <span className="h-[15px] w-px bg-gold/50" />
              <span className="tag text-gold">AI × 白酒 · 经销商运营</span>
            </div>

            <div className="rule-gold rise mt-7" style={{ animationDelay: '80ms' }} />

            <h1
              className="rise mt-5 font-serif text-[30px] font-bold leading-[1.32] text-paper sm:text-[42px]"
              style={{ animationDelay: '140ms' }}
            >
              扫码验茅台真假，大家都会。
              <br />
              <span className="text-gold">这次扫的不是酒，是买家。</span>
            </h1>

            <p
              className="rise mt-5 max-w-[44ch] text-[14px] leading-[1.85] text-paper/75"
              style={{ animationDelay: '220ms' }}
            >
              贴上展会拿到的对话，八秒后告诉你他该不该做、先问他什么、
              这瓶酒到他货架上要卖多少钱、合同该写死哪几条。
            </p>

            <div
              className="rise mt-9 flex flex-wrap gap-x-10 gap-y-5 border-t border-gold/25 pt-6"
              style={{ animationDelay: '300ms' }}
            >
              {[
                { n: '5.6', u: '%', k: '遵义酒企出海转化率', s: '89 家接洽 → 5 家成交' },
                { n: '33', u: '%', k: '套利买家真正要的', s: '消费税 20% ＋ 退税 13%' },
                { n: '8', u: '秒', k: '一段对话到一份判定', s: '规则算账，模型说人话' },
              ].map((x) => (
                <div key={x.k} className="min-w-[9rem]">
                  <div className="num text-[32px] leading-none text-gold">
                    {x.n}
                    <span className="ml-0.5 font-sans text-[13px] font-normal">{x.u}</span>
                  </div>
                  <div className="mt-1.5 text-[12px] text-paper/85">{x.k}</div>
                  <div className="mt-0.5 text-[11px] text-paper/45">{x.s}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 主角瓶 */}
          <div className="rise hidden justify-center lg:flex" style={{ animationDelay: '360ms' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/img/maotai.png"
              alt="贵州酱香型白酒"
              className="floaty h-[380px] w-auto"
              style={{ mixBlendMode: 'screen' }}
            />
          </div>
        </div>
      </section>

      {/* ── 扫描台：内容全在白底上，投影看得清 ── */}
      <section className="mx-auto max-w-[1080px] px-5 pb-16 pt-10 sm:px-8">
        <div className={`sheet corners rounded-[3px] ${s.busy ? 'scan relative overflow-hidden' : ''}`}>
          <div className="border-b border-line px-5 py-4 sm:px-7">
            <h2 className="font-serif text-[19px] font-bold leading-none text-ink">扫描台</h2>
            <p className="mt-2 text-[12.5px] text-ink2">同一场展会的三张名片，先挑一张——或者贴你自己的对话。</p>
          </div>

          <div className="px-5 py-6 sm:px-7">
            <div className="mb-6 grid gap-px overflow-hidden rounded-[2px] border border-line bg-line sm:grid-cols-3">
              {CASES.map((c, ci) => {
                const pre = scoreRisk(c.fallback.signals ?? {})
                const on = s.raw === c.raw
                const mk = c.fallback.market ? MARKETS[c.fallback.market] : null
                const col =
                  pre.level === 'high' ? 'var(--color-halt)'
                  : pre.level === 'mid' ? 'var(--color-probe)'
                  : 'var(--color-go)'
                return (
                  <button
                    key={c.id}
                    onClick={() => s.pickCase(c.id)}
                    className={`rise relative bg-card px-4 py-4 text-left transition ${
                      on ? '' : 'opacity-70 hover:bg-paper2 hover:opacity-100'
                    }`}
                    style={{ animationDelay: `${120 + ci * 70}ms` }}
                  >
                    {on && <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: col }} />}
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className={`truncate text-[13px] ${on ? 'text-ink' : 'text-ink2'}`}>
                          {mk?.flag} {c.fallback.company}
                        </div>
                        <div className="mt-1 truncate text-[11px] text-ink3">{c.source}</div>
                      </div>
                      <span className="num shrink-0 text-[27px] leading-none" style={{ color: col }}>
                        {pre.score}
                      </span>
                    </div>
                    <div className="h-[3px] overflow-hidden rounded-full bg-line">
                      <div
                        className="widen h-full"
                        style={{ width: `${Math.max(3, pre.score)}%`, background: col, animationDelay: `${360 + ci * 70}ms` }}
                      />
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="tag mb-2 text-ink3">对话原文</div>
            <textarea
              value={s.raw}
              onChange={(e) => s.setRaw(e.target.value)}
              rows={8}
              spellCheck={false}
              className="w-full resize-y rounded-[2px] border border-line bg-paper2/60 p-4 font-mono text-[12.5px] leading-[1.8] text-ink outline-none transition placeholder:text-ink3 focus:border-amber/60 focus:bg-card"
              placeholder="微信对话、邮件、名片上的文字…"
            />

            <div className="mt-5 flex flex-wrap items-center gap-4">
              <button
                onClick={go}
                disabled={s.busy || s.raw.trim().length < 10}
                className="inline-flex items-center gap-2.5 rounded-[2px] bg-amber2 px-6 py-3 text-[14px] font-medium text-paper transition hover:bg-amber disabled:cursor-not-allowed disabled:opacity-35"
              >
                {s.busy ? '验真中…' : '验一下这个买家'}
                {!s.busy && <span className="opacity-70">→</span>}
              </button>
              {s.busy && (
                <span className="flex items-center gap-2.5 text-[12.5px] text-ink2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber opacity-70" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-amber" />
                  </span>
                  正在扫这段对话
                  <span className="num text-ink3">{s.elapsed.toFixed(1)}s</span>
                </span>
              )}
            </div>
            {s.aiNote && <p className="mt-3 text-[12px] text-amber2">{s.aiNote}</p>}
          </div>
        </div>
      </section>

      {/* ── 这瓶酒是怎么来的：三道工艺 ── */}
      <section className="border-t border-line bg-paper2/50">
        <div className="mx-auto max-w-[1080px] px-5 py-14 sm:px-8">
          <div className="mb-9 text-center">
            <div className="rule-gold mx-auto" style={{ background: 'linear-gradient(90deg, transparent, var(--color-gold), transparent)', width: 72 }} />
            <h2 className="mt-4 font-serif text-[22px] font-bold text-ink">这瓶酒花了一年才酿出来</h2>
            <p className="mt-2 text-[13px] text-ink2">卡住的从来不是酿酒。是酿完之后，没人接第二单。</p>
          </div>
          <div className="grid gap-9 sm:grid-cols-3">
            {CRAFT.map((c) => (
              <div key={c.k} className="flex flex-col items-center text-center">
                <div className="medal" style={{ backgroundImage: `url(${c.img})` }} />
                <div className="mt-4 font-serif text-[15px] font-bold text-ink">{c.k}</div>
                <p className="mt-1.5 max-w-[22ch] text-[12px] leading-relaxed text-ink2">{c.v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-line py-6 text-center text-[11px] leading-relaxed text-ink3">
        税则与牌照均标注来源与版本 · 落地价为估算值，实际以海关核定为准
      </footer>
    </div>
  )
}
