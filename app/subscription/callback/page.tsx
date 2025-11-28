"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

export default function SubscriptionCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [verifying, setVerifying] = useState(true)
  const [success, setSuccess] = useState(false)
  
  useEffect(() => {
    const reference = searchParams.get('reference')
    const status = searchParams.get('status')
    
    const verifyPayment = async () => {
      if (status === 'success' && reference) {
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
            setSuccess(true)
            toast.success('Payment Successful!', {
              description: `Your ${data.subscription.plan} subscription has been activated.`
            })
            setTimeout(() => router.push('/'), 2000)
          } else {
            throw new Error(data.error || 'Verification failed')
          }
        } catch (error) {
          console.error('Verification error:', error)
          toast.error('Verification Failed', {
            description: 'Please contact support if payment was deducted.'
          })
          setTimeout(() => router.push('/pricing'), 2000)
        }
      } else {
        toast.error('Payment Failed', {
          description: 'Your payment was not successful.'
        })
        setTimeout(() => router.push('/pricing'), 2000)
      }
      setVerifying(false)
    }
    
    verifyPayment()
  }, [searchParams, router])

  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <div className="text-center max-w-sm">
        {verifying ? (
          <>
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <h1 className="text-xl font-semibold mb-2">Verifying Payment...</h1>
            <p className="text-muted-foreground">Please wait while we confirm your payment and activate your subscription.</p>
          </>
        ) : success ? (
          <>
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
            <h1 className="text-xl font-semibold mb-2 text-green-600">Payment Successful!</h1>
            <p className="text-muted-foreground">Your subscription has been activated. Redirecting to your profile...</p>
          </>
        ) : (
          <>
            <XCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />
            <h1 className="text-xl font-semibold mb-2 text-red-600">Payment Failed</h1>
            <p className="text-muted-foreground">There was an issue with your payment. Redirecting back to pricing...</p>
          </>
        )}
      </div>
    </div>
  )
}