"use client"

import { motion } from "framer-motion"
import { Heart, Pill, MessageSquare, FileText, Sparkles, Activity, Stethoscope, Calendar, ClipboardList, Gift, X, StickyNote, Plus, Save } from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { BottomNav } from "@/components/bottom-nav"
import { EmergencyMode } from "@/components/emergency-mode"
import { useEffect, useState } from "react"
import { currentUser } from "@/lib/helpers/session"
import { toast } from "sonner"
import { useNotesStore } from "@/lib/stores/notes-store"


const quickActions = [
  {
    title: "Nurses/Doctors Notes",
    description: "Add clinical notes",
    icon: StickyNote,
    href: "/notes",
    gradient: "from-yellow-500 to-orange-500",
  },
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
  {
    title: "Care Plan",
    description: "Create treatment plans",
    icon: ClipboardList,
    href: "/care-plan",
    gradient: "from-teal-500 to-blue-500",
  },
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
  const [canClaimBonus, setCanClaimBonus] = useState(false)
  const [showBonusNotification, setShowBonusNotification] = useState(false)
  const { notes, addNote, deleteNote } = useNotesStore()
  const [newNote, setNewNote] = useState('')
  const [newNoteTitle, setNewNoteTitle] = useState('')
  const [showAddNote, setShowAddNote] = useState(false)

  useEffect(() => {
    // Check if user is logged in and can claim bonus
    const checkUser = async () => {
      try {
        const userData = await currentUser()
        setUser(userData)
        
        if (userData) {
          // Check if user can claim daily bonus
          const response = await fetch('/api/coins/balance')
          if (response.ok) {
            const data = await response.json()
            setCanClaimBonus(data.canClaimDailyBonus)
            setShowBonusNotification(data.canClaimDailyBonus)
          }
        }
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

  const saveNote = () => {
    if (!newNote.trim()) return
    
    addNote(newNoteTitle, newNote)
    
    setNewNote('')
    setNewNoteTitle('')
    setShowAddNote(false)
    toast.success('Note saved successfully')
  }

  const handleDeleteNote = (id: string) => {
    deleteNote(id)
    toast.success('Note deleted')
  }

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

      {/* Daily Bonus Notification */}
      {user && showBonusNotification && canClaimBonus && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center animate-pulse">
                    <Gift className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-yellow-900">Daily Bonus Available!</h3>
                    <p className="text-sm text-yellow-700">Claim your free 2 coins today</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/coins/daily-bonus', {
                          method: 'POST'
                        })
                        const data = await response.json()
                        if (data.success) {
                          toast.success(data.message)
                          setShowBonusNotification(false)
                          setCanClaimBonus(false)
                        } else {
                          toast.error(data.message)
                        }
                      } catch (error) {
                        toast.error('Failed to claim bonus')
                      }
                    }}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    Claim
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowBonusNotification(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

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

      {/* Quick Notes */}
      {user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <StickyNote className="w-5 h-5 text-primary" />
              Quick Notes
            </h2>
            <div className="flex gap-2">
              <Link href="/notes">
                <Button size="sm" variant="outline">
                  View All
                </Button>
              </Link>
              <Button
                size="sm"
                onClick={() => setShowAddNote(!showAddNote)}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Note
              </Button>
            </div>
          </div>

          {/* Add Note Form */}
          {showAddNote && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4"
            >
              <Card className="border-2 border-primary/20">
                <CardContent className="p-4 space-y-3">
                  <Input
                    placeholder="Clinical note title (optional)"
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    className="border-2 focus:border-primary"
                  />
                  <Textarea
                    placeholder="Write your clinical note here... (patient observations, assessments, care instructions, etc.)"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="min-h-[100px] border-2 focus:border-primary resize-none"
                  />
                  <div className="flex gap-2">
                    <Button onClick={saveNote} size="sm" className="flex-1">
                      <Save className="w-4 h-4 mr-1" />
                      Save Note
                    </Button>
                    <Button 
                      onClick={() => {
                        setShowAddNote(false)
                        setNewNote('')
                        setNewNoteTitle('')
                      }} 
                      variant="outline" 
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Notes List */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {notes.length === 0 ? (
              <Card className="bg-muted/30">
                <CardContent className="p-4 text-center">
                  <StickyNote className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No clinical notes yet. Add your first note to keep track of patient observations and care instructions.
                  </p>
                </CardContent>
              </Card>
            ) : (
              notes.map((note, index) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-yellow-900 truncate">
                            {note.title}
                          </h4>
                          <p className="text-sm text-yellow-800 mt-1 line-clamp-2">
                            {note.content}
                          </p>
                          <p className="text-xs text-yellow-600 mt-2">
                            {note.timestamp}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-yellow-700 hover:text-red-600 hover:bg-red-50 p-1 h-auto"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      )}

      {/* Health Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
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
                transition={{ delay: 0.7 + index * 0.1 }}
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
      <EmergencyMode />
    </div>
  )
}