import PptxGenJS from '/Users/benrio0923/.nvm/versions/node/v25.0.0/lib/node_modules/pptxgenjs/dist/pptxgen.es.js'
import fs from 'node:fs'
const SD = process.argv[2], OUT = process.argv[3]

const C = { paper:'FAF6EF', card:'FFFFFF', line:'E5DCCB', line2:'CDC0A9',
            ink:'1C1613', ink2:'574B41', ink3:'8B7F6F',
            amber:'9A5414', gold:'C6912F', halt:'BE3A2E', go:'217A57' }
const SERIF = 'PingFang SC', SANS = 'PingFang SC', MONO = 'Menlo'

const p = new PptxGenJS()
p.layout = 'LAYOUT_16x9'   // 10 x 5.625 in
p.author = '第二单 SecondOrder'
p.title = '第二单 SecondOrder — 贵州白酒出海首单决策副驾'

// ── 主视觉 12 页：整页图 + 讲稿写进备注 ──
const NOTES = {
 "s01": "（0:00–0:18　18 秒　79 字）\u000b\u000b[停两秒，让评委先看完标题]\u000b各位评委好。\u000b扫码验茅台真假，大家都会。我们做的是同一个动作，方向反过来——\u000b扫的不是酒，是买家。\u000b它叫「第二单」，用户是贵州仁怀、遵义那些没有海外团队的中小酒企。\u000b\u000b───── 时间充裕可加 ─────\u000b为什么不是第一单，最后一页会回答。",
 "s02": "（0:18–0:56　38 秒　178 字）\u000b\u000b遵义综保区去年的工作总结里，有一组很诚实的数字：\u000b八十九家完成出口备案，三十五家有意向，十一家真的出了海，\u000b最后五家和东南亚经销商「建立初步联系」。\u000b[停一拍]\u000b注意这个措辞——不是签约，更不是复购。公开资料到这里就断了。\u000b遵义自己列的第一个障碍是：白酒属管制商品，进口方需酒牌资质。\u000b所以你要找的不是想卖酒的人，是已经持牌的人。\u000b这个池子在任何国家都有限、封闭，早被洋酒喂饱了。\u000b\u000b───── 时间充裕可加 ─────\u000b所以问题从来不是「白酒怎么出海」这种大词，是一家没有海外团队的酒厂，怎么让第一个海外经销商愿意下第二单。",
 "s03": "（0:56–1:20　24 秒　111 字）\u000b\u000b卡住的不在酿酒，在酿完之后。\u000b展会散场，业务员手上十几张名片，\u000b却分不清哪个是真经销商，哪个是来做别的事的。\u000b他真正的问题只有三个：这人是真想卖酒还是在做税差？\u000b这瓶酒到他货架上卖多少钱、卖得动吗？合同该写死哪几条？\u000b现在只能靠猜。\u000b\u000b───── 时间充裕可加 ─────\u000b因为答案分散在五个国家的税则、牌照制度和渠道结构里，他连从哪查起都不知道。",
 "s04": "（1:20–1:58　38 秒　159 字）\u000b\u000b看一张真实的名片。\u000b[指瓶子]\u000b他说：出厂价最低多少，我们要最低的，先来三个柜；\u000b标签不用改，我们自己处理；货先放自贸仓；动销数据是商业机密。\u000b每一句单独看都不算离谱，合起来是另一回事。\u000b他要的不是这瓶酒。\u000b白酒出口，消费税百分之二十从价免征，加增值税退税百分之十三——\u000b他要的是这百分之三十三。囤进自贸仓转手就走，\u000b酒有没有上过货架跟他无关。\u000b\u000b───── 时间充裕可加 ─────\u000b第二个买家问的是：有没有三十八度的，因为越南特别消费税以二十度分界；标签要越南文；\u000b先做一百五十箱放十二家中餐厅试销；能不能给品鉴小样，我们要培训服务生。\u000b这个人是来卖酒的。差别不在语气，在他关心什么。",
 "s05": "（1:58–2:20　22 秒　91 字）\u000b\u000b判断错了，代价是多少。\u000b一柜货值两百六十一万；卖不掉折价倒回国内，亏七十八万。\u000b但更贵的不是这笔钱，是当地价格烂掉之后，\u000b你再也找不到第二个愿意接的经销商。\u000b而这些，你要九十天以后才会知道。\u000b\u000b───── 时间充裕可加 ─────\u000b这就是为什么这个判断必须发生在签约之前，不是发生在报关那一天。",
 "s06": "（2:20–2:42　22 秒　89 字）\u000b\u000b所以我们做了这个工具。\u000b把那段微信对话原样贴进去，不用整理，八秒出一份决策简报。\u000b[指流程]\u000b分工要说清楚：模型只做一件事，把这段乱七八糟的话读成结构。\u000b该不该做、算多少钱、写哪几条，都不归它管。\u000b\u000b───── 时间充裕可加 ─────\u000b因为算错一个税率就是真金白银的亏损，这种事不能交给一个每次回答都可能不一样的东西。",
 "s07": "（2:42–3:06　24 秒　104 字）\u000b\u000b判定我们用一瓶酒表示。\u000b[指两瓶]\u000b瓶子永远是满的，变的是里面装什么。\u000b左边装的是酒，他是来买酒的，可以谈。\u000b右边这瓶，红的是税差，从瓶底把酒顶上来了。\u000b这一瓶里装的不是酒。\u000b业务员不必看懂评分模型，看一眼瓶子就知道该不该往下谈。\u000b\u000b───── 时间充裕可加 ─────\u000b红色占多高，就是套利风险分是多少——这两件事在界面上是同一个东西。",
 "s08": "（3:06–3:32　26 秒　110 字）\u000b\u000b展开是六个页签，一页回答一个问题：\u000b该不该做、凭什么这么判、卖多少钱、\u000b他有没有牌照、怎么跟他讲、合同和之后九十天怎么盯。\u000b六项信号是模型给的初判，但最后一票在人手上——\u000bAI 看得到文字，看不到展位上他说「标签不用改」时的表情。\u000b[切到现场 demo]\u000b\u000b───── 时间充裕可加 ─────\u000b改任何一项，判定、必问清单、合同条款会立刻跟着重算。",
 "s09": "（3:32–4:04　32 秒　147 字）\u000b\u000b为什么不直接问通用大模型？\u000b因为这三条它不会告诉你，是我们逐条翻税则翻出来的：\u000b香港烈酒减税只减两百港币以上那一部分，低价酒完全享受不到。\u000b新加坡按纯酒精量课税，不看瓶数，降度数等于直接少缴税。\u000b美国的 CBMA 额度必须由中国生产商主动指派，进口商自己拿不到；\u000b一瓶差十块七，一柜十几万，而且不花你一毛钱。\u000b\u000b───── 时间充裕可加 ─────\u000b通用模型给你的多半是「约百分之三十到五十综合税负」这种区间。拿这个去跟老板报价，是会出事的。",
 "s10": "（4:04–4:30　26 秒　121 字）\u000b\u000b技术上只坚持一件事：规则算账，模型说人话。\u000b税则、牌照、风险评分、合同条款全是可审计的纯函数，\u000b同样输入永远同样输出，每条都带来源和生效日期。\u000b模型只负责两件事：读懂对话，把结论写成一封能寄出去的信。\u000b所以模型挂了主链路照样跑完，现场断网也演示得完。\u000b\u000b───── 时间充裕可加 ─────\u000b日本原本在候选名单里，但公开资料对烈酒税率的表述不够明确，我们宁可不收——收一条不确定的税率，赔上的是整个规则库的可信度。",
 "s11": "（4:30–4:46　16 秒　74 字）\u000b\u000b接下来一百天，第三步是设计来证伪我们自己的：\u000b跟三家酒厂走完一次真实首单，拿报关单核对落地价。\u000b误差百分之五以内就能用，差到百分之二十，税则模型得重做。\u000b\u000b───── 时间充裕可加 ─────\u000b我们不打算先谈商业模式。先证明能让八十九家里搭上线的从五家变成十家，再谈谁付钱。",
 "s12": "（4:46–5:00　14 秒　57 字）\u000b\u000b最后一句。\u000b出海不缺第一单，缺的是第二单。\u000b货在他仓里没动，他就不会再下单——\u000b而你到那时才知道，已经晚了九十天。\u000b谢谢。"
}
const QANOTES = {
 "13": "以下九页不参与五分钟路演，评委提问时直接跳到对应页。",
 "14": "怎么答：不要辩护「我们的数字很准」。\u000b第一句就说「不保证对，保证可查」，然后当场把鼠标移到 ⓘ 上，让他看到来源和生效日期。\u000b如果被追问为什么没收日本或欧盟：公开资料对烈酒税率的表述不够明确，宁可不收——\u000b收一条不确定的税率，赔上的是整个规则库的可信度。这句话本身就是答案。",
 "15": "怎么答：这题几乎一定会被问，准备好三个字——细节、稳定、可追溯。\u000b最有杀伤力的是当场对比：请评委用手机问通用模型「白酒出口新加坡税负多少」，\u000b他多半会得到一个百分之三十到五十的区间；我们给的是按纯酒精量算出的具体数字，附税则出处。\u000b补充：我们不是在跟通用模型比谁更会讲话，是把一个垂直领域的规则翻出来、写死、标上出处。",
 "16": "怎么答：不要硬编商业模式，那会显得不诚实。\u000b先承认「现在谈还太早」，再给唯一现实的入口——产区服务平台。\u000b综保区本来就在做外贸陪跑，有预算、有台账、有企业名单，这个工具作为其中一个模块，\u000b比单独卖 SaaS 给中小酒企现实得多。\u000b如果追问「那你们靠什么活」：中小酒企不会为一个网页付费，会为「少亏一柜」付费，\u000b所以第一步是把落地价误差验出来，不是先做定价页。",
 "17": "怎么答：分两层说。\u000b一层是官方公开资料——香港政府新闻公报、新加坡海关、越南 2025 年新版特别消费税法、\u000b美国 TTB 与 FDA、中国财政部与税务总局的出口退税公告。\u000b另一层是团队自建的两份数据库：五十六支贵州白酒逐支核过、每支标注资料可信度；\u000b海外用法每条标注证据强度，来源是 World Baijiu Day、品牌方推广和商家页面。\u000b强调「逐支核过」，不是抓的。",
 "18": "怎么答：承认网页不是终态，这一点不要回避。\u000b外贸专员整天在微信里，不会为了判断一个买家去开网页——真正会被用起来的是企业微信机器人，\u000b转发一段对话给它，回一份决策简报。这件事写在一百天计划的第四步。\u000b但要说清楚为什么先做网页：规则库、信号权重、落地价误差这三件事没验完之前，\u000b做成机器人只是把一个还没校准的答案推到更多人面前。",
 "19": "怎么答：主动说，不等被问。\u000b这一页的作用是把可信度拉起来——一个肯讲自己边界的团队，前面说的话才值得信。\u000b最重要的一条是「信号权重还没用真实案例校准」，目前是团队设定值，\u000b这也正好是一百天计划的第二步，前后是接得上的。",
 "20": "技术选型。评委是技术背景时，重点讲那条分界线：\u000b规则是纯函数、模型只做抽取与措辞，这不是偷懒，是因为算错一个税率就是真金白银的亏损。\u000b另外可以提「刻意没引入」那一行——不用图表库（瀑布图、酒瓶液面全是手写 SVG 与 shader）、\u000b不用组件库、不用数据库，税则是编译期常量，比数据库更适合审计与 diff。\u000b判定页那瓶酒是 three.js 实时渲染的，液面高度就是套利风险分。",
 "21": "线上体验可以直接请评委自己打开点，不用注册。\u000b仓库是公开的，Topic 是 #Guikesong，README 顶部就是技术栈表。\u000b如果还有时间，可以回到 demo 现场再跑一个越南的案例做对照——\u000b同样八秒，出来的是「可谈」，让他们看到这工具不是只会说不。"
}
for (let i = 1; i <= 12; i++) {
  const id = 's' + String(i).padStart(2, '0')
  const f = `${SD}/slides/${id}.jpg`
  if (!fs.existsSync(f)) { console.log('missing', id); continue }
  const s = p.addSlide()
  s.background = { color: C.paper }
  s.addImage({ path: f, x: 0, y: 0, w: 10, h: 5.625 })
  if (NOTES[id]) s.addNotes(NOTES[id])
}

