"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BottomNav } from "@/components/bottom-nav"
import { PageHeader } from "@/components/page-header"
import { Users, Copy, Gift, Loader2, Share2 } from "lucide-react"
import { toast } from "sonner"

export default function ReferralPage() {
  const [referralCode, setReferralCode] = useState("")
  const [referralCount, setReferralCount] = useState(0)
  const [hasUsedReferral, setHasUsedReferral] = useState(false)
  const [inputCode, setInputCode] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchReferralInfo()
  }, [])

  const fetchReferralInfo = async () => {
    try {
      const response = await fetch('/api/referral')
      if (response.ok) {
        const data = await response.json()
        setReferralCode(data.referralCode)
        setReferralCount(data.referralCount)
        setHasUsedReferral(data.hasUsedReferral)
      }
    } catch (error) {
      console.error('Failed to fetch referral info:', error)
    }
  }

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode)
    toast.success("Referral code copied to clipboard!")
  }

  const shareReferralLink = async () => {
    const referralLink = `${window.location.origin}/signup?ref=${referralCode}`
    const shareText = `🎉 Join MedPro and get 25 FREE coins! 💰\n\nUse my referral code: ${referralCode}\n\nSign up here: ${referralLink}\n\n✨ AI-powered medical assistance for healthcare professionals`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join MedPro - Get 25 Free Coins!',
          text: shareText,
          url: referralLink
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      navigator.clipboard.writeText(shareText)
      toast.success("Referral message copied to clipboard!")
    }
  }

  const useReferralCode = async () => {
    if (!inputCode.trim()) {
      toast.error("Please enter a referral code")
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/referral', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ referralCode: inputCode.trim() })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        setHasUsedReferral(true)
        setInputCode("")
        fetchReferralInfo()
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      toast.error("Failed to use referral code")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="min-h-screen bottom-nav-spacing p-4">
        <PageHeader
          title="Referral Program"
          subtitle="Earn coins by inviting friends"
          icon={<Users className="w-6 h-6" />}
        />

        {/* Your Referral Code */}
        <Card className="p-6 mb-6">
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Your Referral Code</h2>
            <p className="text-sm text-muted-foreground">
              Share this code and earn 50 coins for each friend who joins!
            </p>
          </div>

          <div className="space-y-3">
            <div className="bg-muted rounded-lg p-4">
              <div className="text-center mb-3">
                <p className="text-sm text-muted-foreground mb-2">Your Referral Code</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl font-bold tracking-wider">{referralCode}</span>
                  <Button size="sm" onClick={copyReferralCode} variant="outline">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Shareable Link</p>
              <div className="bg-white rounded border p-3 mb-3">
                <p className="text-sm break-all text-blue-600">
                  {typeof window !== 'undefined' ? `${window.location.origin}/signup?ref=${referralCode}` : `medpro.com/signup?ref=${referralCode}`}
                </p>
              </div>
              <Button onClick={shareReferralLink} className="w-full bg-blue-600 hover:bg-blue-700">
                <Share2 className="w-4 h-4 mr-2" />
                Share Referral Link
              </Button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Friends referred: <span className="font-semibold">{referralCount}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Total earned: <span className="font-semibold text-green-600">{referralCount * 50} coins</span>
            </p>
          </div>
        </Card>

        {/* Use Referral Code */}
        {!hasUsedReferral && (
          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Have a referral code?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Enter a friend's referral code to get 25 bonus coins!
            </p>
            
            <div className="space-y-3">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toLowerCase())}
                placeholder="Enter referral code"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Button 
                onClick={useReferralCode}
                disabled={loading || !inputCode.trim()}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  "Claim 25 Coins"
                )}
              </Button>
            </div>
          </Card>
        )}

        {hasUsedReferral && (
          <Card className="p-6 mb-6 bg-green-50 border-green-200">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-green-800 mb-2">Referral Used!</h3>
              <p className="text-sm text-green-700">
                You've already used a referral code and received your bonus coins.
              </p>
            </div>
          </Card>
        )}

        {/* How it Works */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">How it works</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-600">1</span>
              </div>
              <div>
                <p className="font-medium">Share your code</p>
                <p className="text-muted-foreground">Send your referral code to friends</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-600">2</span>
              </div>
              <div>
                <p className="font-medium">They join & use your code</p>
                <p className="text-muted-foreground">New users enter your code and get 25 coins</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-600">3</span>
              </div>
              <div>
                <p className="font-medium">You both earn coins!</p>
                <p className="text-muted-foreground">You get 50 coins, they get 25 coins</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <BottomNav />
    </div>
  )
}