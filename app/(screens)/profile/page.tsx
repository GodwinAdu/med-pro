"use client"

import { useState } from "react"
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

export default function ProfilePage() {
    const { theme, setTheme } = useTheme()
    const [language, setLanguage] = useState("en")
    const [notifications, setNotifications] = useState(true)

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
        <div className="mx-auto max-w-md min-h-screen bg-gradient-to-b from-background to-muted/20">
            <div className="min-h-screen bottom-nav-spacing p-6">
                <PageHeader
                    title="Profile"
                    subtitle="Manage your settings and preferences"
                    icon={<User className="w-6 h-6" />}
                />

                {/* User Profile Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                    <Card className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                                        <User className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">Guest User</h2>
                                        <p className="text-sm opacity-90">Free Plan</p>
                                    </div>
                                </div>
                                <Link href="/pricing">
                                    <Button size="sm" variant="secondary" className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-0">
                                        <Crown className="w-4 h-4 mr-2" />
                                        Upgrade
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Upgrade Banner */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
                    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                                        <Crown className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm">Unlock Premium Features</h3>
                                        <p className="text-xs text-muted-foreground">AI Chat, Advanced Analytics & More</p>
                                    </div>
                                </div>
                                <Link href="/pricing">
                                    <Button size="sm" className="h-8">
                                        View Plans
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Settings Sections */}
                <div className="space-y-4">
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
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <SectionIcon className="w-5 h-5 text-primary" />
                                            {section.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {section.items.map((item, itemIndex) => (
                                            <div key={itemIndex} className="flex items-center justify-between gap-4">
                                                <div className="flex-1">
                                                    <Label htmlFor={`setting-${sectionIndex}-${itemIndex}`} className="font-medium">
                                                        {item.label}
                                                    </Label>
                                                    <p className="text-sm text-muted-foreground">{item.description}</p>
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
                                                        <SelectTrigger className="w-[140px]">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {item.options?.map((option) => (
                                                                <SelectItem key={option.value} value={option.value}>
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
                    className="mt-6 space-y-2"
                >
                    {infoLinks.map((link) => {
                        const LinkIcon = link.icon
                        return (
                            <Button key={link.label} variant="ghost" className="w-full justify-between h-auto py-3 px-4 text-left">
                                <div className="flex items-center gap-3">
                                    <LinkIcon className="w-4 h-4 text-muted-foreground" />
                                    <span>{link.label}</span>
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
                    className="mt-8 text-center text-sm text-muted-foreground"
                >
                    <p>Doctor Assistance v1.0.0</p>
                    <p className="text-xs mt-1">Built with Next.js & AI</p>
                </motion.div>
            </div>

            <BottomNav />
        </div>
    )
}
