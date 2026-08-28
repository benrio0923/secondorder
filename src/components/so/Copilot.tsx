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

  const [dp, setDp] = useState(320)
  const [ml, setMl] = useState(500)
  const [abv, setAbv] = useState(53)
  const [logi, setLogi] = useState(18)
  const [margin, setMargin] = useState(0.15)
  const [cbma, setCbma] = useState(false)

  const [brief, setBrief] = useState<Brief | null>(null)
  const [briefBusy, setBriefBusy] = useState(false)
  const [copied, setCopied] = useState(false)

  const m = MARKETS[market]
  const risk = useMemo(() => scoreRisk(verdicts), [verdicts])
  const price = useMemo(
    () => computePrice({ domesticPrice: dp, ml, abv, logistics: logi, market, exportMargin: margin, cbmaAssigned: cbma }),
    [dp, ml, abv, logi, market, margin, cbma],
  )
  const clauses = useMemo(() => pickClauses(risk.badKeys).slice(0, 4), [risk.badKeys])

  function pickCase(id: string) {
    const c = CASES.find((x) => x.id === id)!
    setCaseId(id)
    setRaw(c.raw)
    setStage('input')
    setEx(null)
    setBrief(null)
    setVerdicts(EMPTY)
    setAiNote(null)
  }

  async function analyze() {
    setStage('busy')
    setBrief(null)
    setAiNote(null)
    let out: Extracted | null = null
    try {
      const res = await fetch('/api/so/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw }),
      })
      if (res.ok) out = (await res.json()).extracted as Extracted
    } catch {}
    const fb = CASES.find((c) => c.raw === raw)?.fallback
    if (!out && fb) {
      out = fb
      setAiNote('模型未回應，已切換為本機預解析結果（現場備援路徑）')
    }
    if (!out) {
      setStage('input')
      setAiNote('模型未回應，且這段文字沒有本機備援。請手動勾選下方六項訊號後繼續。')
      setEx({ signals: EMPTY })
      setStage('done')
      return
    }
    setEx(out)
    setVerdicts({ ...EMPTY, ...(out.signals ?? {}) })
    if (out.market && MARKETS[out.market]) setMarket(out.market as MarketId)
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

  function localBrief(): Brief {
    const v = risk.level === 'high' ? 'hold' : risk.level === 'mid' ? 'probe' : 'go'
    return {
      verdict: v,
      headline:
        v === 'hold' ? '暫緩：這一單的性質需要重新評估' : v === 'probe' ? '可談，但先把缺口問清楚' : '可進入首單談判',
      reasons: [
        risk.summary,
        `${m.name}買方必須持有：${m.licences.filter((l) => l.who === 'buyer').map((l) => l.name).join('、')}`,
        `終端零售約 ${fmt(price.retailLocal)} ${m.currency}，是內銷開票價的 ${price.multiple} 倍`,
      ],
      questions: [
        '請提供貴司的酒類進口／分銷牌照編號與有效期。',
        '首批貨的落地倉在哪裡？可否提供地址與倉儲合約？',
        '這批貨預計進入哪些具體售點？可否給我們一份清單？',
        '我們可以提供品鑑小樣與品牌手冊，貴司需要幾套？',
        '動銷報告可否每季提供一次？含售點清單與陳列照片。',
      ],
      reply: '（模型未回應，此為本機備援草稿）感謝來訊。為了讓後續報價與合規安排更準確，我們需要先確認幾件事：貴司的酒類進口牌照、首批貨的落地倉，以及預計進入的售點類型。收到後我們會提供正式報價與可供品鑑的小樣。',
    }
  }

  const heavyTax = price.taxTotal / price.cif > 1

  return (
    <div className="mx-auto max-w-[1180px] px-5 pb-28 pt-10 sm:px-8">
      {/* ── 產品頭 ── */}
      <header className="mb-9">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-amber">
            AI × 白酒 · 經銷商運營
          </span>
          <span className="h-px w-6 bg-white/20" />
          <span className="font-mono text-[10.5px] tracking-[0.14em] text-stone">貴州中小酒企 · 外貿專員</span>
        </div>
        <h1 className="font-serif text-[38px] leading-[1.14] text-bone sm:text-[52px]">
          第二單
          <span className="ml-3 align-middle font-sans text-[13px] font-normal tracking-[0.2em] text-stone">
            SECOND&nbsp;ORDER
          </span>
        </h1>
        <p className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-stone">
          出海不缺第一單，缺的是第二單。這是一個把展會名片變成首單決策簡報的副駕——
          <span className="text-bone">
            判斷對方是真的想賣酒還是在做稅差、算出這瓶酒到他貨架上要賣多少錢、告訴你合同該寫死哪幾條。
          </span>
        </p>
      </header>

      {/* ── 痛點錨定 ── */}
      <div className="mb-9 grid gap-px overflow-hidden rounded-lg border border-white/10 bg-white/8 sm:grid-cols-3">
        {[
          { k: '89 → 5', t: '遵義 2025 年出海漏斗', d: '89 家完成出口備案，最後只有 5 家與東南亞經銷商建立初步聯繫。轉化率 5.6%。' },
          { k: '36%', t: '出口之後又回來的貨', d: '某年上半年出口 5.30 億美元，同期 1.90 億美元從進口渠道回流。有些貨根本沒出境。' },
          { k: '20% + 13%', t: '套利者盯上的那筆錢', d: '白酒出口免徵消費稅、退增值稅 13%。這個差價本身就有人要，與酒賣不賣得掉無關。' },
        ].map((x) => (
          <div key={x.k} className="bg-ink2/60 p-5">
            <div className="font-serif text-[26px] leading-none text-amber">{x.k}</div>
            <div className="mt-2.5 text-[12.5px] font-medium text-bone">{x.t}</div>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-stone">{x.d}</p>
          </div>
        ))}
      </div>

      {/* ── 輸入 ── */}
      <Panel eyebrow="STEP 1" title="把展會拿到的名片與對話貼進來">
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
          三張名片來自同一場展會。左邊那家開口就要 3 個櫃，右邊那家只要 150 箱——
          <span className="text-bone">分數低的那個才是能給你第二單的人。</span>
        </p>
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          rows={9}
          spellCheck={false}
          className="w-full resize-y rounded border border-white/12 bg-ink/70 p-3.5 font-mono text-[12.5px] leading-relaxed text-bone outline-none transition placeholder:text-stone/40 focus:border-amber/50"
          placeholder="貼上微信對話、郵件、或名片上的文字…"
        />
        <div className="mt-3.5 flex flex-wrap items-center gap-3">
          <Btn onClick={analyze} disabled={stage === 'busy' || raw.trim().length < 10}>
            {stage === 'busy' ? '解析中…' : '解析這個買家'}
          </Btn>
          <span className="text-[11.5px] text-stone">
            抽取買家身分與六項訊號 · 判定套利風險 · 算出落地價 · 生成回信
          </span>
        </div>
        {aiNote && <p className="mt-3 text-[12px] text-amber">{aiNote}</p>}
      </Panel>

      {stage === 'done' && ex && (
        <div id="so-result" className="mt-6 space-y-6">
          {/* ── 買家卡 ＋ 風險 ── */}
          <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
            <Panel eyebrow="STEP 2" title="這個買家是誰">
              <div className="mb-4">
                <div className="font-serif text-lg text-bone">{ex.company ?? '（對話中未具名）'}</div>
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
                  <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-rose-300">值得警覺</div>
                  <ul className="space-y-1">
                    {ex.redFlags.map((f, i) => (
                      <li key={i} className="text-[12px] leading-snug text-rose-200/90">· {f}</li>
                    ))}
                  </ul>
                </div>
              )}
              {!!ex.quotes?.length && (
                <div>
                  <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-stone">判斷依據（原文）</div>
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
              eyebrow="STEP 3"
              title="他是在賣酒，還是在做稅差"
              right={<span className="font-mono text-[10px] text-stone">AI 初判 · 你可覆核</span>}
            >
              <RiskDial risk={risk} />
              <div className="mt-4">
                <SignalGrid verdicts={verdicts} onToggle={(id, v) => setVerdicts((s) => ({ ...s, [id]: v }))} />
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-stone/70">
                模型只做語意抽取與初判，最終判定由業務員按下這六組按鈕決定——因為只有他知道展位上對方的表情。
              </p>
            </Panel>
          </div>

          {/* ── 牌照 ── */}
          <Panel
            eyebrow="STEP 4"
            title={`在${m.name}，能合法買你酒的人有多少`}
            right={
              <select
                value={market}
                onChange={(e) => setMarket(e.target.value as MarketId)}
                className="rounded border border-white/15 bg-ink2 px-2.5 py-1.5 text-[12px] text-bone outline-none"
              >
                {MARKET_LIST.map((x) => (
                  <option key={x.id} value={x.id}>{x.flag} {x.name}</option>
                ))}
              </select>
            }
          >
            <div className="mb-4 rounded border border-amber/25 bg-amber/[0.06] px-3.5 py-2.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-amber">買方門檻</span>
              <p className="mt-1 text-[13px] leading-snug text-bone">{m.gate}</p>
            </div>
            <div className="grid gap-px overflow-hidden rounded border border-white/10 bg-white/8 sm:grid-cols-2">
              {m.licences.map((l, i) => (
                <div key={i} className="bg-ink2/60 p-3.5">
                  <div className="mb-1.5 flex items-center gap-2">
                    <Chip tone={l.who === 'buyer' ? 'warn' : 'neutral'}>{l.who === 'buyer' ? '買方須有' : '你須備齊'}</Chip>
                    {l.form && <span className="font-mono text-[10px] text-stone/70">{l.form}</span>}
                  </div>
                  <div className="text-[13px] font-medium leading-snug text-bone">
                    {l.name}
                    <SourceTag source={l.source} />
                  </div>
                  <p className="mt-1.5 text-[11.5px] leading-snug text-stone">{l.detail}</p>
                  <p className="mt-1.5 text-[11.5px] leading-snug text-rose-300/75">缺了會怎樣：{l.ifMissing}</p>
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

          {/* ── 落地價 ── */}
          <Panel
            eyebrow="STEP 5"
            title="這瓶酒到他的貨架上，要賣多少錢"
            right={
              heavyTax ? <Chip tone="bad">落地稅負 &gt; 100%</Chip> : <Chip tone="neutral">落地稅負 {Math.round((price.taxTotal / price.cif) * 100)}%</Chip>
            }
          >
            <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Stat label="出口保本線" value={fmt(price.breakeven)} unit="元／瓶" sub="低於此價這單就是虧的" />
              <Stat label="FOB 報價" value={fmt(price.fob)} unit="元／瓶" sub={`加成 ${Math.round(margin * 100)}%`} />
              <Stat label="完稅落地" value={fmt(price.landed)} unit="元／瓶" tone="warn" sub="進口商的成本" />
              <Stat label="終端零售" value={fmt(price.retail)} unit="元／瓶" tone={price.multiple > 6 ? 'bad' : undefined} sub={`${price.multiple} 倍於內銷開票價`} />
            </div>

            <div className="mb-5 grid gap-3 rounded border border-white/10 bg-white/[0.02] p-3.5 sm:grid-cols-5">
              <NumField label="內銷開票價" value={dp} set={setDp} step={20} unit="元" />
              <NumField label="容量" value={ml} set={setMl} step={50} unit="ml" />
              <NumField label="酒精度" value={abv} set={setAbv} step={1} unit="%" />
              <NumField label="物流分攤" value={logi} set={setLogi} step={2} unit="元" />
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
                  <span className="text-[13px] font-medium text-bone">把 CBMA 稅收優惠額度指派給這家進口商</span>
                  <p className="mt-1 text-[12px] leading-relaxed text-stone">
                    聯邦消費稅標準 $13.50／proof gallon，指派後降到 $2.70。
                    <span className="text-amber">
                      {' '}這一個動作值 {fmt(computePrice({ domesticPrice: dp, ml, abv, logistics: logi, market: 'us', exportMargin: margin }).landed - computePrice({ domesticPrice: dp, ml, abv, logistics: logi, market: 'us', exportMargin: margin, cbmaAssigned: true }).landed)} 元／瓶
                    </span>
                    ，一個 20 尺櫃 12,000 瓶就是十幾萬人民幣——而且不花你一毛錢。
                  </p>
                </span>
              </label>
            )}

            <Waterfall p={price} m={m} />

            <div className="mt-5">
              <SpecAdvisor market={market} m={m} domesticPrice={dp} logistics={logi} margin={margin} cbma={cbma} />
            </div>

            <div className="mt-5 rounded border border-white/10 bg-white/[0.02] p-3.5">
              <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-amber">
                同一瓶酒，出口和內銷的稅務身分不同
              </div>
              <p className="text-[12.5px] leading-relaxed text-stone">
                內銷開票 <Num className="text-bone">{fmt(dp)}</Num> 元，其中消費稅約{' '}
                <Num className="text-bone">{fmt(price.consumptionTaxSaved)}</Num> 元出口免徵
                <SourceTag source="消費稅：20% 從價 ＋ 0.5 元／500ml 從量；出口免徵不退" />
                ，另可退增值稅 <Num className="text-bone">{fmt(price.vatRebate)}</Num> 元
                <SourceTag source="白酒出口增值稅退稅率 13%" />
                。合計 <Num className="text-amber">{fmt(price.arbitragePool)}</Num> 元／瓶——
                <span className="text-bone">這筆錢就是套利型買家真正要的東西，跟酒賣不賣得掉無關。</span>
              </p>
            </div>
          </Panel>

          {/* ── 簡報 ── */}
          <Panel eyebrow="STEP 6" title="首單決策簡報">
            {!brief ? (
              <div className="flex flex-wrap items-center gap-3">
                <Btn onClick={makeBrief} disabled={briefBusy}>
                  {briefBusy ? '生成中…' : '生成決策簡報與回信'}
                </Btn>
                <span className="text-[11.5px] text-stone">判定去留 · 必問清單 · 合同條款 · 第一封回信</span>
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
                  <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
                    {brief.verdict === 'hold' ? '判定 · 暫緩' : brief.verdict === 'probe' ? '判定 · 追問後再定' : '判定 · 可談'}
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
                    <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-amber">必問清單</div>
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
                      建議寫進第一份合同的條款
                    </div>
                    <div className="space-y-2">
                      {clauses.map((c) => (
                        <details key={c.id} className="rounded border border-white/10 bg-white/[0.02] p-2.5">
                          <summary className="cursor-pointer list-none text-[12.5px] font-medium text-bone">
                            <span className="mr-1.5 text-amber">▸</span>
                            {c.title}
                            <span className="ml-2 text-[11px] font-normal text-stone">擋掉：{c.blocks}</span>
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
                      {copied ? '已複製' : '複製'}
                    </Btn>
                  </div>
                  <pre className="whitespace-pre-wrap rounded border border-white/10 bg-ink/60 p-3.5 font-sans text-[12.5px] leading-relaxed text-bone">
                    {brief.reply}
                  </pre>
                </div>

                <Btn variant="ghost" size="sm" onClick={makeBrief} disabled={briefBusy}>
                  {briefBusy ? '重新生成中…' : '重新生成'}
                </Btn>
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
