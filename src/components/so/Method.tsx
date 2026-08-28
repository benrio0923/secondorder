'use client'
import { Panel } from './parts'

const WHY = [
  {
    q: '為什麼稅則不交給大模型算？',
    a: '因為算錯就是真金白銀的虧損。所有稅率、牌照、條款都寫在可審計的規則庫裡（TypeScript 純函式），每一條都帶來源與版本，滑鼠移到 ⓘ 就能看到出處。大模型只做兩件它真正擅長的事：把自然語言抽成結構、把結論寫成人話。',
    tag: '規則引擎 × LLM 混合',
  },
  {
    q: '為什麼六項訊號還要人來按？',
    a: 'AI 看得到文字，看不到展位上對方說「標籤不用改」時的表情。所以 AI 只給初判，六組按鈕的最終判定權在業務員手上——他改了，風險分數和合同條款立刻跟著重算。這不是把人留在迴路裡當裝飾，是因為這一題的關鍵證據本來就有一半不在文字裡。',
    tag: 'AI 初判 · 人做決定',
  },
  {
    q: '為什麼不做成通用的外貿 SaaS？',
    a: '白酒的堵點是三件別的品類沒有的事：它是管制商品，買方必須持牌，所以客戶池是封閉的；它出口免消費稅、退增值稅 13%，這個稅差本身就會吸引不打算賣酒的人；它在多數國家的稅則裡沒有自己的名字，只能被歸進為別的酒種設計的稅率。通用工具處理不了這三件事。',
    tag: '垂直而不是通用',
  },
  {
    q: '網路斷了怎麼辦？',
    a: '三個示範案例都帶本機預解析結果，模型不可用時自動切換並在畫面上標示。落地價、牌照核查、合同條款全部是本機計算，不依賴任何外部服務。也就是說：現場斷網，這條主鏈路照樣從頭跑到尾。',
    tag: '離線可跑完主鏈路',
  },
]

const LAND = [
  { k: '資料從哪來', v: '稅則與牌照全部來自各國官方公開資料（香港政府公報、新加坡海關、越南 SCT 法、美國 TTB／FDA）。產區側的企業台帳已經存在——遵義綜保區手上就有 89 家的完整備案名單。' },
  { k: '誰真的會用', v: '第一線是酒企的外貿專員；但更有效率的入口是遵義綜保區的外貿綜合服務團隊——他們已經在做「陪跑式」服務，一個團隊服務 89 家企業，這套工具是他們的放大器。' },
  { k: '怎麼接進現有系統', v: '第一階段獨立跑，不接任何系統，因為外貿專員現在用的就是微信和 Excel。第二階段接兩個口：綜保區的企業備案台帳、以及海關單一窗口的報關數據，讓「出口了什麼」和「賣掉了沒有」對得上。' },
  { k: '成本多少', v: '每次解析約兩次模型呼叫，以目前價格計算單次成本在人民幣一毛以內。落地價與牌照核查是本機計算，零邊際成本。真正的成本在規則庫的維護——稅則會變，這需要一個人定期核。' },
  { k: '第一步該幹什麼', v: '找 2025 年首次通過綜保區出海的那 11 家企業裡的 3 家，把他們真實的買家對話跑一遍，回頭校準六項訊號的權重。這件事不需要開發，只需要三個下午。' },
]

