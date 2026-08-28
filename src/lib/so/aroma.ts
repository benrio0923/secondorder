/**
 * 香型知識庫。
 * 出海談判裡最常被問、業務員卻最答不上來的一題：「這酒跟我這邊的菜怎麼配？」
 * 資料出自團隊的《白酒海外入菜研究》，每條標註證據強度。
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
  /** 給業務員的一句話說法 */
  pitch: string
}

export const AROMAS: Record<AromaId, Aroma> = {
  sauce: {
    id: 'sauce',
    name: '醬香',
    nameEn: 'Sauce Aroma',
    rep: '茅台、習酒、國台（貴州主力香型）',
    profile: '發酵香強、鮮味重、尾韻長',
    pairing: '濃郁鹹香',
    dishes: ['烤鴨', '紅燒肉', '熟成起司', '滷味與臘味'],
    pitch: '跟熟成起司放在一起講，西方人立刻懂——都是靠發酵堆出來的鮮味。',
  },
  strong: {
    id: 'strong',
    name: '濃香',
    nameEn: 'Strong Aroma',
    rep: '五糧液、瀘州老窖',
    profile: '果香明顯、甜潤、香氣強勢',
    pairing: '辛辣與炭烤',
    dishes: ['川菜', '炭烤肉類', '麻辣火鍋'],
    pitch: '甜潤感能壓辣度，配川菜與燒烤最好講，也是最容易切進調酒的一支。',
  },
  light: {
    id: 'light',
    name: '清香',
    nameEn: 'Light Aroma',
    rep: '汾酒',
    profile: '乾淨、清爽、雜味少',
    pairing: '細緻食材',
    dishes: ['清蒸海鮮', '點心', '清淡菜式'],
    pitch: '口感最接近伏特加、琴酒等國際主流烈酒，是非華人客群最低的入門門檻。',
  },
  herbal: {
    id: 'herbal',
    name: '董香',
    nameEn: 'Herbal Aroma',
    rep: '董酒（貴州獨有，含於「其他香型」約 6%）',
    profile: '藥香舒適、酯香與醇香協調、飲後甘爽',
    pairing: '藥膳與濃味',
    dishes: ['藥膳燉品', '滷味', '重口味紅燒', '陳年火腿'],
    pitch: '全世界唯一用一百多味本草入曲的白酒——對非華人來說，這個故事比風味更好講，也是最容易被記住的差異點。',
  },
  other: {
    id: 'other',
    name: '其他香型',
    nameEn: 'Other',
    rep: '兼香、馥郁香等複合香型',
    profile: '複合香型，風味取決於具體工藝',
    pairing: '視酒體而定',
    dishes: ['依實際風味描述判斷'],
    pitch: '複合香型不好一句話帶過，直接用這支酒自己的香氣與口感描述去講，比套香型分類更準。',
  },
}

export const AROMA_LIST = Object.values(AROMAS)

/** 非中國飲者對白酒香氣的實際描述——不好聽，但業務員上場前應該先知道 */
export const FIRST_IMPRESSION = {
  words: ['臭起司', '八角', '鳳梨', '麝香', '汽油'],
  note:
    '這些高強度酯類與吡嗪類香氣，在調酒裡可以被其他材料平衡，但在菜餚裡會主導整道菜——容錯率很低。所以海外的主戰場是吧檯，不是廚房。',
  advice:
    '第一次讓對方試酒時，不要單獨純飲。先用調飲或搭一道濃味的菜，讓香氣有東西可以靠。',
}

/** 一個常被引用的原則 */
export const PRINCIPLE = '白酒不是拿來搭「某一道菜」，而是搭「某一個地方菜系」——產地酒配產地菜。'

export type UseCase = {
  place: string
  what: string
  /** 證據強度：high / mid / low */
  strength: 'high' | 'mid' | 'low'
  source: string
}

/** 各市場已經被記錄下來的白酒使用場景 */
export const USE_CASES: Record<string, UseCase[]> = {
  sg: [
    { place: 'Gecory', what: '茅台口味冰淇淋，另有國窖 1573、五糧液口味', strength: 'mid', source: '商家頁面' },
    { place: 'High Bar Society', what: 'Moutai bluepea gelato（搭法國香草，標示 5% ABV），被稱為當地唯一的白酒 gelato', strength: 'mid', source: '商家頁面' },
    { place: '新加坡中國白酒協會', what: '推廣茅台冰淇淋與酒心巧克力', strength: 'mid', source: '協會推廣管道' },
  ],
  us: [
    { place: '紐約 Kings County Imperial、Han Dynasty', what: 'Ming River（瀘州背景品牌）以調酒形式進入', strength: 'mid', source: '品牌方推廣' },
    { place: "紐約 Ye's Apothecary", what: '川菜搭中式靈感調酒（Red Sorghum：白酒＋Aperol＋鳳梨＋萊姆＋桂花）', strength: 'mid', source: '品牌方推廣' },
    { place: '紐約米其林一星 Yingtao', what: '主廚把口水雞的白酒風味移植到紅蝦料理——作為風味記號，不是整瓶下鍋', strength: 'mid', source: '媒體報導' },
    { place: '休士頓 Tipsy Dessert Bar', what: '2015 年首屆 World Baijiu Day 即製作白酒冰淇淋', strength: 'low', source: 'World Baijiu Day' },
  ],
  hk: [
    { place: '海外華人廚房（含港澳）', what: '醃臘肉、臘腸時加白酒去腥增香，是數十年來的標準作法——覆蓋率最高、卻最少被當成新聞', strength: 'high', source: '食譜媒體與普遍實踐' },
  ],
  vn: [],
  kr: [],
}

/** 全球性的推廣機制，任何市場都用得上 */
export const GLOBAL_HOOK = {
  name: 'World Baijiu Day',
  detail:
    '每年 8 月 9 日，自 2015 年起累計 70 多個城市參與，內容涵蓋白酒調酒、浸漬酒、利口酒、巧克力、披薩與品飲課。',
  use: '這是現成的、不用你自己辦的落地活動——談第一單時可以直接問對方要不要一起參加，成本低、且對方能藉此測試當地反應。',
}
