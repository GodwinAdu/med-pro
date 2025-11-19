"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Activity, Stethoscope, Pill, Calendar, LogOut, Menu, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export function DashboardNav() {
    const { user, logout } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const handleLogout = () => {
        logout()
        router.push("/")
    }

    const navItems = [
        { href: "/dashboard", label: "Dashboard", icon: Activity },
        { href: "/dashboard/diagnosis", label: "Diagnosis", icon: Stethoscope },
        { href: "/dashboard/prescriptions", label: "Prescriptions", icon: Pill },
        { href: "/dashboard/scheduler", label: "Scheduler", icon: Calendar },
    ]

    return (
        <nav className="bg-white dark:bg-slate-900 border-b sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-8">
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
                                <Activity className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-lg">MedAssist Pro</span>
                        </Link>

                        <div className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => {
                                const Icon = item.icon
                                const isActive = pathname === item.href
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isActive
                                                ? "bg-blue-50 dark:bg-blue-950 text-blue-600"
                                                : "text-muted-foreground hover:text-foreground hover:bg-slate-50 dark:hover:bg-slate-800"
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {item.label}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <div className="text-sm">
                            <div className="font-medium">{user?.name}</div>
                            <div className="text-muted-foreground capitalize">{user?.role}</div>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleLogout}>
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>

                    <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t">
                        <div className="space-y-2">
                            {navItems.map((item) => {
                                const Icon = item.icon
                                const isActive = pathname === item.href
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isActive
                                                ? "bg-blue-50 dark:bg-blue-950 text-blue-600"
                                                : "text-muted-foreground hover:text-foreground hover:bg-slate-50 dark:hover:bg-slate-800"
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {item.label}
                                    </Link>
                                )
                            })}
                        </div>
                        <div className="mt-4 pt-4 border-t">
                            <div className="px-4 mb-2 text-sm">
                                <div className="font-medium">{user?.name}</div>
                                <div className="text-muted-foreground capitalize">{user?.role}</div>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleLogout} className="w-full bg-transparent">
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}