// ── 以下手工制作，不是生成图：分隔页 + 问答 + 附录 ──
function divider(kicker, title, sub) {
  const s = p.addSlide()
  s.background = { color: C.ink }
  s.addText(kicker, { x:0.9, y:2.05, w:8, h:0.3, fontFace:MONO, fontSize:11, color:C.gold, charSpacing:3 })
  s.addShape(p.ShapeType.rect, { x:0.9, y:2.5, w:0.75, h:0.03, fill:{ color:C.gold } })
  s.addText(title, { x:0.9, y:2.7, w:8.2, h:0.9, fontFace:SERIF, fontSize:40, bold:true, color:C.paper })
  if (sub) s.addText(sub, { x:0.9, y:3.6, w:7.4, h:0.5, fontFace:SANS, fontSize:13, color:'C9BBA6', lineSpacing:22 })
  return s
}

function qa(n, q, lead, points, foot) {
  const s = p.addSlide()
  s.background = { color: C.paper }
  s.addText(`Q${String(n).padStart(2,'0')}`, { x:0.62, y:0.5, w:1.2, h:0.3, fontFace:MONO, fontSize:11, color:C.amber, charSpacing:2 })
  s.addText(q, { x:0.62, y:0.85, w:8.76, h:0.75, fontFace:SERIF, fontSize:25, bold:true, color:C.ink, lineSpacing:34 })
  s.addShape(p.ShapeType.rect, { x:0.62, y:1.74, w:8.76, h:0.012, fill:{ color:C.line2 } })

  // 中文一行大约放得下多少字，按这个反推每块要几行——固定行距会把长句压到页脚上
  const BOTTOM = foot ? 4.62 : 4.98
  const fit = (bodyPt) => {
    const perLine = Math.floor(8.42 / (bodyPt / 72) / 1.0)
    let y = 1.92
    const plan = []
    if (lead) {
      const L = Math.max(1, Math.ceil(lead.length / Math.floor(8.5 / ((bodyPt + 2) / 72))))
      plan.push({ kind:'lead', y, lines:L })
      y += L * ((bodyPt + 2) * 1.75 / 72) + 0.18
    }
    for (const [head, body] of points) {
      const L = Math.max(1, Math.ceil(body.length / perLine))
      plan.push({ kind:'pt', y, head, body, lines:L })
      y += 0.30 + L * (bodyPt * 1.68 / 72) + 0.125
    }
    return { plan, end:y, ok: y <= BOTTOM }
  }
  let r = fit(12.5)
  if (!r.ok) r = fit(11.5)
  if (!r.ok) r = fit(10.5)
  const bodyPt = r === undefined ? 12.5 : (fit(12.5).ok ? 12.5 : fit(11.5).ok ? 11.5 : 10.5)

  for (const b of r.plan) {
    if (b.kind === 'lead') {
      s.addText(lead, { x:0.62, y:b.y, w:8.76, h: b.lines * 0.26 + 0.1,
        fontFace:SANS, fontSize: bodyPt + 2, color:C.ink, lineSpacing: (bodyPt + 2) * 1.75 })
    } else {
      s.addShape(p.ShapeType.rect, { x:0.62, y: b.y + 0.075, w:0.055, h:0.155, fill:{ color:C.amber } })
      s.addText(b.head, { x:0.85, y:b.y, w:8.5, h:0.28, fontFace:SANS, fontSize: bodyPt + 1, bold:true, color:C.ink })
      s.addText(b.body, { x:0.85, y: b.y + 0.30, w:8.5, h: b.lines * (bodyPt * 1.68 / 72) + 0.08,
        fontFace:SANS, fontSize: bodyPt, color:C.ink2, lineSpacing: bodyPt * 1.68 })
    }
  }
  if (foot) s.addText(foot, { x:0.62, y: Math.min(5.02, Math.max(4.66, r.end + 0.06)), w:8.76, h:0.42, fontFace:SANS, fontSize:11, color:C.ink3, lineSpacing:18 })
  s.addText('第二单 SecondOrder', { x:0.62, y:5.26, w:4, h:0.22, fontFace:MONO, fontSize:9, color:C.ink3, charSpacing:2 })
  return s
}

