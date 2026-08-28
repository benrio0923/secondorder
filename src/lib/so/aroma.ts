/**
 * 香型知识库。
 * 出海谈判里最常被问、业务员却最答不上来的一题：「这酒跟我这边的菜怎么配？」
 * 资料出自团队的《白酒海外入菜研究》，每条标注证据强度。
 */

export type AromaId = 'sauce' | 'strong' | 'light' | 'herbal' | 'other'

export type Aroma = {
  id: AromaId
  name: string
  nameEn: string
  rep: string
  profile: string
  pairing: string
  dishes: string[]
  /** 给业务员的一句话说法 */
  pitch: string
}

export const AROMAS: Record<AromaId, Aroma> = {
  sauce: {
    id: 'sauce',
    name: '酱香',
    nameEn: '',
    rep: '茅台、习酒、国台（贵州主力香型）',
    profile: '发酵香强、鲜味重、尾韵长',
    pairing: '浓郁咸香',
    dishes: ['烤鸭', '红烧肉', '熟成起司', '卤味与腊味'],
    pitch: '跟熟成起司放在一起讲，西方人立刻懂——都是靠发酵堆出来的鲜味。',
  },
  strong: {
    id: 'strong',
    name: '浓香',
    nameEn: '',
    rep: '五粮液、泸州老窖',
    profile: '果香明显、甜润、香气强势',
    pairing: '辛辣与炭烤',
    dishes: ['川菜', '炭烤肉类', '麻辣火锅'],
    pitch: '甜润感能压辣度，配川菜与烧烤最好讲，也是最容易切进调酒的一支。',
  },
  light: {
    id: 'light',
    name: '清香',
    nameEn: '',
    rep: '汾酒',
    profile: '干净、清爽、杂味少',
    pairing: '细致食材',
    dishes: ['清蒸海鲜', '点心', '清淡菜式'],
    pitch: '口感最接近伏特加、琴酒等国际主流烈酒，是非华人客群最低的入门门槛。',
  },
  herbal: {
    id: 'herbal',
    name: '董香',
    nameEn: '',
    rep: '董酒（贵州独有，含于「其他香型」约 6%）',
    profile: '药香舒适、酯香与醇香协调、饮后甘爽',
    pairing: '药膳与浓味',
    dishes: ['药膳炖品', '卤味', '重口味红烧', '陈年火腿'],
    pitch: '全世界唯一用一百多味本草入曲的白酒——对非华人来说，这个故事比风味更好讲，也是最容易被记住的差异点。',
  },
  other: {
    id: 'other',
    name: '其他香型',
    nameEn: '',
    rep: '兼香、馥郁香等复合香型',
    profile: '复合香型，风味取决于具体工艺',
    pairing: '视酒体而定',
    dishes: ['依实际风味描述判断'],
    pitch: '复合香型不好一句话带过，直接用这支酒自己的香气与口感描述去讲，比套香型分类更准。',
  },
}

export const AROMA_LIST = Object.values(AROMAS)

/** 非中国饮者对白酒香气的实际描述——不好听，但业务员上场前应该先知道 */
export const FIRST_IMPRESSION = {
  words: ['臭起司', '八角', '凤梨', '麝香', '汽油'],
  note:
    '这些高强度酯类与吡嗪类香气，在调酒里可以被其他材料平衡，但在菜肴里会主导整道菜——容错率很低。所以海外的主战场是吧台，不是厨房。',
  advice:
    '第一次让对方试酒时，不要单独纯饮。先用调饮或搭一道浓味的菜，让香气有东西可以靠。',
}

/** 一个常被引用的原则 */
export const PRINCIPLE = '白酒不是拿来搭「某一道菜」，而是搭「某一个地方菜系」——产地酒配产地菜。'

export type UseCase = {
  place: string
  what: string
  /** 证据强度：high / mid / low */
  strength: 'high' | 'mid' | 'low'
  source: string
}

/** 各市场已经被记录下来的白酒使用场景 */
export const USE_CASES: Record<string, UseCase[]> = {
  sg: [
    { place: 'Gecory', what: '茅台口味冰淇淋，另有国窖 1573、五粮液口味', strength: 'mid', source: '商家页面' },
    { place: 'High Bar Society', what: 'Moutai bluepea gelato（搭法国香草，标示 5% ABV），被称为当地唯一的白酒 gelato', strength: 'mid', source: '商家页面' },
    { place: '新加坡中国白酒协会', what: '推广茅台冰淇淋与酒心巧克力', strength: 'mid', source: '协会推广管道' },
  ],
  us: [
    { place: '纽约 Kings County Imperial、Han Dynasty', what: 'Ming River（泸州背景品牌）以调酒形式进入', strength: 'mid', source: '品牌方推广' },
    { place: "纽约 Ye's Apothecary", what: '川菜搭中式灵感调酒（Red Sorghum：白酒＋Aperol＋凤梨＋莱姆＋桂花）', strength: 'mid', source: '品牌方推广' },
    { place: '纽约米其林一星 Yingtao', what: '主厨把口水鸡的白酒风味移植到红虾料理——作为风味记号，不是整瓶下锅', strength: 'mid', source: '媒体报导' },
    { place: '休士顿 Tipsy Dessert Bar', what: '2015 年首届 World Baijiu Day 即制作白酒冰淇淋', strength: 'low', source: 'World Baijiu Day' },
  ],
  hk: [
    { place: '海外华人厨房（含港澳）', what: '腌腊肉、腊肠时加白酒去腥增香，是数十年来的标准作法——覆盖率最高、却最少被当成新闻', strength: 'high', source: '食谱媒体与普遍实践' },
  ],
  vn: [],
  kr: [],
}

/** 全球性的推广机制，任何市场都用得上 */
export const GLOBAL_HOOK = {
  name: 'World Baijiu Day',
  detail:
    '每年 8 月 9 日，自 2015 年起累计 70 多个城市参与，内容涵盖白酒调酒、浸渍酒、利口酒、巧克力、披萨与品饮课。',
  use: '这是现成的、不用你自己办的落地活动——谈第一单时可以直接问对方要不要一起参加，成本低、且对方能借此测试当地反应。',
}
