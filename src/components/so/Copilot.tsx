'use client'
import { useMemo, useState } from 'react'
import { CASES } from '@/lib/so/cases'
import { MARKETS, MARKET_LIST } from '@/lib/so/markets'
import { computePrice } from '@/lib/so/pricing'
import { scoreRisk, SIGNALS } from '@/lib/so/signals'
import { pickClauses } from '@/lib/so/clauses'
import type { Brief, Extracted, MarketId } from '@/lib/so/types'
import { Btn, Chip, Num, Panel, SourceTag, Stat } from './parts'
import { RiskDial, SignalGrid } from './Gauge'
import { Waterfall } from './Waterfall'
import { Method } from './Method'
import { SpecAdvisor } from './SpecAdvisor'
import { PitchKit } from './PitchKit'
import { BottlePicker } from './BottlePicker'
import { SampleCheck } from './SampleCheck'
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
      setAiNote('模型未回应，且这段文字没有本机备用。请手动勾选下方六项讯号后继续。')
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
      if (res.ok) setBrief((await res.json()).brief as Brief)
      else setBrief(localBrief())
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
        ? [`负向讯号：${risk.badKeys.map((k) => SIGNALS.find((s) => s.id === k)?.label ?? k).join('、')}`]
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

  const heavyTax = price.taxTotal / price.cif > 1

  return (
    <div className="mx-auto max-w-[1180px] px-5 pb-28 pt-10 sm:px-8">
      {/* ── 产品头 ── */}
      <header className="mb-9">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-amber">
            AI × 白酒 · 经销商运营
          </span>
          <span className="h-px w-6 bg-white/20" />
          <span className="font-mono text-[10.5px] tracking-[0.14em] text-stone">贵州中小酒企 · 外贸专员</span>
        </div>
        <h1 className="font-serif text-[38px] leading-[1.14] text-bone sm:text-[52px]">
          第二单
          <span className="ml-3 align-middle font-sans text-[13px] font-normal tracking-[0.2em] text-stone">
            
          </span>
        </h1>
        <p className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-stone">
          出海不缺第一单，缺的是第二单。这是一个把展会名片变成首单决策简报的副驾——
          <span className="text-bone">
            判断对方是真的想卖酒还是在做税差、算出这瓶酒到他货架上要卖多少钱、告诉你合同该写死哪几条。
          </span>
        </p>
      </header>

      {/* ── 痛点锚定 ── */}
      <div className="mb-9 grid gap-px overflow-hidden rounded-lg border border-white/10 bg-white/8 sm:grid-cols-3">
        {[
          { k: '89 → 5', t: '遵义 2025 年出海漏斗', d: '89 家完成出口备案，最后只有 5 家与东南亚经销商建立初步联系。转化率 5.6%。' },
          { k: '36%', t: '出口之后又回来的货', d: '某年上半年出口 5.30 亿美元，同期 1.90 亿美元从进口渠道回流。有些货根本没出境。' },
          { k: '20% + 13%', t: '套利者盯上的那笔钱', d: '白酒出口免征消费税、退增值税 13%。这个差价本身就有人要，与酒卖不卖得掉无关。' },
        ].map((x) => (
          <div key={x.k} className="bg-ink2/60 p-5">
            <div className="font-serif text-[26px] leading-none text-amber">{x.k}</div>
            <div className="mt-2.5 text-[12.5px] font-medium text-bone">{x.t}</div>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-stone">{x.d}</p>
          </div>
        ))}
      </div>

      {/* ── 输入 ── */}
      <Panel eyebrow="步骤 1" title="把展会拿到的名片与对话贴进来">
        <div className="mb-4 grid gap-px overflow-hidden rounded border border-white/10 bg-white/8 sm:grid-cols-3">
          {CASES.map((c) => {
            const pre = scoreRisk(c.fallback.signals ?? {})
            const on = raw === c.raw
            const mk = c.fallback.market ? MARKETS[c.fallback.market] : null
            const col = pre.level === 'high' ? 'text-rose-300' : pre.level === 'mid' ? 'text-amber' : 'text-emerald-300'
            const bar = pre.level === 'high' ? 'bg-rose-500/70' : pre.level === 'mid' ? 'bg-amber/80' : 'bg-emerald-500/70'
            return (
              <button
                key={c.id}
                onClick={() => pickCase(c.id)}
                className={`group bg-ink2/60 p-3.5 text-left transition ${on ? 'ring-1 ring-inset ring-amber/50' : 'hover:bg-ink2'}`}
              >
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="truncate font-mono text-[10px] uppercase tracking-[0.12em] text-stone">{c.tag}</span>
                  {mk && <span className="shrink-0 text-[13px]">{mk.flag}</span>}
                </div>
                <div className={`mb-1 truncate text-[12.5px] font-medium ${on ? 'text-amber' : 'text-bone'}`}>
                  {c.fallback.company}
                </div>
                <div className="mb-2.5 truncate text-[11px] text-stone">{c.source}</div>
                <div className="mb-1 flex items-baseline justify-between gap-2">
                  <span className={`font-mono text-[15px] tabular-nums ${col}`}>{pre.score}</span>
                  <span className={`truncate text-[10.5px] ${col}`}>{pre.label}</span>
                </div>
                <div className="h-[4px] overflow-hidden rounded-sm bg-white/8">
                  <div className={`h-full ${bar}`} style={{ width: `${Math.max(3, pre.score)}%`, transition: 'width .5s' }} />
                </div>
              </button>
            )
          })}
        </div>
        <p className="mb-3.5 text-[11.5px] leading-relaxed text-stone">
          三张名片来自同一场展会。左边那家开口就要 3 个柜，右边那家只要 150 箱——
          <span className="text-bone">分数低的那个才是能给你第二单的人。</span>
        </p>
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          rows={9}
          spellCheck={false}
          className="w-full resize-y rounded border border-white/12 bg-ink/70 p-3.5 font-mono text-[12.5px] leading-relaxed text-bone outline-none transition placeholder:text-stone/40 focus:border-amber/50"
          placeholder="粘贴微信对话、邮件、或名片上的文字…"
        />
        <div className="mt-3.5 flex flex-wrap items-center gap-3">
          <Btn onClick={analyze} disabled={stage === 'busy' || raw.trim().length < 10}>
            {stage === 'busy' ? '解析中…' : '解析这个买家'}
          </Btn>
          <span className="text-[11.5px] text-stone">
            抽取买家身分与六项讯号 · 判定套利风险 · 算出落地价 · 生成回信
          </span>
        </div>
        {stage === 'busy' && (
          <div className="mt-3.5 flex items-center gap-3 rounded border border-amber/25 bg-amber/[0.05] px-3.5 py-2.5">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber" />
            </span>
            <span className="text-[12.5px] text-bone">模型正在读这段对话，抽取买家身分与六项讯号</span>
            <span className="ml-auto font-mono text-[11.5px] tabular-nums text-stone">{elapsed.toFixed(1)}s</span>
          </div>
        )}
        {aiNote && <p className="mt-3 text-[12px] text-amber">{aiNote}</p>}
      </Panel>

      {stage === 'done' && ex && (
        <div id="so-result" className="mt-6 space-y-6">
          {/* ── 买家卡 ＋ 风险 ── */}
          <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
            <Panel eyebrow="步骤 2" title="这个买家是谁">
              <div className="mb-4">
                <div className="font-serif text-lg text-bone">{ex.company ?? '（对话中未具名）'}</div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-stone">
                  {ex.contact && <span>{ex.contact}</span>}
                  {ex.role && <Chip>{ex.role}</Chip>}
                  {ex.market && <Chip tone="neutral">{MARKETS[ex.market].flag} {MARKETS[ex.market].name}</Chip>}
                </div>
              </div>
              {!!ex.askedFor?.length && (
                <div className="mb-4">
                  <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-stone">他要你提供</div>
                  <ul className="space-y-1">
                    {ex.askedFor.map((a, i) => (
                      <li key={i} className="flex gap-2 text-[12.5px] leading-snug text-bone">
                        <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-amber" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {!!ex.redFlags?.length && (
                <div className="mb-4 rounded border border-rose-900/40 bg-rose-950/20 p-3">
                  <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-rose-300">值得警觉</div>
                  <ul className="space-y-1">
                    {ex.redFlags.map((f, i) => (
                      <li key={i} className="text-[12px] leading-snug text-rose-200/90">· {f}</li>
                    ))}
                  </ul>
                </div>
              )}
              {!!ex.quotes?.length && (
                <div>
                  <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-stone">判断依据（原文）</div>
                  <div className="space-y-1.5">
                    {ex.quotes.map((q, i) => (
                      <p key={i} className="border-l-2 border-white/15 pl-2.5 font-mono text-[11.5px] leading-snug text-stone/85">
                        {q}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </Panel>

            <Panel
              eyebrow="步骤 3"
              title="他是在卖酒，还是在做税差"
              right={<span className="font-mono text-[10px] text-stone">AI 初判 · 你可覆核</span>}
            >
              <RiskDial risk={risk} />
              <div className="mt-4">
                <SignalGrid verdicts={verdicts} onToggle={(id, v) => setVerdicts((s) => ({ ...s, [id]: v }))} />
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-stone/70">
                模型只做语意抽取与初判，最终判定由业务员按下这六组按钮决定——因为只有他知道展位上对方的表情。
              </p>
            </Panel>
          </div>

          {/* ── 牌照 ── */}
          <Panel
            eyebrow="步骤 4"
            title={`在${m.name}，能合法买你酒的人有多少`}
            right={
              <select
                value={market}
                onChange={(e) => {
                  setMarket(e.target.value as MarketId)
                  setMarkup(undefined)
                }}
                className="rounded border border-white/15 bg-ink2 px-2.5 py-1.5 text-[12px] text-bone outline-none"
              >
                {MARKET_LIST.map((x) => (
                  <option key={x.id} value={x.id}>{x.flag} {x.name}</option>
                ))}
              </select>
            }
          >
            {uncovered && (
              <div className="mb-4 rounded border border-rose-500/35 bg-rose-950/25 px-3.5 py-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-rose-300">规则库未涵盖</span>
                <p className="mt-1 text-[12.5px] leading-relaxed text-bone">
                  这个买家看起来在<span className="text-rose-200">「{uncovered}」</span>，
                  目前规则库只涵盖香港、新加坡、越南、美国、韩国五个市场。
                  下方的落地价与牌照核查<span className="text-rose-200">不适用于这个买家</span>，
                  请手动选一个最接近的市场作参考，或先把这个市场加进规则库再来谈。
                </p>
              </div>
            )}
            <div className="mb-4 rounded border border-amber/25 bg-amber/[0.06] px-3.5 py-2.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-amber">买方门槛</span>
              <p className="mt-1 text-[13px] leading-snug text-bone">{m.gate}</p>
            </div>
            <div className="grid gap-px overflow-hidden rounded border border-white/10 bg-white/8 sm:grid-cols-2">
              {m.licences.map((l, i) => (
                <div key={i} className="bg-ink2/60 p-3.5">
                  <div className="mb-1.5 flex items-center gap-2">
                    <Chip tone={l.who === 'buyer' ? 'warn' : 'neutral'}>{l.who === 'buyer' ? '买方须有' : '你须备齐'}</Chip>
                    {l.form && <span className="font-mono text-[10px] text-stone/70">{l.form}</span>}
                  </div>
                  <div className="text-[13px] font-medium leading-snug text-bone">
                    {l.name}
                    <SourceTag source={l.source} />
                  </div>
                  <p className="mt-1.5 text-[11.5px] leading-snug text-stone">{l.detail}</p>
                  <p className="mt-1.5 text-[11.5px] leading-snug text-rose-300/75">缺了会怎样：{l.ifMissing}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2.5">
              {m.insights.map((ins, i) => (
                <div
                  key={i}
                  className={`rounded border-l-2 px-3.5 py-2.5 ${
                    ins.tone === 'warn'
                      ? 'border-l-rose-500/60 bg-rose-950/15'
                      : ins.tone === 'edge'
                        ? 'border-l-amber/70 bg-amber/[0.05]'
                        : 'border-l-white/25 bg-white/[0.02]'
                  }`}
                >
                  <div className="text-[13px] font-medium text-bone">{ins.title}</div>
                  <p className="mt-1 text-[12px] leading-relaxed text-stone">{ins.body}</p>
                </div>
              ))}
            </div>
          </Panel>

          {/* ── 落地价 ── */}
          <Panel
            eyebrow="步骤 5"
            title="这瓶酒到他的货架上，要卖多少钱"
            right={
              heavyTax ? <Chip tone="bad">落地税负 &gt; 100%</Chip> : <Chip tone="neutral">落地税负 {Math.round((price.taxTotal / price.cif) * 100)}%</Chip>
            }
          >
            <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Stat label="出口保本线" value={fmt(price.breakeven)} unit="元／瓶" sub="低于此价这单就是亏的" />
              <Stat label="离岸报价" value={fmt(price.fob)} unit="元／瓶" sub={`加成 ${Math.round(margin * 100)}%`} />
              <Stat label="完税落地" value={fmt(price.landed)} unit="元／瓶" tone="warn" sub="进口商的成本" />
              <Stat label="终端零售" value={fmt(price.retail)} unit="元／瓶" tone={price.multiple > 6 ? 'bad' : undefined} sub={`${price.multiple} 倍于内销开票价`} />
            </div>

            <div className="mb-4">
              <BottlePicker id={bottleId} onPick={pickBottle} />
            </div>

            <div className="mb-4 rounded border border-white/10 bg-white/[0.02] p-3.5">
              <div className="mb-2.5 flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-amber">他打算怎么卖</span>
                {([['onPremise', '餐饮通路', '中餐厅、酒吧'], ['retail', '零售通路', '商超、酒类专卖']] as const).map(
                  ([k, label, sub]) => (
                    <button
                      key={k}
                      onClick={() => {
                        setChan(k)
                        setMarkup(undefined)
                      }}
                      className={`rounded border px-3 py-1.5 text-[12.5px] transition ${
                        chan === k
                          ? 'border-amber/60 bg-amber/10 text-amber'
                          : 'border-white/12 text-stone hover:border-white/30 hover:text-bone'
                      }`}
                    >
                      {label}
                      <span className="ml-1.5 text-[10.5px] opacity-60">{sub}</span>
                    </button>
                  ),
                )}
              </div>
              <div className="grid gap-2.5 sm:grid-cols-[1fr_auto] sm:items-end">
                <div className="flex flex-wrap gap-2.5">
                  {price.channel.map((c, i) => (
                    <label key={c.label} className="flex items-center gap-1.5">
                      <span className="text-[11.5px] text-stone">{c.label}</span>
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
                        className="w-[54px] rounded border border-white/12 bg-ink/70 px-1.5 py-1 text-right font-mono text-[12px] tabular-nums text-bone outline-none focus:border-amber/50"
                      />
                      <span className="text-[10.5px] text-stone">%</span>
                    </label>
                  ))}
                  {markup && (
                    <button
                      onClick={() => setMarkup(undefined)}
                      className="self-center font-mono text-[10.5px] text-amber underline underline-offset-2"
                    >
                      还原
                    </button>
                  )}
                </div>
                <span className="text-[10.5px] leading-snug text-stone/60 sm:max-w-[300px] sm:text-right">
                  毛利率口径，可改。{chan === 'onPremise' ? '餐饮端 75–85%；高价位酒实务上会往下压' : '零售端约 20–23%'}
                </span>
              </div>
              <p className="mt-2.5 border-t border-white/8 pt-2.5 text-[11px] leading-relaxed text-stone">
                <span className="text-bone">白酒在海外的主战场是餐饮，不是货架。</span>
                同一瓶酒走餐饮通路的终端价，会是走零售的两倍以上——因为餐饮端毛利率 75–85%，零售只有 20–23%。
                谈第一单时若不问清楚对方打算怎么卖，你算出来的落地价是错的。
                <span className="text-stone/70">（餐饮端的高毛利率是行业均值，高价位酒实务上会往下压，所以这三个数字都留给你改。）</span>
                <span className="text-stone/60">　依据：{m.markupSource}</span>
              </p>
            </div>

            <div className="mb-5 grid gap-3 rounded border border-white/10 bg-white/[0.02] p-3.5 sm:grid-cols-5">
              <NumField label="内销开票价" value={dp} set={setDp} step={20} unit="元" />
              <NumField label="容量" value={ml} set={setMl} step={50} unit="ml" />
              <NumField label="酒精度" value={abv} set={setAbv} step={1} unit="%" />
              <NumField label="物流分摊" value={logi} set={setLogi} step={2} unit="元" />
              <div>
                <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-stone">出口加成</div>
                <input
                  type="range" min={0} max={0.6} step={0.05} value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="w-full accent-[#D9873F]"
                />
                <div className="mt-0.5 font-mono text-[11px] text-bone">{Math.round(margin * 100)}%</div>
              </div>
            </div>

            {market === 'us' && (
              <label className="mb-4 flex cursor-pointer items-start gap-3 rounded border border-amber/30 bg-amber/[0.06] p-3.5">
                <input type="checkbox" checked={cbma} onChange={(e) => setCbma(e.target.checked)} className="mt-0.5 accent-[#D9873F]" />
                <span>
                  <span className="text-[13px] font-medium text-bone">把 CBMA 税收优惠额度指派给这家进口商</span>
                  <p className="mt-1 text-[12px] leading-relaxed text-stone">
                    联邦消费税标准 $13.50／标准酒精加仑（proof gallon），指派后降到 $2.70。
                    <span className="text-amber">
                      {' '}这一个动作值 {fmt(computePrice({ domesticPrice: dp, ml, abv, logistics: logi, market: 'us', exportMargin: margin }).landed - computePrice({ domesticPrice: dp, ml, abv, logistics: logi, market: 'us', exportMargin: margin, cbmaAssigned: true }).landed)} 元／瓶
                    </span>
                    ，一个 20 尺柜 12,000 瓶就是十几万人民币——而且不花你一毛钱。
                  </p>
                </span>
              </label>
            )}

            <Waterfall p={price} m={m} />

            <div className="mt-5">
              <SampleCheck abv={abv} asked={wantsSample(raw, ex?.askedFor)} />
            </div>

            <div className="mt-5">
              <SpecAdvisor market={market} m={m} domesticPrice={dp} logistics={logi} margin={margin} cbma={cbma} channel={chan} />
            </div>

            <div className="mt-5 rounded border border-white/10 bg-white/[0.02] p-3.5">
              <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-amber">
                同一瓶酒，出口和内销的税务身分不同
              </div>
              <p className="text-[12.5px] leading-relaxed text-stone">
                内销开票 <Num className="text-bone">{fmt(dp)}</Num> 元，其中消费税约{' '}
                <Num className="text-bone">{fmt(price.consumptionTaxSaved)}</Num> 元出口免征
                <SourceTag source="消费税：20% 从价 ＋ 0.5 元／500ml 从量；出口免征不退" />
                ，另可退增值税 <Num className="text-bone">{fmt(price.vatRebate)}</Num> 元
                <SourceTag source="白酒出口增值税退税率 13%" />
                。合计 <Num className="text-amber">{fmt(price.arbitragePool)}</Num> 元／瓶——
                <span className="text-bone">这笔钱就是套利型买家真正要的东西，跟酒卖不卖得掉无关。</span>
              </p>
            </div>
          </Panel>

          {/* ── 卖点 ── */}
          <Panel
            eyebrow="步骤 6"
            title="他一定会问「这酒在我这里怎么卖」"
            right={<span className="font-mono text-[10px] text-stone">香型 × 料理 × 该市场已验证的用法</span>}
          >
            <PitchKit market={market} m={m} aroma={aroma} setAroma={setAroma} bottle={bottleId ? BAIJIU_BY_ID[bottleId] : null} />
          </Panel>

          {/* ── 简报 ── */}
          <Panel eyebrow="步骤 7" title="首单决策简报">
            {!brief ? (
              <div className="flex flex-wrap items-center gap-3">
                <Btn onClick={makeBrief} disabled={briefBusy}>
                  {briefBusy ? '生成中…' : '生成决策简报与回信'}
                </Btn>
                <span className="text-[11.5px] text-stone">判定去留 · 必问清单 · 合同条款 · 第一封回信</span>
              </div>
            ) : (
              <div id="so-brief" className="space-y-5">
                <div
                  className={`rounded border-l-[3px] px-4 py-3.5 ${
                    brief.verdict === 'hold'
                      ? 'border-l-rose-500 bg-rose-950/20'
                      : brief.verdict === 'probe'
                        ? 'border-l-amber bg-amber/[0.07]'
                        : 'border-l-emerald-500 bg-emerald-950/15'
                  }`}
                >
                  <div className="mb-1 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
                    <span>{brief.verdict === 'hold' ? '判定 · 暂缓' : brief.verdict === 'probe' ? '判定 · 追问后再定' : '判定 · 可谈'}</span>
                    <span className="text-stone/50">由规则引擎决定 · 模型只负责写理由</span>
                  </div>
                  <div className="font-serif text-[17px] leading-snug text-bone">{brief.headline}</div>
                  <ul className="mt-2.5 space-y-1">
                    {brief.reasons?.map((r, i) => (
                      <li key={i} className="text-[12.5px] leading-relaxed text-stone">· {r}</li>
                    ))}
                  </ul>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <div>
                    <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-amber">必问清单</div>
                    <ol className="space-y-2">
                      {brief.questions?.map((q, i) => (
                        <li key={i} className="flex gap-2.5 rounded border border-white/10 bg-white/[0.02] p-2.5 text-[12.5px] leading-snug text-bone">
                          <span className="font-mono text-[11px] text-amber">{String(i + 1).padStart(2, '0')}</span>
                          {q}
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div>
                    <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-amber">
                      建议写进第一份合同的条款
                    </div>
                    <div className="space-y-2">
                      {clauses.map((c) => (
                        <details key={c.id} className="rounded border border-white/10 bg-white/[0.02] p-2.5">
                          <summary className="cursor-pointer list-none text-[12.5px] font-medium text-bone">
                            <span className="mr-1.5 text-amber">▸</span>
                            {c.title}
                            <span className="ml-2 text-[11px] font-normal text-stone">挡掉：{c.blocks}</span>
                          </summary>
                          <p className="mt-2 border-l-2 border-amber/40 pl-2.5 text-[11.5px] leading-relaxed text-stone">
                            {c.body}
                          </p>
                        </details>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-amber">第一封回信草稿</span>
                    <Btn
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        navigator.clipboard?.writeText(brief.reply)
                        setCopied(true)
                        setTimeout(() => setCopied(false), 1600)
                      }}
                    >
                      {copied ? '已复制' : '复制'}
                    </Btn>
                  </div>
                  <pre className="whitespace-pre-wrap rounded border border-white/10 bg-ink/60 p-3.5 font-sans text-[12.5px] leading-relaxed text-bone">
                    {brief.reply}
                  </pre>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  <Btn
                    size="sm"
                    onClick={() => {
                      navigator.clipboard?.writeText(fullBrief())
                      setCopiedAll(true)
                      setTimeout(() => setCopiedAll(false), 1800)
                    }}
                  >
                    {copiedAll ? '整份简报已复制' : '复制整份决策简报'}
                  </Btn>
                  <Btn variant="ghost" size="sm" onClick={makeBrief} disabled={briefBusy}>
                    {briefBusy ? '重新生成中…' : '重新生成'}
                  </Btn>
                </div>
              </div>
            )}
          </Panel>
        </div>
      )}

      <Method />
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
