export type Clause = {
  id: string
  title: string
  body: string
  blocks: string
  /** 触发这条的信号 */
  trigger?: string[]
  priority: number
}

export const CLAUSES: Clause[] = [
  {
    id: 'sellthrough',
    title: '动销证明',
    body: '买方应于每季度末 15 日内提供终端动销报告，内容包含售点清单、期间出货量与不少于 5 张终端陈列照片。连续两期未提供者，卖方有权暂停供货。',
    blocks: '货压在仓里不动，或原箱转手',
    trigger: ['sellthrough', 'downstream'],
    priority: 1,
  },
  {
    id: 'reorder',
    title: '复购绑定独家',
    body: '本协议授予买方之区域独家经销权，以买方于首单交付后 180 日内完成第二次采购（金额不低于首单 70%）为停止条件；未达成者，独家权利自动解除，卖方得另行指定经销商。',
    blocks: '占坑不做、锁死市场',
    trigger: ['size'],
    priority: 2,
  },
  {
    id: 'noreflux',
    title: '禁止回销',
    body: '买方承诺本协议项下货物不得以任何形式直接或间接回销中国大陆地区。违反者，卖方有权立即终止协议，并就每瓶回流货物请求相当于出口价三倍之违约金。',
    blocks: '折价倒回中国，砸掉你自己的价格体系',
    trigger: ['dest'],
    priority: 1,
  },
  {
    id: 'trace',
    title: '批次溯源赋码',
    body: '出口批次采独立赋码，买方不得移除、遮蔽或涂改。卖方有权以码查询流向；因买方移除赋码致无法追溯者，推定为违反禁止回销条款。',
    blocks: '回流之后你举不出证，追不到人',
    trigger: ['dest', 'spec'],
    priority: 2,
  },
  {
    id: 'smallfirst',
    title: '小首单＋90 天复盘',
    body: '首单数量以双方书面确认之试销量为限；交付后 90 日内双方进行动销复盘，复盘结果作为续约与价格条件之依据。',
    blocks: '用一笔大单掩盖卖不动的事实',
    trigger: ['size'],
    priority: 3,
  },
  {
    id: 'landedprice',
    title: '落地价共识',
    body: '双方于首单前共同确认目标市场之建议零售价区间，并附完税落地成本测算。买方实际零售价低于区间下限逾 15% 者，卖方有权要求说明并得暂停供货。',
    blocks: '货到了才发现贵到卖不动，或被低价甩货',
    trigger: ['brand'],
    priority: 2,
  },
]

export function pickClauses(badKeys: string[]): Clause[] {
  const hit = CLAUSES.filter((c) => c.trigger?.some((t) => badKeys.includes(t)))
  const rest = CLAUSES.filter((c) => !hit.includes(c))
  return [...hit.sort((a, b) => a.priority - b.priority), ...rest.sort((a, b) => a.priority - b.priority)]
}
