import type { Extracted, MarketId } from './types'

export type DemoCase = {
  id: string
  tag: string
  source: string
  raw: string
  /** 預先寫好的解析結果：AI 失敗時的 fallback，也是現場 demo 的保險 */
  fallback: Extracted
}

export const CASES: DemoCase[] = [
  {
    id: 'sg-golden',
    tag: '展會微信',
    source: '新加坡 · ProWine 攤位掃碼',
    raw: `【名片】GoldenLink Trading Pte Ltd｜陳先生｜Singapore

你好，我们做酒类出口贸易的，在你们展位扫的码。
53度500ml那款，出厂价最低能到多少？我们要最低的。
先来3个柜试试水，量大价格得下来。
标签不用改，我们这边自己处理。
货先放新加坡自贸仓，后面看情况分销。
品牌资料就不用了，我们不做零售。
动销数据？这个是我们的商业机密，不方便提供。`,
    fallback: {
      company: 'GoldenLink Trading Pte Ltd',
      contact: '陳先生',
      market: 'sg',
      role: '酒類出口貿易商',
      claims: ['做酒類出口貿易', '量大可以吃下 3 個櫃'],
      askedFor: ['最低出廠價', '3 個櫃的報價'],
      signals: {
        downstream: false,
        spec: false,
        size: false,
        dest: false,
        brand: false,
        sellthrough: false,
      },
      redFlags: [
        '首單直接開 3 個櫃，卻不議規格只議價',
        '「標籤不用改，我們自己處理」——他不打算讓這批貨合規落地',
        '貨只到自貿倉，沒有終端市場',
        '拒絕提供動銷數據',
      ],
      quotes: [
        '标签不用改，我们这边自己处理',
        '货先放新加坡自贸仓，后面看情况分销',
        '动销数据？这个是我们的商业机密',
      ],
    },
  },
  {
    id: 'vn-anphu',
    tag: '展會後郵件',
    source: '越南胡志明 · 食品餐飲展',
    raw: `【名片】An Phú Foods Co., Ltd｜Nguyễn Văn Minh｜Ho Chi Minh City

您好，我们是胡志明市的食品进口商 An Phú Foods。
请问你们 500ml 的规格有 38 度的吗？越南这边 20 度以上的特别消费税刚修法，2027 年开始逐年上调。
标签需要越南文，成分备案我们可以协助办理，但需要你们提供第三方检测报告。
第一批想先做 150 箱，放在胡志明市 12 家中餐厅试销。
有没有品鉴用的小样和品牌手册？我们要培训服务生怎么介绍酱香。
动销报告我们每月都做，可以同步给你们。`,
    fallback: {
      company: 'An Phú Foods',
      contact: 'Nguyễn 先生',
      market: 'vn',
      role: '食品進口商（持證）',
      claims: ['胡志明市食品進口商', '手上有 12 家中餐廳通路'],
      askedFor: ['38 度規格', '第三方檢測報告', '品鑑小樣與品牌手冊'],
      signals: {
        downstream: true,
        spec: true,
        size: true,
        dest: true,
        brand: true,
        sellthrough: true,
      },
      redFlags: [],
      quotes: [
        '请问你们 500ml 的规格有 38 度的吗？',
        '第一批想先做 150 箱，放在胡志明市 12 家中餐厅试销',
        '动销报告我们每月都做，可以同步给你们',
      ],
    },
  },
  {
    id: 'us-pacific',
    tag: '英文郵件',
    source: '美國加州 · 進口商主動來信',
    raw: `【Business card】Pacific Rim Beverage LLC｜Mark Whelan｜Oakland, CA

Hi — we're a licensed importer in California, TTB basic permit on file.
Before we can move anything we'll need COLA approval, so please send label artwork (front + back, high res).
Also need your FDA facility registration number and your US agent's contact.
Thinking of starting with 200 cases of the 53% ABV 500ml.
What's your best FOB? Our margin is tight after the federal excise tax.
And we'll need the CBMA assignment from you — otherwise the FET at $13.50/PG kills the deal.`,
    fallback: {
      company: 'Pacific Rim Beverage LLC',
      contact: 'Mark',
      market: 'us',
      role: '持牌進口商（TTB Basic Permit）',
      claims: ['加州持牌進口商', 'TTB 基本許可已在案'],
      askedFor: [
        '酒標高解析檔（正背標）以申請 COLA',
        'FDA 設施註冊號與美國代理人聯絡方式',
        'FOB 最優報價',
        'CBMA 稅收優惠額度指派',
      ],
      signals: {
        downstream: false,
        spec: true,
        size: true,
        dest: true,
        brand: false,
        sellthrough: null,
      },
      redFlags: [],
      quotes: [
        "we'll need COLA approval, so please send label artwork",
        'need your FDA facility registration number and your US agent',
        'we\'ll need the CBMA assignment from you',
      ],
    },
  },
]

export const CASE_BY_ID = Object.fromEntries(CASES.map((c) => [c.id, c]))

export const DEFAULT_MARKET: MarketId = 'sg'
