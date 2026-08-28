/**
 * 首单发出之后的 90 天。
 *
 * 这个工具叫「第二单」，但如果功能停在报价与签约，它其实只做了第一单之前的事。
 * 真正决定有没有第二单的，是货到了之后那三个月——而这段时间里，
 * 多数中小酒企什么都不做，直到某天发现货被折价倒回国内。
 *
 * 下面每一个节点的日期都不是随便定的，是从合同条款里推出来的：
 * 「每季度动销报告」「90 日复盘」「180 日内完成第二次采购」。
 */

export type Milestone = {
  day: number
  label: string
  title: string
  todo: string[]
  /** 这一步在防什么 */
  guards: string
  /** 对应哪一条合同条款 */
  clause?: string
  /** 高风险买家才特别重要 */
  criticalWhenRisky?: boolean
}

export const MILESTONES: Milestone[] = [
  {
    day: 0,
    label: 'D+0',
    title: '发货',
    todo: [
      '出口批次赋码，自己留一份码表',
      '随货附品鉴资料、品牌手册与侍酒说明（对方培训服务生要用）',
      '书面确认落地零售价区间',
    ],
    guards: '没有码表，日后货回流你举不出证',
    clause: '批次溯源赋码',
  },
  {
    day: 7,
    label: 'D+7',
    title: '到货确认',
    todo: ['要一张落地仓的照片或仓储单', '确认货已出保税区、进了真实仓库'],
    guards: '货停在保税仓不动，是套利型交易最明显的信号',
    clause: '禁止回销',
    criticalWhenRisky: true,
  },
  {
    day: 30,
    label: 'D+30',
    title: '第一次动销检查',
    todo: ['要终端陈列照片（不少于 5 张）', '要售点清单', '问第一个月卖了多少'],
    guards: '一个月没有任何终端照片，基本可以判断他没在卖',
    clause: '动销证明',
    criticalWhenRisky: true,
  },
  {
    day: 45,
    label: 'D+45',
    title: '补货窗口',
    todo: [
      '动得掉：这时候谈补货，而不是等他来找你',
      '动不掉：把原因问出来——是价格、口味、还是根本没铺出去',
    ],
    guards: '错过这个窗口，对方会先把库存压到过季，然后消失',
  },
  {
    day: 60,
    label: 'D+60',
    title: '复盘会议',
    todo: [
      '一起看动销数据，不是各说各话',
      '决定要不要调规格：降度数、换小容量、改标签',
      '重新核一次落地价——目的国税率可能已经变了',
    ],
    guards: '第二单谈不成，多半是因为第一单从头到尾没有人复盘',
    clause: '小首单＋90 天复盘',
  },
  {
    day: 90,
    label: 'D+90',
    title: '第二单决策点',
    todo: [
      '有动销、有复盘 → 谈第二单与区域独家',
      '没动销 → 按条款收回独家，另找经销商',
      '要求回收未售库存，避免折价倒流',
    ],
    guards: '这一天是分水岭：不作决定，等于默认让他继续占着这个市场',
    clause: '复购绑定独家',
  },
  {
    day: 180,
    label: 'D+180',
    title: '独家条款的停止条件',
    todo: ['依合同，未完成第二次采购（不低于首单 70%）者，区域独家自动解除'],
    guards: '占坑不做的经销商，是中小酒企出海最贵的沉没成本',
    clause: '复购绑定独家',
  },
]

export function nextMilestone(daysSince: number): Milestone {
  return MILESTONES.find((m) => m.day >= daysSince) ?? MILESTONES[MILESTONES.length - 1]
}