divider('APPENDIX · Q & A', '问答与附录', '以下几页不参与五分钟路演，留给评委提问时直接翻。')

qa(1, '税率你怎么保证是对的？',
 '不保证「对」，保证「可查」。每一条税率、每一张牌照都在代码里带 source 与 asOf 两个字段，界面上鼠标移到 ⓘ 就能看到出处与生效日期。',
 [['全部是纯函数，不经过模型','同样输入永远同样输出，可以逐行覆核。模型算错一个税率就是真金白银的亏损，这部分我们不交给它。'],
  ['写不确定的，不如不写','日本原本在候选名单里，但公开资料对烈酒税率的表述不够明确，我们宁可不收——收一条不确定的税率，代价是整个规则库的可信度。']],
 '目前涵盖香港、新加坡、越南、美国、韩国五个市场。韩国税目为二手来源（产业报导），界面上已标注「建议向韩国国税厅核实」。')

qa(2, '直接问通用大模型不就好了？',
 '可以问，也会得到一个听起来很像样的答案。问题出在三个地方，而这三个地方恰好都会出事。',
 [['细节','通用模型多半给你「约 30–50% 综合税负」的区间。我们逐条查出来写死：新加坡按纯酒精量、越南 20 度分界、美国 CBMA 须由生产商指派。'],
  ['稳定性','同一题问两次，数字可能不一样。我们是纯函数计算，同样输入永远同样输出。'],
  ['可追溯','通用模型不会告诉你出处与生效日期。我们每条都标了。']],
 '我们不是在跟通用模型比谁更会讲话，是把一个垂直领域的规则翻出来、写死、标上出处。')

