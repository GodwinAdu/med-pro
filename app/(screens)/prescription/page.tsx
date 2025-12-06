"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Pill, Loader2, CheckCircle, AlertTriangle, Plus, Trash2, Brain, Shield, Download, Mail, Volume2, History, RotateCcw, Copy, Save } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { PageHeader } from "@/components/page-header"
import { toast } from "sonner"
import { downloadPrescriptionPDF } from "@/lib/pdf-generator"
import { AudioPlayer } from "@/components/audio-player"

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
    const searchParams = useSearchParams()
    const [medications, setMedications] = useState<Medication[]>([
        { id: "1", name: "", dosage: "", frequency: "", duration: "" },
    ])
    const [notes, setNotes] = useState("")
    const [patientName, setPatientName] = useState("")
    const [patientAge, setPatientAge] = useState("")
    const [diagnosis, setDiagnosis] = useState("")
    const [isValidating, setIsValidating] = useState(false)
    const [validation, setValidation] = useState<ValidationResult | null>(null)

    useEffect(() => {
        const prescriptionId = searchParams.get('id')
        const isDuplicate = searchParams.get('duplicate') === 'true'
        if (prescriptionId) {
            loadPrescription(prescriptionId, isDuplicate)
        }
    }, [searchParams])

    const loadPrescription = async (id: string, isDuplicate: boolean = false) => {
        try {
            const response = await fetch(`/api/prescription/get?id=${id}`)
            if (response.ok) {
                const data = await response.json()
                const { prescription } = data
                
                if (isDuplicate) {
                    // For duplicate, clear patient-specific info but keep medications
                    setPatientName('')
                    setPatientAge('')
                    setDiagnosis(prescription.diagnosis || '')
                    setMedications(prescription.medications.map((m: any, i: number) => ({
                        id: (Date.now() + i).toString(),
                        ...m
                    })))
                    setNotes(prescription.notes || '')
                    setValidation(null)
                    toast.success('Template loaded - Enter patient details')
                } else {
                    setPatientName(prescription.patientName)
                    setPatientAge(prescription.patientAge || '')
                    setDiagnosis(prescription.diagnosis || '')
                    setMedications(prescription.medications.map((m: any, i: number) => ({
                        id: (Date.now() + i).toString(),
                        ...m
                    })))
                    setNotes(prescription.notes || '')
                    if (prescription.validation) {
                        setValidation(prescription.validation)
                    }
                    toast.success('Prescription loaded')
                }
            }
        } catch (error) {
            console.error('Failed to load prescription:', error)
            toast.error('Failed to load prescription')
        }
    }

    const savePrescription = async () => {
        if (!patientName || !medications.some(m => m.name)) {
            toast.error('Missing Information', {
                description: 'Please enter patient name and at least one medication'
            })
            return
        }

        try {
            const response = await fetch('/api/prescription/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patientName,
                    patientAge,
                    diagnosis,
                    medications: medications.filter(m => m.name),
                    notes,
                    validation
                })
            })

            if (response.ok) {
                toast.success('Prescription saved to history')
            }
        } catch (error) {
            console.error('Failed to save prescription:', error)
        }
    }

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
                // Auto-save after validation
                setTimeout(() => savePrescription(), 500)
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
        <div className="mx-auto max-w-md sm:max-w-2xl lg:max-w-4xl min-h-screen bg-gradient-to-b from-background to-muted/20">
            <div className="min-h-screen bottom-nav-spacing p-3 sm:p-6 lg:p-8">
                <div className="flex items-center justify-between mb-6">
                    <PageHeader
                        title="Prescription"
                        subtitle="AI-powered prescription safety analysis"
                        icon={<Shield className="w-6 h-6" />}
                    />
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setPatientName('')
                                setPatientAge('')
                                setDiagnosis('')
                                setMedications([{ id: '1', name: '', dosage: '', frequency: '', duration: '' }])
                                setNotes('')
                                setValidation(null)
                                toast.success('Form cleared')
                            }}
                            className="h-9"
                        >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            {/* Clear */}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push('/prescription/history')}
                            className="h-9"
                        >
                            <History className="w-4 h-4 mr-1" />
                            {/* History */}
                        </Button>
                    </div>
                </div>

                <div className="space-y-4">
                    <Card className="p-3">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Pill className="w-5 h-5" />
                            Prescription Details
                        </h2>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label htmlFor="patientName">Patient Name</Label>
                                    <Input
                                        id="patientName"
                                        placeholder="Enter patient name"
                                        value={patientName}
                                        onChange={(e) => setPatientName(e.target.value)}
                                        className="h-10"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="patientAge">Age</Label>
                                    <Input
                                        id="patientAge"
                                        placeholder="Age"
                                        value={patientAge}
                                        onChange={(e) => setPatientAge(e.target.value)}
                                        className="h-10"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="diagnosis">Diagnosis</Label>
                                <Input
                                    id="diagnosis"
                                    placeholder="Primary diagnosis"
                                    value={diagnosis}
                                    onChange={(e) => setDiagnosis(e.target.value)}
                                    className="h-10"
                                />
                            </div>

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

                            <div className="flex gap-2">
                                <Button
                                    onClick={savePrescription}
                                    disabled={!patientName || !medications.some(m => m.name)}
                                    variant="outline"
                                    className="h-12 px-4"
                                >
                                    <Save className="w-4 h-4" />
                                </Button>
                                <Button
                                    onClick={handleValidate}
                                    disabled={isValidating || !medications.some((m) => m.name)}
                                    className="flex-1 h-12 bg-blue-600 hover:bg-blue-700"
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
                                            <span>Analyze</span>
                                        </div>
                                    )}
                                </Button>
                                
                                <Button
                                    onClick={() => {
                                        if (!patientName || !medications.some(m => m.name)) {
                                            toast.error("Missing Information", {
                                                description: "Please enter patient name and at least one medication"
                                            })
                                            return
                                        }
                                        
                                        const prescriptionData = {
                                            id: Date.now().toString(),
                                            patientName,
                                            patientAge: patientAge ? parseInt(patientAge) : undefined,
                                            doctorName: "Dr. [Your Name]",
                                            date: new Date().toLocaleDateString(),
                                            medications: medications.filter(m => m.name).map(m => ({
                                                name: m.name,
                                                dosage: m.dosage,
                                                frequency: m.frequency,
                                                duration: m.duration,
                                                instructions: ""
                                            })),
                                            diagnosis,
                                            notes
                                        }
                                        
                                        downloadPrescriptionPDF(prescriptionData)
                                        toast.success("PDF Downloaded", {
                                            description: "Prescription has been saved as PDF"
                                        })
                                    }}
                                    variant="outline"
                                    className="h-12 px-4"
                                >
                                    <Download className="w-4 h-4" />
                                </Button>
                            </div>
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

                            <div className="flex items-center gap-2 mb-3">
                                <AudioPlayer text={validation.analysis} />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        navigator.clipboard.writeText(validation.analysis)
                                        toast.success('Analysis copied to clipboard')
                                    }}
                                    className="h-7 px-2 text-xs"
                                >
                                    <Copy className="w-3 h-3 mr-1" />
                                    Copy
                                </Button>
                            </div>

                            <div className="space-y-3 mt-3">
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
  
