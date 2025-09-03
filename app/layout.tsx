import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "DropDetect - Crypto Airdrop Tracker",
  description: "Track and claim crypto airdrops across all blockchains",
  generator: "v0.app",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://dropdetect.xyz"),
  icons: {
    icon: "/logo.jpg",
  },
  openGraph: {
    title: "DropDetect - Crypto Airdrop Tracker",
    description: "Track and claim crypto airdrops across all blockchains",
    images: [{ url: "/logo.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DropDetect - Crypto Airdrop Tracker",
    description: "Track and claim crypto airdrops across all blockchains",
    images: ["/logo.jpg"],
    creator: "@drop_detect",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