qa(3, '谁付钱？商业模式是什么？',
 '现在谈还太早。先证明它能让 89 家里搭上线的从 5 家变成 10 家，再谈谁付钱。',
 [['最现实的入口是产区服务平台','综保区本来就在做外贸陪跑，有预算、有台账、有企业名单。这个工具作为其中一个模块，比单独卖 SaaS 给中小酒企现实得多。'],
  ['中小酒企不会为一个网页付费','他们会为「少亏一柜」付费。所以先把误差验出来——落地价误差 5% 以内这工具就能用，差 20% 就得重做税则模型。']])

qa(4, '数据从哪来？',
 '税则与牌照全部来自官方公开资料，品项与用法来自我们自己整理的两份数据库。',
 [['税则与牌照','香港特区政府新闻公报、新加坡海关、越南 2025 年新版特别消费税法、美国 TTB 与 FDA、中国财政部与税务总局出口退税公告。'],
  ['品项与香型','团队《贵州白酒完整数据库》56 支，每支标注资料可信度；《白酒海外入菜研究》每条标注证据强度。'],
  ['出海漏斗','遵义综合保税区 2025 年工作总结相关报导。']])

qa(5, '为什么不直接做成微信机器人？',
 '因为那才是它最终该长的样子——但不是第一步该做的事。',
 [['产品形态现在还不对','外贸专员整天在微信里，不会为了判断一个买家去开网页。网页是 demo 的形态。'],
  ['真正会被用起来的是企业微信机器人','转发一段对话给它，回一份决策简报。这件事写在一百天计划的第四步。'],
  ['先做对的事，再做顺手的事','规则库、信号权重、落地价误差这三件事没验完之前，做成机器人只是把一个还没校准的答案推到更多人面前。']])

