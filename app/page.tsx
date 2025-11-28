"use client"

import { motion } from "framer-motion"
import { Heart, Pill, MessageSquare, FileText, Sparkles, Activity, Stethoscope, Calendar } from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { BottomNav } from "@/components/bottom-nav"
import { useEffect, useState } from "react"
import { currentUser } from "@/lib/helpers/session"


const quickActions = [
  {
    title: "Search Drugs",
    description: "Find drug information",
    icon: Pill,
    href: "/drugs",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "AI Assistant",
    description: "Ask medical questions",
    icon: MessageSquare,
    href: "/chat",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "Prescriptions",
    description: "Manage prescriptions",
    icon: FileText,
    href: "/prescription",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    title: "Diagnosis",
    description: "AI diagnosis support",
    icon: Stethoscope,
    href: "/diagnosis",
    gradient: "from-red-500 to-orange-500",
  },
  // {
  //   title: "Scheduler",
  //   description: "Task management",
  //   icon: Calendar,
  //   href: "/scheduler",
  //   gradient: "from-indigo-500 to-purple-500",
  // },
]

const allHealthTips = [
  { icon: Activity, tip: "Stay hydrated - drink at least 8 glasses of water daily" },
  { icon: Heart, tip: "Regular exercise improves cardiovascular health" },
  { icon: Sparkles, tip: "Get 7-9 hours of quality sleep each night" },
  { icon: Activity, tip: "Take the stairs instead of elevators when possible" },
  { icon: Heart, tip: "Eat a balanced diet rich in fruits and vegetables" },
  { icon: Sparkles, tip: "Practice deep breathing exercises to reduce stress" },
  { icon: Activity, tip: "Wash your hands frequently to prevent infections" },
  { icon: Heart, tip: "Limit processed foods and added sugars" },
  { icon: Sparkles, tip: "Take regular breaks from screen time" },
  { icon: Activity, tip: "Maintain good posture while sitting and standing" },
  { icon: Heart, tip: "Schedule regular health check-ups" },
  { icon: Sparkles, tip: "Practice mindfulness and meditation" },
  { icon: Activity, tip: "Get some sunlight exposure for vitamin D" },
  { icon: Heart, tip: "Avoid smoking and limit alcohol consumption" },
  { icon: Sparkles, tip: "Keep a consistent sleep schedule" }
]

export default function HomePage() {
  const [user, setUser] = useState<{
    _id: string;
    role: string;
    fullName?: string;
    email?: string;
    profileImage?: string;
    status?: string;
    permissions?: string[];
    [key: string]: string | number | boolean | string[] | undefined;
  } | null>(null)
  const [dailyTips, setDailyTips] = useState<typeof allHealthTips>([])

  useEffect(() => {
    // Check if user is logged in
    const checkUser = async () => {
      try {
        const userData = await currentUser()
        setUser(userData)
      } catch (error) {
        setUser(null)
      }
    }
    checkUser()

    // Get daily tips based on current date
    const today = new Date()
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
    const startIndex = dayOfYear % allHealthTips.length
    const selectedTips = [
      allHealthTips[startIndex],
      allHealthTips[(startIndex + 1) % allHealthTips.length],
      allHealthTips[(startIndex + 2) % allHealthTips.length]
    ]
    setDailyTips(selectedTips)
  }, [])

  return (
    <div className="mx-auto max-w-md sm:max-w-2xl lg:max-w-4xl min-h-screen bg-gradient-to-b from-background to-muted/20 p-3 sm:p-6 lg:p-8 bottom-nav-spacing">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 pt-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-xl shadow-lg">
            <Heart className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-balance">MedPro</h1>
            <p className="text-muted-foreground">Your health companion</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <Link href={action.href}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/50">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 bg-gradient-to-br ${action.gradient} rounded-lg shadow-md`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-base">{action.title}</h3>
                          <p className="text-sm text-muted-foreground">{action.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Health Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-6"
      >
        <h2 className="text-lg font-semibold mb-3">Daily Health Tips</h2>
        <div className="space-y-2">
          {dailyTips.map((item, index) => {
            const Icon = item.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Card className="bg-gradient-to-r from-card to-muted/30">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <div className="p-1.5 bg-primary/10 rounded-md">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <p className="text-sm leading-relaxed flex-1">{item.tip}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {!user && (
        <div className="text-center mt-6">
          <Link href="/login" className="text-primary hover:underline">
            Sign in to access all features
          </Link>
        </div>
      )}
       <BottomNav />
    </div>
  )
}