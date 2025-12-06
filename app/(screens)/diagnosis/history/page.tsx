"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Stethoscope, Loader2, Trash2, AlertCircle, Calendar, Search, Filter, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { toast } from "sonner"

interface DiagnosisHistory {
  id: string
  symptoms: string
  patientAge?: string
  urgencyLevel?: 'low' | 'medium' | 'high'
  createdAt: string
  preview: string
}

export default function DiagnosisHistoryPage() {
  const router = useRouter()
  const [diagnoses, setDiagnoses] = useState<DiagnosisHistory[]>([])
  const [filteredDiagnoses, setFilteredDiagnoses] = useState<DiagnosisHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all')

  useEffect(() => {
    fetchHistory()
  }, [])

  useEffect(() => {
    let filtered = diagnoses

    if (urgencyFilter !== 'all') {
      filtered = filtered.filter(d => d.urgencyLevel === urgencyFilter)
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(d => 
        d.symptoms.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredDiagnoses(filtered)
  }, [searchQuery, urgencyFilter, diagnoses])

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/diagnosis/history')
      if (response.ok) {
        const data = await response.json()
        setDiagnoses(data.diagnoses)
        setFilteredDiagnoses(data.diagnoses)
      }
    } catch (error) {
      console.error('Failed to fetch history:', error)
      toast.error('Failed to load diagnosis history')
    } finally {
      setLoading(false)
    }
  }

  const loadDiagnosis = (diagnosisId: string) => {
    router.push(`/diagnosis?id=${diagnosisId}`)
  }

  const deleteDiagnosis = async (diagnosisId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!confirm('Delete this diagnosis? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/diagnosis/delete-history?id=${diagnosisId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setDiagnoses(prev => prev.filter(d => d.id !== diagnosisId))
        toast.success('Diagnosis deleted')
      } else {
        throw new Error('Failed to delete')
      }
    } catch (error) {
      console.error('Failed to delete diagnosis:', error)
      toast.error('Failed to delete diagnosis')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "Today"
    if (diffDays === 2) return "Yesterday"
    if (diffDays <= 7) return `${diffDays - 1} days ago`
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  const getUrgencyBadge = (level?: string) => {
    if (!level) return null
    
    const config = {
      low: { label: 'Routine', className: 'bg-green-100 text-green-700 border-green-200' },
      medium: { label: 'Moderate', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      high: { label: 'Urgent', className: 'bg-red-100 text-red-700 border-red-200' }
    }
    
    const { label, className } = config[level as keyof typeof config]
    return <Badge variant="outline" className={`text-xs ${className}`}>{label}</Badge>
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-blue-50/30 via-background to-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-sm">
        <div className="flex items-center gap-3 p-4">
          <Link href="/diagnosis">
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold">Diagnosis History</h1>
            <p className="text-xs text-muted-foreground">Your previous cases</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!loading && diagnoses.length > 0 && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by symptoms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={urgencyFilter} onValueChange={setUrgencyFilter} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="low" className="text-xs">Routine</TabsTrigger>
                <TabsTrigger value="medium" className="text-xs">Moderate</TabsTrigger>
                <TabsTrigger value="high" className="text-xs">Urgent</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filteredDiagnoses.length === 0 && diagnoses.length > 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <Filter className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">No Results Found</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Try adjusting your filters
            </p>
            <Button onClick={() => { setSearchQuery(''); setUrgencyFilter('all') }} variant="outline">
              Clear Filters
            </Button>
          </div>
        ) : diagnoses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <Stethoscope className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">No Diagnosis History</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Your diagnosis cases will appear here
            </p>
            <Link href="/diagnosis">
              <Button>Create Diagnosis</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDiagnoses.map((dx, index) => (
              <motion.div
                key={dx.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => loadDiagnosis(dx.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center flex-shrink-0">
                      <Stethoscope className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {dx.patientAge && (
                          <Badge variant="secondary" className="text-xs">
                            {dx.patientAge}y
                          </Badge>
                        )}
                        {getUrgencyBadge(dx.urgencyLevel)}
                      </div>
                      <p className="text-sm text-foreground mb-2 line-clamp-2">
                        {dx.preview}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(dx.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/diagnosis?id=${dx.id}`)
                        }}
                        className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                        title="Use as template"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => deleteDiagnosis(dx.id, e)}
                        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
