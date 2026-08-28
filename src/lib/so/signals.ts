import type { BuyerSignal } from './types'

export const SIGNALS: Omit<BuyerSignal, 'verdict'>[] = [
  {
    id: 'downstream',
    label: '說得出下游嗎',
    good: '指得出目標餐廳、商超或酒吧',
    bad: '只說「我有渠道」，問不出具體售點',
    weight: 20,
  },
  {
    id: 'spec',
    label: '在意規格嗎',
    good: '問標籤、度數、容量、當地法規',
    bad: '不在意規格，只問價格與數量',
    weight: 18,
  },
  {
    id: 'size',
    label: '首單多大',
    good: '偏小且謹慎，先試單、要鋪貨支持',
    bad: '異常大且爽快，不議價、不要行銷資源',
    weight: 18,
  },
  {
    id: 'dest',
    label: '目的地明確嗎',
    good: '指定終端市場與落地倉儲',
    bad: '目的地含糊，或只到自貿區／保稅倉',
    weight: 20,
  },
  {
    id: 'brand',
    label: '要品牌素材嗎',
    good: '要品牌手冊、品鑑培訓、聯合推廣',
    bad: '對品牌建設完全沒興趣',
    weight: 12,
  },
  {
    id: 'sellthrough',
    label: '接受動銷透明嗎',
    good: '願意提供動銷報告與終端照片',
    bad: '拒絕，視為商業機密',
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
  const label = level === 'high' ? '高度疑似套利型買家' : level === 'mid' ? '需要進一步盡調' : '偏向真實經銷需求'
  const summary =
    answered === 0
      ? '尚未取得足夠訊號，先把必問清單問完。'
      : level === 'high'
        ? `${badKeys.length} 項關鍵訊號為負。這一單的性質應重新評估，尤其在對方拒絕動銷透明的情況下。`
        : level === 'mid'
          ? `有 ${badKeys.length} 項訊號為負，可以談，但把防回流條款寫死。`
          : '訊號一致偏正向，可進入首單談判，條款仍應完整。'
  return { score, level, label, answered, badKeys, summary }
}