export function Method() {
  return (
    <div className="mt-8 space-y-6">
      <Panel eyebrow="方案完整度" title="為什麼這樣做，以及為什麼不那樣做">
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
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-stone">一條請求走過的路</div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2 font-mono text-[11px]">
            {[
              { t: '名片／對話', c: 'text-stone' },
              { t: 'LLM 抽取', c: 'text-amber' },
              { t: '六訊號初判', c: 'text-amber' },
              { t: '人工覆核', c: 'text-bone' },
              { t: '風險評分（規則）', c: 'text-sky-300' },
              { t: '落地價（規則）', c: 'text-sky-300' },
              { t: '條款選取（規則）', c: 'text-sky-300' },
              { t: 'LLM 寫回信', c: 'text-amber' },
              { t: '決策簡報', c: 'text-bone' },
            ].map((s, i, arr) => (
              <span key={s.t} className="flex items-center gap-2">
                <span className={`rounded border border-white/12 bg-white/[0.03] px-2 py-1 ${s.c}`}>{s.t}</span>
                {i < arr.length - 1 && <span className="text-stone/40">→</span>}
              </span>
            ))}
          </div>
          <p className="mt-3 text-[11.5px] leading-relaxed text-stone">
            <span className="text-amber">琥珀</span>是模型負責的部分，
            <span className="text-sky-300">藍色</span>是規則庫負責的部分，
            <span className="text-bone">白色</span>是人負責的部分。錢算錯不起，所以錢的部分不歸模型管。
          </p>
        </div>
      </Panel>

      <Panel eyebrow="最常被問的一題" title="那我直接問通用大模型不就好了？">
        <p className="mb-4 max-w-[72ch] text-[13px] leading-relaxed text-stone">
          可以問，而且它會給你一個聽起來很像樣的答案。問題出在三個地方——而這三件事，
          恰好就是一個外貿專員拿這個答案去跟老闆報價時，會出事的三個地方。
        </p>
        <div className="grid gap-px overflow-hidden rounded border border-white/10 bg-white/8 sm:grid-cols-3">
          {[
            {
              t: '它不知道這些細節',
              b: '新加坡按純酒精量課稅、越南 SCT 以 20 度為分界、美國 CBMA 額度必須由中國生產商主動指派——這些不是常識，是散在各國官方文件裡、要一條條查出來的東西。通用模型多半會給你一個「約 30–50% 綜合稅負」的模糊區間。',
            },
            {
              t: '同一題問兩次，答案會不一樣',
              b: '報價要拿去跟人談，數字不能每次都變。這裡的每一分錢都是規則庫的純函式算出來的——同樣的輸入永遠得到同樣的輸出，而且可以逐行覆核。模型只負責讀對話和寫回信，碰不到數字。',
            },
            {
              t: '它不會告訴你出處與生效日期',
              b: '每一條稅率都標了來源和版本：香港那條是 2024/10/16 起生效，越南那條 2027 年就要改。你把資料交給老闆時，需要的是「這個數字哪來的、什麼時候會變」，不是一段流利的敘述。',
            },
          ].map((x) => (
            <div key={x.t} className="bg-ink2/60 p-4">
              <div className="mb-2 font-serif text-[14.5px] leading-snug text-bone">{x.t}</div>
              <p className="text-[12px] leading-relaxed text-stone">{x.b}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 max-w-[72ch] text-[12.5px] leading-relaxed text-stone">
          換句話說：<span className="text-bone">我們不是在跟通用模型比誰更會講話，是在把一個垂直領域的規則翻出來、寫死、標上出處。</span>
          模型在這套系統裡負責的是它真正擅長的兩件事——把一段亂七八糟的微信對話讀成結構，和把結論寫成一封能寄出去的信。
        </p>
      </Panel>

      <Panel eyebrow="落地可行性" title="這套東西要真上線，第一步得幹什麼">
        <div className="space-y-px overflow-hidden rounded border border-white/10 bg-white/8">
          {LAND.map((l) => (
            <div key={l.k} className="grid gap-2 bg-ink2/60 p-4 sm:grid-cols-[128px_1fr] sm:gap-5">
              <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-amber">{l.k}</div>
              <p className="text-[12.5px] leading-relaxed text-stone">{l.v}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel eyebrow="問題從哪來" title="這不是拍腦袋想的題目">
        <p className="mb-4 max-w-[70ch] text-[13px] leading-relaxed text-stone">
          做這個原型之前，我們先做了兩份產業研究：一份是貴州白酒出海的產業全景，一份是中小酒企出海的路徑成本比較。
          產品裡每一個判斷——為什麼是「第二單」而不是「第一單」、為什麼買家池是封閉的、為什麼稅差會吸引不賣酒的人——
          都出自那兩份研究裡的公開資料，而不是憑空設想的痛點。
        </p>
        <div className="grid gap-px overflow-hidden rounded border border-white/10 bg-white/8 sm:grid-cols-3">
          {[
            { n: '89 → 35 → 11 → 5', t: '遵義 2025 年的出海漏斗', d: '完成備案 89 家、有出口意向 35 家、首次出海 11 家、與東南亞經銷商建立初步聯繫 5 家。公開資料到這裡就斷了，而真正的問題在斷點之後。' },
            { n: '75%+', t: '出口額集中在茅台一家', d: '2024 年全國白酒出口額中，茅台占七成五以上，五糧液加瀘州老窖再占兩成。剩下所有酒企分不到 5%——他們才是需要這套工具的人。' },
            { n: '管制商品', d: '遵義綜保區自己總結的第一個障礙就是「找客戶困難——白酒屬管制商品，進口方需酒牌資質」。你的客戶不是「想賣酒的人」，是「已經持牌的人」。', t: '為什麼找不到客戶' },
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
          第二單 SecondOrder · 賽道二 傳統行業 AI 解決方案 · AI × 白酒 · 經銷商運營
          <br />
          稅則與牌照資料均標註來源與版本，落地價為估算值，實際以海關核定為準。
        </p>
      </footer>
    </div>
  )
}
