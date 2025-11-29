"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BottomNav } from "@/components/bottom-nav"
import { PageHeader } from "@/components/page-header"
import { History, ArrowLeft, TrendingUp, TrendingDown, Coins, Calendar } from "lucide-react"
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
  const [stats, setStats] = useState({
    totalEarned: 0,
    totalSpent: 0,
    currentBalance: 0
  })

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/coins/transactions')
      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    } finally {
      setLoading(false)
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
            <h1 className="text-xl font-bold">Coin History</h1>
            <p className="text-sm text-muted-foreground">Track your coin usage</p>
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
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
                  </div>
                  <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
                </div>
              </Card>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <Card className="p-8 text-center">
            <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Transactions Yet</h3>
            <p className="text-muted-foreground text-sm">
              Your coin transactions will appear here
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction, index) => (
              <motion.div
                key={transaction._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-4">
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
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}