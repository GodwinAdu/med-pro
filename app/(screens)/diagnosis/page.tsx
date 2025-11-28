"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Stethoscope, Loader2, AlertCircle, Brain, BookOpen, Activity, TestTube } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { PageHeader } from "@/components/page-header"
import { toast } from "sonner"

interface DiagnosisResult {
    analysis: string
    urgencyLevel: "low" | "medium" | "high"
    differentialDiagnosis: string
    investigations: string
    references: string
    disclaimer: string
}

export default function DiagnosisPage() {
    const router = useRouter()
    const [symptoms, setSymptoms] = useState("")
    const [patientAge, setPatientAge] = useState("")
    const [medicalHistory, setMedicalHistory] = useState("")
    const [vitalSigns, setVitalSigns] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<DiagnosisResult | null>(null)

    const handleAnalyze = async () => {
        if (!symptoms.trim()) return

        setIsLoading(true)
        try {
            const response = await fetch("/api/diagnosis", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ symptoms, patientAge, medicalHistory, vitalSigns }),
            })

            if (response.status === 403) {
                const errorData = await response.json()
                
                if (errorData.trialExpired) {
                    toast.error("Trial Expired", {
                        description: "Your 14-day trial has ended. Upgrade to continue using diagnosis features.",
                        action: {
                            label: "Upgrade",
                            onClick: () => router.push('/pricing')
                        }
                    })
                } else if (errorData.limitReached) {
                    toast.error("Usage Limit Reached", {
                        description: `You've used ${errorData.currentUsage}/${errorData.limit} diagnoses this month. Upgrade for unlimited access.`,
                        action: {
                            label: "Upgrade",
                            onClick: () => router.push('/pricing')
                        }
                    })
                } else {
                    toast.error("Access Restricted", {
                        description: errorData.error || "Please upgrade to continue using this feature.",
                        action: {
                            label: "Upgrade",
                            onClick: () => router.push('/pricing')
                        }
                    })
                }
                return
            }

            if (!response.ok) {
                throw new Error('Failed to analyze symptoms')
            }

            const data = await response.json()
            setResult(data)
        } catch (error) {
            console.error("Diagnosis failed:", error)
            toast.error("Analysis Failed", {
                description: "Unable to analyze symptoms. Please try again."
            })
        } finally {
            setIsLoading(false)
        }
    }

    const urgencyColors = {
        low: "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 border-green-200",
        medium: "bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400 border-yellow-200",
        high: "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-200",
    }

    const urgencyLabels = {
        low: "Routine Care",
        medium: "Moderate Priority", 
        high: "Urgent Attention"
    }

    return (
        <div className="mx-auto max-w-md sm:max-w-2xl lg:max-w-4xl min-h-screen bg-gradient-to-b from-background to-muted/20">
            <div className="min-h-screen bottom-nav-spacing p-3 sm:p-6 lg:p-8">
                <PageHeader
                    title="Clinical Diagnosis"
                    subtitle="AI-powered differential diagnosis with references"
                    icon={<Brain className="w-6 h-6" />}
                />

                <div className="space-y-4">
                    <Card className="p-4">
                        <h2 className="text-base font-bold mb-3">Patient Information</h2>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="symptoms">Symptoms *</Label>
                                <Textarea
                                    id="symptoms"
                                    placeholder="Describe symptoms in detail..."
                                    value={symptoms}
                                    onChange={(e) => setSymptoms(e.target.value)}
                                    rows={4}
                                    className="resize-none"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="age">Age</Label>
                                        <Input
                                            id="age"
                                            type="number"
                                            placeholder="45"
                                            value={patientAge}
                                            onChange={(e) => setPatientAge(e.target.value)}
                                            className="h-10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="history">Medical History</Label>
                                        <Input
                                            id="history"
                                            placeholder="Previous conditions"
                                            value={medicalHistory}
                                            onChange={(e) => setMedicalHistory(e.target.value)}
                                            className="h-10"
                                        />
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="vitals">Vital Signs (Optional)</Label>
                                    <Input
                                        id="vitals"
                                        placeholder="BP: 120/80, HR: 72, Temp: 98.6°F, RR: 16"
                                        value={vitalSigns}
                                        onChange={(e) => setVitalSigns(e.target.value)}
                                        className="h-10"
                                    />
                                </div>
                            </div>

                            <Button onClick={handleAnalyze} disabled={isLoading || !symptoms.trim()} className="w-full h-12 bg-blue-600 hover:bg-blue-700">
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        </div>
                                        <span>AI Analyzing...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Brain className="w-4 h-4" />
                                        <span>Generate Diagnosis</span>
                                    </div>
                                )}
                            </Button>
                        </div>
                    </Card>

                    {!result && !isLoading && (
                        <Card className="p-6">
                            <div className="flex flex-col items-center justify-center text-center">
                                <Stethoscope className="w-12 h-12 text-muted-foreground mb-3" />
                                <p className="text-sm text-muted-foreground">
                                    Enter symptoms and analyze for AI insights
                                </p>
                            </div>
                        </Card>
                    )}

                    {isLoading && (
                        <Card className="p-6 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                            <div className="flex flex-col items-center justify-center">
                                <div className="relative mb-4">
                                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                    <Brain className="w-6 h-6 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                                </div>
                                <p className="text-sm font-medium text-primary">AI is analyzing clinical presentation...</p>
                                <p className="text-xs text-muted-foreground mt-1">Generating differential diagnosis</p>
                            </div>
                        </Card>
                    )}

                    {result && (
                        <div className="space-y-4">
                            {/* Urgency Level */}
                            <Card className="p-4">
                                <div className={`p-3 rounded-lg border ${urgencyColors[result.urgencyLevel]}`}>
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5" />
                                        <span className="font-semibold text-sm">{urgencyLabels[result.urgencyLevel]}</span>
                                    </div>
                                </div>
                            </Card>

                            {/* Comprehensive Analysis */}
                            <Card className="p-4 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <Brain className="w-5 h-5 text-primary" />
                                    Clinical Analysis
                                </h2>
                                
                                <div className="space-y-4">
                                    {result.analysis.split('\n\n').map((section, index) => {
                                        const lines = section.split('\n')
                                        const title = lines[0]
                                        const content = lines.slice(1).join('\n')
                                        
                                        if (title.includes('**') || title.includes(':')) {
                                            return (
                                                <div key={index} className="space-y-2">
                                                    <h4 className="font-semibold text-sm text-primary border-b border-primary/20 pb-1">
                                                        {title.replace(/\*\*/g, '').replace(':', '')}
                                                    </h4>
                                                    <div className="text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap">
                                                        {content || lines.slice(1).join('\n')}
                                                    </div>
                                                </div>
                                            )
                                        }
                                        return (
                                            <div key={index} className="text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap">
                                                {section}
                                            </div>
                                        )
                                    })}
                                </div>
                            </Card>

                            {/* Investigations */}
                            <Card className="p-4 border-blue-200 bg-blue-50/50">
                                <h3 className="font-semibold mb-3 text-sm flex items-center gap-2">
                                    <TestTube className="w-4 h-4 text-blue-600" />
                                    Recommended Investigations
                                </h3>
                                <div className="text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap">
                                    {result.investigations}
                                </div>
                            </Card>

                            {/* Clinical References */}
                            <Card className="p-4 border-green-200 bg-green-50/50">
                                <h3 className="font-semibold mb-3 text-sm flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-green-600" />
                                    Clinical References
                                </h3>
                                <div className="text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap">
                                    {result.references}
                                </div>
                            </Card>

                            {/* Disclaimer */}
                            <Card className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
                                <p className="text-xs text-amber-800 dark:text-amber-200">
                                    <strong>Medical Disclaimer:</strong> {result.disclaimer}
                                </p>
                            </Card>
                        </div>
                    )}
                </div>
            </div>

            <BottomNav />
        </div>
    )
}
