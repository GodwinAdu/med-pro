"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

export default function SubscriptionCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const reference = searchParams.get('reference')
    const status = searchParams.get('status')
    
    if (status === 'success') {
      toast.success('Payment Successful!', {
        description: 'Your subscription has been activated.'
      })
      router.push('/profile')
    } else {
      toast.error('Payment Failed', {
        description: 'Your payment was not successful.'
      })
      router.push('/pricing')
    }
  }, [searchParams, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-xl font-semibold mb-2">Processing Payment...</h1>
        <p className="text-muted-foreground">Please wait while we verify your payment.</p>
      </div>
    </div>
  )
}