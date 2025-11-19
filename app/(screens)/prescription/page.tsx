"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Pill, Loader2, CheckCircle, AlertTriangle, Plus, Trash2, Brain, Shield } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { PageHeader } from "@/components/page-header"
import { toast } from "sonner"

interface Medication {
    id: string
    name: string
    dosage: string
    frequency: string
    duration: string
}

interface ValidationResult {
    status: "safe" | "warning" | "danger"
    analysis: string
    medicationCount: number
    fdaDataAvailable: number
}

export default function PrescriptionsPage() {
    const router = useRouter()
    const [medications, setMedications] = useState<Medication[]>([
        { id: "1", name: "", dosage: "", frequency: "", duration: "" },
    ])
    const [notes, setNotes] = useState("")
    const [isValidating, setIsValidating] = useState(false)
    const [validation, setValidation] = useState<ValidationResult | null>(null)

    const addMedication = () => {
        setMedications([...medications, { id: Date.now().toString(), name: "", dosage: "", frequency: "", duration: "" }])
    }

    const removeMedication = (id: string) => {
        setMedications(medications.filter((med) => med.id !== id))
    }

    const updateMedication = (id: string, field: keyof Medication, value: string) => {
        setMedications(medications.map((med) => (med.id === id ? { ...med, [field]: value } : med)))
    }

    const handleValidate = async () => {
        setIsValidating(true)
        try {
            const response = await fetch("/api/prescription/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ medications, notes }),
            })

            if (response.status === 403) {
                const errorData = await response.json()
                
                if (errorData.trialExpired) {
                    toast.error("Trial Expired", {
                        description: "Your 14-day trial has ended. Upgrade to continue using prescription validation.",
                        action: {
                            label: "Upgrade",
                            onClick: () => router.push('/pricing')
                        }
                    })
                } else if (errorData.limitReached) {
                    toast.error("Usage Limit Reached", {
                        description: `You've used ${errorData.currentUsage}/${errorData.limit} prescription validations this month. Upgrade for unlimited access.`,
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
                throw new Error('Failed to validate prescription')
            }

            const data = await response.json()
            if (data.success) {
                setValidation(data)
            }
        } catch (error) {
            console.error("Validation failed:", error)
            toast.error("Validation Failed", {
                description: "Unable to validate prescription. Please try again."
            })
        } finally {
            setIsValidating(false)
        }
    }

    const statusConfig = {
        safe: {
            color: "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 border-green-200",
            icon: CheckCircle,
            label: "Safe to Prescribe",
        },
        warning: {
            color: "bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400 border-yellow-200",
            icon: AlertTriangle,
            label: "Review Required",
        },
        danger: {
            color: "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-200",
            icon: AlertTriangle,
            label: "Potential Issues",
        },
    }

    return (
        <div className="mx-auto max-w-md min-h-screen bg-gradient-to-b from-background to-muted/20">
            <div className="min-h-screen bottom-nav-spacing p-3">
                <PageHeader
                    title="Prescription Validator"
                    subtitle="AI-powered prescription safety analysis"
                    icon={<Shield className="w-6 h-6" />}
                />

                <div className="space-y-4">
                    <Card className="p-3">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Pill className="w-5 h-5" />
                            Prescription Details
                        </h2>

                        <div className="space-y-4">

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label>Medications</Label>
                                    <Button onClick={addMedication} size="sm" variant="outline" className="h-8">
                                        <Plus className="w-4 h-4 mr-1" />
                                        Add
                                    </Button>
                                </div>

                                {medications.map((med, index) => (
                                    <Card key={med.id} className="p-3 bg-slate-50 dark:bg-slate-900">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm font-medium">Medication {index + 1}</span>
                                            {medications.length > 1 && (
                                                <Button
                                                    onClick={() => removeMedication(med.id)}
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                </Button>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            <Input
                                                placeholder="Medication name"
                                                value={med.name}
                                                onChange={(e) => updateMedication(med.id, "name", e.target.value)}
                                                className="h-10"
                                            />
                                            <div className="grid grid-cols-2 gap-2">
                                                <Input
                                                    placeholder="Dosage"
                                                    value={med.dosage}
                                                    onChange={(e) => updateMedication(med.id, "dosage", e.target.value)}
                                                    className="h-10"
                                                />
                                                <Input
                                                    placeholder="Frequency"
                                                    value={med.frequency}
                                                    onChange={(e) => updateMedication(med.id, "frequency", e.target.value)}
                                                    className="h-10"
                                                />
                                            </div>
                                            <Input
                                                placeholder="Duration"
                                                value={med.duration}
                                                onChange={(e) => updateMedication(med.id, "duration", e.target.value)}
                                                className="h-10"
                                            />
                                        </div>
                                    </Card>
                                ))}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Additional Notes</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Special instructions, allergies..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={3}
                                    className="resize-none"
                                />
                            </div>

                            <Button
                                onClick={handleValidate}
                                disabled={isValidating || !medications.some((m) => m.name)}
                                className="w-full h-12 bg-blue-600 hover:bg-blue-700"
                            >
                                {isValidating ? (
                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        </div>
                                        <span>AI Analyzing...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Brain className="w-4 h-4" />
                                        <span>Analyze Prescription</span>
                                    </div>
                                )}
                            </Button>
                        </div>
                    </Card>

                    {validation && (
                        <Card className="p-4 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Brain className="w-5 h-5 text-primary" />
                                AI Analysis Results
                            </h2>
                            
                            <div className={`p-3 rounded-lg border mb-4 ${statusConfig[validation.status].color}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    {(() => {
                                        const IconComponent = statusConfig[validation.status].icon
                                        return <IconComponent className="w-5 h-5" />
                                    })()}
                                    <span className="font-semibold">{statusConfig[validation.status].label}</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {validation.medicationCount} medications analyzed • {validation.fdaDataAvailable} FDA records found
                                </div>
                            </div>

                            <div className="space-y-3">
                                {validation.analysis.split('\n\n').map((section, index) => {
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
                    )}
                </div>
            </div>

            <BottomNav />
        </div>
    )
}
  
