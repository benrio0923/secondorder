import type { BuyerSignal } from './types'

export const SIGNALS: Omit<BuyerSignal, 'verdict'>[] = [
  {
    id: 'downstream',
    label: '说得出下游吗',
    good: '指得出目标餐厅、商超或酒吧',
    bad: '只说「我有渠道」，问不出具体售点',
    weight: 20,
  },
  {
    id: 'spec',
    label: '在意规格吗',
    good: '问标签、度数、容量、当地法规',
    bad: '不在意规格，只问价格与数量',
    weight: 18,
  },
  {
    id: 'size',
    label: '首单多大',
    good: '偏小且谨慎，先试单、要铺货支持',
    bad: '异常大且爽快，不议价、不要行销资源',
    weight: 18,
  },
  {
    id: 'dest',
    label: '目的地明确吗',
    good: '指定终端市场与落地仓储',
    bad: '目的地含糊，或只到自贸区／保税仓',
    weight: 20,
  },
  {
    id: 'brand',
    label: '要品牌素材吗',
    good: '要品牌手册、品鉴培训、联合推广',
    bad: '对品牌建设完全没兴趣',
    weight: 12,
  },
  {
    id: 'sellthrough',
    label: '接受动销透明吗',
    good: '愿意提供动销报告与终端照片',
    bad: '拒绝，视为商业机密',
    weight: 22,
  },
]

export type RiskResult = {
  score: number
  level: 'low' | 'mid' | 'high'
  label: string
  answered: number
  badKeys: string[]
  summary: string
}

export function scoreRisk(verdicts: Record<string, boolean | null>): RiskResult {
  let risk = 0
  let max = 0
  let answered = 0
  const badKeys: string[] = []
  for (const s of SIGNALS) {
    const v = verdicts[s.id]
    if (v === null || v === undefined) continue
    answered++
    max += s.weight
    if (v === false) {
      risk += s.weight
      badKeys.push(s.id)
    }
  }
  const score = max === 0 ? 0 : Math.round((risk / max) * 100)
  const level: RiskResult['level'] = score >= 55 ? 'high' : score >= 25 ? 'mid' : 'low'
  const label = level === 'high' ? '高度疑似套利型买家' : level === 'mid' ? '需要进一步尽调' : '偏向真实经销需求'
  const summary =
    answered === 0
      ? '尚未取得足够讯号，先把必问清单问完。'
      : level === 'high'
        ? `${badKeys.length} 项关键讯号为负。这一单的性质应重新评估，尤其在对方拒绝动销透明的情况下。`
        : level === 'mid'
          ? `有 ${badKeys.length} 项讯号为负，可以谈，但把防回流条款写死。`
          : '讯号一致偏正向，可进入首单谈判，条款仍应完整。'
  return { score, level, label, answered, badKeys, summary }
}