qa(6, '你们知道自己还差什么吗？',
 '知道。这几条我们主动说，不等评委问。',
 [['信号权重还没用真实案例校准','目前是团队设定值。这是上线前的第一件事。'],
  ['美国州级酒税未计入','各州差异极大，目前只算到联邦层。'],
  ['越南关税采最惠国 50%','ACFTA 优惠税率须逐案核定，工具里没有替你做这个判断。'],
  ['对标酒款为示意价','用于量级对照，不是即时报价；汇率为估算汇率。落地价一律为估算值，以海关核定为准。']])

// 附录：技术栈
{
  const s = p.addSlide()
  s.background = { color: C.paper }
  s.addText('APPENDIX', { x:0.62, y:0.5, w:2, h:0.3, fontFace:MONO, fontSize:11, color:C.amber, charSpacing:2 })
  s.addText('技术选型', { x:0.62, y:0.85, w:8.76, h:0.6, fontFace:SERIF, fontSize:25, bold:true, color:C.ink })
  s.addTable([
    [{ text:'层', options:{ bold:true } }, { text:'选型', options:{ bold:true } }, { text:'为什么选它', options:{ bold:true } }],
    ['框架','Next.js 16.3.3（App Router）','前后端同仓，API Route 直接承接模型调用'],
    ['UI 运行时','React 19.2.8','六个页面全部预渲染，首屏不等 JS'],
    ['语言','TypeScript 5','税则与落地价是纯函数，类型是正确性的第一道防线'],
    ['样式','Tailwind CSS 4（设计令牌）','整套配色走 CSS 变量，暗改亮只换令牌'],
    ['3D','three.js 0.185','判定酒瓶：玻璃折射 + 液面 shader，液面高度即风险分'],
    ['包管理','Bun 1.3.10','安装与构建快一个量级，现场改代码重启不用等'],
    ['模型','OpenAI 兼容端点 · gpt-5-mini','只用两个 endpoint，换供应商改一个环境变量'],
    ['图像','gemini-3.1-flash-image','窖池、高粱、酒曲、赤水河与本套 slide 主视觉'],
    ['状态','React Context + sessionStorage','六页共享一份买家档案，刷新不丢'],
    ['部署','Vercel','静态页走 CDN，两个 API Route 走 Node.js 运行时'],
    ['验证','Playwright（Chrome headless）','每次改动跑三案例全链路，并检查三种视口的横向溢出'],
  ], {
    x:0.62, y:1.52, w:8.76, colW:[1.05, 2.7, 5.01],
    fontFace:SANS, fontSize:9.5, color:C.ink2, border:{ type:'solid', color:C.line, pt:0.5 },
    fill:{ color:C.card }, rowH:0.235, valign:'middle', autoPage:false,
  })
  s.addText('刻意没有引入：图表库（瀑布图、酒瓶液面全是手写 SVG／shader）、组件库、数据库（税则是编译期常量，比数据库更适合审计与 diff）。',
    { x:0.62, y:4.86, w:8.76, h:0.4, fontFace:SANS, fontSize:10, color:C.ink3, lineSpacing:16 })
  s.addText('第二单 SecondOrder', { x:0.62, y:5.32, w:4, h:0.2, fontFace:MONO, fontSize:9, color:C.ink3, charSpacing:2 })
}

