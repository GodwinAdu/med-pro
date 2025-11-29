"use client"

import type React from "react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Stethoscope, Eye, EyeOff, Mail, Lock, Loader2, Heart, Shield, Zap } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { loginUser } from "@/lib/actions/register.actons"
import { toast } from "sonner"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirect = searchParams.get('redirect')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const values = { email, password }
            await loginUser(values)
            toast.success('Welcome back!')
            router.push(redirect || "/chat")
        } catch (error) {
            console.error("Login failed:", error)
            toast.error('Invalid credentials. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            {/* Header with floating elements */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-green-600 pt-12 pb-20">
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
                    <Heart className="w-6 h-6 text-red-300" />
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
                    <Shield className="w-4 h-4 text-blue-300" />
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
                            <p className="text-blue-100 text-sm">AI Medical Assistant</p>
                        </div>
                    </motion.div>
                    
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <h2 className="text-2xl font-bold mb-2">
                            Welcome Back
                        </h2>
                        <p className="text-blue-100 text-sm">
                            Advanced healthcare at your fingertips
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Login Form */}
            <div className="px-4 -mt-8 pb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="p-6 shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: 0.1 }}
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
                                        className="pl-10 h-12 border-2 focus:border-blue-500 transition-colors rounded-lg"
                                        required
                                    />
                                </div>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: 0.2 }}
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
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 pr-10 h-12 border-2 focus:border-blue-500 transition-colors rounded-lg"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.3 }}
                            >
                                <Button 
                                    type="submit" 
                                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200" 
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Signing in...</span>
                                        </div>
                                    ) : (
                                        "Sign In"
                                    )}
                                </Button>
                            </motion.div>
                        </form>
                    </Card>
                </motion.div>

                {/* Features */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-6 space-y-3"
                >
                    {[
                        { icon: Heart, text: "AI-Powered Diagnosis", color: "text-red-500" },
                        { icon: Zap, text: "Instant Results", color: "text-yellow-500" }
                    ].map((feature, index) => {
                        const Icon = feature.icon
                        return (
                            <motion.div 
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                                className="flex items-center gap-3 p-3 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm"
                            >
                                <Icon className={`w-5 h-5 ${feature.color}`} />
                                <span className="text-gray-700 font-medium">{feature.text}</span>
                            </motion.div>
                        )
                    })}
                </motion.div>

                {/* Sign up link */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.8 }}
                    className="mt-8 text-center"
                >
                    <div className="relative mb-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-gray-50 text-gray-500">
                                New to MedPro?
                            </span>
                        </div>
                    </div>
                    
                    <Link 
                        href="/signup" 
                        className="inline-flex items-center justify-center w-full h-12 border-2 border-gray-200 hover:border-blue-300 rounded-lg font-medium text-gray-700 hover:text-blue-600 transition-all duration-200 hover:bg-blue-50 bg-white"
                    >
                        Create Account
                    </Link>
                </motion.div>
            </div>
        </div>
    )
}
