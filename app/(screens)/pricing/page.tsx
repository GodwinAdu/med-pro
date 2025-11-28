"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Check, Crown, Loader2, CreditCard, Smartphone, X } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { PageHeader } from "@/components/page-header"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { currentUser } from "@/lib/helpers/session"

const plans = [
    {
        name: "Free",
        price: 0,
        description: "14-day trial for new users",
        features: [
            "10 AI chat messages",
            "5 prescriptions",
            "3 diagnoses",
            "Basic drug database",
            "14-day trial period"
        ],
        planCode: "free",
        popular: false,
    },
    {
        name: "Basic",
        price: 70,
        description: "Perfect for individual practitioners",
        features: [
            "100 AI chat messages/month",
            "20 prescriptions/month", 
            "10 diagnoses/month",
            "Full drug database access",
            "Email support",
        ],
        planCode: "basic",
        popular: false,
    },
    {
        name: "Pro",
        price: 150,
        description: "For busy healthcare professionals",
        features: [
            "Unlimited AI chat messages",
            "Unlimited prescriptions",
            "Unlimited diagnoses",
            "Advanced drug interactions",
            "Priority support",
            "All premium features"
        ],
        planCode: "pro",
        popular: true,
    }
]

export default function PricingPage() {
    const [loading, setLoading] = useState<string | null>(null)
    const [currentPlan, setCurrentPlan] = useState<string>("free")
    const [currentDuration, setCurrentDuration] = useState<1 | 3 | 6 | 12 | null>(null)
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
    const [selectedDuration, setSelectedDuration] = useState<1 | 3 | 6 | 12>(12)

    useEffect(() => {
        const fetchUserPlan = async () => {
            try {
                const user = await currentUser()
                if (user && user.subscriptionPlan) {
                    setCurrentPlan(user.subscriptionPlan)
                    setCurrentDuration(user.subscriptionDuration || null)
                }
            } catch (error) {
                console.error('Failed to fetch user plan:', error)
                // Keep default 'free' plan if fetch fails
            }
        }
        
        fetchUserPlan()
    }, [])

    const handleSelectPlan = (planCode: string) => {
        if (planCode === "free") {
            toast.info("Free Plan", {
                description: "Cannot downgrade to free plan"
            })
            return
        }

        setSelectedPlan(planCode)
        setSelectedDuration(12) // Default to 1 year for best discount
        setShowPaymentModal(true)
    }

    const handlePayment = async (paymentMethod: 'card' | 'mobile_money') => {
        if (!selectedPlan) return

        setLoading(selectedPlan)
        setShowPaymentModal(false)

        try {
            const endpoint = paymentMethod === 'card' 
                ? '/api/subscription/initialize'
                : '/api/payment/mobile-money'

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    plan: selectedPlan,
                    duration: selectedDuration 
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to initialize payment')
            }

            window.location.href = data.authorization_url

        } catch (error) {
            console.error('Payment error:', error)
            toast.error("Payment Error", {
                description: error instanceof Error ? error.message : "Failed to process payment"
            })
        } finally {
            setLoading(null)
            setSelectedPlan(null)
        }
    }

    return (
        <div className="mx-auto max-w-md sm:max-w-2xl lg:max-w-4xl min-h-screen bg-gradient-to-b from-background to-muted/20">
            <div className="min-h-screen bottom-nav-spacing p-3 sm:p-6 lg:p-8">
                <PageHeader
                    title="Pricing"
                    subtitle="Choose your plan"
                    icon={<Crown className="w-6 h-6" />}
                />

                <div className="text-center mb-4">
                    <p className="text-sm text-muted-foreground mb-4">
                        Start with 14-day free trial. Upgrade anytime.
                    </p>
                </div>

                <div className="space-y-3">
                    <div className="space-y-3 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-4 sm:space-y-0">
                    {plans.map((plan) => {
                        const isCurrentPlan = plan.planCode === currentPlan
                        const isDowngrade = plan.planCode === "free" && currentPlan !== "free"
                        
                        return (
                            <Card
                                key={plan.name}
                                className={`p-3 border-2 ${
                                    plan.popular 
                                        ? "border-blue-600 bg-blue-50 dark:bg-blue-950" 
                                        : "border-border"
                                } ${isCurrentPlan ? "opacity-75" : ""} relative`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-2 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                                        Most Popular
                                    </div>
                                )}

                                {isCurrentPlan && (
                                    <div className="absolute -top-2 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                                        Current Plan
                                    </div>
                                )}

                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <h3 className="text-base font-bold">{plan.name}</h3>
                                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-bold">
                                            {plan.price === 0 ? "Free" : `₵${plan.price}`}
                                        </div>
                                        {plan.price > 0 && (
                                            <div className="text-xs text-muted-foreground">/month</div>
                                        )}
                                    </div>
                                </div>

                                <Button
                                    onClick={() => handleSelectPlan(plan.planCode)}
                                    disabled={loading === plan.planCode || isDowngrade}
                                    className={`w-full mb-3 h-9 text-sm ${
                                        plan.popular 
                                            ? "bg-blue-600 hover:bg-blue-700" 
                                            : "bg-slate-900 hover:bg-slate-800"
                                    } ${isDowngrade ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                    {loading === plan.planCode ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : isCurrentPlan ? (
                                        "Extend Plan"
                                    ) : isDowngrade ? (
                                        "Cannot Downgrade"
                                    ) : (
                                        "Select Plan"
                                    )}
                                </Button>

                                <ul className="space-y-1">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                            <span className="text-xs">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        )
                    })}
                </div>
                </div>

                <div className="mt-4 text-center text-xs text-muted-foreground">
                    <p>All paid plans are billed monthly. Cancel anytime.</p>
                    <p className="mt-1">Payments processed securely via Paystack.</p>
                </div>
            </div>

            <BottomNav />

            {/* Payment Method Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Choose Payment Options</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowPaymentModal(false)}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-4">
                            Select duration and payment method for the {selectedPlan} plan
                        </p>

                        {/* Duration Selection */}
                        <div className="mb-6">
                            <label className="text-sm font-medium mb-2 block">Duration</label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { value: 1, label: '1 Month', originalPrice: selectedPlan === 'basic' ? 70 : 150, discount: 0 },
                                    { value: 3, label: '3 Months', originalPrice: selectedPlan === 'basic' ? 210 : 450, discount: 0.05 },
                                    { value: 6, label: '6 Months', originalPrice: selectedPlan === 'basic' ? 420 : 900, discount: 0.10 },
                                    { value: 12, label: '1 Year', originalPrice: selectedPlan === 'basic' ? 840 : 1800, discount: 0.15 }
                                ].map((option) => {
                                    const finalPrice = Math.round(option.originalPrice * (1 - option.discount))
                                    const isCurrentDurationOrLower = selectedPlan === currentPlan && currentDuration !== null && option.value <= currentDuration
                                    
                                    return (
                                        <Button
                                            key={option.value}
                                            variant={selectedDuration === option.value ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setSelectedDuration(option.value as 1 | 3 | 6 | 12)}
                                            disabled={isCurrentDurationOrLower}
                                            className={`h-12 flex flex-col ${isCurrentDurationOrLower ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <div className="font-medium">{option.label}</div>
                                            <div className="text-xs">
                                                {option.discount > 0 && (
                                                    <span className="line-through text-muted-foreground mr-1">₵{option.originalPrice}</span>
                                                )}
                                                ₵{finalPrice}
                                                {option.discount > 0 && (
                                                    <span className="text-green-600 ml-1">({Math.round(option.discount * 100)}% off)</span>
                                                )}
                                            </div>
                                        </Button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Payment Methods */}
                        <div className="space-y-3">
                            <Button
                                onClick={() => handlePayment('card')}
                                className="w-full h-12 flex items-center gap-3"
                                variant="outline"
                            >
                                <CreditCard className="w-5 h-5" />
                                <div className="text-left">
                                    <div className="font-medium">Pay with Card</div>
                                    <div className="text-xs text-muted-foreground">Recurring subscription</div>
                                </div>
                            </Button>

                            <Button
                                onClick={() => handlePayment('mobile_money')}
                                className="w-full h-12 flex items-center gap-3"
                                variant="outline"
                            >
                                <Smartphone className="w-5 h-5" />
                                <div className="text-left">
                                    <div className="font-medium">Pay with Mobile Money</div>
                                    <div className="text-xs text-muted-foreground">One-time payment</div>
                                </div>
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}