import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "./components/dashboard/global/theme-provider"
import "./globals.css"
import { Suspense } from "react"


export const metadata: Metadata = {
  title: "RoadKing",
  description: "Professional dashboard for user and task management",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <Suspense fallback={<p>Loading...</p>}>
          {children}
          </Suspense>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
