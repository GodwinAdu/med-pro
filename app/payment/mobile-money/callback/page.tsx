"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

export default function MobileMoneyCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const reference = searchParams.get('reference')
    const status = searchParams.get('status')
    
    if (status === 'success') {
      toast.success('Payment Successful!', {
        description: 'Your payment has been processed successfully.'
      })
      router.push('/dashboard')
    } else {
      toast.error('Payment Failed', {
        description: 'Your mobile money payment was not successful.'
      })
      router.push('/pricing')
    }
  }, [searchParams, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-xl font-semibold mb-2">Processing Payment...</h1>
        <p className="text-muted-foreground">Please wait while we verify your mobile money payment.</p>
      </div>
    </div>
  )
}