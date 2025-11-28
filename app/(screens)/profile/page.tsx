"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { User, Moon, Sun, Globe, Bell, Shield, Info, ChevronRight, Crown } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { currentUser } from "@/lib/helpers/session"

export default function ProfilePage() {
    const { theme, setTheme } = useTheme()
    const [language, setLanguage] = useState("en")
    const [notifications, setNotifications] = useState(true)
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

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
        fetchUser()
    }, [])

    const getPlanDisplayName = (plan: string) => {
        switch (plan) {
            case 'free': return 'Free Trial'
            case 'basic': return 'Basic Plan'
            case 'pro': return 'Pro Plan'
            default: return 'Free Trial'
        }
    }

    const isTrialActive = () => {
        if (!user?.trialEndDate) return false
        return new Date(user.trialEndDate) > new Date()
    }

    const getSubscriptionStatus = () => {
        if (user?.subscriptionPlan === 'pro' || user?.subscriptionPlan === 'basic') {
            if (user.subscriptionEndDate) {
                const endDate = new Date(user.subscriptionEndDate)
                const now = new Date()
                console.log('Subscription check:', { endDate, now, isActive: endDate > now })
                return endDate > now ? 'Active' : 'Expired'
            }
            return 'Expired'
        }
        return isTrialActive() ? 'Trial Active' : 'Trial Expired'
    }

    const getPlanColor = (plan: string) => {
        switch (plan) {
            case 'pro': return 'text-purple-600'
            case 'basic': return 'text-blue-600'
            default: return 'text-gray-600'
        }
    }

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

    const infoLinks = [
        { label: "Privacy Policy", icon: Shield },
        { label: "Terms of Service", icon: Info },
        { label: "About", icon: Info },
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
                                                {getPlanDisplayName(user?.subscriptionPlan || 'free')} • {getSubscriptionStatus()}
                                            </p>
                                        </div>
                                    </div>
                                    {user?.subscriptionPlan !== 'pro' && (
                                        <Link href="/pricing">
                                            <Button size="sm" variant="secondary" className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-0 text-xs px-2 py-1">
                                                <Crown className="w-3 h-3 mr-1" />
                                                Upgrade
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Upgrade Banner - Only show if not on Pro plan */}
                {user?.subscriptionPlan !== 'pro' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-4">
                        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
                            <CardContent className="p-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                                            <Crown className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-xs">Unlock Premium Features</h3>
                                            <p className="text-xs text-muted-foreground">AI Chat & More</p>
                                        </div>
                                    </div>
                                    <Link href="/pricing">
                                        <Button size="sm" className="h-7 text-xs px-2">
                                            View Plans
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Subscription Details */}
                {user && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Crown className="w-4 h-4 text-primary" />
                                    Subscription Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-0">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <h3 className="font-medium text-sm">Current Plan</h3>
                                        <p className="text-xs text-muted-foreground">{getPlanDisplayName(user.subscriptionPlan || 'free')}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-sm">Status</h3>
                                        <p className={`text-xs ${
                                            getSubscriptionStatus().includes('Active') ? 'text-green-600' : 
                                            getSubscriptionStatus().includes('Expired') ? 'text-red-600' : 'text-yellow-600'
                                        }`}>
                                            {getSubscriptionStatus()}
                                        </p>
                                    </div>
                                </div>
                                {user.subscriptionEndDate && (
                                    <div>
                                        <h3 className="font-medium text-sm">Expires On</h3>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(user.subscriptionEndDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                                {user.trialEndDate && user.subscriptionPlan === 'free' && (
                                    <div>
                                        <h3 className="font-medium text-sm">Trial {isTrialActive() ? 'Ends' : 'Ended'}</h3>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(user.trialEndDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

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

                {/* Info Links */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-4 space-y-1"
                >
                    {infoLinks.map((link) => {
                        const LinkIcon = link.icon
                        return (
                            <Button key={link.label} variant="ghost" className="w-full justify-between h-auto py-2 px-3 text-left">
                                <div className="flex items-center gap-2">
                                    <LinkIcon className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm">{link.label}</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </Button>
                        )
                    })}
                </motion.div>

                {/* App Version */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
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
