"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BottomNav } from "@/components/bottom-nav"
import { PageHeader } from "@/components/page-header"
import { ClipboardList, Calendar, User, FileText, Eye, Plus, Loader2, Search, Filter, Clock, Activity, AlertCircle, Trash2, Download, Copy, Edit } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { AudioPlayer } from "@/components/audio-player"
import { generateCarePlanPDF } from "@/lib/pdf-generator"

interface SavedCarePlan {
  _id: string
  patientName: string
  patientAge?: string
  diagnosis: string
  problems?: any[]
  status: "active" | "completed" | "cancelled"
  createdAt: string
}

export default function CarePlansPage() {
  const [carePlans, setCarePlans] = useState<SavedCarePlan[]>([])
  const [filteredPlans, setFilteredPlans] = useState<SavedCarePlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<SavedCarePlan | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    fetchCarePlans()
  }, [])

  useEffect(() => {
    filterAndSortPlans()
  }, [carePlans, searchQuery, statusFilter, sortBy])

  const fetchCarePlans = async () => {
    try {
      const response = await fetch('/api/care-plan/list')
      
      if (!response.ok) {
        throw new Error('Failed to fetch care plans')
      }

      const data = await response.json()
      console.log('Fetched care plans:', data.carePlans) // Debug log
      setCarePlans(data.carePlans)
    } catch (error) {
      console.error('Fetch error:', error)
      toast.error("Failed to load care plans")
    } finally {
      setIsLoading(false)
    }
  }

  const deletePlan = async (planId: string, patientName: string) => {
    if (!confirm(`Delete care plan for ${patientName}?`)) return
    
    try {
      const response = await fetch(`/api/care-plan/delete?id=${planId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete care plan')
      }
      
      setCarePlans(prev => prev.filter(plan => plan._id !== planId))
      toast.success('Care plan deleted successfully')
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete care plan')
    }
  }

  const exportToPDF = async () => {
    if (!selectedPlan) return
    
    setIsExporting(true)
    try {
      await generateCarePlanPDF({
        patientName: selectedPlan.patientName,
        patientAge: selectedPlan.patientAge || '',
        diagnosis: selectedPlan.diagnosis,
        problems: selectedPlan.problems || [],
        createdAt: selectedPlan.createdAt
      })
      toast.success('Care plan exported successfully')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export care plan')
    } finally {
      setIsExporting(false)
    }
  }

  const filterAndSortPlans = () => {
    let filtered = carePlans.filter(plan => {
      const matchesSearch = plan.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           plan.diagnosis.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" || plan.status === statusFilter
      return matchesSearch && matchesStatus
    })

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "name":
          return a.patientName.localeCompare(b.patientName)
        default:
          return 0
      }
    })

    setFilteredPlans(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Activity className="w-3 h-3" />
      case 'completed': return <ClipboardList className="w-3 h-3" />
      case 'cancelled': return <Clock className="w-3 h-3" />
      default: return null
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

  const getStatsSummary = () => {
    const total = carePlans.length
    const active = carePlans.filter(p => p.status === 'active').length
    const completed = carePlans.filter(p => p.status === 'completed').length
    return { total, active, completed }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="min-h-screen bottom-nav-spacing p-4 lg:p-8">
          <PageHeader
            title="Care Plans"
            subtitle="View saved care plans"
            icon={<ClipboardList className="w-6 h-6" />}
          />
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-muted-foreground">Loading care plans...</p>
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
    )
  }

  if (selectedPlan) {
    console.log('Selected plan problems:', selectedPlan.problems) // Debug log
    
    return (
      <div className="mx-auto max-w-4xl min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="min-h-screen bottom-nav-spacing p-4 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedPlan(null)}
              className="hover:bg-muted"
            >
              ← Back to Plans
            </Button>
            <div>
              <h1 className="text-xl font-bold">{selectedPlan.patientName}</h1>
              <p className="text-sm text-muted-foreground">Care Plan Details</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Patient Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6 border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-blue-900">Patient Information</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{selectedPlan.patientName}</span>
                  </div>
                  {selectedPlan.patientAge && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Age:</span>
                      <span className="font-medium">{selectedPlan.patientAge}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge className={`${getStatusColor(selectedPlan.status)} flex items-center gap-1`}>
                      {getStatusIcon(selectedPlan.status)}
                      {selectedPlan.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span className="font-medium">{formatDate(selectedPlan.createdAt)}</span>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Diagnosis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 border-2 border-red-100 bg-gradient-to-br from-red-50 to-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-red-900">Primary Diagnosis</h3>
                </div>
                <p className="text-sm leading-relaxed">{selectedPlan.diagnosis}</p>
              </Card>
            </motion.div>

            {/* Problems and Care Plan */}
            {selectedPlan.problems && selectedPlan.problems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="lg:col-span-2"
              >
                <div className="space-y-4">
                  {selectedPlan.problems.map((problem: any, index: number) => (
                    <Card key={index} className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                          <span className="text-white text-sm font-bold">{problem.number}</span>
                        </div>
                        <h3 className="text-lg font-semibold">{problem.problem}</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-blue-600 mb-2">Nursing Diagnosis</h4>
                          <AudioPlayer text={`Problem ${problem.number}: ${problem.problem}. Nursing Diagnosis: ${problem.nursingDiagnosis}. Short-term goal: ${problem.goals.shortTerm}. Long-term goal: ${problem.goals.longTerm}. Interventions: ${problem.interventions.join(', ')}. Rationale: ${problem.rationale.join(', ')}. Evaluation: ${problem.evaluation.join(', ')}.`} />
                          <p className="text-sm bg-blue-50 p-3 rounded-lg border-l-4 border-blue-200">{problem.nursingDiagnosis}</p>
                        </div>
                        
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <h4 className="font-semibold text-green-600 mb-2">Goals</h4>
                            <div className="space-y-2">
                              <div className="bg-green-50 p-3 rounded-lg">
                                <div className="font-medium text-xs text-green-700">Short-term:</div>
                                <div className="text-sm">{problem.goals.shortTerm}</div>
                              </div>
                              <div className="bg-green-50 p-3 rounded-lg">
                                <div className="font-medium text-xs text-green-700">Long-term:</div>
                                <div className="text-sm">{problem.goals.longTerm}</div>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-purple-600 mb-2">Interventions</h4>
                            <ul className="space-y-1">
                              {problem.interventions.map((intervention: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                  <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0"></span>
                                  {intervention}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <h4 className="font-semibold text-orange-600 mb-2">Rationale</h4>
                            <ul className="space-y-1">
                              {problem.rationale.map((rationale: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                  <span className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0"></span>
                                  {rationale}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-red-600 mb-2">Evaluation</h4>
                            <ul className="space-y-1">
                              {problem.evaluation.map((evaluation: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                  <span className="w-1.5 h-1.5 bg-red-600 rounded-full mt-2 flex-shrink-0"></span>
                                  {evaluation}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}
            
            {/* Export Button */}
            <div className="lg:col-span-2 pt-4">
              <Button 
                onClick={exportToPDF}
                disabled={isExporting}
                className="w-full bg-red-600 hover:bg-red-700 h-12"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Export Care Plan as PDF
              </Button>
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
    )
  }

  const stats = getStatsSummary()

  return (
    <div className="mx-auto max-w-6xl min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="min-h-screen bottom-nav-spacing p-4 lg:p-8">
        <div className="mb-6">
          <PageHeader
            title="Care Plans"
            subtitle="Manage and view patient care plans"
            icon={<ClipboardList className="w-6 h-6" />}
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="p-4 text-center bg-blue-50">
            <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-xs text-muted-foreground font-medium">Total Plans</div>
          </Card>
          <Card className="p-4 text-center bg-green-50">
            <div className="text-3xl font-bold text-green-600">{stats.active}</div>
            <div className="text-xs text-muted-foreground font-medium">Active</div>
          </Card>
          <Card className="p-4 text-center bg-purple-50">
            <div className="text-3xl font-bold text-purple-600">{stats.completed}</div>
            <div className="text-xs text-muted-foreground font-medium">Completed</div>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search patients or diagnosis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* New Care Plan Button */}
        <Link href="/care-plan">
          <Button className="w-full mb-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-md">
            <Plus className="w-4 h-4 mr-2" />
            Create New Care Plan
          </Button>
        </Link>

        {filteredPlans.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <ClipboardList className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">
              {carePlans.length === 0 ? "No Care Plans Yet" : "No Plans Found"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {carePlans.length === 0 
                ? "Create your first comprehensive care plan to get started with patient management"
                : "Try adjusting your search or filter criteria"
              }
            </p>
            {carePlans.length === 0 && (
              <Link href="/care-plan">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Care Plan
                </Button>
              </Link>
            )}
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {filteredPlans.map((plan, index) => (
                <motion.div
                  key={plan._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-5 hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 hover:border-blue-200 bg-white">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg group-hover:text-blue-600 transition-colors">
                          {plan.patientName}
                        </h3>
                        <Badge className={`${getStatusColor(plan.status)} flex items-center gap-1 w-fit mt-2`}>
                          {getStatusIcon(plan.status)}
                          <span className="text-xs font-medium">{plan.status}</span>
                        </Badge>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPlan(plan)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-50 hover:bg-blue-100 text-blue-600 h-7 w-7 p-0"
                          title="View"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            deletePlan(plan._id, plan.patientName)
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-50 hover:bg-red-100 text-red-600 h-7 w-7 p-0"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground line-clamp-2">{plan.diagnosis}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{formatDate(plan.createdAt)}</span>
                      </div>
                      
                      {plan.patientAge && (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{plan.patientAge}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPlan(plan)}
                        className="flex-1 group-hover:bg-blue-50 group-hover:border-blue-200 group-hover:text-blue-600 transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          deletePlan(plan._id, plan.patientName)
                        }}
                        className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 px-2"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}