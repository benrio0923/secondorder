import { NextResponse } from 'next/server'
import { chatJSON } from '@/lib/llm'
import { SIGNALS } from '@/lib/so/signals'
import { MARKET_LIST } from '@/lib/so/markets'
import type { Extracted } from '@/lib/so/types'

export const runtime = 'nodejs'
export const maxDuration = 60

const SIGNAL_SPEC = SIGNALS.map(
  (s) => `- ${s.id}（${s.label}）：true = ${s.good}；false = ${s.bad}；資訊不足填 null`,
).join('\n')

const MARKET_SPEC = MARKET_LIST.map((m) => `${m.id}=${m.name}`).join('、')

const SYSTEM = `你是中國白酒出口業務的盡職調查助手，服務對象是貴州仁懷一家中小酒企的外貿專員。
他剛從展會回來，手上是一段與潛在海外買家的對話或郵件。你的工作是把它拆成可判斷的結構。

只輸出 JSON，一律使用繁體中文（引述原文除外，原文照抄不翻譯）。

判定六個訊號，這是核心：
${SIGNAL_SPEC}

判定原則（嚴格照這些規則，不要自行放寬）：
- 只根據文字裡真正出現的證據判定。完全沒有線索才填 null。

downstream：
  true = 講得出具體售點（幾家餐廳、哪個通路、什麼場景）。
  false = 只說「我有渠道」「看情況分銷」「後面再說」這類沒有指名的說法。
  提到「分銷」但講不出對象，是 false 不是 null。

spec：
  true = 主動追問標籤、度數、容量、檢測報告、當地法規、合規文件。
  false = 只問價格和數量；或說「標籤不用改／我們自己處理／不用你管」——
          這代表他不打算讓這批貨用你的品牌合規落地，是強烈負向訊號。
  只是在訊息裡提到「53度500ml」用來指認品項，不算 true。

size：
  true = 首單偏小、講得出試銷安排（多少箱、放在哪裡試）。
  false = 首單一次要多個貨櫃、或只壓價不談試銷與鋪貨支持。
  「先來 3 個櫃試試水」是 false——櫃是量，不是試。

dest：
  true = 指名終端市場與落地倉儲。
  false = 只到保稅倉／自貿倉／免稅倉，或目的地含糊。

brand：
  true = 要品牌手冊、小樣、品鑑培訓、聯合推廣素材。
  false = 明說不需要品牌資料、不做零售、對品牌建設沒興趣。

sellthrough：
  true = 願意提供動銷報告、終端照片、售點清單。
  false = 拒絕，或稱之為商業機密。

對方主動提出合規要求（酒標、檢測報告、牌照、稅務文件、COLA、FDA、CBMA）一律視為 spec = true。

market 只能是這些代碼之一：${MARKET_SPEC}；判斷不出來就填 null，並在 marketGuess 寫下你看到的地理線索。

輸出格式：
{
 "company": "公司名，抓不到填 null",
 "contact": "聯絡人，抓不到填 null",
 "market": "市場代碼或 null",
 "marketGuess": "地理線索，沒有填 null",
 "role": "對方在產業鏈上的身分，例如：持牌進口商／貿易商／餐飲通路商",
 "claims": ["對方宣稱的能力，每則不超過 20 字"],
 "askedFor": ["對方明確要求你提供的東西，每則不超過 25 字"],
 "signals": {"downstream":true/false/null, "spec":..., "size":..., "dest":..., "brand":..., "sellthrough":...},
 "redFlags": ["值得警覺的具體事實，每則不超過 35 字，沒有就空陣列"],
 "quotes": ["最能支撐你判斷的原文片段，最多 3 則，照抄不翻譯"]
}`

export async function POST(req: Request) {
  const { raw } = (await req.json()) as { raw?: string }
  if (!raw || raw.trim().length < 10) {
    return NextResponse.json({ error: 'empty' }, { status: 400 })
  }
  const out = await chatJSON<Extracted>(SYSTEM, `以下是對話原文：\n\n${raw.slice(0, 4000)}`, 45000)
  if (!out) return NextResponse.json({ error: 'llm_unavailable' }, { status: 503 })
  return NextResponse.json({ extracted: out, source: 'ai' })
}
