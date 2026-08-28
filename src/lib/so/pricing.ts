import { MARKETS } from './markets'
import type { MarketId, TaxLine } from './types'

export type PriceInput = {
  /** 內銷開票價（含增值稅），人民幣／瓶 */
  domesticPrice: number
  ml: number
  abv: number
  /** 每瓶分攤的物流與雜費，人民幣 */
  logistics: number
  market: MarketId
  cbmaAssigned?: boolean
  /** 出口報價相對「保本線」的加成，0.15 = 加 15% */
  exportMargin: number
}

export type PriceStep = {
  key: string
  label: string
  value: number
  delta?: number
  note: string
  tone?: 'gain' | 'cost' | 'neutral'
}

export type PriceResult = {
  /** 中國側 */
  exVatBase: number
  consumptionTaxSaved: number
  vatRebate: number
  /** 出口保本線（低於此價即虧損） */
  breakeven: number
  fob: number
  cif: number
  taxes: TaxLine[]
  taxTotal: number
  landed: number
  channel: { label: string; from: number; to: number; rate: number; note: string }[]
  retail: number
  retailLocal: number
  multiple: number
  steps: PriceStep[]
  /** 套利者盯上的那筆錢 */
  arbitragePool: number
}

const r2 = (n: number) => Math.round(n * 100) / 100

export function computePrice(raw: PriceInput): PriceResult {
  // 防護：任何非正數輸入都會讓比值變成 NaN/Infinity，畫面會直接壞掉
  const input: PriceInput = {
    ...raw,
    domesticPrice: Math.max(1, raw.domesticPrice || 0),
    ml: Math.max(1, raw.ml || 0),
    abv: Math.min(96, Math.max(0, raw.abv || 0)),
    logistics: Math.max(0, raw.logistics || 0),
    exportMargin: Math.max(0, raw.exportMargin || 0),
  }
  const m = MARKETS[input.market]
  const exVatBase = input.domesticPrice / 1.13
  // 白酒消費稅：從價 20% ＋ 從量 0.5 元／500ml。出口免徵（不退）。
  const consumptionTaxSaved = exVatBase * 0.2 + (input.ml / 500) * 0.5
  // 增值稅出口退稅率 13%
  const vatRebate = exVatBase * 0.13

  // 出口保本線：內銷不含稅成本，扣掉出口免掉與退回的稅
  const breakeven = Math.max(0.01, exVatBase - consumptionTaxSaved - vatRebate)
  const fob = breakeven * (1 + input.exportMargin)
  const cif = fob + input.logistics

  const taxes = m.calcTax({ cifRmb: cif, ml: input.ml, abv: input.abv, cbmaAssigned: input.cbmaAssigned })
  const taxTotal = taxes.reduce((a, t) => a + t.amount, 0)
  const landed = cif + taxTotal

  let cur = landed
  const channel = m.channelMarkup.map((c) => {
    const from = cur
    const to = cur / (1 - c.rate)
    cur = to
    return { label: c.label, from: r2(from), to: r2(to), rate: c.rate, note: c.note }
  })
  const retail = cur

  const steps: PriceStep[] = [
    { key: 'dom', label: '內銷開票價', value: r2(input.domesticPrice), note: '含增值稅', tone: 'neutral' },
    { key: 'ct', label: '出口免徵消費稅', value: r2(consumptionTaxSaved), delta: -r2(consumptionTaxSaved), note: '20% 從價 ＋ 0.5 元／500ml 從量', tone: 'gain' },
    { key: 'vat', label: '增值稅退稅', value: r2(vatRebate), delta: -r2(vatRebate), note: '退稅率 13%', tone: 'gain' },
    { key: 'be', label: '出口保本線', value: r2(breakeven), note: '低於此價，這一單就是虧的', tone: 'neutral' },
    { key: 'fob', label: '你的 FOB 報價', value: r2(fob), note: `保本線 ＋ ${Math.round(input.exportMargin * 100)}% 加成`, tone: 'neutral' },
    { key: 'cif', label: 'CIF 到岸價', value: r2(cif), note: `＋ 物流雜費 ${r2(input.logistics)} 元`, tone: 'cost' },
    ...taxes.map((t) => ({ key: t.key, label: t.label, value: r2(t.amount), note: `${t.rate}｜基數：${t.basis}`, tone: 'cost' as const })),
    { key: 'landed', label: '完稅落地成本', value: r2(landed), note: '進口商拿到貨的成本', tone: 'neutral' },
    ...channel.map((c) => ({ key: 'ch-' + c.label, label: `${c.label}加價`, value: r2(c.to - c.from), note: `毛利率 ${Math.round(c.rate * 100)}%`, tone: 'cost' as const })),
    { key: 'retail', label: '終端零售價', value: r2(retail), note: '消費者看到的價格', tone: 'neutral' },
  ]

  return {
    exVatBase: r2(exVatBase),
    consumptionTaxSaved: r2(consumptionTaxSaved),
    vatRebate: r2(vatRebate),
    breakeven: r2(breakeven),
    fob: r2(fob),
    cif: r2(cif),
    taxes,
    taxTotal: r2(taxTotal),
    landed: r2(landed),
    channel,
    retail: r2(retail),
    retailLocal: r2(retail / m.fx),
    multiple: r2(retail / input.domesticPrice),
    steps,
    arbitragePool: r2(consumptionTaxSaved + vatRebate),
  }
}
