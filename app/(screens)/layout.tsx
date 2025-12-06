"use client"

import { BottomNav } from "@/components/bottom-nav"
import { ProtectedRoute } from "@/components/protected-route"
import { usePathname } from "next/navigation"

export default function ScreenLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    const pathname = usePathname()
    const hideBottomNav = pathname === '/chat'

    return (
        // <ProtectedRoute>
            <div className="mx-auto max-w-md min-h-screen bg-gradient-to-b from-background to-muted/20">
                <div className={`min-h-screen ${hideBottomNav ? '' : 'bottom-nav-spacing'}`}>
                    {children}
                </div>
                {!hideBottomNav && <BottomNav />}
            </div>
        // </ProtectedRoute>
    )
}
