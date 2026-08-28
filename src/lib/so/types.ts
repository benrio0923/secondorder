export type MarketId = 'hk' | 'sg' | 'vn' | 'us' | 'kr'

export type TaxLine = {
  key: string
  label: string
  /** 本层税费金额（人民币元／瓶） */
  amount: number
  /** 计算基数说明，写给人看的 */
  basis: string
  /** 税率或单位税的文字表达 */
  rate: string
  /** 这条税的依据来源 */
  source: string
  /** 生效日期或版本 */
  asOf: string
  /** 未来会变的，写在这 */
  changing?: string
}

export type LicenceReq = {
  who: 'buyer' | 'you'
  name: string
  detail: string
  form?: string
  source: string
  /** 缺这一项的后果 */
  ifMissing: string
}

export type Market = {
  id: MarketId
  name: string
  nameEn: string
  flag: string
  currency: string
  /** 1 单位当地币 = ? 人民币，仅供估算 */
  fx: number
  /** 渠道加价层级（毛利率口径）。白酒海外主要走餐饮，两套差很多，所以分开给 */
  channelMarkup: {
    retail: { label: string; rate: number; note: string }[]
    onPremise: { label: string; rate: number; note: string }[]
  }
  /** 加价率的依据 */
  markupSource: string
  licences: LicenceReq[]
  /** 该市场的关键提醒，是产品的「行家知识」 */
  insights: { title: string; body: string; tone: 'warn' | 'edge' | 'info' }[]
  /** 对标酒款：落地价会和什么酒站在一起 */
  benchmarks: { name: string; priceLocal: number; note: string }[]
  calcTax: (i: TaxInput) => TaxLine[]
  /** 买方是否为封闭持牌池 */
  gate: string
}

export type TaxInput = {
  /** 每瓶 到岸价 价，人民币 */
  cifRmb: number
  /** 容量 ml */
  ml: number
  /** 酒精度 % */
  abv: number
  /** 是否已把美国 CBMA 额度指派给进口商 */
  cbmaAssigned?: boolean
}

export type BuyerSignal = {
  id: string
  label: string
  good: string
  bad: string
  /** 使用者判定：true=好信号 false=坏信号 null=未知 */
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
