"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, FileText, Loader2, Trash2, CheckCircle, AlertTriangle, User, Calendar, Search, Filter, Download, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { toast } from "sonner"

interface PrescriptionHistory {
  id: string
  patientName: string
  patientAge?: string
  diagnosis?: string
  medicationCount: number
  validationStatus?: 'safe' | 'warning' | 'danger'
  createdAt: string
  preview: string
}

export default function PrescriptionHistoryPage() {
  const router = useRouter()
  const [prescriptions, setPrescriptions] = useState<PrescriptionHistory[]>([])
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<PrescriptionHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/prescription/history')
      if (response.ok) {
        const data = await response.json()
        setPrescriptions(data.prescriptions)
        setFilteredPrescriptions(data.prescriptions)
      }
    } catch (error) {
      console.error('Failed to fetch history:', error)
      toast.error('Failed to load prescription history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let filtered = prescriptions

    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.validationStatus === statusFilter)
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(p => 
        p.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredPrescriptions(filtered)
  }, [searchQuery, statusFilter, prescriptions])

  const loadPrescription = async (prescriptionId: string) => {
    router.push(`/prescription?id=${prescriptionId}`)
  }

  const deletePrescription = async (prescriptionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!confirm('Delete this prescription? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/prescription/delete-history?id=${prescriptionId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setPrescriptions(prev => prev.filter(p => p.id !== prescriptionId))
        toast.success('Prescription deleted')
      } else {
        throw new Error('Failed to delete')
      }
    } catch (error) {
      console.error('Failed to delete prescription:', error)
      toast.error('Failed to delete prescription')
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

  const getStatusBadge = (status?: string) => {
    if (!status) return null
    
    const config = {
      safe: { label: 'Safe', className: 'bg-green-100 text-green-700 border-green-200' },
      warning: { label: 'Review', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      danger: { label: 'Caution', className: 'bg-red-100 text-red-700 border-red-200' }
    }
    
    const { label, className } = config[status as keyof typeof config]
    return <Badge variant="outline" className={`text-xs ${className}`}>{label}</Badge>
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-blue-50/30 via-background to-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-sm">
        <div className="flex items-center gap-3 p-4">
          <Link href="/prescription">
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold">Prescription History</h1>
            <p className="text-xs text-muted-foreground">Your previous prescriptions</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!loading && prescriptions.length > 0 && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by patient name or diagnosis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="safe" className="text-xs">Safe</TabsTrigger>
                <TabsTrigger value="warning" className="text-xs">Review</TabsTrigger>
                <TabsTrigger value="danger" className="text-xs">Caution</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filteredPrescriptions.length === 0 && prescriptions.length > 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <Filter className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">No Results Found</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Try adjusting your filters
            </p>
            <Button onClick={() => { setSearchQuery(''); setStatusFilter('all') }} variant="outline">
              Clear Filters
            </Button>
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <FileText className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">No Prescription History</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Your prescriptions will appear here
            </p>
            <Link href="/prescription">
              <Button>Create Prescription</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPrescriptions.map((rx, index) => (
              <motion.div
                key={rx.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => loadPrescription(rx.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-sm truncate">
                          {rx.patientName}
                        </h3>
                        {rx.patientAge && (
                          <Badge variant="secondary" className="text-xs">
                            {rx.patientAge}y
                          </Badge>
                        )}
                        {getStatusBadge(rx.validationStatus)}
                      </div>
                      {rx.diagnosis && (
                        <p className="text-xs text-muted-foreground mb-1">
                          {rx.diagnosis}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground truncate mb-2">
                        {rx.preview}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(rx.createdAt)}
                        </span>
                        <span>•</span>
                        <span>{rx.medicationCount} medication{rx.medicationCount !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/prescription?id=${rx.id}&duplicate=true`)
                        }}
                        className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => deletePrescription(rx.id, e)}
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
