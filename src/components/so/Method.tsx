'use client'
import { Panel } from './parts'

const WHY = [
  {
    q: '为什么税则不交给大模型算？',
    a: '因为算错就是真金白银的亏损。所有税率、牌照、条款都写在可审计的规则库里（TypeScript 纯函数），每一条都带来源与版本，鼠标移到 ⓘ 就能看到出处。大模型只做两件它真正擅长的事：把自然语言抽成结构、把结论写成人话。',
    tag: '规则引擎 × 大模型 混合',
  },
  {
    q: '为什么六项信号还要人来按？',
    a: 'AI 看得到文字，看不到展位上对方说「标签不用改」时的表情。所以 AI 只给初判，六组按钮的最终判定权在业务员手上——他改了，风险分数和合同条款立刻跟着重算。这不是把人留在回路里当装饰，是因为这一题的关键证据本来就有一半不在文字里。',
    tag: 'AI 初判 · 人做决定',
  },
  {
    q: '没看到坏消息，为什么不算好消息？',
    a: '六项信号里如果只判定得出三项，分数会偏低——但那是因为信息少，不是因为对方干净。所以覆盖率低于六成时，系统不给「偏向真实经销需求」这个结论，而是明说「信号不足，不等于安全」。一个会因为资料不够就说没问题的工具，比没有工具更危险。',
    tag: '覆盖率保护',
  },
  {
    q: '为什么不做成通用的外贸 SaaS？',
    a: '白酒的堵点是三件别的品类没有的事：它是管制商品，买方必须持牌，所以客户池是封闭的；它出口免消费税、退增值税 13%，这个税差本身就会吸引不打算卖酒的人；它在多数国家的税则里没有自己的名字，只能被归进为别的酒种设计的税率。通用工具处理不了这三件事。',
    tag: '垂直而不是通用',
  },
  {
    q: '网络断了怎么办？',
    a: '三个示范案例都带本机预解析结果，模型不可用时自动切换并在画面上标示。落地价、牌照核查、合同条款全部是本机计算，不依赖任何外部服务。也就是说：现场断网，这条主链路照样从头跑到尾。',
    tag: '离线可跑完主链路',
  },
]

const LAND = [
  { k: '资料从哪来', v: '税则与牌照全部来自各国官方公开资料（香港政府公报、新加坡海关、越南 特别消费税 法、美国酒精烟草税务贸易局 TTB／FDA）。产区侧的企业台帐已经存在——遵义综保区手上就有 89 家的完整备案名单。' },
  { k: '谁真的会用', v: '第一线是酒企的外贸专员；但更有效率的入口是遵义综保区的外贸综合服务团队——他们已经在做「陪跑式」服务，一个团队服务 89 家企业，这套工具是他们的放大器。' },
  { k: '怎么接进现有系统', v: '第一阶段独立跑，不接任何系统，因为外贸专员现在用的就是微信和 Excel。第二阶段接两个口：综保区的企业备案台帐、以及海关单一窗口的报关数据，让「出口了什么」和「卖掉了没有」对得上。' },
  { k: '成本多少', v: '每次解析约两次模型呼叫，以目前价格计算单次成本在人民币一毛以内。落地价与牌照核查是本机计算，零边际成本。真正的成本在规则库的维护——税则会变，这需要一个人定期核。' },
  { k: '第一步该干什么', v: '找 2025 年首次通过综保区出海的那 11 家企业里的 3 家，把他们真实的买家对话跑一遍，回头校准六项信号的权重。这件事不需要开发，只需要三个下午。' },
]

