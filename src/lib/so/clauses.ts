export type Clause = {
  id: string
  title: string
  body: string
  blocks: string
  /** 觸發這條的訊號 */
  trigger?: string[]
  priority: number
}

export const CLAUSES: Clause[] = [
  {
    id: 'sellthrough',
    title: '動銷證明',
    body: '買方應於每季度末 15 日內提供終端動銷報告，內容包含售點清單、期間出貨量與不少於 5 張終端陳列照片。連續兩期未提供者，賣方有權暫停供貨。',
    blocks: '貨壓在倉裡不動，或原箱轉手',
    trigger: ['sellthrough', 'downstream'],
    priority: 1,
  },
  {
    id: 'reorder',
    title: '複購綁定獨家',
    body: '本協議授予買方之區域獨家經銷權，以買方於首單交付後 180 日內完成第二次採購（金額不低於首單 70%）為停止條件；未達成者，獨家權利自動解除，賣方得另行指定經銷商。',
    blocks: '佔坑不做、鎖死市場',
    trigger: ['size'],
    priority: 2,
  },
  {
    id: 'noreflux',
    title: '禁止回銷',
    body: '買方承諾本協議項下貨物不得以任何形式直接或間接回銷中國大陸地區。違反者，賣方有權立即終止協議，並就每瓶回流貨物請求相當於出口價三倍之違約金。',
    blocks: '折價倒回中國，砸掉你自己的價格體系',
    trigger: ['dest'],
    priority: 1,
  },
  {
    id: 'trace',
    title: '批次溯源賦碼',
    body: '出口批次採獨立賦碼，買方不得移除、遮蔽或塗改。賣方有權以碼查詢流向；因買方移除賦碼致無法追溯者，推定為違反禁止回銷條款。',
    blocks: '回流之後你舉不出證，追不到人',
    trigger: ['dest', 'spec'],
    priority: 2,
  },
  {
    id: 'smallfirst',
    title: '小首單＋90 天複盤',
    body: '首單數量以雙方書面確認之試銷量為限；交付後 90 日內雙方進行動銷複盤，複盤結果作為續約與價格條件之依據。',
    blocks: '用一筆大單掩蓋賣不動的事實',
    trigger: ['size'],
    priority: 3,
  },
  {
    id: 'landedprice',
    title: '落地價共識',
    body: '雙方於首單前共同確認目標市場之建議零售價區間，並附完稅落地成本測算。買方實際零售價低於區間下限逾 15% 者，賣方有權要求說明並得暫停供貨。',
    blocks: '貨到了才發現貴到賣不動，或被低價甩貨',
    trigger: ['brand'],
    priority: 2,
  },
]

export function pickClauses(badKeys: string[]): Clause[] {
  const hit = CLAUSES.filter((c) => c.trigger?.some((t) => badKeys.includes(t)))
  const rest = CLAUSES.filter((c) => !hit.includes(c))
  return [...hit.sort((a, b) => a.priority - b.priority), ...rest.sort((a, b) => a.priority - b.priority)]
}
