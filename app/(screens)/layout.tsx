import { BottomNav } from "@/components/bottom-nav"
import { ProtectedRoute } from "@/components/protected-route"

export default function ScreenLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        // <ProtectedRoute>
            <div className="mx-auto max-w-md min-h-screen bg-gradient-to-b from-background to-muted/20">
                <div className="min-h-screen bottom-nav-spacing p-6">
                    {children}
                </div>
                <BottomNav />
            </div>
        // </ProtectedRoute>
    )
}