export function Method() {
  return (
    <div className="mt-8 space-y-6">
      <Panel eyebrow="方案完整度" title="为什么这样做，以及为什么不那样做">
        <div className="grid gap-px overflow-hidden rounded border border-white/10 bg-white/8 sm:grid-cols-2">
          {WHY.map((w) => (
            <div key={w.q} className="bg-ink2/60 p-4">
              <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-amber">{w.tag}</div>
              <div className="mb-1.5 font-serif text-[14.5px] leading-snug text-bone">{w.q}</div>
              <p className="text-[12px] leading-relaxed text-stone">{w.a}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded border border-white/10 bg-white/[0.02] p-4">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-stone">一条请求走过的路</div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2 font-mono text-[11px]">
            {[
              { t: '名片／对话', c: 'text-stone' },
              { t: '大模型抽取', c: 'text-amber' },
              { t: '六信号初判', c: 'text-amber' },
              { t: '人工覆核', c: 'text-bone' },
              { t: '风险评分（规则）', c: 'text-sky-300' },
              { t: '落地价（规则）', c: 'text-sky-300' },
              { t: '条款选取（规则）', c: 'text-sky-300' },
              { t: '大模型写回信', c: 'text-amber' },
              { t: '决策简报', c: 'text-bone' },
            ].map((s, i, arr) => (
              <span key={s.t} className="flex items-center gap-2">
                <span className={`rounded border border-white/12 bg-white/[0.03] px-2 py-1 ${s.c}`}>{s.t}</span>
                {i < arr.length - 1 && <span className="text-stone/40">→</span>}
              </span>
            ))}
          </div>
          <p className="mt-3 text-[11.5px] leading-relaxed text-stone">
            <span className="text-amber">琥珀</span>是模型负责的部分，
            <span className="text-sky-300">蓝色</span>是规则库负责的部分，
            <span className="text-bone">白色</span>是人负责的部分。钱算错不起，所以钱的部分不归模型管。
          </p>
        </div>
      </Panel>

      <Panel eyebrow="最常被问的一题" title="那我直接问通用大模型不就好了？">
        <p className="mb-4 max-w-[72ch] text-[13px] leading-relaxed text-stone">
          可以问，而且它会给你一个听起来很像样的答案。问题出在三个地方——而这三件事，
          恰好就是一个外贸专员拿这个答案去跟老板报价时，会出事的三个地方。
        </p>
        <div className="grid gap-px overflow-hidden rounded border border-white/10 bg-white/8 sm:grid-cols-3">
          {[
            {
              t: '它不知道这些细节',
              b: '新加坡按纯酒精量课税、越南 特别消费税 以 20 度为分界、美国 CBMA 额度必须由中国生产商主动指派——这些不是常识，是散在各国官方文件里、要一条条查出来的东西。通用模型多半会给你一个「约 30–50% 综合税负」的模糊区间。',
            },
            {
              t: '同一题问两次，答案会不一样',
              b: '报价要拿去跟人谈，数字不能每次都变。这里的每一分钱都是规则库的纯函数算出来的——同样的输入永远得到同样的输出，而且可以逐行覆核。模型只负责读对话和写回信，碰不到数字。',
            },
            {
              t: '它不会告诉你出处与生效日期',
              b: '每一条税率都标了来源和版本：香港那条是 2024/10/16 起生效，越南那条 2027 年就要改。你把资料交给老板时，需要的是「这个数字哪来的、什么时候会变」，不是一段流利的叙述。',
            },
          ].map((x) => (
            <div key={x.t} className="bg-ink2/60 p-4">
              <div className="mb-2 font-serif text-[14.5px] leading-snug text-bone">{x.t}</div>
              <p className="text-[12px] leading-relaxed text-stone">{x.b}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 max-w-[72ch] text-[12.5px] leading-relaxed text-stone">
          换句话说：<span className="text-bone">我们不是在跟通用模型比谁更会讲话，是在把一个垂直领域的规则翻出来、写死、标上出处。</span>
          模型在这套系统里负责的是它真正擅长的两件事——把一段乱七八糟的微信对话读成结构，和把结论写成一封能寄出去的信。
        </p>
      </Panel>

      <Panel eyebrow="落地可行性" title="这套东西要真上线，第一步得干什么">
        <div className="space-y-px overflow-hidden rounded border border-white/10 bg-white/8">
          {LAND.map((l) => (
            <div key={l.k} className="grid gap-2 bg-ink2/60 p-4 sm:grid-cols-[128px_1fr] sm:gap-5">
              <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-amber">{l.k}</div>
              <p className="text-[12.5px] leading-relaxed text-stone">{l.v}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel eyebrow="赛后 100 天" title="如果给我们 100 天 PoC 陪跑，我们会做这四件事">
        <p className="mb-4 max-w-[72ch] text-[13px] leading-relaxed text-stone">
          写得具体一点，因为这四件事我们已经知道该找谁、要什么、验什么。
          <span className="text-bone">前三件都不需要写新代码</span>，第四件才是工程。
        </p>
        <div className="space-y-px overflow-hidden rounded border border-white/10 bg-white/8">
          {[
            {
              w: '第 1–2 周',
              t: '拿到台账，选 10 家试点',
              d: '遵义综保区手上有 89 家完成出口备案的完整名单，其中 11 家是 2025 年首次出海的。从这 11 家里选 3 家、再从有意向的 35 家里选 7 家。不需要开发，需要的是一次对接会。',
            },
            {
              w: '第 3–6 周',
              t: '用真实对话校准六项信号',
              d: '把这 10 家手上真实的买家对话跑一遍，比对系统判定与业务员的判断。权重目前是我们设的，这一步就是把它换成有数据支撑的版本。这是整个产品最需要被证伪的地方。',
            },
            {
              w: '第 7–10 周',
              t: '跟 3 家走完一次首单，验落地价',
              d: '拿实际的报关单与对方的进价回来对，看我们算的完税落地成本差多少。差 5% 以内这个工具就能用，差 20% 就得重做税则模型。',
            },
            {
              w: '第 11–14 周',
              t: '搬进微信',
              d: '业务员不会为了判断一个买家去开网页——他整天在微信里。这一步把主链路做成企业微信机器人：转发一段对话给它，回一份决策简报。这才是它真正会被用起来的形态。',
            },
          ].map((x) => (
            <div key={x.w} className="grid gap-2 bg-ink2/60 p-4 sm:grid-cols-[92px_1fr] sm:gap-5">
              <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-amber">{x.w}</div>
              <div>
                <div className="mb-1.5 text-[13.5px] font-medium text-bone">{x.t}</div>
                <p className="text-[12.5px] leading-relaxed text-stone">{x.d}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded border border-white/10 bg-white/[0.02] p-4">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-amber">怎么收钱？现在谈还太早</div>
          <p className="max-w-[72ch] text-[12.5px] leading-relaxed text-stone">
            诚实说：这个阶段谈商业模式是自欺欺人。
            <span className="text-bone">先证明它能让 89 家里搭上线的从 5 家变成 10 家</span>
            ，再谈谁付钱。
            真要往下推，最现实的入口是产区服务平台的一个模块——综保区本来就在做外贸陪跑，有预算、有台账、有企业名单；
            酒企自己订阅是第二步，而且要等到它已经进了微信之后。
          </p>
        </div>
      </Panel>

      <Panel eyebrow="问题从哪来" title="这不是拍脑袋想的题目">
        <p className="mb-4 max-w-[70ch] text-[13px] leading-relaxed text-stone">
          做这个原型之前，我们先做了两份产业研究：一份是贵州白酒出海的产业全景，一份是中小酒企出海的路径成本比较。
          产品里每一个判断——为什么是「第二单」而不是「第一单」、为什么买家池是封闭的、为什么税差会吸引不卖酒的人——
          都出自那两份研究里的公开资料，而不是凭空设想的痛点。
        </p>
        <div className="grid gap-px overflow-hidden rounded border border-white/10 bg-white/8 sm:grid-cols-3">
          {[
            { n: '89 → 35 → 11 → 5', t: '遵义 2025 年的出海漏斗', d: '完成备案 89 家、有出口意向 35 家、首次出海 11 家、与东南亚经销商建立初步联系 5 家。公开资料到这里就断了，而真正的问题在断点之后。' },
            { n: '75%+', t: '出口额集中在茅台一家', d: '2024 年全国白酒出口额中，茅台占七成五以上，五粮液加泸州老窖再占两成。剩下所有酒企分不到 5%——他们才是需要这套工具的人。' },
            { n: '管制商品', d: '遵义综保区自己总结的第一个障碍就是「找客户困难——白酒属管制商品，进口方需酒牌资质」。你的客户不是「想卖酒的人」，是「已经持牌的人」。', t: '为什么找不到客户' },
          ].map((x) => (
            <div key={x.t} className="bg-ink2/60 p-4">
              <div className="font-serif text-[19px] leading-tight text-amber">{x.n}</div>
              <div className="mt-2 text-[12.5px] font-medium text-bone">{x.t}</div>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-stone">{x.d}</p>
            </div>
          ))}
        </div>
      </Panel>

      <footer className="pt-2 text-center">
        <p className="font-mono text-[11px] leading-relaxed text-stone/60">
          第二单 SecondOrder · 赛道二 传统行业 AI 解决方案 · AI × 白酒 · 经销商运营
          <br />
          税则与牌照资料均标注来源与版本，落地价为估算值，实际以海关核定为准。
        </p>
      </footer>
    </div>
  )
}
