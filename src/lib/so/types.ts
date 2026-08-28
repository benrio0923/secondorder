export type MarketId = 'hk' | 'sg' | 'vn' | 'us' | 'kr'

export type TaxLine = {
  key: string
  label: string
  /** 本層稅費金額（人民幣元／瓶） */
  amount: number
  /** 計算基數說明，寫給人看的 */
  basis: string
  /** 稅率或單位稅的文字表達 */
  rate: string
  /** 這條稅的依據來源 */
  source: string
  /** 生效日期或版本 */
  asOf: string
  /** 未來會變的，寫在這 */
  changing?: string
}

export type LicenceReq = {
  who: 'buyer' | 'you'
  name: string
  detail: string
  form?: string
  source: string
  /** 缺這一項的後果 */
  ifMissing: string
}

export type Market = {
  id: MarketId
  name: string
  nameEn: string
  flag: string
  currency: string
  /** 1 單位當地幣 = ? 人民幣，僅供估算 */
  fx: number
  /** 通路加價層級，[進口商, 批發商, 零售商] 毛利率 */
  channelMarkup: { label: string; rate: number; note: string }[]
  licences: LicenceReq[]
  /** 該市場的關鍵提醒，是產品的「行家知識」 */
  insights: { title: string; body: string; tone: 'warn' | 'edge' | 'info' }[]
  /** 對標酒款：落地價會和什麼酒站在一起 */
  benchmarks: { name: string; priceLocal: number; note: string }[]
  calcTax: (i: TaxInput) => TaxLine[]
  /** 買方是否為封閉持牌池 */
  gate: string
}

export type TaxInput = {
  /** 每瓶 CIF 價，人民幣 */
  cifRmb: number
  /** 容量 ml */
  ml: number
  /** 酒精度 % */
  abv: number
  /** 是否已把美國 CBMA 額度指派給進口商 */
  cbmaAssigned?: boolean
}

export type BuyerSignal = {
  id: string
  label: string
  good: string
  bad: string
  /** 使用者判定：true=好訊號 false=壞訊號 null=未知 */
  verdict: boolean | null
  weight: number
}

export type Extracted = {
  company?: string
  contact?: string
  market?: MarketId
  marketGuess?: string
  role?: string
  claims?: string[]
  askedFor?: string[]
  signals?: Record<string, boolean | null>
  redFlags?: string[]
  quotes?: string[]
}

export type Brief = {
  verdict: 'go' | 'probe' | 'hold'
  headline: string
  reasons: string[]
  questions: string[]
  reply: string
}
