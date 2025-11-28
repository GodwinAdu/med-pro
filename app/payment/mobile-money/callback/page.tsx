"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function MobileMoneyCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isVerifying, setIsVerifying] = useState(true)
  
  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get('reference') || searchParams.get('trxref')
      
      if (!reference) {
        toast.error('Payment Failed', {
          description: 'No payment reference found.'
        })
        router.push('/pricing')
        return
      }

      try {
        const response = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reference })
        })

        const data = await response.json()

        if (response.ok && data.success) {
          toast.success('Payment Successful!', {
            description: `Your ${data.subscription.plan} subscription is now active.`
          })
          router.push('/')
        } else {
          toast.error('Payment Verification Failed', {
            description: data.error || 'Unable to verify your payment.'
          })
          router.push('/pricing')
        }
      } catch (error) {
        console.error('Payment verification error:', error)
        toast.error('Payment Verification Failed', {
          description: 'Unable to verify your payment. Please contact support.'
        })
        router.push('/pricing')
      } finally {
        setIsVerifying(false)
      }
    }

    verifyPayment()
  }, [searchParams, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="mb-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        </div>
        <h1 className="text-xl font-semibold mb-2">
          {isVerifying ? 'Verifying Payment...' : 'Processing...'}
        </h1>
        <p className="text-muted-foreground">
          Please wait while we verify your mobile money payment.
        </p>
      </div>
    </div>
  )
}