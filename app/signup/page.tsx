"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Stethoscope, Gift, User, Mail, Lock, Phone, Eye, EyeOff, Loader2, Heart, Shield, Zap, CheckCircle } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { registerUser } from "@/lib/actions/register.actons"
import { toast } from "sonner"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState<"doctor" | "nurse">("doctor")
  const [referralCode, setReferralCode] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const refCode = searchParams.get('ref')
    if (refCode) {
      setReferralCode(refCode)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
    
    setIsLoading(true)
    try {
      const values = { email, password, name, phone, role, referralCode: referralCode || undefined } 
      await registerUser(values)
      toast.success('Account created successfully!')
      router.push("/login")
    } catch (error) {
      console.error("Signup failed:", error)
      toast.error('Failed to create account. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const benefits = [
    "20 free coins to get started",
    "AI-powered medical assistance",
    "Secure & HIPAA compliant",
    "Access to drug database"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-600 to-blue-600 pt-12 pb-20">
        <motion.div 
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-8 right-8 w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center"
        >
          <Zap className="w-6 h-6 text-yellow-300" />
        </motion.div>
        
        <motion.div 
          animate={{ 
            y: [0, 15, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute top-20 left-8 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center"
        >
          <Heart className="w-4 h-4 text-red-300" />
        </motion.div>

        <div className="relative z-10 text-center text-white px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold">MedPro</h1>
              <p className="text-green-100 text-sm">AI Medical Assistant</p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold mb-2">
              Join MedPro Today
            </h2>
            <p className="text-green-100 text-sm">
              Start with 20 free coins
            </p>
          </motion.div>
        </div>
      </div>

      {/* Form */}
      <div className="px-4 -mt-8 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-6 shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            {/* Benefits */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mb-6"
            >
              <h3 className="text-sm font-semibold text-gray-700 mb-3">What you get:</h3>
              <div className="grid grid-cols-2 gap-2">
                {benefits.map((benefit, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                    className="flex items-center gap-2 text-xs text-gray-600"
                  >
                    <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                    <span>{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="space-y-2"
              >
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Dr. Jane Smith"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 h-11 border-2 focus:border-green-500 transition-colors rounded-lg"
                    required
                  />
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="space-y-2"
              >
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="doctor@hospital.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 border-2 focus:border-green-500 transition-colors rounded-lg"
                    required
                  />
                </div>
              </motion.div>

              <div className="grid grid-cols-2 gap-3">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="space-y-2"
                >
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-11 border-2 focus:border-green-500 transition-colors rounded-lg"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                  className="space-y-2"
                >
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirm
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10 h-11 border-2 focus:border-green-500 transition-colors rounded-lg"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </motion.div>
              </div>

              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.7 }}
                className="space-y-2"
              >
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Phone (Optional)
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+233 123 456 789"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10 h-11 border-2 focus:border-green-500 transition-colors rounded-lg"
                  />
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.8 }}
                className="space-y-3"
              >
                <Label className="text-sm font-medium text-gray-700">I am a</Label>
                <RadioGroup value={role} onValueChange={(value) => setRole(value as "doctor" | "nurse")} className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="doctor" id="doctor" className="border-2" />
                    <Label htmlFor="doctor" className="font-normal cursor-pointer text-sm">
                      Doctor
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="nurse" id="nurse" className="border-2" />
                    <Label htmlFor="nurse" className="font-normal cursor-pointer text-sm">
                      Nurse
                    </Label>
                  </div>
                </RadioGroup>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.9 }}
                className="space-y-2"
              >
                <Label htmlFor="referralCode" className="text-sm font-medium text-gray-700">
                  Referral Code (Optional)
                </Label>
                <div className="relative">
                  <Gift className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="referralCode"
                    type="text"
                    placeholder="Enter friend's code"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toLowerCase())}
                    className="pl-10 h-11 border-2 focus:border-green-500 transition-colors rounded-lg"
                  />
                </div>
                {referralCode && (
                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-lg">
                    <Gift className="w-4 h-4" />
                    <span>You'll get 25 bonus coins!</span>
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 1.0 }}
              >
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating account...</span>
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </motion.div>
            </form>
          </Card>
        </motion.div>

        {/* Sign in link */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1.1 }}
          className="mt-6 text-center"
        >
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-50 text-gray-500">
                Already have an account?
              </span>
            </div>
          </div>
          
          <Link 
            href="/login" 
            className="inline-flex items-center justify-center w-full h-12 border-2 border-gray-200 hover:border-green-300 rounded-lg font-medium text-gray-700 hover:text-green-600 transition-all duration-200 hover:bg-green-50 bg-white"
          >
            Sign In
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
