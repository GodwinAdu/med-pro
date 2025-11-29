"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BottomNav } from "@/components/bottom-nav"
import { PageHeader } from "@/components/page-header"
import { Coins, Zap, Star, Loader2, Gift } from "lucide-react"
import { toast } from "sonner"

interface CoinPackage {
  id: string
  name: string
  coins: number
  price: string
  priceValue: number
  bonus: string
  popular?: boolean
  features: string[]
}

const packages: CoinPackage[] = [
  {
    id: "starter",
    name: "Starter Pack",
    coins: 100,
    price: "₵20",
    priceValue: 20,
    bonus: "Perfect for trying out",
    features: [
      "20 Chat messages",
      "50 Drug searches", 
      "12 Prescription validations",
      "6 Care plans"
    ]
  },
  {
    id: "value",
    name: "Value Pack",
    coins: 300,
    price: "₵50",
    priceValue: 50,
    bonus: "20% bonus coins",
    popular: true,
    features: [
      "60 Chat messages",
      "150 Drug searches",
      "37 Prescription validations", 
      "20 Care plans"
    ]
  },
  {
    id: "pro",
    name: "Pro Pack",
    coins: 1000,
    price: "₵120",
    priceValue: 120,
    bonus: "66% bonus coins",
    features: [
      "200 Chat messages",
      "500 Drug searches",
      "125 Prescription validations",
      "66 Care plans"
    ]
  }
]

const FEATURE_COSTS = {
  chat: 5,
  'drug-search': 2,
  prescription: 8,
  'care-plan': 15
}

