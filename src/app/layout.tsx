import type { Metadata } from 'next'
import './fonts.css'
import './globals.css'

export const metadata: Metadata = {
  title: '第二單 SecondOrder — 貴州白酒出海首單決策副駕',
  description: '把展會名片變成首單決策簡報：判斷買家是真的想賣酒還是在做稅差，算出這瓶酒到他貨架上要賣多少錢，告訴你合同該寫死哪幾條。',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body className="bg-ink text-bone antialiased">{children}</body>
    </html>
  )
}
