import type { Market, TaxInput, TaxLine } from './types'

/** 估算汇率（1 单位当地币 = ? RMB）。仅供量级估算，非即时汇率。 */
const FX = { hk: 0.92, sg: 5.5, vn: 0.00028, us: 7.1, kr: 0.0053 }

const r2 = (n: number) => Math.round(n * 100) / 100

export const MARKETS: Record<string, Market> = {
  hk: {
    id: 'hk',
    name: '中国香港',
    nameEn: 'Hong Kong',
    flag: '🇭🇰',
    currency: 'HKD',
    fx: FX.hk,
    gate: '一般进口商即可，无需专门酒牌（零售端另需酒牌）',
    channelMarkup: [
      { label: '进口商', rate: 0.25, note: '香港进口商层级薄，多为贸易＋分销一体' },
      { label: '零售／餐饮', rate: 0.6, note: '餐饮端加价可达 2–3 倍，此处取零售口径' },
    ],
    licences: [
      {
        who: 'buyer',
        name: '商业登记＋酒牌（零售／餐饮端）',
        detail: '进口本身门槛低；但买方若要在店内售卖或供应饮用，须持有酒牌。',
        source: '香港法例（酒类售卖或供应）',
        ifMissing: '对方只能做批发转手，无法自建终端——你拿不到动销数据。',
      },
      {
        who: 'you',
        name: '常规出口报关文件',
        detail: '合同、发票、装箱单、出厂合格证明；出口食品生产企业备案。',
        source: '中国海关出口食品监管要求',
        ifMissing: '出不了关。',
      },
    ],
    insights: [
      {
        title: '减税只减「200 港元以上的那一段」',
        body: '2024/10/16 起，酒精浓度高于 30% 的酒类，进口价 200 港元以上的部分税率由 100% 降至 10%；200 港元及以下的部分维持 100% 不变。所以受益的是高价位酒——正好是贵州的出口结构。低价光瓶酒几乎没吃到这波红利。',
        tone: 'edge',
      },
      {
        title: '香港的价值是试验田，不是销量池',
        body: '香港去年占内地白酒出口量约 23%，是第一大目的地。但它真正的用处是：法规友善、华洋杂处、餐饮密集，是验证定价与酒吧场景成本最低的市场。先在这里跑通打法，再输出。',
        tone: 'info',
      },
    ],
    benchmarks: [
      { name: 'Johnnie Walker 黑牌', priceLocal: 300, note: '示意价' },
      { name: '麦卡伦 12 年雪莉桶', priceLocal: 700, note: '示意价' },
      { name: '轩尼诗 VSOP', priceLocal: 560, note: '示意价' },
    ],
    calcTax: (i: TaxInput): TaxLine[] => {
      const cifHkd = i.cifRmb / FX.hk
      const dutyHkd = Math.min(cifHkd, 200) * 1.0 + Math.max(0, cifHkd - 200) * 0.1
      return [
        {
          key: 'duty',
          label: '烈酒税',
          amount: r2(dutyHkd * FX.hk),
          basis: `进口价 HK$${r2(cifHkd)}／瓶`,
          rate: '≤HK$200 部分 100%；>HK$200 部分 10%',
          source: '香港特区政府新闻公报（调低酒精浓度高于 30% 的酒类税率）',
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
    gate: '买方须持有海关 海关准证＋酒类执照（酒类执照）',
    channelMarkup: [
      { label: '进口商', rate: 0.3, note: '' },
      { label: '批发商', rate: 0.2, note: '若进口商兼批发可省一层' },
      { label: '零售', rate: 0.45, note: '' },
    ],
    licences: [
      {
        who: 'buyer',
        name: '酒类执照（酒类执照）＋海关准证',
        detail: '商业进口须完税并取得海关准证；携带超过 10 公升酒类亦需准证。',
        source: '新加坡海关',
        ifMissing: '货进不了关，或只能以个人自用名义小量带入，无法商业化。',
      },
      {
        who: 'you',
        name: '中文以外的成分与酒精度标示',
        detail: '标签须清楚标示酒精度与净含量。',
        source: '新加坡食品法规',
        ifMissing: '清关被扣、重贴标签，成本与时间都由你承担。',
      },
    ],
    insights: [
      {
        title: '新加坡按「纯酒精量」课税，度数越高越贵',
        body: 'S$88／公升纯酒精。53 度 500ml 一瓶含 0.265 公升纯酒精，光消费税就 S$23.32——约人民币 128 元，且与你的出厂价无关。这意味着：低价位白酒在新加坡几乎没有价格竞争力，因为税是按度数收的，不是按价值收的。',
        tone: 'warn',
      },
      {
        title: '降度数是新加坡市场唯一的结构性解',
        body: '同一瓶酒从 53 度降到 38 度，纯酒精量少 28%，消费税同步少 28%。这是「低度化」在出海上最直接的财务理由——不是为了迎合口味，是为了活过税。',
        tone: 'edge',
      },
      {
        title: '新加坡在东南亚的份额正在被稀释',
        body: '新加坡占中国白酒对东南亚出口额的比重，从 2015 年的 48.24% 降到 2024 年的 17.83%。不是它萎缩，是泰国、越南、缅甸长得更快。把新加坡当成「东南亚入口」的旧地图已经过期。',
        tone: 'info',
      },
    ],
    benchmarks: [
      { name: '起瓦士 12 年', priceLocal: 70, note: '示意价' },
      { name: '响 Harmony', priceLocal: 130, note: '示意价' },
      { name: '格兰菲迪 12 年', priceLocal: 95, note: '示意价' },
    ],
    calcTax: (i: TaxInput): TaxLine[] => {
      const cifSgd = i.cifRmb / FX.sg
      const litresAlc = (i.ml / 1000) * (i.abv / 100)
      const dutySgd = litresAlc * 88
      const gstSgd = 0.09 * (cifSgd + dutySgd)
      return [
        {
          key: 'duty',
          label: '消费税（按纯酒精量）',
          amount: r2(dutySgd * FX.sg),
          basis: `${r2(litresAlc)} 公升纯酒精 × S$88`,
          rate: 'S$88／公升纯酒精',
          source: '新加坡海关 Duties and Dutiable Goods',
          asOf: '2025 现行',
        },
        {
          key: 'gst',
          label: '商品服务税',
          amount: r2(gstSgd * FX.sg),
          basis: `(到岸价 S$${r2(cifSgd)} ＋ 消费税 S$${r2(dutySgd)})`,
          rate: '9%',
          source: '新加坡海关',
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
    gate: '买方须持有酒类进口与分销许可；实务上中小酒企多为「资质挂靠」',
    channelMarkup: [
      { label: '进口商', rate: 0.35, note: '挂靠时另有挂靠费，通常不入报价单' },
      { label: '批发商', rate: 0.25, note: '' },
      { label: '零售', rate: 0.4, note: '' },
    ],
    licences: [
      {
        who: 'buyer',
        name: '酒类进口／分销许可',
        detail: '越南对酒类分销采许可制。中国中小酒企常见做法是借用他人资质（挂靠）。',
        source: '越南市场合规服务方案（进口商资质挂靠）',
        ifMissing: '你的通路建立在别人的牌照上——牌照一旦出事，你的货连同市场一起没了。',
      },
      {
        who: 'you',
        name: '标签审核＋成分备案',
        detail: '越南要求进口前完成标签审核与成分备案。',
        source: '越南市场合规服务方案',
        ifMissing: '货到港无法报备，滞港费由你付。',
      },
    ],
    insights: [
      {
        title: '越南的税从 2027 年开始，每年往上加 5 个百分点',
        body: '2025 年 6 月 14 日越南国会通过特别消费税（特别消费税）修法：ABV ≥20% 的酒类，税率自 2027 年起由 65% 调至 70%，其后 2028 年 75%、2029 年 80%、2030 年 85%、2031 年 90%。你今天算得动的帐，2027 年就不成立了——所有越南的长约定价都必须把这条加进去。',
        tone: 'warn',
      },
      {
        title: '「挂靠」不是省事，是把命脉交出去',
        body: '挂靠让你不必自建资质，代价是你在越南的合法存在依附于别人。谈第一单时务必问清楚：挂靠的是谁的牌照、挂靠费多少、如果挂靠方被查你的货怎么办。这三个问题对方答不出来，这一单就不该做。',
        tone: 'edge',
      },
    ],
    benchmarks: [
      { name: '起瓦士 12 年', priceLocal: 900000, note: '示意价' },
      { name: '杰克丹尼', priceLocal: 700000, note: '示意价' },
      { name: '人头马 VSOP', priceLocal: 1800000, note: '示意价' },
    ],
    calcTax: (i: TaxInput): TaxLine[] => {
      const cif = i.cifRmb
      const duty = cif * 0.5
      // 特别消费税 依酒精度分级：ABV ≥20% 为 65%；ABV <20% 为 35%
      const high = i.abv >= 20
      const sctRate = high ? 0.65 : 0.35
      const sct = (cif + duty) * sctRate
      const vat = (cif + duty + sct) * 0.1
      return [
        {
          key: 'duty',
          label: '进口关税（最惠国）',
          amount: r2(duty),
          basis: '到岸价',
          rate: '50%',
          source: '越南 最惠国 税率（ACFTA 另有优惠税率，须逐案核定）',
          asOf: '2025',
        },
        {
          key: 'sct',
          label: '特别消费税',
          amount: r2(sct),
          basis: '到岸价 ＋ 关税',
          rate: `${Math.round(sctRate * 100)}%（ABV ${high ? '≥' : '<'}20%）`,
          source: '越南国会 2025-06-14 通过之特别消费税法',
          asOf: '2026 现行',
          changing: high
            ? '2027→70%、2028→75%、2029→80%、2030→85%、2031→90%；降到 20 度以下可适用 35% 级距'
            : '低度级距 2031 年前将由 35% 升至 60%',
        },
        {
          key: 'vat',
          label: 'VAT',
          amount: r2(vat),
          basis: '到岸价 ＋ 关税 ＋ 特别消费税',
          rate: '10%',
          source: '越南增值税法',
          asOf: '2025',
        },
      ]
    },
  },

  us: {
    id: 'us',
    name: '美国',
    nameEn: 'United States',
    flag: '🇺🇸',
    currency: 'USD',
    fx: FX.us,
    gate: '买方须同时持有 TTB 进口商基本许可＋该款酒的 酒标核准证核准',
    channelMarkup: [
      { label: '进口商', rate: 0.3, note: '' },
      { label: '批发商', rate: 0.3, note: '三层制强制分层，这一层无法跳过' },
      { label: '零售', rate: 0.35, note: '' },
    ],
    licences: [
      {
        who: 'buyer',
        name: '联邦进口商基本许可（TTB 核发）',
        detail: '表格 5100.24。没有这张，任何人都不能合法进口酒类。',
        form: 'TTB F 5100.24',
        source: '美国酒精烟草税务贸易局 TTB',
        ifMissing: '这不是「谈判条件」，是资格问题——没有就不用谈了。',
      },
      {
        who: 'buyer',
        name: '酒标核准证 COLA',
        detail:
          '表格 5100.31，逐款申请。标签须含酒精度、净含量、生产商资讯与健康警语。',
        form: 'TTB F 5100.31',
        source: '美国酒精烟草税务贸易局 TTB',
        ifMissing: '你的酒标不合格，整批退运。COLA 是逐款的——换包装要重送。',
      },
      {
        who: 'you',
        name: '美国食品药品监督管理局 FDA 食品设施注册＋美国代理人',
        detail:
          '境外设施必须注册并指定一名美国代理人，负责与 FDA 沟通、回答关于该设施产品的问题。',
        source: '美国食品药品监督管理局 FDA 食品设施注册规定',
        ifMissing: '这是你这一侧的义务，不是进口商的——漏了，货到港被扣。',
      },
      {
        who: 'you',
        name: 'CBMA 税收优惠额度指派',
        detail:
          '外国生产商须主动把 CBMA 额度指派给美国进口商，进口商才能事后向 TTB 申请退税。',
        source: 'TTB CBMA Imports',
        ifMissing: '进口商每 标准酒精加仑（proof gallon） 多付 $10.80——这笔钱会直接从你的报价里扣回去。',
      },
    ],
    insights: [
      {
        title: '三层分销制：你永远碰不到零售端',
        body: '美国法律强制进口商、批发商、零售商分层。中国酒厂在这条链上的位置是「境外供应商」。这意味着你的谈判对象只能是持牌进口商，而且你对终端价格几乎没有控制权——每一层都要吃毛利。',
        tone: 'warn',
      },
      {
        title: 'CBMA 额度：你不主动指派，进口商每瓶多付一块多美元',
        body: '联邦消费税标准税率 $13.50／标准酒精加仑（proof gallon），CBMA 优惠税率为前 10 万 标准酒精加仑（proof gallon） $2.70。2023 年起进口商须先全额缴给 CBP，再凭外国生产商指派的额度向 TTB 申请退税。53 度 500ml 一瓶约 0.14 标准酒精加仑（proof gallon），差额约 $1.51／瓶。一个 20 尺柜 12,000 瓶就是 $18,000 以上——这是你能给进口商的、不花钱的让利。',
        tone: 'edge',
      },
      {
        title: '关税还要看 301 条款是否适用',
        body: '本工具以 7.5%（301 条款 List 4A 量级）估算，实际税率须依 HTS 2208.90 项下的具体归类与当期公告核定。州级酒税另计，各州差异极大，未计入。',
        tone: 'info',
      },
    ],
    benchmarks: [
      { name: '杰克丹尼', priceLocal: 28, note: '示意价' },
      { name: '轩尼诗 VS', priceLocal: 40, note: '示意价' },
      { name: '麦卡伦 12 年', priceLocal: 70, note: '示意价' },
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
          label: '进口关税（含 301 加征估算）',
          amount: r2(tariff * FX.us),
          basis: `到岸价 US$${r2(cifUsd)}`,
          rate: '7.5%（估算）',
          source: 'HTS 2208.90 项下；301 条款 List 4A 量级',
          asOf: '须依当期公告核定',
        },
        {
          key: 'fet',
          label: `联邦消费税${i.cbmaAssigned ? '（CBMA 优惠）' : '（标准税率）'}`,
          amount: r2(fet * FX.us),
          basis: `${r2(proofGal)} 标准酒精加仑（proof gallon） × $${fetRate}`,
          rate: `$${fetRate}／标准酒精加仑（proof gallon）`,
          source: 'TTB；CBMA 优惠为前 10 万 标准酒精加仑（proof gallon） $2.70',
          asOf: '2023 起由 TTB 事后退税',
          changing: i.cbmaAssigned
            ? undefined
            : '把 CBMA 额度指派给进口商，可降至 $2.70／标准酒精加仑（proof gallon）',
        },
        {
          key: 'mpf',
          label: '货物处理费 MPF',
          amount: r2(mpf * FX.us),
          basis: '到岸价',
          rate: '0.3464%',
          source: 'US CBP（另有上下限，此处未套用）',
          asOf: '2025',
        },
        {
          key: 'hmf',
          label: '港口维护费 HMF',
          amount: r2(hmf * FX.us),
          basis: '到岸价',
          rate: '0.125%',
          source: 'US CBP',
          asOf: '2025',
        },
      ]
    },
  },

  kr: {
    id: 'kr',
    name: '韩国',
    nameEn: 'South Korea',
    flag: '🇰🇷',
    currency: 'KRW',
    fx: FX.kr,
    gate: '买方须持有酒类进口业与贩卖业执照',
    channelMarkup: [
      { label: '进口商', rate: 0.3, note: '' },
      { label: '批发商', rate: 0.2, note: '' },
      { label: '零售', rate: 0.4, note: '' },
    ],
    licences: [
      {
        who: 'buyer',
        name: '酒类进口业执照＋贩卖业执照',
        detail: '韩国酒类进口与贩卖分别发照。',
        source: '韩国国税厅酒类管理',
        ifMissing: '无法合法进口与分销。',
      },
      {
        who: 'you',
        name: '韩文标签',
        detail: '须提供符合韩国要求的韩文标示。',
        source: '韩国食品法规',
        ifMissing: '清关受阻或需重贴标签。',
      },
    ],
    insights: [
      {
        title: '韩国的税是叠上去的，不是加上去的',
        body: '关税之外还有 72% 酒精税，教育税按酒精税再收 30%，最后 VAT 10% 对前面所有金额一起课。层层叠乘的结果，是综合税负量级可达 180%——这不是一个「调整报价」能解决的问题，是选不选这个市场的问题。',
        tone: 'warn',
      },
      {
        title: '但韩国的高端烈酒市场是空的',
        body: '相较日本本土酒企强势、外来烈酒难起量，韩国高端烈酒市场相对缺乏本土供给，拓展空间更大。税高但不是没有机会——前提是你的定位一开始就在高端，而不是想靠价格取胜。',
        tone: 'info',
      },
    ],
    benchmarks: [
      { name: '起瓦士 12 年', priceLocal: 45000, note: '示意价' },
      { name: '花郎 Hwayo 41', priceLocal: 60000, note: '示意价' },
      { name: '山崎 12 年', priceLocal: 280000, note: '示意价' },
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
          label: '进口关税（最惠国 估算）',
          amount: r2(duty),
          basis: '到岸价',
          rate: '15%（估算，中韩 FTA 另有优惠税率）',
          source: '韩国关税税则；本项为估算值',
          asOf: '须逐案核定',
        },
        {
          key: 'liquor',
          label: '酒精税',
          amount: r2(liquor),
          basis: '到岸价 ＋ 关税',
          rate: '72%',
          source: '转引自产业报导（虎嗅《税负，白酒出海的头一道坎？》）',
          asOf: '二手来源，建议向韩国国税厅核实',
        },
        {
          key: 'edu',
          label: '教育税',
          amount: r2(edu),
          basis: '酒精税金额',
          rate: '30%',
          source: '同上，二手来源',
          asOf: '建议核实',
        },
        {
          key: 'vat',
          label: 'VAT',
          amount: r2(vat),
          basis: '到岸价 ＋ 关税 ＋ 酒精税 ＋ 教育税',
          rate: '10%',
          source: '韩国增值税',
          asOf: '2025',
        },
      ]
    },
  },
}

export const MARKET_LIST = Object.values(MARKETS)
