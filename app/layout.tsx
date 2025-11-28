import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import { Suspense } from "react"
import { Toaster } from "@/components/ui/sonner";
import { LoadingSkeleton } from "@/components/loading-skeleton";



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'MedPro',
    template: '%s · MedPro',
  },
  description: 'MedPro - Your Medical Companion App',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16', type: 'image/x-icon' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: '/apple-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MedPro',
  },
  openGraph: {
    title: 'MedPro',
    description: 'MedPro - Your Medical Companion App',
    type: 'website',
    locale: 'en-US',
    siteName: 'MedPro',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Suspense fallback={<LoadingSkeleton />}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>

            {children}
            <Toaster richColors />
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  )
}
