"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Pill, MessageSquare, FileText, User, Stethoscope, ClipboardList } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useState } from "react"

const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/drugs", icon: Pill, label: "Drugs" },
    { href: "/chat", icon: MessageSquare, label: "Chat" },
    { href: "/prescription", icon: FileText, label: "Rx" },
    { href: "/diagnosis", icon: Stethoscope, label: "Diagnosis" },
    { href: "/care-plans", icon: ClipboardList, label: "Plans" },
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
            <div className="bg-white/95 backdrop-blur-xl border-t border-gray-200/50 shadow-[0_-8px_32px_rgba(0,0,0,0.12)] safe-area-inset-bottom">
                <div className="flex items-center justify-around px-1 py-2 sm:px-2 sm:py-3">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href === "/care-plans" && pathname === "/care-plan")
                        const Icon = item.icon

                        return (
                            <div key={item.href} className="relative">
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "relative flex flex-col items-center gap-0.5 px-1.5 py-1.5 rounded-xl transition-all duration-300 active:scale-95 touch-manipulation",
                                        isActive && "shadow-lg shadow-primary/25"
                                    )}
                                    onTouchStart={() => !isActive && setActiveTooltip(item.href)}
                                    onTouchEnd={() => setActiveTooltip(null)}
                                    onTouchCancel={() => setActiveTooltip(null)}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-gradient-to-br from-primary/15 to-primary/5 rounded-2xl border border-primary/20"
                                            transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                                        />
                                    )}
                                    <div className={cn(
                                        "relative z-10 transition-all duration-300 rounded-lg p-0.5",
                                        isActive && "bg-primary/10 shadow-sm"
                                    )}>
                                        <Icon
                                            className={cn(
                                                "transition-all duration-300",
                                                isActive ? "w-6 h-6 text-primary" : "w-4 h-4 text-gray-500",
                                            )}
                                        />
                                    </div>
                                    {isActive && (
                                        <motion.span
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.2 }}
                                            className="text-[10px] font-semibold relative z-10 text-primary"
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