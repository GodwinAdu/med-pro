"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Search, Pill, AlertCircle, Loader2, Brain, Sparkles, Plus, X, Shield, Calculator, Volume2, History, RotateCcw, Copy } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { PageHeader } from "@/components/page-header"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AudioPlayer } from "@/components/audio-player"

interface DrugSearchResult {
    rawData: any
    summary: string
    basicInfo: {
        brand_name: string
        generic_name: string
        manufacturer: string
        dosage_form: string
        route: string
        purpose: string
        indications: string
        warnings: string
        dosage: string
        contraindications: string
        adverse_reactions: string
    }
}

export default function DrugsPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [searchQuery, setSearchQuery] = useState("")
    const [interactionQuery, setInteractionQuery] = useState("")
    const [drugInfo, setDrugInfo] = useState<DrugSearchResult | null>(null)
    const [loading, setLoading] = useState(false)
    const [aiLoading, setAiLoading] = useState(false)
    const [interactionDrugs, setInteractionDrugs] = useState<string[]>([])
    const [interactionResult, setInteractionResult] = useState<string | null>(null)
    const [interactionLoading, setInteractionLoading] = useState(false)
    const [activeTab, setActiveTab] = useState("search")
    const [dosageResult, setDosageResult] = useState<string | null>(null)
    const [dosageLoading, setDosageLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubscriptionError = (errorData: any) => {
        if (errorData.trialExpired) {
            toast.error("Trial Expired", {
                description: "Your 14-day trial has ended. Upgrade to continue using drug search features.",
                action: {
                    label: "Upgrade",
                    onClick: () => router.push('/pricing')
                }
            })
        } else if (errorData.limitReached) {
            toast.error("Usage Limit Reached", {
                description: `You've used ${errorData.currentUsage}/${errorData.limit} searches this month. Upgrade for unlimited access.`,
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
    }

    const searchDrug = async () => {
        if (!searchQuery.trim()) return

        setLoading(true)
        setAiLoading(true)
        setError(null)
        setDrugInfo(null)

        try {
            const response = await fetch('/api/drugs/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ drugName: searchQuery }),
            })

            if (response.status === 403) {
                const errorData = await response.json()
                handleSubscriptionError(errorData)
                return
            }

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to search drug')
            }

            if (data.success) {
                setDrugInfo(data.data)
                // Save to history
                saveDrugSearch('drug-info', searchQuery, data.data)
            } else {
                setError("No information found for this drug. Try a different name.")
            }
        } catch (err: any) {
            setError(err.message || "Unable to fetch drug information. Please try again.")
            console.error(err)
        } finally {
            setLoading(false)
            setAiLoading(false)
        }
    }

    const saveDrugSearch = async (searchType: string, drugName: string, result: any) => {
        try {
            const response = await fetch('/api/drugs/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ searchType, drugName, result })
            })
            if (response.ok) {
                console.log('Search saved to history')
            }
        } catch (error) {
            console.error('Failed to save search:', error)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            searchDrug()
        }
    }

    useEffect(() => {
        const searchId = searchParams.get('search')
        if (searchId) {
            loadSearchFromHistory(searchId)
        }
    }, [searchParams])

    const loadSearchFromHistory = async (id: string) => {
        setLoading(true)
        try {
            const response = await fetch(`/api/drugs/get?id=${id}`)
            if (response.ok) {
                const data = await response.json()
                const { search } = data
                
                if (search.searchType === 'drug-info') {
                    setSearchQuery(search.drugName)
                    setDrugInfo(search.result)
                    setActiveTab('search')
                } else if (search.searchType === 'interaction') {
                    setInteractionDrugs(search.result.drugs || [])
                    setInteractionResult(search.result.interaction)
                    setActiveTab('interactions')
                } else if (search.searchType === 'dosage') {
                    setDosageResult(search.result.dosage)
                    setActiveTab('dosage')
                }
                toast.success('Search loaded')
            }
        } catch (error) {
            console.error('Failed to load search:', error)
            toast.error('Failed to load search')
        } finally {
            setLoading(false)
        }
    }

    const addDrugToInteraction = () => {
        if (interactionQuery.trim() && !interactionDrugs.includes(interactionQuery.trim())) {
            setInteractionDrugs([...interactionDrugs, interactionQuery.trim()])
            setInteractionQuery("")
        }
    }

    const removeDrugFromInteraction = (drug: string) => {
        setInteractionDrugs(interactionDrugs.filter(d => d !== drug))
    }

    const checkInteractions = async () => {
        if (interactionDrugs.length < 2) return
        
        setInteractionLoading(true)
        try {
            const response = await fetch('/api/drugs/interactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ drugs: interactionDrugs })
            })
            
            if (response.status === 403) {
                const errorData = await response.json()
                handleSubscriptionError(errorData)
                return
            }

            if (!response.ok) {
                throw new Error('Failed to check interactions')
            }
            
            const data = await response.json()
            if (data.success) {
                setInteractionResult(data.interaction)
                // Save to history
                saveDrugSearch('interaction', interactionDrugs.join(', '), { interaction: data.interaction, drugs: interactionDrugs })
            }
        } catch (error) {
            console.error('Interaction check failed:', error)
            toast.error("Interaction Check Failed", {
                description: "Unable to check drug interactions. Please try again."
            })
        } finally {
            setInteractionLoading(false)
        }
    }

    const calculateDosage = async (formData: FormData) => {
        setDosageLoading(true)
        try {
            const response = await fetch('/api/drugs/dosage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    drug: formData.get('drug'),
                    weight: formData.get('weight'),
                    age: formData.get('age'),
                    condition: formData.get('condition'),
                    renalFunction: formData.get('renal'),
                    hepaticFunction: formData.get('hepatic')
                })
            })
            
            if (response.status === 403) {
                const errorData = await response.json()
                handleSubscriptionError(errorData)
                return
            }

            if (!response.ok) {
                throw new Error('Failed to calculate dosage')
            }
            
            const data = await response.json()
            if (data.success) {
                setDosageResult(data.dosage)
                // Save to history
                saveDrugSearch('dosage', formData.get('drug') as string, { dosage: data.dosage, formData: Object.fromEntries(formData) })
            }
        } catch (error) {
            console.error('Dosage calculation failed:', error)
            toast.error("Dosage Calculation Failed", {
                description: "Unable to calculate dosage. Please try again."
            })
        } finally {
            setDosageLoading(false)
        }
    }

    return (
        <div className="mx-auto max-w-md sm:max-w-2xl lg:max-w-4xl min-h-screen bg-gradient-to-b from-background to-muted/20">
            <div className="min-h-screen bottom-nav-spacing p-3 sm:p-6 lg:p-8">
                <div className="flex items-center justify-between mb-6">
                    <PageHeader
                        title="Drug Search"
                        subtitle="AI-powered drug information from FDA database"
                        icon={<Pill className="w-6 h-6" />}
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/drugs/history')}
                        className="h-9"
                    >
                        <History className="w-4 h-4 mr-1" />
                        History
                    </Button>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                        <TabsTrigger value="search" className="text-xs">
                            <Search className="w-4 h-4 mr-1" />
                            Search
                        </TabsTrigger>
                        <TabsTrigger value="interactions" className="text-xs">
                            <Shield className="w-4 h-4 mr-1" />
                            Interactions
                        </TabsTrigger>
                        <TabsTrigger value="dosage" className="text-xs">
                            <Calculator className="w-4 h-4 mr-1" />
                            Dosage
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="search" className="space-y-4">
                        {/* Search Bar */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Enter drug name (e.g., Aspirin)"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            className="pl-10"
                                        />
                                    </div>
                                    {drugInfo && (
                                        <Button 
                                            onClick={() => {
                                                setDrugInfo(null)
                                                setSearchQuery('')
                                                setError(null)
                                            }} 
                                            variant="outline" 
                                            size="icon"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                        </Button>
                                    )}
                                    <Button onClick={searchDrug} disabled={loading || !searchQuery.trim()} className="px-4">
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Error Message */}
                        <AnimatePresence>
                            {error && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Drug Information */}
                        <AnimatePresence>
                            {(loading || drugInfo) && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="space-y-4">
                                    {/* AI Summary */}
                                    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                                        <CardHeader>
                                            <CardTitle className="flex items-center justify-between text-primary text-base">
                                                <div className="flex items-center gap-2">
                                                    <Brain className="w-5 h-5" />
                                                    AI Summary
                                                    <Sparkles className="w-4 h-4 text-primary/60" />
                                                </div>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {loading ? (
                                                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                                                    <div className="relative">
                                                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                                        <Brain className="w-6 h-6 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-sm font-medium text-primary">AI is analyzing...</p>
                                                        <p className="text-xs text-muted-foreground mt-1">Please wait</p>
                                                    </div>
                                                </div>
                                            ) : drugInfo ? (
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <AudioPlayer text={drugInfo.summary} />
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(drugInfo.summary)
                                                                toast.success('Summary copied to clipboard')
                                                            }}
                                                            className="h-7 px-2 text-xs"
                                                        >
                                                            <Copy className="w-3 h-3 mr-1" />
                                                            Copy
                                                        </Button>
                                                    </div>
                                                    {drugInfo.summary.split('\n\n').map((section, index) => {
                                                        const lines = section.split('\n')
                                                        const title = lines[0]
                                                        const content = lines.slice(1).join('\n')
                                                        
                                                        if (title.includes(':') || title.match(/^[A-Z][a-z\s]+$/)) {
                                                            return (
                                                                <div key={index} className="space-y-1">
                                                                    <h4 className="font-semibold text-xs text-primary border-b border-primary/20 pb-1">
                                                                        {title.replace(':', '')}
                                                                    </h4>
                                                                    <p className="text-xs leading-relaxed text-foreground/90">
                                                                        {content || lines.slice(1).join(' ')}
                                                                    </p>
                                                                </div>
                                                            )
                                                        }
                                                        return (
                                                            <p key={index} className="text-xs leading-relaxed text-foreground/90">
                                                                {section}
                                                            </p>
                                                        )
                                                    })}
                                                </div>
                                            ) : null}
                                        </CardContent>
                                    </Card>

                                    {/* Basic Info */}
                                    {drugInfo && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center justify-between text-base">
                                                    Basic Information
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <AudioPlayer 
                                                    text={`Drug Information: Brand name ${drugInfo.basicInfo.brand_name}, Generic name ${drugInfo.basicInfo.generic_name}, Manufacturer ${drugInfo.basicInfo.manufacturer}, Dosage form ${drugInfo.basicInfo.dosage_form}, Route ${drugInfo.basicInfo.route}, Purpose ${drugInfo.basicInfo.purpose}`} 
                                                />
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <h3 className="font-semibold text-xs text-muted-foreground mb-1">Brand Name</h3>
                                                        <p className="text-sm font-medium">{drugInfo.basicInfo.brand_name}</p>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-xs text-muted-foreground mb-1">Generic Name</h3>
                                                        <p className="text-sm">{drugInfo.basicInfo.generic_name}</p>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-xs text-muted-foreground mb-1">Form</h3>
                                                        <Badge variant="secondary" className="text-xs">
                                                            {drugInfo.basicInfo.dosage_form}
                                                        </Badge>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-xs text-muted-foreground mb-1">Route</h3>
                                                        <Badge variant="outline" className="text-xs">
                                                            {drugInfo.basicInfo.route}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-xs text-muted-foreground mb-1">Manufacturer</h3>
                                                    <p className="text-sm">{drugInfo.basicInfo.manufacturer}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Empty State */}
                        {!drugInfo && !loading && !error && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="p-6 bg-muted/50 rounded-full mb-4">
                                    <Search className="w-12 h-12 text-muted-foreground" />
                                </div>
                                <h3 className="text-base font-semibold mb-2">Search for Drug Information</h3>
                                <p className="text-sm text-muted-foreground">
                                    Enter a drug name to get AI-powered analysis
                                </p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="interactions" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Shield className="w-5 h-5 text-orange-500" />
                                    Drug Interactions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add drug name"
                                        value={interactionQuery}
                                        onChange={(e) => setInteractionQuery(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault()
                                                addDrugToInteraction()
                                            }
                                        }}
                                        className="flex-1"
                                    />
                                    <Button onClick={addDrugToInteraction} size="sm" variant="outline" disabled={!interactionQuery.trim()}>
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                                
                                {interactionDrugs.length > 0 && (
                                    <div className="space-y-3">
                                        <div className="flex flex-wrap gap-2">
                                            {interactionDrugs.map((drug, index) => (
                                                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                                    {drug}
                                                    <X 
                                                        className="w-3 h-3 cursor-pointer" 
                                                        onClick={() => removeDrugFromInteraction(drug)}
                                                    />
                                                </Badge>
                                            ))}
                                        </div>
                                        <Button 
                                            onClick={checkInteractions} 
                                            disabled={interactionDrugs.length < 2 || interactionLoading}
                                            className="w-full"
                                        >
                                            {interactionLoading ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                "Check Interactions"
                                            )}
                                        </Button>
                                    </div>
                                )}
                                
                                {interactionLoading && (
                                    <Card className="border-orange-200 bg-orange-50/50">
                                        <CardContent className="p-4">
                                            <div className="flex flex-col items-center justify-center py-8 space-y-4">
                                                <div className="relative">
                                                    <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
                                                    <Shield className="w-6 h-6 text-orange-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm font-medium text-orange-600">AI is analyzing drug interactions...</p>
                                                    <p className="text-xs text-muted-foreground mt-1">Checking for potential risks</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                                
                                {interactionResult && !interactionLoading && (
                                    <Card className="border-orange-200 bg-orange-50/50">
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <AudioPlayer text={interactionResult} />
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(interactionResult)
                                                        toast.success('Interaction info copied')
                                                    }}
                                                    className="h-7 px-2 text-xs"
                                                >
                                                    <Copy className="w-3 h-3 mr-1" />
                                                    Copy
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setInteractionResult(null)
                                                        setInteractionDrugs([])
                                                    }}
                                                    className="h-7 px-2 text-xs"
                                                >
                                                    <RotateCcw className="w-3 h-3 mr-1" />
                                                    Clear
                                                </Button>
                                            </div>
                                            <div className="space-y-3 mt-3">
                                                {interactionResult.split('\n\n').map((section, index) => {
                                                    const lines = section.split('\n')
                                                    const title = lines[0]
                                                    const content = lines.slice(1).join('\n')
                                                    
                                                    if (title.includes(':') || title.match(/^[A-Z][a-z\s]+$/)) {
                                                        return (
                                                            <div key={index} className="space-y-1">
                                                                <h4 className="font-semibold text-xs text-orange-600 border-b border-orange-200 pb-1">
                                                                    {title.replace(':', '')}
                                                                </h4>
                                                                <p className="text-xs leading-relaxed text-foreground/90">
                                                                    {content || lines.slice(1).join(' ')}
                                                                </p>
                                                            </div>
                                                        )
                                                    }
                                                    return (
                                                        <p key={index} className="text-xs leading-relaxed text-foreground/90">
                                                            {section}
                                                        </p>
                                                    )
                                                })}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                                
                                {interactionDrugs.length === 0 && (
                                    <div className="text-center py-8">
                                        <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-sm text-muted-foreground">
                                            Add 2 or more drugs to check for interactions
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="dosage" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Calculator className="w-5 h-5 text-blue-500" />
                                    Dosage Calculator
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form action={calculateDosage} className="space-y-4">
                                    <Input name="drug" placeholder="Drug name" required />
                                    <div className="grid grid-cols-2 gap-3">
                                        <Input name="weight" placeholder="Weight (kg)" type="number" required />
                                        <Input name="age" placeholder="Age (years)" type="number" required />
                                    </div>
                                    <Input name="condition" placeholder="Condition/Indication" required />
                                    <div className="grid grid-cols-2 gap-3">
                                        <Input name="renal" placeholder="Renal function" />
                                        <Input name="hepatic" placeholder="Hepatic function" />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={dosageLoading}>
                                        {dosageLoading ? (
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Calculating...</span>
                                            </div>
                                        ) : (
                                            "Calculate Dosage"
                                        )}
                                    </Button>
                                </form>
                                
                                {dosageLoading && (
                                    <Card className="mt-4 border-blue-200 bg-blue-50/50">
                                        <CardContent className="p-4">
                                            <div className="flex flex-col items-center justify-center py-8 space-y-4">
                                                <div className="relative">
                                                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                                                    <Calculator className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm font-medium text-blue-600">AI is calculating dosage...</p>
                                                    <p className="text-xs text-muted-foreground mt-1">Considering patient factors</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                                
                                {dosageResult && !dosageLoading && (
                                    <Card className="mt-4 border-blue-200 bg-blue-50/50">
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <AudioPlayer text={dosageResult} />
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(dosageResult)
                                                        toast.success('Dosage info copied')
                                                    }}
                                                    className="h-7 px-2 text-xs"
                                                >
                                                    <Copy className="w-3 h-3 mr-1" />
                                                    Copy
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setDosageResult(null)}
                                                    className="h-7 px-2 text-xs"
                                                >
                                                    <RotateCcw className="w-3 h-3 mr-1" />
                                                    Clear
                                                </Button>
                                            </div>
                                            <div className="space-y-3 mt-3">
                                                {dosageResult.split('\n\n').map((section, index) => {
                                                    const lines = section.split('\n')
                                                    const title = lines[0]
                                                    const content = lines.slice(1).join('\n')
                                                    
                                                    if (title.includes(':') || title.match(/^[A-Z][a-z\s]+$/)) {
                                                        return (
                                                            <div key={index} className="space-y-1">
                                                                <h4 className="font-semibold text-xs text-blue-600 border-b border-blue-200 pb-1">
                                                                    {title.replace(':', '')}
                                                                </h4>
                                                                <p className="text-xs leading-relaxed text-foreground/90">
                                                                    {content || lines.slice(1).join(' ')}
                                                                </p>
                                                            </div>
                                                        )
                                                    }
                                                    return (
                                                        <p key={index} className="text-xs leading-relaxed text-foreground/90">
                                                            {section}
                                                        </p>
                                                    )
                                                })}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                                
                                {!dosageResult && !dosageLoading && (
                                    <div className="text-center py-8">
                                        <Calculator className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-sm text-muted-foreground">
                                            Enter patient details for personalized dosage calculation
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
            <BottomNav />
        </div>
    )
}
