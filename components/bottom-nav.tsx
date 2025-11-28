"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Pill, MessageSquare, FileText, User, Stethoscope, Calendar } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useState } from "react"

const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/drugs", icon: Pill, label: "Drugs" },
    { href: "/chat", icon: MessageSquare, label: "Chat" },
    { href: "/prescription", icon: FileText, label: "Rx" },
    { href: "/diagnosis", icon: Stethoscope, label: "Diagnosis" },
    // { href: "/scheduler", icon: Calendar, label: "Schedule" },
    { href: "/profile", icon: User, label: "Profile" },
]

export function BottomNav() {
    const pathname = usePathname()
    const [activeTooltip, setActiveTooltip] = useState<string | null>(null)

    return (
        <motion.nav
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md sm:max-w-2xl lg:max-w-4xl"
        >
            <div className="bg-card/98 backdrop-blur-xl border-t border-border shadow-2xl safe-area-inset-bottom">
                <div className="flex items-center justify-around px-1 py-2 sm:px-4 sm:py-3">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        const Icon = item.icon

                        return (
                            <div key={item.href} className="relative">
                                <Link
                                    href={item.href}
                                    className="relative flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all duration-200 active:scale-95 touch-manipulation"
                                    onTouchStart={() => !isActive && setActiveTooltip(item.href)}
                                    onTouchEnd={() => setActiveTooltip(null)}
                                    onTouchCancel={() => setActiveTooltip(null)}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-primary/10 rounded-xl"
                                            transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                                        />
                                    )}
                                    <Icon
                                        className={cn(
                                            "w-6 h-6 relative z-10 transition-all duration-200",
                                            isActive ? "text-primary scale-110" : "text-muted-foreground",
                                        )}
                                    />
                                    {isActive && (
                                        <motion.span
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.2 }}
                                            className="text-xs font-medium relative z-10 text-primary"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </Link>
                                {activeTooltip === item.href && !isActive && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.8 }}
                                        className="absolute -top-12 left-1/2 -translate-x-1/2 bg-foreground text-background px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap z-50 pointer-events-none"
                                    >
                                        {item.label}
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-foreground" />
                                    </motion.div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </motion.nav>
    )
}
