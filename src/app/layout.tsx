import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '第二单 — 贵州白酒出海首单决策副驾',
  description:
    '把展会名片变成首单决策简报：判断买家是真的想卖酒还是在做税差，算出这瓶酒到他货架上要卖多少钱，告诉你合同该写死哪几条。',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hans">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@500;700;900&family=Noto+Sans+SC:wght@300;400;500;700&family=Oswald:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="field bg-ink text-bone antialiased">
        <div className="above">{children}</div>
      </body>
    </html>
  )
}
