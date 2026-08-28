/** Provider adapter：只在 server side 使用。任何失敗都回 null，由呼叫端接 fallback。 */

const BASE = process.env.OPENAI_BASE_URL ?? 'https://api.openai-next.com/v1'
const KEY = process.env.OPENAI_API_KEY ?? ''
const TEXT_MODEL = process.env.N25_TEXT_MODEL ?? 'gpt-5-mini'
const IMAGE_MODEL = process.env.N25_IMAGE_MODEL ?? 'gemini-3.1-flash-image'

const HEADERS = {
  Authorization: `Bearer ${KEY}`,
  'Content-Type': 'application/json',
  // 中轉站前面掛 Cloudflare，預設 UA 會被 1010 擋掉
  'User-Agent': 'curl/8.7.1',
}

async function post<T>(path: string, body: unknown, timeoutMs: number): Promise<T | null> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(body),
      signal: ctrl.signal,
    })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

async function withRetry<T>(fn: () => Promise<T | null>): Promise<T | null> {
  const first = await fn()
  if (first) return first
  return fn()
}

type ChatRes = { choices?: { message?: { content?: string } }[] }

export async function chatJSON<T>(
  system: string,
  user: string,
  timeoutMs = 12000,
): Promise<T | null> {
  if (!KEY) return null
  const run = async () => {
    const res = await post<ChatRes>(
      '/chat/completions',
      {
        model: TEXT_MODEL,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        response_format: { type: 'json_object' },
        // 同一段对话每次判定应该一致——业务员不能每刷新一次就看到不同的风险分
        temperature: 0.1,
      },
      timeoutMs,
    )
    const raw = res?.choices?.[0]?.message?.content
    if (!raw) return null
    try {
      const cleaned = raw.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '')
      return JSON.parse(cleaned) as T
    } catch {
      return null
    }
  }
  return withRetry(run)
}

type ImageRes = { data?: { b64_json?: string; url?: string }[] }

export async function generateImage(prompt: string, timeoutMs = 30000): Promise<string | null> {
  if (!KEY) return null
  const run = async () => {
    const res = await post<ImageRes>(
      '/images/generations',
      { model: IMAGE_MODEL, prompt, n: 1 },
      timeoutMs,
    )
    const d = res?.data?.[0]
    if (d?.b64_json) {
      const mime = d.b64_json.startsWith('/9j/') ? 'image/jpeg' : 'image/png'
      return `data:${mime};base64,${d.b64_json}`
    }
    if (d?.url) return d.url
    return null
  }
  return withRetry(run)
}
