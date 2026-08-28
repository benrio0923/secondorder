/**
 * 寄样品的合规核查。
 * 展会后最高频的一句话是「我寄两支样品给你试试」——
 * 而 53 度白酒在国际运输规则里是第 3 类易燃液体，三大国际快递都不收。
 * 业务员答应得很快，货卡在仓库两个月。
 */

export type SampleRule = {
  /** 判定门槛 */
  band: 'free' | 'class3' | 'forbidden'
  title: string
  detail: string
  needs: string[]
  source: string
}

/** 依酒精度判定运输类别（国际运输通行的三个分界） */
export function classifySample(abv: number): SampleRule {
  if (abv < 24) {
    return {
      band: 'free',
      title: '24 度以下：不按危险品处理',
      detail:
        '酒精度低于 24% 的酒类，在国际运输规则里不列入危险品，普通国际快递可收（仍受各国酒类进口规定限制）。',
      needs: ['收件方仍须具备当地酒类进口资质', '仍须随附成分与酒精度标示'],
      source: '国际航空运输危险品规则通行分界',
    }
  }
  if (abv <= 70) {
    return {
      band: 'class3',
      title: `${abv} 度：属第 3 类易燃液体（危险品）`,
      detail:
        '酒精度 24%–70% 的酒类按第 3 类易燃液体管理。DHL、FedEx、UPS 一般不收液体酒精，须走化工品专线或专门的酒类物流渠道。',
      needs: [
        '有资质的化工研究院出具的「非危险品报告」',
        '可运输证明',
        '非危险品运输保函',
        '收件方须为持有进口许可证的法人单位（个人收件通不了关）',
      ],
      source: '国际航空运输危险品规则；DHL／FedEx／UPS 禁运品清单',
    }
  }
  return {
    band: 'forbidden',
    title: `${abv} 度：超过 70 度，一般禁运`,
    detail: '酒精度高于 70% 的酒类在多数国际运输渠道属于禁运品。',
    needs: ['须改以低度版本送样，或在当地采购替代样品'],
    source: '国际航空运输危险品规则',
  }
}

/** 从对话里认出「对方要样品」 */
const SAMPLE_HINTS = ['样品', '小样', '试饮', '品鉴', '样酒', 'sample', 'samples', 'tasting', '寄样']

export function wantsSample(raw: string, askedFor?: string[]): boolean {
  const hay = (raw + ' ' + (askedFor ?? []).join(' ')).toLowerCase()
  return SAMPLE_HINTS.some((k) => hay.includes(k.toLowerCase()))
}

/** 度数的三个分界线，放在一起看才知道度数决定了多少事 */
export const ABV_THRESHOLDS = [
  { abv: 20, label: '越南特别消费税分界', detail: '20 度以上 65%，以下 35%', tone: 'tax' as const },
  { abv: 24, label: '国际运输危险品分界', detail: '24 度以上按第 3 类易燃液体处理，普通快递不收', tone: 'ship' as const },
  { abv: 70, label: '国际运输禁运线', detail: '超过 70 度多数渠道禁运', tone: 'ship' as const },
]
