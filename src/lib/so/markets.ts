import type { Market, TaxInput, TaxLine } from './types'

/** 估算匯率（1 單位當地幣 = ? RMB）。僅供量級估算，非即時匯率。 */
const FX = { hk: 0.92, sg: 5.5, vn: 0.00028, us: 7.1, kr: 0.0053 }

const r2 = (n: number) => Math.round(n * 100) / 100

export const MARKETS: Record<string, Market> = {
  hk: {
    id: 'hk',
    name: '中國香港',
    nameEn: 'Hong Kong',
    flag: '🇭🇰',
    currency: 'HKD',
    fx: FX.hk,
    gate: '一般進口商即可，無需專門酒牌（零售端另需酒牌）',
    channelMarkup: [
      { label: '進口商', rate: 0.25, note: '香港進口商層級薄，多為貿易＋分銷一體' },
      { label: '零售／餐飲', rate: 0.6, note: '餐飲端加價可達 2–3 倍，此處取零售口徑' },
    ],
    licences: [
      {
        who: 'buyer',
        name: '商業登記＋酒牌（零售／餐飲端）',
        detail: '進口本身門檻低；但買方若要在店內售賣或供應飲用，須持有酒牌。',
        source: '香港法例（酒類售賣或供應）',
        ifMissing: '對方只能做批發轉手，無法自建終端——你拿不到動銷數據。',
      },
      {
        who: 'you',
        name: '常規出口報關文件',
        detail: '合同、發票、裝箱單、出廠合格證明；出口食品生產企業備案。',
        source: '中國海關出口食品監管要求',
        ifMissing: '出不了關。',
      },
    ],
    insights: [
      {
        title: '減稅只減「200 港元以上的那一段」',
        body: '2024/10/16 起，酒精濃度高於 30% 的酒類，進口價 200 港元以上的部分稅率由 100% 降至 10%；200 港元及以下的部分維持 100% 不變。所以受益的是高價位酒——正好是貴州的出口結構。低價光瓶酒幾乎沒吃到這波紅利。',
        tone: 'edge',
      },
      {
        title: '香港的價值是試驗田，不是銷量池',
        body: '香港去年占內地白酒出口量約 23%，是第一大目的地。但它真正的用處是：法規友善、華洋雜處、餐飲密集，是驗證定價與酒吧場景成本最低的市場。先在這裡跑通打法，再輸出。',
        tone: 'info',
      },
    ],
    benchmarks: [
      { name: 'Johnnie Walker 黑牌', priceLocal: 300, note: '示意價' },
      { name: '麥卡倫 12 年雪莉桶', priceLocal: 700, note: '示意價' },
      { name: '軒尼詩 VSOP', priceLocal: 560, note: '示意價' },
    ],
    calcTax: (i: TaxInput): TaxLine[] => {
      const cifHkd = i.cifRmb / FX.hk
      const dutyHkd = Math.min(cifHkd, 200) * 1.0 + Math.max(0, cifHkd - 200) * 0.1
      return [
        {
          key: 'duty',
          label: '烈酒稅',
          amount: r2(dutyHkd * FX.hk),
          basis: `進口價 HK$${r2(cifHkd)}／瓶`,
          rate: '≤HK$200 部分 100%；>HK$200 部分 10%',
          source: '香港特區政府新聞公報（調低酒精濃度高於 30% 的酒類稅率）',
          asOf: '2024-10-16 起',
        },
      ]
    },
  },

  sg: {
    id: 'sg',
    name: '新加坡',
    nameEn: 'Singapore',
    flag: '🇸🇬',
    currency: 'SGD',
    fx: FX.sg,
    gate: '買方須持有海關 Customs Permit＋酒類執照（Liquor Licence）',
    channelMarkup: [
      { label: '進口商', rate: 0.3, note: '' },
      { label: '批發商', rate: 0.2, note: '若進口商兼批發可省一層' },
      { label: '零售', rate: 0.45, note: '' },
    ],
    licences: [
      {
        who: 'buyer',
        name: '酒類執照（Liquor Licence）＋海關準證',
        detail: '商業進口須完稅並取得海關準證；攜帶超過 10 公升酒類亦需準證。',
        source: '新加坡海關',
        ifMissing: '貨進不了關，或只能以個人自用名義小量帶入，無法商業化。',
      },
      {
        who: 'you',
        name: '中文以外的成分與酒精度標示',
        detail: '標籤須清楚標示酒精度與淨含量。',
        source: '新加坡食品法規',
        ifMissing: '清關被扣、重貼標籤，成本與時間都由你承擔。',
      },
    ],
    insights: [
      {
        title: '新加坡按「純酒精量」課稅，度數越高越貴',
        body: 'S$88／公升純酒精。53 度 500ml 一瓶含 0.265 公升純酒精，光消費稅就 S$23.32——約人民幣 128 元，且與你的出廠價無關。這意味著：低價位白酒在新加坡幾乎沒有價格競爭力，因為稅是按度數收的，不是按價值收的。',
        tone: 'warn',
      },
      {
        title: '降度數是新加坡市場唯一的結構性解',
        body: '同一瓶酒從 53 度降到 38 度，純酒精量少 28%，消費稅同步少 28%。這是「低度化」在出海上最直接的財務理由——不是為了迎合口味，是為了活過稅。',
        tone: 'edge',
      },
      {
        title: '新加坡在東南亞的份額正在被稀釋',
        body: '新加坡占中國白酒對東南亞出口額的比重，從 2015 年的 48.24% 降到 2024 年的 17.83%。不是它萎縮，是泰國、越南、緬甸長得更快。把新加坡當成「東南亞入口」的舊地圖已經過期。',
        tone: 'info',
      },
    ],
    benchmarks: [
      { name: '起瓦士 12 年', priceLocal: 70, note: '示意價' },
      { name: '響 Harmony', priceLocal: 130, note: '示意價' },
      { name: '格蘭菲迪 12 年', priceLocal: 95, note: '示意價' },
    ],
    calcTax: (i: TaxInput): TaxLine[] => {
      const cifSgd = i.cifRmb / FX.sg
      const litresAlc = (i.ml / 1000) * (i.abv / 100)
      const dutySgd = litresAlc * 88
      const gstSgd = 0.09 * (cifSgd + dutySgd)
      return [
        {
          key: 'duty',
          label: '消費稅（按純酒精量）',
          amount: r2(dutySgd * FX.sg),
          basis: `${r2(litresAlc)} 公升純酒精 × S$88`,
          rate: 'S$88／公升純酒精',
          source: '新加坡海關 Duties and Dutiable Goods',
          asOf: '2025 現行',
        },
        {
          key: 'gst',
          label: 'GST',
          amount: r2(gstSgd * FX.sg),
          basis: `(CIF S$${r2(cifSgd)} ＋ 消費稅 S$${r2(dutySgd)})`,
          rate: '9%',
          source: '新加坡海關',
          asOf: '2024 起 9%',
        },
      ]
    },
  },

  vn: {
    id: 'vn',
    name: '越南',
    nameEn: 'Vietnam',
    flag: '🇻🇳',
    currency: 'VND',
    fx: FX.vn,
    gate: '買方須持有酒類進口與分銷許可；實務上中小酒企多為「資質掛靠」',
    channelMarkup: [
      { label: '進口商', rate: 0.35, note: '掛靠時另有掛靠費，通常不入報價單' },
      { label: '批發商', rate: 0.25, note: '' },
      { label: '零售', rate: 0.4, note: '' },
    ],
    licences: [
      {
        who: 'buyer',
        name: '酒類進口／分銷許可',
        detail: '越南對酒類分銷採許可制。中國中小酒企常見做法是借用他人資質（掛靠）。',
        source: '越南市場合規服務方案（進口商資質掛靠）',
        ifMissing: '你的通路建立在別人的牌照上——牌照一旦出事，你的貨連同市場一起沒了。',
      },
      {
        who: 'you',
        name: '標籤審核＋成分備案',
        detail: '越南要求進口前完成標籤審核與成分備案。',
        source: '越南市場合規服務方案',
        ifMissing: '貨到港無法報備，滯港費由你付。',
      },
    ],
    insights: [
      {
        title: '越南的稅從 2027 年開始，每年往上加 5 個百分點',
        body: '2025 年 6 月 14 日越南國會通過特別消費稅（SCT）修法：ABV ≥20% 的酒類，稅率自 2027 年起由 65% 調至 70%，其後 2028 年 75%、2029 年 80%、2030 年 85%、2031 年 90%。你今天算得動的帳，2027 年就不成立了——所有越南的長約定價都必須把這條加進去。',
        tone: 'warn',
      },
      {
        title: '「掛靠」不是省事，是把命脈交出去',
        body: '掛靠讓你不必自建資質，代價是你在越南的合法存在依附於別人。談第一單時務必問清楚：掛靠的是誰的牌照、掛靠費多少、如果掛靠方被查你的貨怎麼辦。這三個問題對方答不出來，這一單就不該做。',
        tone: 'edge',
      },
    ],
    benchmarks: [
      { name: '起瓦士 12 年', priceLocal: 900000, note: '示意價' },
      { name: '傑克丹尼', priceLocal: 700000, note: '示意價' },
      { name: '人頭馬 VSOP', priceLocal: 1800000, note: '示意價' },
    ],
    calcTax: (i: TaxInput): TaxLine[] => {
      const cif = i.cifRmb
      const duty = cif * 0.5
      // SCT 依酒精度分級：ABV ≥20% 為 65%；ABV <20% 為 35%
      const high = i.abv >= 20
      const sctRate = high ? 0.65 : 0.35
      const sct = (cif + duty) * sctRate
      const vat = (cif + duty + sct) * 0.1
      return [
        {
          key: 'duty',
          label: '進口關稅（MFN）',
          amount: r2(duty),
          basis: 'CIF',
          rate: '50%',
          source: '越南 MFN 稅率（ACFTA 另有優惠稅率，須逐案核定）',
          asOf: '2025',
        },
        {
          key: 'sct',
          label: '特別消費稅 SCT',
          amount: r2(sct),
          basis: 'CIF ＋ 關稅',
          rate: `${Math.round(sctRate * 100)}%（ABV ${high ? '≥' : '<'}20%）`,
          source: '越南國會 2025-06-14 通過之特別消費稅法',
          asOf: '2026 現行',
          changing: high
            ? '2027→70%、2028→75%、2029→80%、2030→85%、2031→90%；降到 20 度以下可適用 35% 級距'
            : '低度級距 2031 年前將由 35% 升至 60%',
        },
        {
          key: 'vat',
          label: 'VAT',
          amount: r2(vat),
          basis: 'CIF ＋ 關稅 ＋ SCT',
          rate: '10%',
          source: '越南增值稅法',
          asOf: '2025',
        },
      ]
    },
  },

  us: {
    id: 'us',
    name: '美國',
    nameEn: 'United States',
    flag: '🇺🇸',
    currency: 'USD',
    fx: FX.us,
    gate: '買方須同時持有 TTB 進口商基本許可＋該款酒的 COLA 標籤核准',
    channelMarkup: [
      { label: '進口商', rate: 0.3, note: '' },
      { label: '批發商', rate: 0.3, note: '三層制強制分層，這一層無法跳過' },
      { label: '零售', rate: 0.35, note: '' },
    ],
    licences: [
      {
        who: 'buyer',
        name: 'TTB 進口商基本許可（Federal Basic Permit）',
        detail: '表格 5100.24。沒有這張，任何人都不能合法進口酒類。',
        form: 'TTB F 5100.24',
        source: '美國 TTB',
        ifMissing: '這不是「談判條件」，是資格問題——沒有就不用談了。',
      },
      {
        who: 'buyer',
        name: 'COLA 標籤核准證',
        detail:
          '表格 5100.31，逐款申請。標籤須含酒精度、淨含量、生產商資訊與健康警語。',
        form: 'TTB F 5100.31',
        source: '美國 TTB',
        ifMissing: '你的酒標不合格，整批退運。COLA 是逐款的——換包裝要重送。',
      },
      {
        who: 'you',
        name: 'FDA 食品設施註冊＋美國代理人',
        detail:
          '境外設施必須註冊並指定一名美國代理人，負責與 FDA 溝通、回答關於該設施產品的問題。',
        source: 'FDA 食品設施註冊規定',
        ifMissing: '這是你這一側的義務，不是進口商的——漏了，貨到港被扣。',
      },
      {
        who: 'you',
        name: 'CBMA 稅收優惠額度指派',
        detail:
          '外國生產商須主動把 CBMA 額度指派給美國進口商，進口商才能事後向 TTB 申請退稅。',
        source: 'TTB CBMA Imports',
        ifMissing: '進口商每 proof gallon 多付 $10.80——這筆錢會直接從你的報價裡扣回去。',
      },
    ],
    insights: [
      {
        title: '三層分銷制：你永遠碰不到零售端',
        body: '美國法律強制進口商、批發商、零售商分層。中國酒廠在這條鏈上的位置是「境外供應商」。這意味著你的談判對象只能是持牌進口商，而且你對終端價格幾乎沒有控制權——每一層都要吃毛利。',
        tone: 'warn',
      },
      {
        title: 'CBMA 額度：你不主動指派，進口商每瓶多付一塊多美元',
        body: '聯邦消費稅標準稅率 $13.50／proof gallon，CBMA 優惠稅率為前 10 萬 proof gallon $2.70。2023 年起進口商須先全額繳給 CBP，再憑外國生產商指派的額度向 TTB 申請退稅。53 度 500ml 一瓶約 0.14 proof gallon，差額約 $1.51／瓶。一個 20 尺櫃 12,000 瓶就是 $18,000 以上——這是你能給進口商的、不花錢的讓利。',
        tone: 'edge',
      },
      {
        title: '關稅還要看 301 條款是否適用',
        body: '本工具以 7.5%（301 條款 List 4A 量級）估算，實際稅率須依 HTS 2208.90 項下的具體歸類與當期公告核定。州級酒稅另計，各州差異極大，未計入。',
        tone: 'info',
      },
    ],
    benchmarks: [
      { name: '傑克丹尼', priceLocal: 28, note: '示意價' },
      { name: '軒尼詩 VS', priceLocal: 40, note: '示意價' },
      { name: '麥卡倫 12 年', priceLocal: 70, note: '示意價' },
    ],
    calcTax: (i: TaxInput): TaxLine[] => {
      const cifUsd = i.cifRmb / FX.us
      const tariff = cifUsd * 0.075
      const proofGal = (i.ml / 3785.41) * (i.abv / 50)
      const fetRate = i.cbmaAssigned ? 2.7 : 13.5
      const fet = proofGal * fetRate
      const mpf = cifUsd * 0.003464
      const hmf = cifUsd * 0.00125
      return [
        {
          key: 'tariff',
          label: '進口關稅（含 301 加徵估算）',
          amount: r2(tariff * FX.us),
          basis: `CIF US$${r2(cifUsd)}`,
          rate: '7.5%（估算）',
          source: 'HTS 2208.90 項下；301 條款 List 4A 量級',
          asOf: '須依當期公告核定',
        },
        {
          key: 'fet',
          label: `聯邦消費稅${i.cbmaAssigned ? '（CBMA 優惠）' : '（標準稅率）'}`,
          amount: r2(fet * FX.us),
          basis: `${r2(proofGal)} proof gallon × $${fetRate}`,
          rate: `$${fetRate}／proof gallon`,
          source: 'TTB；CBMA 優惠為前 10 萬 proof gallon $2.70',
          asOf: '2023 起由 TTB 事後退稅',
          changing: i.cbmaAssigned
            ? undefined
            : '把 CBMA 額度指派給進口商，可降至 $2.70／proof gallon',
        },
        {
          key: 'mpf',
          label: '貨物處理費 MPF',
          amount: r2(mpf * FX.us),
          basis: 'CIF',
          rate: '0.3464%',
          source: 'US CBP（另有上下限，此處未套用）',
          asOf: '2025',
        },
        {
          key: 'hmf',
          label: '港口維護費 HMF',
          amount: r2(hmf * FX.us),
          basis: 'CIF',
          rate: '0.125%',
          source: 'US CBP',
          asOf: '2025',
        },
      ]
    },
  },

  kr: {
    id: 'kr',
    name: '韓國',
    nameEn: 'South Korea',
    flag: '🇰🇷',
    currency: 'KRW',
    fx: FX.kr,
    gate: '買方須持有酒類進口業與販賣業執照',
    channelMarkup: [
      { label: '進口商', rate: 0.3, note: '' },
      { label: '批發商', rate: 0.2, note: '' },
      { label: '零售', rate: 0.4, note: '' },
    ],
    licences: [
      {
        who: 'buyer',
        name: '酒類進口業執照＋販賣業執照',
        detail: '韓國酒類進口與販賣分別發照。',
        source: '韓國國稅廳酒類管理',
        ifMissing: '無法合法進口與分銷。',
      },
      {
        who: 'you',
        name: '韓文標籤',
        detail: '須提供符合韓國要求的韓文標示。',
        source: '韓國食品法規',
        ifMissing: '清關受阻或需重貼標籤。',
      },
    ],
    insights: [
      {
        title: '韓國的稅是疊上去的，不是加上去的',
        body: '關稅之外還有 72% 酒精稅，教育稅按酒精稅再收 30%，最後 VAT 10% 對前面所有金額一起課。層層疊乘的結果，是綜合稅負量級可達 180%——這不是一個「調整報價」能解決的問題，是選不選這個市場的問題。',
        tone: 'warn',
      },
      {
        title: '但韓國的高端烈酒市場是空的',
        body: '相較日本本土酒企強勢、外來烈酒難起量，韓國高端烈酒市場相對缺乏本土供給，拓展空間更大。稅高但不是沒有機會——前提是你的定位一開始就在高端，而不是想靠價格取勝。',
        tone: 'info',
      },
    ],
    benchmarks: [
      { name: '起瓦士 12 年', priceLocal: 45000, note: '示意價' },
      { name: '花郎 Hwayo 41', priceLocal: 60000, note: '示意價' },
      { name: '山崎 12 年', priceLocal: 280000, note: '示意價' },
    ],
    calcTax: (i: TaxInput): TaxLine[] => {
      const cif = i.cifRmb
      const duty = cif * 0.15
      const liquor = (cif + duty) * 0.72
      const edu = liquor * 0.3
      const vat = (cif + duty + liquor + edu) * 0.1
      return [
        {
          key: 'duty',
          label: '進口關稅（MFN 估算）',
          amount: r2(duty),
          basis: 'CIF',
          rate: '15%（估算，中韓 FTA 另有優惠稅率）',
          source: '韓國關稅稅則；本項為估算值',
          asOf: '須逐案核定',
        },
        {
          key: 'liquor',
          label: '酒精稅',
          amount: r2(liquor),
          basis: 'CIF ＋ 關稅',
          rate: '72%',
          source: '轉引自產業報導（虎嗅《稅負，白酒出海的頭一道坎？》）',
          asOf: '二手來源，建議向韓國國稅廳核實',
        },
        {
          key: 'edu',
          label: '教育稅',
          amount: r2(edu),
          basis: '酒精稅金額',
          rate: '30%',
          source: '同上，二手來源',
          asOf: '建議核實',
        },
        {
          key: 'vat',
          label: 'VAT',
          amount: r2(vat),
          basis: 'CIF ＋ 關稅 ＋ 酒精稅 ＋ 教育稅',
          rate: '10%',
          source: '韓國增值稅',
          asOf: '2025',
        },
      ]
    },
  },
}

export const MARKET_LIST = Object.values(MARKETS)
