"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { MessageCircle, Send, ArrowLeft, Bug, Lightbulb, Star, AlertCircle } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

const feedbackTypes = [
    { value: "bug", label: "Bug Report", icon: Bug, color: "bg-red-100 text-red-700 border-red-200" },
    { value: "feature", label: "Feature Request", icon: Lightbulb, color: "bg-blue-100 text-blue-700 border-blue-200" },
    { value: "improvement", label: "Improvement", icon: Star, color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    { value: "general", label: "General Feedback", icon: MessageCircle, color: "bg-green-100 text-green-700 border-green-200" },
]

const priorityLevels = [
    { value: "low", label: "Low", color: "bg-gray-100 text-gray-700" },
    { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-700" },
    { value: "high", label: "High", color: "bg-orange-100 text-orange-700" },
    { value: "critical", label: "Critical", color: "bg-red-100 text-red-700" },
]

export default function FeedbackPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        type: "",
        priority: "medium",
        subject: "",
        message: "",
        deviceInfo: "",
        steps: ""
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent
                })
            })

            if (response.ok) {
                setSubmitted(true)
            } else {
                throw new Error('Failed to send feedback')
            }
        } catch (error) {
            console.error('Error sending feedback:', error)
            alert('Failed to send feedback. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (submitted) {
        return (
            <div className="mx-auto max-w-md min-h-screen bg-gradient-to-b from-background to-muted/20">
                <div className="min-h-screen bottom-nav-spacing p-4 flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center"
                    >
                        <Card className="p-8">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h2 className="text-xl font-bold mb-2">Thank You!</h2>
                            <p className="text-muted-foreground mb-6">
                                Your feedback has been sent successfully. We'll review it and get back to you if needed.
                            </p>
                            <div className="space-y-2">
                                <Button onClick={() => setSubmitted(false)} className="w-full">
                                    Send Another Feedback
                                </Button>
                                <Button variant="outline" onClick={() => router.back()} className="w-full">
                                    Go Back
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                </div>
                <BottomNav />
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-md min-h-screen bg-gradient-to-b from-background to-muted/20">
            <div className="min-h-screen bottom-nav-spacing p-4">
                <div className="flex items-center gap-3 mb-6">
                    <Button variant="ghost" size="sm" onClick={() => router.back()} className="h-8 w-8 p-0">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <PageHeader
                        title="Send Feedback"
                        subtitle="Help us improve the app"
                        icon={<MessageCircle className="w-6 h-6" />}
                    />
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  

                    {/* Feedback Type */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Feedback Type *</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-3">
                                {feedbackTypes.map((type) => {
                                    const Icon = type.icon
                                    return (
                                        <button
                                            key={type.value}
                                            type="button"
                                            onClick={() => setFormData({...formData, type: type.value})}
                                            className={`p-3 rounded-lg border-2 transition-all ${
                                                formData.type === type.value 
                                                    ? 'border-primary bg-primary/5' 
                                                    : 'border-border hover:border-primary/50'
                                            }`}
                                        >
                                            <Icon className="w-5 h-5 mx-auto mb-2 text-primary" />
                                            <p className="text-xs font-medium">{type.label}</p>
                                        </button>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Priority & Subject */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="priority">Priority</Label>
                                <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {priorityLevels.map((level) => (
                                            <SelectItem key={level.value} value={level.value}>
                                                <Badge variant="secondary" className={level.color}>
                                                    {level.label}
                                                </Badge>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject *</Label>
                                <Input
                                    id="subject"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                    placeholder="Brief description of your feedback"
                                    required
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Message */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Message *</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Textarea
                                value={formData.message}
                                onChange={(e) => setFormData({...formData, message: e.target.value})}
                                placeholder="Please provide detailed information about your feedback..."
                                rows={5}
                                className="resize-none"
                                required
                            />
                            
                            {formData.type === 'bug' && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="steps">Steps to Reproduce</Label>
                                        <Textarea
                                            id="steps"
                                            value={formData.steps}
                                            onChange={(e) => setFormData({...formData, steps: e.target.value})}
                                            placeholder="1. Go to...&#10;2. Click on...&#10;3. Expected vs Actual result..."
                                            rows={4}
                                            className="resize-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="deviceInfo">Device/Browser Information</Label>
                                        <Input
                                            id="deviceInfo"
                                            value={formData.deviceInfo}
                                            onChange={(e) => setFormData({...formData, deviceInfo: e.target.value})}
                                            placeholder="e.g., iPhone 14, Safari, iOS 16.1"
                                        />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Submit Button */}
                    <Button 
                        type="submit" 
                        disabled={isSubmitting  || !formData.type || !formData.subject || !formData.message}
                        className="w-full h-12"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Sending Feedback...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Send className="w-4 h-4" />
                                <span>Send Feedback</span>
                            </div>
                        )}
                    </Button>
                </form>

                {/* Info Card */}
                <Card className="mt-6 bg-blue-50 dark:bg-blue-950 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    Your feedback helps us improve the Doctor Assistance app. We typically respond within 24-48 hours for critical issues.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <BottomNav />
        </div>
    )
}