'use client'
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { CASES } from './cases'
import { MARKETS } from './markets'
import { computePrice } from './pricing'
import { scoreRisk, SIGNALS } from './signals'
import { pickClauses } from './clauses'
import { BAIJIU_BY_ID } from './baijiu'
import type { AromaId } from './aroma'
import type { Brief, Extracted, MarketId } from './types'

const fmt = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 0 })
const EMPTY: Record<string, boolean | null> = Object.fromEntries(SIGNALS.map((s) => [s.id, null]))
const KEY = 'so.session.v1'

/** 会跨页保存的那一份状态。刷新不能把现场演示打断。 */
type Persist = {
  raw: string
  ex: Extracted | null
  verdicts: Record<string, boolean | null>
  market: MarketId
  brief: Brief | null
  uncovered: string | null
  aiNote: string | null
  dp: number; ml: number; abv: number; logi: number; margin: number
  cbma: boolean; chan: 'retail' | 'onPremise'; markup?: number[]
  aroma: AromaId; bottleId: string | null
}

function useSessionState() {
  const [ready, setReady] = useState(false)
  const [raw, setRaw] = useState(CASES[0].raw)
  const [busy, setBusy] = useState(false)
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

  // 水合：SSR 时不能读 sessionStorage，等挂载后再补
  useEffect(() => {
    try {
      const s = sessionStorage.getItem(KEY)
      if (s) {
        const p = JSON.parse(s) as Persist
        setRaw(p.raw); setEx(p.ex); setVerdicts(p.verdicts); setMarket(p.market)
        setBrief(p.brief); setUncovered(p.uncovered); setAiNote(p.aiNote)
        setDp(p.dp); setMl(p.ml); setAbv(p.abv); setLogi(p.logi); setMargin(p.margin)
        setCbma(p.cbma); setChan(p.chan); setMarkup(p.markup)
        setAroma(p.aroma); setBottleId(p.bottleId)
      }
    } catch {}
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    const p: Persist = {
      raw, ex, verdicts, market, brief, uncovered, aiNote,
      dp, ml, abv, logi, margin, cbma, chan, markup, aroma, bottleId,
    }
    try { sessionStorage.setItem(KEY, JSON.stringify(p)) } catch {}
  }, [ready, raw, ex, verdicts, market, brief, uncovered, aiNote, dp, ml, abv, logi, margin, cbma, chan, markup, aroma, bottleId])

  const m = MARKETS[market]
  const risk = useMemo(() => scoreRisk(verdicts), [verdicts])
  const price = useMemo(
    () => computePrice({
      domesticPrice: dp, ml, abv, logistics: logi, market,
      exportMargin: margin, cbmaAssigned: cbma, channel: chan, markupOverride: markup,
    }),
    [dp, ml, abv, logi, market, margin, cbma, chan, markup],
  )
  const clauses = useMemo(() => pickClauses(risk.badKeys).slice(0, 4), [risk.badKeys])
  // 去留是规则说了算，模型只负责把理由写成人话
  const ruleVerdict: Brief['verdict'] = risk.level === 'high' ? 'hold' : risk.level === 'mid' ? 'probe' : 'go'
  const taxRate = Math.round((price.taxTotal / price.cif) * 100)

  function pickBottle(id: string | null) {
    setBottleId(id)
    if (!id) return
    const b = BAIJIU_BY_ID[id]
    if (!b) return
    setAbv(b.abv)
    setAroma(b.aroma === 'other' ? 'other' : b.aroma)
  }

  function reset() {
    setEx(null); setBrief(null); setVerdicts(EMPTY); setAiNote(null); setUncovered(null)
  }

  function pickCase(id: string) {
    const c = CASES.find((x) => x.id === id)
    if (!c) return
    setRaw(c.raw)
    reset()
  }

  function localBrief(r: typeof risk = risk): Brief {
    const v: Brief['verdict'] = r.level === 'high' ? 'hold' : r.level === 'mid' ? 'probe' : 'go'
    return {
      verdict: v,
      headline: v === 'hold' ? '暂缓：这一单的性质需要重新评估'
        : v === 'probe' ? '可谈，但先把缺口问清楚' : '可进入首单谈判',
      reasons: [
        r.summary,
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

  async function makeBrief(exOverride?: Extracted, mk?: MarketId, riskOverride?: typeof risk) {
    const use = exOverride ?? ex
    if (!use) return
    setBriefBusy(true)
    // analyze() 会在同一个 tick 里接着调这里，这时 state 还没重算完，
    // 必须用当次算出的 risk，否则封条会盖成上一份买家的判定
    const r = riskOverride ?? risk
    const ruleV: Brief['verdict'] = r.level === 'high' ? 'hold' : r.level === 'mid' ? 'probe' : 'go'
    try {
      const res = await fetch('/api/so/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          extracted: use, market: mk ?? market, verdict: ruleV,
          riskScore: r.score, riskLabel: r.label,
          badSignals: r.badKeys.map((k) => SIGNALS.find((s) => s.id === k)?.label ?? k),
          price: {
            fob: price.fob, landed: price.landed, retail: price.retail,
            retailLocal: price.retailLocal, taxRate, multiple: price.multiple,
          },
          raw,
        }),
      })
      if (res.ok) {
        const got = (await res.json()).brief as Brief
        const fb = localBrief(r)
        // 模型偶尔会漏字段——缺什么补什么，不能让业务员看到一块空白
        setBrief({
          // 去留永远是规则说了算，模型只负责把理由写成人话
          verdict: ruleV,
          headline: got.headline?.trim() || fb.headline,
          reasons: got.reasons?.length ? got.reasons : fb.reasons,
          questions: got.questions?.length ? got.questions : fb.questions,
          reply: got.reply?.trim() || fb.reply,
        })
      } else setBrief(localBrief(r))
    } catch {
      setBrief(localBrief(r))
    }
    setBriefBusy(false)
  }

  /** 返回 true 表示解析成功，可以跳到判定页 */
  async function analyze(): Promise<boolean> {
    setBusy(true)
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
      setAiNote('模型未回应，且这段文字没有本机备用。请到「信号」页手动勾选六项后继续。')
      out = { signals: EMPTY }
    }

    setEx(out)
    const nextVerdicts = { ...EMPTY, ...(out.signals ?? {}) }
    setVerdicts(nextVerdicts)
    const nextRisk = scoreRisk(nextVerdicts)
    let mk = market
    if (out.market && MARKETS[out.market]) {
      mk = out.market as MarketId
      setMarket(mk)
      setUncovered(null)
    } else {
      // 规则库没有这个市场——说出来，不要默默套用默认值
      setUncovered(out.marketGuess || '无法判断')
    }
    setBusy(false)
    void makeBrief(out, mk, nextRisk)
    return true
  }

  function fullBrief(): string {
    if (!brief) return ''
    return [
      `【首单决策简报】${ex?.company ?? '未具名买家'}　${m.flag} ${m.name}`,
      `判定：${ruleVerdict === 'hold' ? '暂缓' : ruleVerdict === 'probe' ? '追问后再定' : '可谈'}　${brief.headline}`,
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
      `目的国税费 ${fmt(price.taxTotal)}（占 到岸价 ${taxRate}%）→ 完税落地 ${fmt(price.landed)}`,
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
    ].join('\n')
  }

  return {
    ready, raw, setRaw, busy, ex, verdicts, setVerdicts, market, setMarket,
    aiNote, uncovered, elapsed,
    dp, setDp, ml, setMl, abv, setAbv, logi, setLogi, margin, setMargin,
    cbma, setCbma, chan, setChan, markup, setMarkup, aroma, setAroma, bottleId,
    brief, briefBusy, m, risk, price, clauses, ruleVerdict, taxRate,
    pickBottle, pickCase, reset, analyze, makeBrief, fullBrief,
  }
}

type Session = ReturnType<typeof useSessionState>
const Ctx = createContext<Session | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const v = useSessionState()
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>
}

export function useSession(): Session {
  const v = useContext(Ctx)
  if (!v) throw new Error('useSession 必须在 SessionProvider 内使用')
  return v
}