// 附录：链接
{
  const s = p.addSlide()
  s.background = { color: C.ink }
  s.addText('线上体验与开源', { x:0.9, y:1.5, w:8, h:0.6, fontFace:SERIF, fontSize:34, bold:true, color:C.paper })
  s.addShape(p.ShapeType.rect, { x:0.9, y:2.3, w:0.75, h:0.03, fill:{ color:C.gold } })
  const rows = [
    ['在线体验', 'https://secondorder-blond.vercel.app', '无需注册，打开即用'],
    ['开源仓库', 'https://github.com/benrio0923/secondorder', '公开 · Topic #Guikesong'],
  ]
  let y = 2.65
  for (const [k, url, note] of rows) {
    s.addText(k, { x:0.9, y, w:1.5, h:0.3, fontFace:MONO, fontSize:11, color:C.gold, charSpacing:2 })
    s.addText(url, { x:2.5, y: y-0.05, w:6.6, h:0.36, fontFace:MONO, fontSize:15, color:C.paper, hyperlink:{ url } })
    s.addText(note, { x:2.5, y: y+0.3, w:6.6, h:0.26, fontFace:SANS, fontSize:11, color:'C9BBA6' })
    y += 1.0
  }
  s.addText('赛道二 · 传统行业 AI 解决方案　方向：AI × 白酒（营销与经销商运营 Agent）',
    { x:0.9, y:4.85, w:8.2, h:0.3, fontFace:SANS, fontSize:11.5, color:'9C8E79' })
}

// 问答与附录页的「怎么答」提示
p.slides.forEach((sl, idx) => {
  const n = QANOTES[String(idx + 1)]
  if (n) sl.addNotes(n)
})

await p.writeFile({ fileName: OUT })
console.log('WROTE', OUT)
