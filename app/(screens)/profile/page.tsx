"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { User, Moon, Sun, Globe, Bell, Shield, Info, ChevronRight, Crown, Coins, LogOut, Edit, History, Trash2, AlertTriangle, MessageCircle, Activity, FileText, Stethoscope, ClipboardList, Pill, Download, RefreshCw, Mail, Clock } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
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
    const [isDeleting, setIsDeleting] = useState(false)
    const [deleteConfirmation, setDeleteConfirmation] = useState('')
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [stats, setStats] = useState({
        totalChats: 0,
        totalPrescriptions: 0,
        totalDiagnoses: 0,
        totalCarePlans: 0,
        totalDrugSearches: 0
    })
    const [isExporting, setIsExporting] = useState(false)

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
        
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/user/stats')
                if (response.ok) {
                    const data = await response.json()
                    setStats(data.stats)
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error)
            }
        }
        
        fetchUser()
        fetchCoinBalance()
        fetchStats()
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

    const handleDeleteAccount = async () => {
        if (deleteConfirmation !== 'DELETE') {
            toast.error('Please type DELETE to confirm')
            return
        }

        setIsDeleting(true)
        try {
            const response = await fetch('/api/user/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (response.ok) {
                toast.success('Account deleted successfully')
                await logout('/login')
            } else {
                const error = await response.json()
                toast.error(error.message || 'Failed to delete account')
            }
        } catch (error) {
            console.error('Delete account error:', error)
            toast.error('Failed to delete account')
        } finally {
            setIsDeleting(false)
            setShowDeleteDialog(false)
            setDeleteConfirmation('')
        }
    }

    const handleExportData = async () => {
        setIsExporting(true)
        try {
            const response = await fetch('/api/user/export')
            if (response.ok) {
                const blob = await response.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `medpro-data-${new Date().toISOString().split('T')[0]}.json`
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                document.body.removeChild(a)
                toast.success('Data exported successfully')
            } else {
                toast.error('Failed to export data')
            }
        } catch (error) {
            toast.error('Failed to export data')
        } finally {
            setIsExporting(false)
        }
    }

    const quickActions = [
        { label: "New Chat", icon: MessageCircle, href: "/chat", color: "bg-blue-500" },
        { label: "Diagnosis", icon: Stethoscope, href: "/diagnosis", color: "bg-green-500" },
        { label: "Prescription", icon: FileText, href: "/prescription", color: "bg-purple-500" },
        { label: "Care Plan", icon: ClipboardList, href: "/care-plan", color: "bg-orange-500" },
    ]

    const accountLinks = [
        { label: "Edit Profile", icon: Edit, href: "/profile/edit" },
        { label: "Credit Usage History", icon: History, href: "/profile/coin-history" },
        { label: "Referral Program", icon: User, href: "/referral" },
    ]

    const infoLinks = [
        { label: "Privacy Policy", icon: Shield, href: "/privacy" },
        { label: "Terms of Service", icon: Info, href: "/terms" },
        { label: "Send Feedback", icon: MessageCircle, href: "/feedback" },
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
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                                            <User className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-lg font-bold">{user?.fullName || 'User'}</h2>
                                            <p className="text-xs opacity-90">{user?.role || 'Healthcare Professional'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 text-xs opacity-90">
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-3 h-3" />
                                            <span>{user?.email || 'email@example.com'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3 h-3" />
                                            <span>Last login: {new Date(user?.lastLogin || Date.now()).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Quick Actions */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-4">
                    <Card>
                        <CardContent className="p-4">
                            <h3 className="font-semibold mb-3 text-sm">Quick Actions</h3>
                            <div className="grid grid-cols-4 gap-2">
                                {quickActions.map((action) => {
                                    const ActionIcon = action.icon
                                    return (
                                        <Link key={action.label} href={action.href}>
                                            <div className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                                                <div className={`w-10 h-10 ${action.color} rounded-full flex items-center justify-center`}>
                                                    <ActionIcon className="w-5 h-5 text-white" />
                                                </div>
                                                <span className="text-xs text-center">{action.label}</span>
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Usage Statistics */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-4">
                    <Card>
                        <CardContent className="p-4">
                            <h3 className="font-semibold mb-3 text-sm flex items-center gap-2">
                                <Activity className="w-4 h-4" />
                                Your Activity
                            </h3>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="text-center p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                                    <div className="text-lg font-bold text-blue-600">{stats.totalChats}</div>
                                    <div className="text-xs text-muted-foreground">Chats</div>
                                </div>
                                <div className="text-center p-2 bg-green-50 dark:bg-green-950 rounded-lg">
                                    <div className="text-lg font-bold text-green-600">{stats.totalDiagnoses}</div>
                                    <div className="text-xs text-muted-foreground">Diagnoses</div>
                                </div>
                                <div className="text-center p-2 bg-purple-50 dark:bg-purple-950 rounded-lg">
                                    <div className="text-lg font-bold text-purple-600">{stats.totalPrescriptions}</div>
                                    <div className="text-xs text-muted-foreground">Prescriptions</div>
                                </div>
                                <div className="text-center p-2 bg-orange-50 dark:bg-orange-950 rounded-lg">
                                    <div className="text-lg font-bold text-orange-600">{stats.totalCarePlans}</div>
                                    <div className="text-xs text-muted-foreground">Care Plans</div>
                                </div>
                                <div className="text-center p-2 bg-pink-50 dark:bg-pink-950 rounded-lg">
                                    <div className="text-lg font-bold text-pink-600">{stats.totalDrugSearches}</div>
                                    <div className="text-xs text-muted-foreground">Drug Searches</div>
                                </div>
                                <div className="text-center p-2 bg-gray-50 dark:bg-gray-950 rounded-lg">
                                    <div className="text-lg font-bold text-gray-600">{stats.totalChats + stats.totalDiagnoses + stats.totalPrescriptions + stats.totalCarePlans + stats.totalDrugSearches}</div>
                                    <div className="text-xs text-muted-foreground">Total</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Coin Balance Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-4">
                    <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 border-yellow-200 dark:border-yellow-800">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center">
                                        <Coins className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">Credit Balance</h3>
                                        <p className="text-md md:text-2xl font-bold text-yellow-800 dark:text-yellow-200">{coinBalance} credits</p>
                                    </div>
                                </div>
                                <Link href="/coins">
                                    <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white">
                                        <Coins className="w-4 h-4 mr-1" />
                                        Buy Credits
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
                                transition={{ delay: 0.3 + sectionIndex * 0.1 }}
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
                    transition={{ delay: 0.6 }}
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

                {/* Data Export */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="mt-4"
                >
                    <Button 
                        onClick={handleExportData}
                        disabled={isExporting}
                        variant="outline" 
                        className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                        {isExporting ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                <span>Exporting...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                <span>Export My Data</span>
                            </div>
                        )}
                    </Button>
                </motion.div>

                {/* Info Links */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.75 }}
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
                    transition={{ delay: 0.8 }}
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

                {/* Delete Account */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.85 }}
                    className="mt-3"
                >
                    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                        <DialogTrigger asChild>
                            <Button 
                                variant="ghost" 
                                className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 border border-red-200"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Account
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-red-600">
                                    <AlertTriangle className="w-5 h-5" />
                                    Delete Account
                                </DialogTitle>
                                <DialogDescription className="text-left">
                                    This action cannot be undone. This will permanently delete your account, 
                                    all your medical data, prescriptions, care plans, and coin balance.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <p className="text-sm text-red-800 font-medium mb-2">What will be deleted:</p>
                                    <ul className="text-xs text-red-700 space-y-1">
                                        <li>• All medical records and chat history</li>
                                        <li>• Prescriptions and care plans</li>
                                        <li>• Credit balance ({coinBalance} credits)</li>
                                        <li>• Account preferences and settings</li>
                                    </ul>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">
                                        Type <span className="font-bold text-red-600">DELETE</span> to confirm:
                                    </label>
                                    <Input
                                        value={deleteConfirmation}
                                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                                        placeholder="Type DELETE here"
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                            <DialogFooter className="gap-2">
                                <Button 
                                    variant="outline" 
                                    onClick={() => {
                                        setShowDeleteDialog(false)
                                        setDeleteConfirmation('')
                                    }}
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    variant="destructive" 
                                    onClick={handleDeleteAccount}
                                    disabled={isDeleting || deleteConfirmation !== 'DELETE'}
                                >
                                    {isDeleting ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>Deleting...</span>
                                        </div>
                                    ) : (
                                        'Delete Account'
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </motion.div>

                {/* App Version */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className="mt-6 text-center text-xs text-muted-foreground"
                >
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <p>MedPro v1.0.0</p>
                        <RefreshCw className="w-3 h-3 text-green-600" />
                        <span className="text-green-600 font-medium">Up to date</span>
                    </div>
                    <p className="text-xs mt-1">Built with Love ❤️</p>
                </motion.div>
            </div>

            <BottomNav />
        </div>
    )
}
