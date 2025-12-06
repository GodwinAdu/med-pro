"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Pill, Loader2, Trash2, Shield, Calculator, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { toast } from "sonner"

interface DrugSearchHistory {
  id: string
  searchType: 'drug-info' | 'interaction' | 'dosage'
  drugName: string
  searchedAt: string
  preview: string
}

export default function DrugHistoryPage() {
  const router = useRouter()
  const [searches, setSearches] = useState<DrugSearchHistory[]>([])
  const [filteredSearches, setFilteredSearches] = useState<DrugSearchHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchFilter, setSearchFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/drugs/history')
      if (response.ok) {
        const data = await response.json()
        setSearches(data.searches)
        setFilteredSearches(data.searches)
      }
    } catch (error) {
      console.error('Failed to fetch history:', error)
      toast.error('Failed to load search history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let filtered = searches

    if (typeFilter !== 'all') {
      filtered = filtered.filter(s => s.searchType === typeFilter)
    }

    if (searchFilter.trim()) {
      filtered = filtered.filter(s => 
        s.drugName.toLowerCase().includes(searchFilter.toLowerCase())
      )
    }

    setFilteredSearches(filtered)
  }, [searchFilter, typeFilter, searches])

  const loadSearch = async (searchId: string) => {
    try {
      const response = await fetch(`/api/drugs/get?id=${searchId}`)
      if (response.ok) {
        const data = await response.json()
        router.push(`/drugs?search=${searchId}`)
      }
    } catch (error) {
      console.error('Failed to load search:', error)
      toast.error('Failed to load search')
    }
  }

  const deleteSearch = async (searchId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!confirm('Delete this search? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/drugs/delete-history?id=${searchId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSearches(prev => prev.filter(s => s.id !== searchId))
        toast.success('Search deleted')
      } else {
        throw new Error('Failed to delete')
      }
    } catch (error) {
      console.error('Failed to delete search:', error)
      toast.error('Failed to delete search')
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

  const getIcon = (type: string) => {
    switch (type) {
      case 'drug-info': return <Pill className="w-5 h-5 text-white" />
      case 'interaction': return <Shield className="w-5 h-5 text-white" />
      case 'dosage': return <Calculator className="w-5 h-5 text-white" />
      default: return <Pill className="w-5 h-5 text-white" />
    }
  }

  const getColor = (type: string) => {
    switch (type) {
      case 'drug-info': return 'from-blue-600 to-blue-500'
      case 'interaction': return 'from-orange-600 to-orange-500'
      case 'dosage': return 'from-green-600 to-green-500'
      default: return 'from-blue-600 to-blue-500'
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-blue-50/30 via-background to-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-sm">
        <div className="flex items-center gap-3 p-4">
          <Link href="/drugs">
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold">Search History</h1>
            <p className="text-xs text-muted-foreground">Your previous drug searches</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!loading && searches.length > 0 && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by drug name..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={typeFilter} onValueChange={setTypeFilter} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="drug-info" className="text-xs">Info</TabsTrigger>
                <TabsTrigger value="interaction" className="text-xs">Interactions</TabsTrigger>
                <TabsTrigger value="dosage" className="text-xs">Dosage</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filteredSearches.length === 0 && searches.length > 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <Filter className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">No Results Found</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Try adjusting your filters
            </p>
            <Button onClick={() => { setSearchFilter(''); setTypeFilter('all') }} variant="outline">
              Clear Filters
            </Button>
          </div>
        ) : searches.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <Pill className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">No Search History</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Your drug searches will appear here
            </p>
            <Link href="/drugs">
              <Button>Search Drugs</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSearches.map((search, index) => (
              <motion.div
                key={search.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => loadSearch(search.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getColor(search.searchType)} flex items-center justify-center flex-shrink-0`}>
                      {getIcon(search.searchType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-sm truncate">
                          {search.drugName}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {search.searchType === 'drug-info' ? 'Info' : search.searchType === 'interaction' ? 'Interaction' : 'Dosage'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mb-2">
                        {search.preview}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{formatDate(search.searchedAt)}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => deleteSearch(search.id, e)}
                      className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
