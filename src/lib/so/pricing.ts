import { MARKETS } from './markets'
import type { MarketId, TaxLine } from './types'

export type PriceInput = {
  /** 内销开票价（含增值税），人民币／瓶 */
  domesticPrice: number
  ml: number
  abv: number
  /** 每瓶分摊的物流与杂费，人民币 */
  logistics: number
  market: MarketId
  cbmaAssigned?: boolean
  /** 走零售渠道还是餐饮渠道——白酒在海外主要走餐饮，两者终端价差很大 */
  channel?: 'retail' | 'onPremise'
  /** 覆写各层毛利率（使用者可调） */
  markupOverride?: number[]
  /** 出口报价相对「保本线」的加成，0.15 = 加 15% */
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
  /** 中国侧 */
  exVatBase: number
  consumptionTaxSaved: number
  vatRebate: number
  /** 出口保本线（低于此价即亏损） */
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
  /** 套利者盯上的那笔钱 */
  arbitragePool: number
}

const r2 = (n: number) => Math.round(n * 100) / 100

export function computePrice(raw: PriceInput): PriceResult {
  // 防护：任何非正数输入都会让比值变成 NaN/Infinity，画面会直接坏掉
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
  // 白酒消费税：从价 20% ＋ 从量 0.5 元／500ml。出口免征（不退）。
  const consumptionTaxSaved = exVatBase * 0.2 + (input.ml / 500) * 0.5
  // 增值税出口退税率 13%
  const vatRebate = exVatBase * 0.13

  // 出口保本线：内销不含税成本，扣掉出口免掉与退回的税
  const breakeven = Math.max(0.01, exVatBase - consumptionTaxSaved - vatRebate)
  const fob = breakeven * (1 + input.exportMargin)
  const cif = fob + input.logistics

  const taxes = m.calcTax({ cifRmb: cif, ml: input.ml, abv: input.abv, cbmaAssigned: input.cbmaAssigned })
  const taxTotal = taxes.reduce((a, t) => a + t.amount, 0)
  const landed = cif + taxTotal

  let cur = landed
  const tiers = m.channelMarkup[input.channel ?? 'retail']
  const channel = tiers.map((c, ci) => {
    const rate = input.markupOverride?.[ci] ?? c.rate
    const from = cur
    const to = cur / (1 - Math.min(0.95, Math.max(0, rate)))
    cur = to
    return { label: c.label, from: r2(from), to: r2(to), rate, note: c.note }
  })
  const retail = cur

  const steps: PriceStep[] = [
    { key: 'dom', label: '内销开票价', value: r2(input.domesticPrice), note: '含增值税', tone: 'neutral' },
    { key: 'ct', label: '出口免征消费税', value: r2(consumptionTaxSaved), delta: -r2(consumptionTaxSaved), note: '20% 从价 ＋ 0.5 元／500ml 从量', tone: 'gain' },
    { key: 'vat', label: '增值税退税', value: r2(vatRebate), delta: -r2(vatRebate), note: '退税率 13%', tone: 'gain' },
    { key: 'be', label: '出口保本线', value: r2(breakeven), note: '低于此价，这一单就是亏的', tone: 'neutral' },
    { key: 'fob', label: '你的离岸报价', value: r2(fob), note: `保本线 ＋ ${Math.round(input.exportMargin * 100)}% 加成`, tone: 'neutral' },
    { key: 'cif', label: '到岸价', value: r2(cif), note: `＋ 物流杂费 ${r2(input.logistics)} 元`, tone: 'cost' },
    ...taxes.map((t) => ({ key: t.key, label: t.label, value: r2(t.amount), note: `${t.rate}｜基数：${t.basis}`, tone: 'cost' as const })),
    { key: 'landed', label: '完税落地成本', value: r2(landed), note: '进口商拿到货的成本', tone: 'neutral' },
    ...channel.map((c) => ({ key: 'ch-' + c.label, label: `${c.label}加价`, value: r2(c.to - c.from), note: `毛利率 ${Math.round(c.rate * 100)}%`, tone: 'cost' as const })),
    { key: 'retail', label: '终端零售价', value: r2(retail), note: '消费者看到的价格', tone: 'neutral' },
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
