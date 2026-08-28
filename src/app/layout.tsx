import type { Metadata } from 'next'
import './fonts.css'
import './globals.css'

export const metadata: Metadata = {
  title: '第二单 SecondOrder — 贵州白酒出海首单决策副驾',
  description: '把展会名片变成首单决策简报：判断买家是真的想卖酒还是在做税差，算出这瓶酒到他货架上要卖多少钱，告诉你合同该写死哪几条。',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body className="bg-ink text-bone antialiased">{children}</body>
    </html>
  )
}
