"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FileText, CheckCircle2, AlertTriangle, XCircle, Loader2, Sparkles } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ValidationResult {
    status: "safe" | "warning" | "danger"
    summary: string
    issues: Array<{
        type: "info" | "warning" | "error"
        message: string
    }>
    recommendations: string[]
}

export default function PrescriptionsPage() {
    const [prescription, setPrescription] = useState("")
    const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
    const [loading, setLoading] = useState(false)

    const validatePrescription = async () => {
        if (!prescription.trim()) return

        setLoading(true)
        setValidationResult(null)

        try {
            const response = await fetch("/api/validate-prescription", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prescription }),
            })

            const data = await response.json()
            setValidationResult(data)
        } catch (error) {
            console.error("Validation error:", error)
            setValidationResult({
                status: "danger",
                summary: "Unable to validate prescription. Please try again.",
                issues: [{ type: "error", message: "Validation service unavailable" }],
                recommendations: ["Please try again later or consult a pharmacist"],
            })
        } finally {
            setLoading(false)
        }
    }

    const getStatusIcon = () => {
        if (!validationResult) return null

        switch (validationResult.status) {
            case "safe":
                return <CheckCircle2 className="w-6 h-6 text-green-500" />
            case "warning":
                return <AlertTriangle className="w-6 h-6 text-yellow-500" />
            case "danger":
                return <XCircle className="w-6 h-6 text-red-500" />
        }
    }

    const getStatusColor = () => {
        if (!validationResult) return ""

        switch (validationResult.status) {
            case "safe":
                return "border-green-500/50 bg-green-50 dark:bg-green-950/20"
            case "warning":
                return "border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20"
            case "danger":
                return "border-red-500/50 bg-red-50 dark:bg-red-950/20"
        }
    }

    return (
        <div className="mx-auto max-w-md min-h-screen bg-gradient-to-b from-background to-muted/20">
            <div className="min-h-screen bottom-nav-spacing p-6">
                <PageHeader
                    title="Prescription Validator"
                    subtitle="AI-powered prescription safety checker"
                    icon={<FileText className="w-6 h-6" />}
                />

                {/* Input Section */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-primary" />
                                Enter Prescription Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Textarea
                                placeholder="Enter prescription details including:&#10;- Drug name&#10;- Dosage (e.g., 500mg)&#10;- Frequency (e.g., twice daily)&#10;- Duration (e.g., 7 days)&#10;- Patient age and conditions"
                                value={prescription}
                                onChange={(e) => setPrescription(e.target.value)}
                                rows={8}
                                className="resize-none"
                            />
                            <Button onClick={validatePrescription} disabled={loading || !prescription.trim()} className="w-full">
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Validating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Validate Prescription
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Validation Results */}
                <AnimatePresence>
                    {validationResult && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="space-y-4"
                        >
                            {/* Status Summary */}
                            <Card className={getStatusColor()}>
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        {getStatusIcon()}
                                        <div className="flex-1">
                                            <h3 className="font-semibold mb-1">
                                                {validationResult.status === "safe" && "Prescription Appears Safe"}
                                                {validationResult.status === "warning" && "Caution Required"}
                                                {validationResult.status === "danger" && "Safety Concerns Detected"}
                                            </h3>
                                            <p className="text-sm leading-relaxed">{validationResult.summary}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Issues */}
                            {validationResult.issues.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Identified Issues</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {validationResult.issues.map((issue, index) => (
                                            <Alert
                                                key={index}
                                                variant={issue.type === "error" ? "destructive" : "default"}
                                                className={
                                                    issue.type === "warning" ? "border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20" : ""
                                                }
                                            >
                                                {issue.type === "error" && <XCircle className="h-4 w-4" />}
                                                {issue.type === "warning" && <AlertTriangle className="h-4 w-4" />}
                                                {issue.type === "info" && <CheckCircle2 className="h-4 w-4" />}
                                                <AlertDescription className="text-sm">{issue.message}</AlertDescription>
                                            </Alert>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Recommendations */}
                            {validationResult.recommendations.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Recommendations</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {validationResult.recommendations.map((rec, index) => (
                                                <li key={index} className="flex items-start gap-2">
                                                    <Badge variant="secondary" className="mt-0.5 flex-shrink-0">
                                                        {index + 1}
                                                    </Badge>
                                                    <span className="text-sm leading-relaxed">{rec}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Disclaimer */}
                            <Alert>
                                <AlertDescription className="text-xs">
                                    This validation is AI-generated and for informational purposes only. Always consult with a licensed
                                    pharmacist or healthcare provider before taking any medication.
                                </AlertDescription>
                            </Alert>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Empty State */}
                {!validationResult && !loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-12 text-center"
                    >
                        <div className="p-6 bg-muted/50 rounded-full mb-4">
                            <FileText className="w-12 h-12 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Validate Your Prescription</h3>
                        <p className="text-sm text-muted-foreground max-w-sm text-pretty">
                            Enter prescription details to check for dosage accuracy, drug interactions, and safety concerns
                        </p>
                    </motion.div>
                )}
            </div>

            <BottomNav />
        </div>
    )
}
