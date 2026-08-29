'use client'
import { useEffect, useMemo, useState } from 'react'
import { CASES } from '@/lib/so/cases'
import { MARKETS, MARKET_LIST } from '@/lib/so/markets'
import { computePrice } from '@/lib/so/pricing'
import { scoreRisk, SIGNALS } from '@/lib/so/signals'
import { pickClauses } from '@/lib/so/clauses'
import type { Brief, Extracted, MarketId } from '@/lib/so/types'
import { Btn, Chip, SourceTag, Stat } from './parts'
import { SignalGrid } from './Gauge'
import { Fold } from './Fold'
import { Verdict } from './Verdict'
import { Waterfall } from './Waterfall'
import { SpecAdvisor } from './SpecAdvisor'
import { PitchKit } from './PitchKit'
import { BottlePicker } from './BottlePicker'
import { SampleCheck } from './SampleCheck'
import { AfterShip } from './AfterShip'
import { wantsSample } from '@/lib/so/sample'
import { BAIJIU_BY_ID } from '@/lib/so/baijiu'
import type { AromaId } from '@/lib/so/aroma'

const fmt = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 0 })
const EMPTY: Record<string, boolean | null> = Object.fromEntries(SIGNALS.map((s) => [s.id, null]))

export default function Copilot() {
  const [caseId, setCaseId] = useState(CASES[0].id)
  const [raw, setRaw] = useState(CASES[0].raw)
  const [stage, setStage] = useState<'input' | 'busy' | 'done'>('input')
  const [ex, setEx] = useState<Extracted | null>(null)
  const [verdicts, setVerdicts] = useState(EMPTY)
  const [market, setMarket] = useState<MarketId>('sg')
  const [aiNote, setAiNote] = useState<string | null>(null)
  const [uncovered, setUncovered] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)

  const [dp, setDp] = useState(320)
  const [ml, setMl] = useState(500)
  const [abv, setAbv] = useState(53)
  const [logi, setLogi] = useState(18)
  const [margin, setMargin] = useState(0.15)
  const [cbma, setCbma] = useState(false)
  const [chan, setChan] = useState<'retail' | 'onPremise'>('retail')
  const [markup, setMarkup] = useState<number[] | undefined>(undefined)
  const [aroma, setAroma] = useState<AromaId>('sauce')
  const [bottleId, setBottleId] = useState<string | null>('gz-10')

  const [brief, setBrief] = useState<Brief | null>(null)
  const [briefBusy, setBriefBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copiedAll, setCopiedAll] = useState(false)

  const m = MARKETS[market]
  const risk = useMemo(() => scoreRisk(verdicts), [verdicts])
  const price = useMemo(
    () =>
      computePrice({
        domesticPrice: dp, ml, abv, logistics: logi, market,
        exportMargin: margin, cbmaAssigned: cbma, channel: chan, markupOverride: markup,
      }),
    [dp, ml, abv, logi, market, margin, cbma, chan, markup],
  )
  const clauses = useMemo(() => pickClauses(risk.badKeys).slice(0, 4), [risk.badKeys])
  // 去留是规则说了算，模型只负责把理由写成人话
  const ruleVerdict: Brief['verdict'] = risk.level === 'high' ? 'hold' : risk.level === 'mid' ? 'probe' : 'go'

  function pickBottle(id: string | null) {
    setBottleId(id)
    if (!id) return
    const b = BAIJIU_BY_ID[id]
    if (!b) return
    setAbv(b.abv)
    setAroma(b.aroma === 'other' ? 'other' : b.aroma)
  }

  function pickCase(id: string) {
    const c = CASES.find((x) => x.id === id)!
    setCaseId(id)
    setRaw(c.raw)
    setStage('input')
    setEx(null)
    setBrief(null)
    setVerdicts(EMPTY)
    setAiNote(null)
    setUncovered(null)
  }

  async function analyze() {
    setStage('busy')
    setBrief(null)
    setAiNote(null)
    setElapsed(0)
    const t0 = Date.now()
    const timer = setInterval(() => setElapsed((Date.now() - t0) / 1000), 100)
    let out: Extracted | null = null
    try {
      const res = await fetch('/api/so/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw }),
      })
      if (res.ok) out = (await res.json()).extracted as Extracted
    } catch {}
    clearInterval(timer)
    const fb = CASES.find((c) => c.raw === raw)?.fallback
    if (!out && fb) {
      out = fb
      setAiNote('模型未回应，已切换为本机预解析结果（现场备用路径）')
    }
    if (!out) {
      setStage('input')
      setAiNote('模型未回应，且这段文字没有本机备用。请手动勾选下方六项信号后继续。')
      setEx({ signals: EMPTY })
      setStage('done')
      return
    }
    setEx(out)
    setVerdicts({ ...EMPTY, ...(out.signals ?? {}) })
    if (out.market && MARKETS[out.market]) {
      setMarket(out.market as MarketId)
      setUncovered(null)
    } else {
      // 规则库没有这个市场——说出来，不要默默套用默认值
      setUncovered(out.marketGuess || '无法判断')
    }
    setStage('done')
    setTimeout(() => document.getElementById('so-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
  }

  async function makeBrief() {
    setBriefBusy(true)
    try {
      const res = await fetch('/api/so/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          extracted: ex,
          market,
          verdict: ruleVerdict,
          riskScore: risk.score,
          riskLabel: risk.label,
          badSignals: risk.badKeys.map((k) => SIGNALS.find((s) => s.id === k)?.label ?? k),
          price: {
            fob: price.fob, landed: price.landed, retail: price.retail,
            retailLocal: price.retailLocal, taxRate: Math.round((price.taxTotal / price.cif) * 100), multiple: price.multiple,
          },
          raw,
        }),
      })
      if (res.ok) {
        const got = (await res.json()).brief as Brief
        const fb = localBrief()
        // 模型偶尔会漏字段——缺什么补什么，不能让业务员看到一块空白
        setBrief({
          verdict: got.verdict ?? fb.verdict,
          headline: got.headline?.trim() || fb.headline,
          reasons: got.reasons?.length ? got.reasons : fb.reasons,
          questions: got.questions?.length ? got.questions : fb.questions,
          reply: got.reply?.trim() || fb.reply,
        })
      } else setBrief(localBrief())
    } catch {
      setBrief(localBrief())
    }
    setBriefBusy(false)
    setTimeout(() => document.getElementById('so-brief')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
  }

  function fullBrief(): string {
    if (!brief) return ''
    const L = (s: string) => s
    return [
      `【首单决策简报】${ex?.company ?? '未具名买家'}　${m.flag} ${m.name}`,
      `判定：${brief.verdict === 'hold' ? '暂缓' : brief.verdict === 'probe' ? '追问后再定' : '可谈'}　${brief.headline}`,
      '',
      `套利风险：${risk.score}/100（${risk.label}）`,
      ...(risk.badKeys.length
        ? [`负向信号：${risk.badKeys.map((k) => SIGNALS.find((s) => s.id === k)?.label ?? k).join('、')}`]
        : []),
      '',
      '── 判定理由 ──',
      ...(brief.reasons ?? []).map((r) => `· ${r}`),
      '',
      '── 落地价测算（人民币／瓶）──',
      `内销开票 ${fmt(dp)} → 出口保本线 ${fmt(price.breakeven)} → 离岸价 ${fmt(price.fob)} → 到岸价 ${fmt(price.cif)}`,
      `目的国税费 ${fmt(price.taxTotal)}（占 到岸价 ${Math.round((price.taxTotal / price.cif) * 100)}%）→ 完税落地 ${fmt(price.landed)}`,
      `终端零售约 ${fmt(price.retail)} 元（${fmt(price.retailLocal)} ${m.currency}），为内销开票价的 ${price.multiple} 倍`,
      '',
      `── ${m.name}的持牌门槛 ──`,
      `买方：${m.gate}`,
      ...m.licences.map((l) => `· [${l.who === 'buyer' ? '买方' : '你方'}] ${l.name}${l.form ? `（${l.form}）` : ''}｜缺了会怎样：${l.ifMissing}`),
      '',
      '── 必问清单 ──',
      ...(brief.questions ?? []).map((q, i) => `${i + 1}. ${q}`),
      '',
      '── 建议写进第一份合同的条款 ──',
      ...clauses.map((c) => `【${c.title}】挡掉：${c.blocks}\n${c.body}`),
      '',
      '── 第一封回信草稿 ──',
      brief.reply,
      '',
      '（落地价为估算值，实际以海关核定为准；税则来源与版本见工具界面）',
    ].map(L).join('\n')
  }

  function localBrief(): Brief {
    const v = ruleVerdict
    return {
      verdict: v,
      headline:
        v === 'hold' ? '暂缓：这一单的性质需要重新评估' : v === 'probe' ? '可谈，但先把缺口问清楚' : '可进入首单谈判',
      reasons: [
        risk.summary,
        `${m.name}买方必须持有：${m.licences.filter((l) => l.who === 'buyer').map((l) => l.name).join('、')}`,
        `终端零售约 ${fmt(price.retailLocal)} ${m.currency}，是内销开票价的 ${price.multiple} 倍`,
      ],
      questions: [
        '请提供贵司的酒类进口／分销牌照编号与有效期。',
        '首批货的落地仓在哪里？可否提供地址与仓储合约？',
        '这批货预计进入哪些具体售点？可否给我们一份清单？',
        '我们可以提供品鉴小样与品牌手册，贵司需要几套？',
        '动销报告可否每季提供一次？含售点清单与陈列照片。',
      ],
      reply: '（模型未回应，此为本机备用草稿）感谢来讯。为了让后续报价与合规安排更准确，我们需要先确认几件事：贵司的酒类进口牌照、首批货的落地仓，以及预计进入的售点类型。收到后我们会提供正式报价与可供品鉴的小样。',
    }
  }

  // 解析完自动接着出判定——业务员要的是一个动作换一个答案，不是两个按钮
  useEffect(() => {
    if (stage === 'done' && ex?.company !== undefined && !brief && !briefBusy) void makeBrief()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, ex])

  const taxRate = Math.round((price.taxTotal / price.cif) * 100)

  return (
    <div className="mx-auto max-w-[1000px] px-5 pb-24 pt-8 sm:px-8">
      <header className="rise mb-7 flex flex-wrap items-center gap-x-5 gap-y-3">
        <h1 className="font-serif text-[28px] font-black leading-none tracking-tight text-bone">第二单</h1>
        <span className="h-[22px] w-px bg-white/15" />
        <span className="text-[12.5px] text-stone">贵州白酒出海 · 首单决策副驾</span>
        <span className="tag ml-auto text-stone2">AI × 白酒 · 经销商运营</span>
      </header>

      {stage !== 'done' && (
        <p className="rise mb-5 max-w-[54ch] text-[14px] leading-relaxed text-stone" style={{ animationDelay: '60ms' }}>
          贴上展会拿到的对话，八秒后告诉你：
          <span className="text-bone">这个买家该不该做、先问他什么、这瓶酒到他货架上要卖多少钱。</span>
        </p>
      )}

      {/* ── 输入 ── */}
      {stage !== 'done' ? (
        <div className="rise rounded-[3px] border border-white/[.08] bg-ink2/40 p-5 sm:p-6">
          <div className="mb-4">
            <div className="tag mb-2.5 text-stone2">同一场展会的三张名片</div>
            <div className="grid gap-px overflow-hidden rounded-[3px] border border-white/[.07] bg-white/[.06] sm:grid-cols-3">
              {CASES.map((c, ci) => {
                const pre = scoreRisk(c.fallback.signals ?? {})
                const on = raw === c.raw
                const mk = c.fallback.market ? MARKETS[c.fallback.market] : null
                const col = pre.level === 'high' ? 'var(--color-halt)' : pre.level === 'mid' ? 'var(--color-probe)' : 'var(--color-go)'
                return (
                  <button
                    key={c.id}
                    onClick={() => pickCase(c.id)}
                    className={`rise relative bg-ink2 px-4 py-3.5 text-left transition ${on ? '' : 'opacity-70 hover:opacity-100'}`}
                    style={{ animationDelay: `${ci * 70}ms` }}
                  >
                    {on && <span className="absolute inset-x-0 top-0 h-[2px]" style={{ background: col }} />}
                    <div className="mb-2.5 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className={`truncate text-[13px] ${on ? 'text-bone' : 'text-bone/75'}`}>
                          {mk?.flag} {c.fallback.company}
                        </div>
                        <div className="mt-0.5 truncate text-[11px] text-stone2">{c.source}</div>
                      </div>
                      <span className="num shrink-0 text-[24px] leading-none" style={{ color: col }}>{pre.score}</span>
                    </div>
                    <div className="h-[2px] overflow-hidden rounded-full bg-white/[.07]">
                      <div className="widen h-full" style={{ width: `${Math.max(3, pre.score)}%`, background: col, animationDelay: `${ci * 70 + 200}ms` }} />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
          <div className="tag mb-2 text-stone2">或者贴上你自己的对话</div>
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={7}
            spellCheck={false}
            className="w-full resize-y rounded-[3px] border border-white/[.09] bg-ink/60 p-4 font-mono text-[12.5px] leading-[1.75] text-bone outline-none transition placeholder:text-stone2 focus:border-amber/45 focus:bg-ink/80"
            placeholder="微信对话、邮件、名片上的文字…"
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Btn onClick={analyze} disabled={stage === 'busy' || raw.trim().length < 10}>
              {stage === 'busy' ? '分析中…' : '分析这个买家'}
            </Btn>
            {stage === 'busy' && (
              <span className="flex items-center gap-2.5 text-[12.5px] text-stone">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber" />
                </span>
                读对话、判信号、算落地价
                <span className="font-mono tabular-nums text-stone/70">{elapsed.toFixed(1)}s</span>
              </span>
            )}
          </div>
          {aiNote && <p className="mt-3 text-[12px] text-amber">{aiNote}</p>}
        </div>
      ) : (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-[3px] border border-white/[.06] bg-white/[.015] px-4 py-2.5">
          <span className="min-w-0 truncate font-mono text-[11px] text-stone2">
            {raw.replace(/\n/g, ' ').slice(0, 82)}…
          </span>
          <button
            onClick={() => {
              setStage('input')
              setEx(null)
              setBrief(null)
            }}
            className="tag shrink-0 text-amber transition hover:text-gold"
          >
            换一个买家
          </button>
        </div>
      )}

      {aiNote && stage === 'done' && <p className="mb-3 text-[12px] text-amber">{aiNote}</p>}

      {/* ── 结论 ── */}
      {stage === 'done' && ex && (
        <div id="so-result" className="space-y-2.5">
          <Verdict
            ex={ex}
            m={m}
            risk={risk}
            brief={brief}
            price={price}
            busy={briefBusy}
            copied={copied}
            copiedAll={copiedAll}
            onCopyReply={() => {
              navigator.clipboard?.writeText(brief?.reply ?? '')
              setCopied(true)
              setTimeout(() => setCopied(false), 1600)
            }}
            onCopyAll={() => {
              navigator.clipboard?.writeText(fullBrief())
              setCopiedAll(true)
              setTimeout(() => setCopiedAll(false), 1800)
            }}
            onRetry={makeBrief}
          />

          {uncovered && (
            <div className="rounded border border-rose-500/35 bg-rose-950/25 px-4 py-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-rose-300">规则库未涵盖</span>
              <p className="mt-1 text-[12.5px] leading-relaxed text-bone">
                这个买家看起来在<span className="text-rose-200">「{uncovered}」</span>，
                规则库只涵盖香港、新加坡、越南、美国、韩国。下面的落地价与牌照核查
                <span className="text-rose-200">不适用于他</span>，请手动选一个最接近的市场参考。
              </p>
            </div>
          )}

          {/* ── 细节，要用的时候才展开 ── */}
          <Fold
            title="六项信号"
            meta={
              <span className={risk.thin ? 'text-amber' : ''}>
                已判定 {risk.answered}/6{risk.thin ? ' · 覆盖不足' : ''}
              </span>
            }
          >
            <SignalGrid verdicts={verdicts} onToggle={(id, v) => setVerdicts((s) => ({ ...s, [id]: v }))} />
            <p className="mt-3 text-[11.5px] leading-relaxed text-stone">
              {risk.summary}　模型只给初判，改这六组按钮，上面的判定与条款会跟着重算。
            </p>
          </Fold>

          <Fold
            title="落地价"
            meta={
              <span>
                终端 <span className="font-mono text-bone">{fmt(price.retail)}</span> 元 · 税负{' '}
                <span className={taxRate > 100 ? 'font-mono text-rose-300' : 'font-mono text-bone'}>{taxRate}%</span>
              </span>
            }
          >
            <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Stat label="出口保本线" value={fmt(price.breakeven)} unit="元" sub="低于此价这单亏" />
              <Stat label="离岸报价" value={fmt(price.fob)} unit="元" sub={`加成 ${Math.round(margin * 100)}%`} />
              <Stat label="完税落地" value={fmt(price.landed)} unit="元" tone="warn" sub="进口商的成本" />
              <Stat label="终端零售" value={fmt(price.retail)} unit="元" tone={price.multiple > 6 ? 'bad' : undefined} sub={`${price.multiple} 倍`} />
            </div>

            <div className="mb-4">
              <BottlePicker id={bottleId} onPick={pickBottle} />
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-amber">他打算怎么卖</span>
              {([['onPremise', '餐饮'], ['retail', '零售']] as const).map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => {
                    setChan(k)
                    setMarkup(undefined)
                  }}
                  className={`rounded border px-3 py-1 text-[12.5px] transition ${
                    chan === k ? 'border-amber/60 bg-amber/10 text-amber' : 'border-white/12 text-stone hover:border-white/30'
                  }`}
                >
                  {label}
                </button>
              ))}
              <span className="text-[11px] text-stone/70">餐饮端毛利率 75–85%，零售 20–23%，终端价差三倍以上</span>
              <div className="ml-auto flex flex-wrap gap-2">
                {price.channel.map((c, i) => (
                  <label key={c.label} className="flex items-center gap-1">
                    <span className="text-[11px] text-stone">{c.label}</span>
                    <input
                      type="number"
                      min={0}
                      max={95}
                      value={Math.round(c.rate * 100)}
                      onChange={(e) => {
                        const v = Math.min(95, Math.max(0, Number(e.target.value) || 0)) / 100
                        const next = price.channel.map((x) => x.rate)
                        next[i] = v
                        setMarkup(next)
                      }}
                      className="w-[46px] rounded border border-white/12 bg-ink/70 px-1 py-0.5 text-right font-mono text-[11.5px] tabular-nums text-bone outline-none focus:border-amber/50"
                    />
                    <span className="text-[10px] text-stone">%</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-4 grid gap-3 rounded border border-white/10 bg-white/[0.02] p-3 sm:grid-cols-5">
              <NumField label="内销开票价" value={dp} set={setDp} step={20} unit="元" />
              <NumField label="容量" value={ml} set={setMl} step={50} unit="ml" />
              <NumField label="酒精度" value={abv} set={setAbv} step={1} unit="%" />
              <NumField label="物流分摊" value={logi} set={setLogi} step={2} unit="元" />
              <div>
                <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-stone">出口加成</div>
                <input type="range" min={0} max={0.6} step={0.05} value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))} className="w-full accent-[#D9873F]" />
                <div className="mt-0.5 font-mono text-[11px] text-bone">{Math.round(margin * 100)}%</div>
              </div>
            </div>

            {market === 'us' && (
              <label className="mb-4 flex cursor-pointer items-start gap-3 rounded border border-amber/30 bg-amber/[0.06] p-3">
                <input type="checkbox" checked={cbma} onChange={(e) => setCbma(e.target.checked)} className="mt-0.5 accent-[#D9873F]" />
                <span className="text-[12.5px] leading-relaxed text-bone">
                  把 CBMA 额度指派给这家进口商
                  <span className="text-amber">
                    {' '}值 {fmt(computePrice({ domesticPrice: dp, ml, abv, logistics: logi, market: 'us', exportMargin: margin, channel: chan }).landed - computePrice({ domesticPrice: dp, ml, abv, logistics: logi, market: 'us', exportMargin: margin, channel: chan, cbmaAssigned: true }).landed)} 元／瓶
                  </span>
                  ，一柜十几万，不花你一毛钱。
                </span>
              </label>
            )}

            <Waterfall p={price} m={m} />

            <div className="mt-4">
              <SpecAdvisor market={market} m={m} domesticPrice={dp} logistics={logi} margin={margin} cbma={cbma} channel={chan} />
            </div>

            <p className="mt-4 rounded border border-white/10 bg-white/[0.02] p-3 text-[12px] leading-relaxed text-stone">
              内销开票 {fmt(dp)} 元里，消费税约 {fmt(price.consumptionTaxSaved)} 元出口免征
              <SourceTag source="消费税：20% 从价 ＋ 0.5 元／500ml 从量；出口免征不退" />
              ，另可退增值税 {fmt(price.vatRebate)} 元
              <SourceTag source="白酒出口增值税退税率 13%" />
              。合计 <span className="text-amber">{fmt(price.arbitragePool)}</span> 元／瓶——
              <span className="text-bone">套利型买家真正要的是这笔钱，跟酒卖不卖得掉无关。</span>
            </p>
          </Fold>

          <Fold
            title={`${m.name}的持牌门槛`}
            meta={
              <select
                value={market}
                onChange={(e) => {
                  setMarket(e.target.value as MarketId)
                  setMarkup(undefined)
                }}
                onClick={(e) => e.stopPropagation()}
                className="rounded border border-white/15 bg-ink2 px-2 py-1 text-[12px] text-bone outline-none"
              >
                {MARKET_LIST.map((x) => (
                  <option key={x.id} value={x.id}>{x.flag} {x.name}</option>
                ))}
              </select>
            }
          >
            <div className="mb-3.5 rounded border border-amber/25 bg-amber/[0.06] px-3.5 py-2.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-amber">买方必须持有</span>
              <p className="mt-1 text-[13px] leading-snug text-bone">{m.gate}</p>
            </div>
            <div className="grid gap-px overflow-hidden rounded border border-white/10 bg-white/8 sm:grid-cols-2">
              {m.licences.map((l, i) => (
                <div key={i} className="bg-ink2/60 p-3.5">
                  <div className="mb-1.5 flex items-center gap-2">
                    <Chip tone={l.who === 'buyer' ? 'warn' : 'neutral'}>{l.who === 'buyer' ? '买方' : '你方'}</Chip>
                    {l.form && <span className="font-mono text-[10px] text-stone/70">{l.form}</span>}
                  </div>
                  <div className="text-[13px] font-medium leading-snug text-bone">
                    {l.name}
                    <SourceTag source={l.source} />
                  </div>
                  <p className="mt-1.5 text-[11.5px] leading-snug text-rose-300/75">缺了：{l.ifMissing}</p>
                </div>
              ))}
            </div>
            <details className="mt-3">
              <summary className="cursor-pointer list-none font-mono text-[10.5px] uppercase tracking-[0.12em] text-stone hover:text-bone">
                ▸ 这个市场还有几件事值得知道
              </summary>
              <div className="mt-2.5 space-y-2">
                {m.insights.map((ins, i) => (
                  <div key={i} className={`rounded border-l-2 px-3.5 py-2.5 ${
                    ins.tone === 'warn' ? 'border-l-rose-500/60 bg-rose-950/15'
                    : ins.tone === 'edge' ? 'border-l-amber/70 bg-amber/[0.05]'
                    : 'border-l-white/25 bg-white/[0.02]'}`}>
                    <div className="text-[12.5px] font-medium text-bone">{ins.title}</div>
                    <p className="mt-1 text-[11.5px] leading-relaxed text-stone">{ins.body}</p>
                  </div>
                ))}
              </div>
            </details>
          </Fold>

          <Fold title="寄样品之前" meta={<span className={abv >= 24 ? 'text-rose-300' : 'text-emerald-300'}>{abv >= 24 ? '危险品' : '可寄'}</span>}>
            <SampleCheck abv={abv} asked={wantsSample(raw, ex?.askedFor)} />
          </Fold>

          <Fold title="怎么跟他讲这支酒" meta="香型 × 料理 × 该市场已验证的用法">
            <PitchKit market={market} m={m} aroma={aroma} setAroma={setAroma} bottle={bottleId ? BAIJIU_BY_ID[bottleId] : null} />
          </Fold>

          <Fold title="首单发出之后的 90 天" meta={risk.level !== 'low' ? <span className="text-rose-300">D+7 与 D+30 要盯</span> : '七个节点'}>
            <AfterShip risk={risk} buyer={ex.company ?? undefined} market={`${m.flag} ${m.name}`} />
          </Fold>

          <Fold title="该写进第一份合同的条款" meta={`${clauses.length} 条`}>
            <div className="space-y-2">
              {clauses.map((c) => (
                <div key={c.id} className="rounded border border-white/10 bg-white/[0.02] p-3">
                  <div className="text-[13px] font-medium text-bone">
                    {c.title}
                    <span className="ml-2 text-[11.5px] font-normal text-stone">挡掉：{c.blocks}</span>
                  </div>
                  <p className="mt-1.5 border-l-2 border-amber/40 pl-2.5 text-[11.5px] leading-relaxed text-stone">{c.body}</p>
                </div>
              ))}
            </div>
          </Fold>

          <p className="pt-5 text-center text-[10.5px] leading-relaxed text-stone2">
            税则与牌照均标注来源与版本 · 落地价为估算值，实际以海关核定为准
          </p>
        </div>
      )}
    </div>
  )
}

function NumField({ label, value, set, step, unit }: { label: string; value: number; set: (n: number) => void; step: number; unit: string }) {
  return (
    <div>
      <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-stone">{label}</div>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={value}
          step={step}
          onChange={(e) => set(Math.max(0, Number(e.target.value) || 0))}
          className="w-full rounded border border-white/12 bg-ink/70 px-2 py-1.5 font-mono text-[12.5px] tabular-nums text-bone outline-none focus:border-amber/50"
        />
        <span className="shrink-0 text-[10.5px] text-stone">{unit}</span>
      </div>
    </div>
  )
}
