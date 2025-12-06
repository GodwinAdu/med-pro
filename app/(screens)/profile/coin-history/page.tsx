"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BottomNav } from "@/components/bottom-nav"
import { PageHeader } from "@/components/page-header"
import { History, ArrowLeft, TrendingUp, TrendingDown, Coins, Calendar, X, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

interface CoinTransaction {
  _id: string
  type: 'usage' | 'purchase' | 'bonus' | 'refund'
  amount: number
  description: string
  feature?: string
  paystackReference?: string
  balanceAfter: number
  createdAt: string
}

export default function CoinHistoryPage() {
  const [transactions, setTransactions] = useState<CoinTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<CoinTransaction | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [stats, setStats] = useState({
    totalEarned: 0,
    totalSpent: 0,
    currentBalance: 0
  })
  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastTransactionRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    fetchTransactions(1)
  }, [])

  useEffect(() => {
    if (loading || loadingMore || !hasMore) return

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        fetchTransactions(page + 1)
      }
    })

    if (lastTransactionRef.current) {
      observerRef.current.observe(lastTransactionRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [loading, loadingMore, hasMore, page])

  const fetchTransactions = async (pageNum: number) => {
    try {
      if (pageNum === 1) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      const response = await fetch(`/api/coins/transactions?page=${pageNum}&limit=20`)
      if (response.ok) {
        const data = await response.json()
        
        if (pageNum === 1) {
          setTransactions(data.transactions)
        } else {
          setTransactions(prev => [...prev, ...data.transactions])
        }
        
        setStats(data.stats)
        setHasMore(data.pagination.hasMore)
        setPage(pageNum)
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'usage': return <TrendingDown className="w-4 h-4 text-red-500" />
      case 'purchase': return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'bonus': return <Coins className="w-4 h-4 text-yellow-500" />
      case 'refund': return <TrendingUp className="w-4 h-4 text-blue-500" />
      default: return <Coins className="w-4 h-4 text-gray-500" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'usage': return 'text-red-600'
      case 'purchase': return 'text-green-600'
      case 'bonus': return 'text-yellow-600'
      case 'refund': return 'text-blue-600'
      default: return 'text-gray-600'
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

  return (
    <div className="mx-auto max-w-md min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="min-h-screen bottom-nav-spacing p-4">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/profile">
            <Button variant="outline" size="sm" className="hover:bg-muted">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Credit History</h1>
            <p className="text-sm text-muted-foreground">Track your credit usage</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="p-3 text-center bg-gradient-to-br from-green-50 to-white border-green-200">
            <div className="text-lg font-bold text-green-600">{stats.totalEarned}</div>
            <div className="text-xs text-green-700">Earned</div>
          </Card>
          <Card className="p-3 text-center bg-gradient-to-br from-red-50 to-white border-red-200">
            <div className="text-lg font-bold text-red-600">{stats.totalSpent}</div>
            <div className="text-xs text-red-700">Spent</div>
          </Card>
          <Card className="p-3 text-center bg-gradient-to-br from-blue-50 to-white border-blue-200">
            <div className="text-lg font-bold text-blue-600">{stats.currentBalance}</div>
            <div className="text-xs text-blue-700">Balance</div>
          </Card>
        </div>

        {/* Transactions */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="p-4 overflow-hidden relative">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-full animate-shimmer" />
                  <div className="flex-1 space-y-2.5">
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer" style={{ animationDelay: '0.1s' }} />
                    <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-3/4 animate-shimmer" style={{ animationDelay: '0.2s' }} />
                  </div>
                  <div className="h-5 w-14 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer" style={{ animationDelay: '0.15s' }} />
                </div>
              </Card>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <Card className="p-8 text-center">
            <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Transactions Yet</h3>
            <p className="text-muted-foreground text-sm">
              Your credit transactions will appear here
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction, index) => (
              <motion.div
                key={transaction._id}
                ref={index === transactions.length - 1 ? lastTransactionRef : null}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setSelectedTransaction(transaction)}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate">
                          {transaction.description}
                        </p>
                        <span className={`font-bold text-sm ${getTransactionColor(transaction.type)}`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-muted-foreground">
                          {formatDate(transaction.createdAt)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Balance: {transaction.balanceAfter}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
            
            {loadingMore && (
              <div className="space-y-3 mt-3">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="p-4 overflow-hidden relative">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-full animate-shimmer" />
                      <div className="flex-1 space-y-2.5">
                        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer" />
                        <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-3/4 animate-shimmer" />
                      </div>
                      <div className="h-5 w-14 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer" />
                    </div>
                  </Card>
                ))}
              </div>
            )}
            
            {!hasMore && transactions.length > 0 && (
              <div className="text-center py-4 text-sm text-muted-foreground">
                No more transactions
              </div>
            )}
          </div>
        )}
      </div>

      {/* Transaction Details Modal */}
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTransaction && getTransactionIcon(selectedTransaction.type)}
              Transaction Details
            </DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getTransactionColor(selectedTransaction.type)}`}>
                  {selectedTransaction.amount > 0 ? '+' : ''}{selectedTransaction.amount} credits
                </div>
                <div className="text-sm text-muted-foreground capitalize">
                  {selectedTransaction.type}
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Description</label>
                  <p className="text-sm">{selectedTransaction.description}</p>
                </div>
                
                {selectedTransaction.feature && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Feature Used</label>
                    <p className="text-sm capitalize">{selectedTransaction.feature}</p>
                  </div>
                )}
                
                {selectedTransaction.paystackReference && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Payment Reference</label>
                    <p className="text-sm font-mono text-xs">{selectedTransaction.paystackReference}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Date & Time</label>
                  <p className="text-sm">{new Date(selectedTransaction.createdAt).toLocaleString()}</p>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Balance After</label>
                  <p className="text-sm font-medium">{selectedTransaction.balanceAfter} credits</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  )
}