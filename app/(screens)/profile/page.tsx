"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { User, Moon, Sun, Globe, Bell, Shield, Info, ChevronRight, Crown, Coins, LogOut, Edit, History } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { currentUser, logout } from "@/lib/helpers/session"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
    const { theme, setTheme } = useTheme()
    const router = useRouter()
    const [language, setLanguage] = useState("en")
    const [notifications, setNotifications] = useState(true)
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [coinBalance, setCoinBalance] = useState<number>(0)
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await currentUser()
                console.log('User data:', userData)
                if (userData) {
                    setUser(userData)
                }
            } catch (error) {
                console.error('Failed to fetch user:', error)
            } finally {
                setLoading(false)
            }
        }
        
        const fetchCoinBalance = async () => {
            try {
                const response = await fetch('/api/coins/balance')
                if (response.ok) {
                    const data = await response.json()
                    setCoinBalance(data.coinBalance)
                }
            } catch (error) {
                console.error('Failed to fetch coin balance:', error)
            }
        }
        
        fetchUser()
        fetchCoinBalance()
    }, [])



    const settingsSections = [
        {
            title: "Appearance",
            icon: theme === "dark" ? Moon : Sun,
            items: [
                {
                    label: "Dark Mode",
                    description: "Toggle dark mode theme",
                    type: "switch" as const,
                    value: theme === "dark",
                    onChange: (checked: boolean) => setTheme(checked ? "dark" : "light"),
                },
            ],
        },
        {
            title: "Language & Region",
            icon: Globe,
            items: [
                {
                    label: "Language",
                    description: "Select your preferred language",
                    type: "select" as const,
                    value: language,
                    onChange: setLanguage,
                    options: [
                        { value: "en", label: "English" },
                        { value: "es", label: "Español" },
                        { value: "fr", label: "Français" },
                        { value: "de", label: "Deutsch" },
                        { value: "zh", label: "中文" },
                    ],
                },
            ],
        },
        {
            title: "Notifications",
            icon: Bell,
            items: [
                {
                    label: "Push Notifications",
                    description: "Receive medication reminders",
                    type: "switch" as const,
                    value: notifications,
                    onChange: setNotifications,
                },
            ],
        },
    ]

    const handleLogout = async () => {
        setIsLoggingOut(true)
        try {
            await logout('/login')
            toast.success('Logged out successfully')
        } catch (error) {
            toast.error('Failed to logout')
        } finally {
            setIsLoggingOut(false)
        }
    }

    const accountLinks = [
        { label: "Edit Profile", icon: Edit, href: "/profile/edit" },
        { label: "Coin Usage History", icon: History, href: "/profile/coin-history" },
        { label: "Referral Program", icon: User, href: "/referral" },
    ]

    const infoLinks = [
        { label: "Privacy Policy", icon: Shield, href: "/privacy" },
        { label: "Terms of Service", icon: Info, href: "/terms" },
        { label: "About", icon: Info, href: "/about" },
    ]

    return (
        <div className="mx-auto max-w-md sm:max-w-2xl lg:max-w-4xl min-h-screen bg-gradient-to-b from-background to-muted/20">
            <div className="min-h-screen bottom-nav-spacing p-4 sm:p-6 lg:p-8">
                <PageHeader
                    title="Profile"
                    subtitle="Manage your settings and preferences"
                    icon={<User className="w-6 h-6" />}
                />

                {/* User Profile Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
                    <Card className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                        <CardContent className="p-4">
                            {loading ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-primary-foreground/20 animate-pulse" />
                                    <div className="space-y-2">
                                        <div className="h-4 w-24 bg-primary-foreground/20 rounded animate-pulse" />
                                        <div className="h-3 w-16 bg-primary-foreground/20 rounded animate-pulse" />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                                            <User className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold">{user?.fullName || 'User'}</h2>
                                            <p className={`text-xs opacity-90`}>
                                                {user?.role || 'Healthcare Professional'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Coin Balance Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-4">
                    <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 border-yellow-200 dark:border-yellow-800">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center">
                                        <Coins className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">Coin Balance</h3>
                                        <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">{coinBalance} coins</p>
                                    </div>
                                </div>
                                <Link href="/coins">
                                    <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white">
                                        <Coins className="w-4 h-4 mr-1" />
                                        Buy Coins
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>



                {/* Settings Sections */}
                <div className="space-y-3">
                    {settingsSections.map((section, sectionIndex) => {
                        const SectionIcon = section.icon
                        return (
                            <motion.div
                                key={section.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + sectionIndex * 0.1 }}
                            >
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <SectionIcon className="w-4 h-4 text-primary" />
                                            {section.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3 pt-0">
                                        {section.items.map((item, itemIndex) => (
                                            <div key={itemIndex} className="flex items-center justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <Label htmlFor={`setting-${sectionIndex}-${itemIndex}`} className="font-medium text-sm">
                                                        {item.label}
                                                    </Label>
                                                    <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                                                </div>
                                                {item.type === "switch" && (
                                                    <Switch
                                                        id={`setting-${sectionIndex}-${itemIndex}`}
                                                        checked={item.value as boolean}
                                                        onCheckedChange={item.onChange as (checked: boolean) => void}
                                                    />
                                                )}
                                                {item.type === "select" && (
                                                    <Select value={item.value as string} onValueChange={item.onChange as (value: string) => void}>
                                                        <SelectTrigger className="w-[120px] h-8 text-xs">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {item.options?.map((option) => (
                                                                <SelectItem key={option.value} value={option.value} className="text-xs">
                                                                    {option.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )
                    })}
                </div>

                {/* Account Links */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-4"
                >
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Account</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1 pt-0">
                            {accountLinks.map((link) => {
                                const LinkIcon = link.icon
                                const content = (
                                    <Button key={link.label} variant="ghost" className="w-full justify-between h-auto py-2 px-3 text-left">
                                        <div className="flex items-center gap-2">
                                            <LinkIcon className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-sm">{link.label}</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                    </Button>
                                )
                                
                                return (
                                    <Link key={link.label} href={link.href}>
                                        {content}
                                    </Link>
                                )
                            })}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Info Links */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-4 space-y-1"
                >
                    {infoLinks.map((link) => {
                        const LinkIcon = link.icon
                        const content = (
                            <Button key={link.label} variant="ghost" className="w-full justify-between h-auto py-2 px-3 text-left">
                                <div className="flex items-center gap-2">
                                    <LinkIcon className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm">{link.label}</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </Button>
                        )
                        
                        return (
                            <Link key={link.label} href={link.href}>
                                {content}
                            </Link>
                        )
                    })}
                </motion.div>

                {/* Logout Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="mt-4"
                >
                    <Button 
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        variant="outline" 
                        className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                        {isLoggingOut ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                <span>Logging out...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <LogOut className="w-4 h-4" />
                                <span>Logout</span>
                            </div>
                        )}
                    </Button>
                </motion.div>

                {/* App Version */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-6 text-center text-xs text-muted-foreground"
                >
                    <p>Doctor Assistance v1.0.0</p>
                    <p className="text-xs mt-1">Built with Next.js & AI</p>
                </motion.div>
            </div>

            <BottomNav />
        </div>
    )
}