export default function CoinsPage() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState<string | null>(null)
  const [coinBalance, setCoinBalance] = useState<number>(0)
  const [canClaimBonus, setCanClaimBonus] = useState(false)
  const [claimingBonus, setClaimingBonus] = useState(false)
  const [customAmount, setCustomAmount] = useState<string>('')
  const [calculatedCoins, setCalculatedCoins] = useState<number>(0)
  const [verifyReference, setVerifyReference] = useState<string>('')
  const [isVerifying, setIsVerifying] = useState(false)

  useEffect(() => {
    fetchBalance()
    
    // Check for payment callback with reference
    const reference = searchParams.get('reference')
    const trxref = searchParams.get('trxref')
    const paymentRef = reference || trxref
    
    if (paymentRef && paymentRef.startsWith('coin_')) {
      // Automatically verify payment
      verifyPaymentCallback(paymentRef)
    } else if (searchParams.get('success') === 'true') {
      toast.success('Payment completed! Your coins will be added shortly.')
      // Remove the success parameter from URL
      window.history.replaceState({}, '', '/coins')
    }
  }, [searchParams])

  const fetchBalance = async () => {
    try {
      const response = await fetch('/api/coins/balance')
      if (response.ok) {
        const data = await response.json()
        setCoinBalance(data.coinBalance)
        setCanClaimBonus(data.canClaimDailyBonus)
      }
    } catch (error) {
      console.error('Balance fetch error:', error)
    }
  }

  const handlePurchase = async (packageId: string) => {
    setLoading(packageId)

    try {
      const response = await fetch('/api/coins/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packageType: packageId })
      })

      if (!response.ok) {
        throw new Error('Failed to initialize payment')
      }

      const data = await response.json()
      window.location.href = data.authorizationUrl

    } catch (error) {
      console.error('Purchase error:', error)
      toast.error("Failed to start payment")
    } finally {
      setLoading(null)
    }
  }

  const handleCustomPurchase = async (amount: number) => {
    setLoading('custom')

    try {
      const response = await fetch('/api/coins/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          packageType: 'custom',
          amount: amount,
          coins: Math.floor(amount * 4)
        })
      })

      if (!response.ok) {
        throw new Error('Failed to initialize payment')
      }

      const data = await response.json()
      window.location.href = data.authorizationUrl

    } catch (error) {
      console.error('Purchase error:', error)
      toast.error("Failed to start payment")
    } finally {
      setLoading(null)
    }
  }

  const claimDailyBonus = async () => {
    setClaimingBonus(true)
    
    try {
      const response = await fetch('/api/coins/daily-bonus', {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success(data.message)
        fetchBalance()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error("Failed to claim bonus")
    } finally {
      setClaimingBonus(false)
    }
  }

  const verifyPaymentCallback = async (reference: string) => {
    try {
      const response = await fetch('/api/coins/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message)
        fetchBalance()
      } else {
        toast.error('Payment verification failed. Please use manual verification below.')
      }
    } catch (error) {
      toast.error('Payment verification failed. Please use manual verification below.')
    } finally {
      // Clean up URL
      window.history.replaceState({}, '', '/coins')
    }
  }

  const verifyPayment = async () => {
    if (!verifyReference.trim()) {
      toast.error('Please enter payment reference')
      return
    }

    setIsVerifying(true)
    try {
      const response = await fetch('/api/coins/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: verifyReference.trim() })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message)
        setVerifyReference('')
        fetchBalance()
      } else {
        toast.error(data.error || 'Verification failed')
      }
    } catch (error) {
      toast.error('Verification failed')
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="mx-auto max-w-md min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="min-h-screen bottom-nav-spacing p-4">
        <PageHeader
          title="Buy Coins"
          subtitle="Pay only for what you use"
          icon={<Coins className="w-6 h-6" />}
        />

        {/* Current Balance */}
        <Card className="p-4 mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center">
                <Coins className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-yellow-900">Current Balance</h3>
                <p className="text-2xl font-bold text-yellow-800">{coinBalance} coins</p>
              </div>
            </div>
            {canClaimBonus && (
              <Button 
                size="sm" 
                onClick={claimDailyBonus}
                disabled={claimingBonus}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                {claimingBonus ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Gift className="w-4 h-4 mr-1" />
                    +2
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>

        {/* Feature Costs */}
        <Card className="p-4 mb-6">
          <h3 className="font-semibold mb-3">Feature Costs</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span>Chat Message</span>
              <span className="font-medium">{FEATURE_COSTS.chat} coins</span>
            </div>
            <div className="flex justify-between">
              <span>Drug Search</span>
              <span className="font-medium">{FEATURE_COSTS['drug-search']} coins</span>
            </div>
            <div className="flex justify-between">
              <span>Prescription</span>
              <span className="font-medium">{FEATURE_COSTS.prescription} coins</span>
            </div>
            <div className="flex justify-between">
              <span>Care Plan</span>
              <span className="font-medium">{FEATURE_COSTS['care-plan']} coins</span>
            </div>
          </div>
        </Card>

        {/* Custom Amount */}
        <Card className="p-4 mb-6">
          <h3 className="font-semibold mb-3">Buy Custom Amount</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Amount (₵)</label>
              <input
                type="number"
                min="1"
                max="1000"
                value={customAmount}
                placeholder="Enter amount in Cedis"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) => {
                  const value = e.target.value
                  setCustomAmount(value)
                  const amount = parseFloat(value)
                  if (amount >= 1) {
                    const coins = Math.floor(amount * 4) // 4 coins per Cedi
                    setCalculatedCoins(coins)
                  } else {
                    setCalculatedCoins(0)
                  }
                }}
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-muted-foreground">Rate: 4 coins per ₵1</p>
                {calculatedCoins > 0 && (
                  <p className="text-sm font-medium text-green-600">
                    = {calculatedCoins} coins
                  </p>
                )}
              </div>
            </div>
            <Button 
              onClick={() => {
                const amount = parseFloat(customAmount)
                if (amount >= 1) {
                  handleCustomPurchase(amount)
                }
              }}
              disabled={!customAmount || parseFloat(customAmount) < 1 || loading === 'custom'}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              {loading === 'custom' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                `Buy ${calculatedCoins > 0 ? calculatedCoins : ''} Coins`
              )}
            </Button>
          </div>
        </Card>

        {/* Coin Packages */}
        <div className="space-y-4">
          {packages.map((pkg) => (
            <Card 
              key={pkg.id} 
              className={`p-6 relative ${
                pkg.popular 
                  ? 'border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50' 
                  : 'border border-gray-200'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Best Value
                  </span>
                </div>
              )}

              <div className="text-center mb-4">
                <h3 className="text-xl font-bold mb-1">{pkg.name}</h3>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-3xl font-bold">{pkg.coins}</span>
                  <Coins className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-1">{pkg.price}</div>
                <p className="text-sm text-green-600 font-medium">{pkg.bonus}</p>
              </div>

              <div className="space-y-2 mb-6">
                <h4 className="font-medium text-sm mb-2">What you can do:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {pkg.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-600" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                onClick={() => handlePurchase(pkg.id)}
                disabled={loading === pkg.id}
                className={`w-full h-12 ${
                  pkg.popular 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-gray-800 hover:bg-gray-900'
                }`}
              >
                {loading === pkg.id ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    {pkg.popular && <Zap className="w-5 h-5 mr-2" />}
                    Buy {pkg.coins} Coins
                  </>
                )}
              </Button>
            </Card>
          ))}
        </div>

        {/* Benefits */}
        <Card className="p-4 mt-6">
          <h3 className="font-semibold mb-3">Why coins?</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <span>Pay only for what you use</span>
            </div>
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-blue-600" />
              <span>Daily bonus coins for active users</span>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-blue-600" />
              <span>No monthly commitments</span>
            </div>
          </div>
        </Card>

        {/* Manual Verification */}
        <Card className="p-4 mt-6 border-orange-200 bg-orange-50">
          <h3 className="font-semibold mb-3 text-orange-900">Payment Issues?</h3>
          <p className="text-sm text-orange-800 mb-3">
            If you completed payment but didn't receive coins, enter your payment reference below:
          </p>
          <div className="space-y-3">
            <input
              type="text"
              value={verifyReference}
              onChange={(e) => setVerifyReference(e.target.value)}
              placeholder="Enter payment reference (e.g., coin_1234567890_abc)"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <Button 
              onClick={verifyPayment}
              disabled={!verifyReference.trim() || isVerifying}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                'Verify Payment'
              )}
            </Button>
          </div>
        </Card>

        <div className="text-center mt-6 text-xs text-muted-foreground">
          <p>🔒 Secure payments powered by Paystack</p>
          <p>Coins never expire • Instant activation • Currency: Ghana Cedis (₵)</p>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}