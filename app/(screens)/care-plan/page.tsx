"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { BottomNav } from "@/components/bottom-nav"
import { PageHeader } from "@/components/page-header"
import { ClipboardList, Loader2, FileText, User, Calendar, Clock, AlertCircle, Download, Volume2 } from "lucide-react"
import { toast } from "sonner"
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { AudioPlayer } from "@/components/audio-player"
import { VoiceRecorder } from "@/components/voice-recorder"

interface CarePlan {
  patientInfo: {
    name: string
    age: string
    diagnosis: string
  }
  problems: Array<{
    number: number
    problem: string
    nursingDiagnosis: string
    goals: {
      shortTerm: string
      longTerm: string
    }
    interventions: string[]
    rationale: string[]
    evaluation: string[]
  }>
}

export default function CarePlanPage() {
  const [patientInfo, setPatientInfo] = useState("")
  const [carePlan, setCarePlan] = useState<CarePlan | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const pdfRef = useRef<HTMLDivElement>(null)

  const generateCarePlan = async () => {
    if (!patientInfo.trim()) {
      toast.error("Please enter patient information")
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch('/api/care-plan/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: patientInfo })
      })

      if (response.status === 403) {
        const errorData = await response.json()
        if (errorData.insufficientCoins) {
          toast.error("Insufficient Coins", {
            description: `Need 15 coins for care plan. You have ${errorData.coinBalance || 0} coins. Buy more to continue.`
          })
        } else {
          toast.error("Access Denied", {
            description: errorData.error || "Unable to generate care plan"
          })
        }
        return
      }

      if (!response.ok) {
        throw new Error('Failed to generate care plan')
      }

      const data = await response.json()
      setCarePlan(data.carePlan)
      toast.success("Professional care plan generated successfully")

    } catch (error) {
      console.error('Care plan generation error:', error)
      toast.error("Failed to generate care plan")
    } finally {
      setIsGenerating(false)
    }
  }

  const exportToPDF = async () => {
    if (!carePlan) return

    setIsExporting(true)
    
    try {
      // Create a temporary div with the care plan content
      const tempDiv = document.createElement('div')
      tempDiv.style.position = 'absolute'
      tempDiv.style.left = '-9999px'
      tempDiv.style.width = '210mm'
      tempDiv.style.padding = '20px'
      tempDiv.style.fontFamily = 'Arial, sans-serif'
      tempDiv.style.fontSize = '12px'
      tempDiv.style.lineHeight = '1.4'
      tempDiv.style.backgroundColor = 'white'
      
      tempDiv.innerHTML = `
        <div style="text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px;">
          <h1 style="color: #1e40af; margin: 0; font-size: 20px;">COMPREHENSIVE NURSING CARE PLAN</h1>
          <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 10px;">Generated on ${new Date().toLocaleDateString()}</p>
        </div>

        <div style="margin-bottom: 20px; padding: 10px; background: #f8fafc; border-radius: 6px;">
          <h3 style="margin: 0 0 10px 0; color: #374151;">PATIENT INFORMATION</h3>
          <div><strong>Name:</strong> ${carePlan.patientInfo.name}</div>
          <div><strong>Age:</strong> ${carePlan.patientInfo.age}</div>
          <div><strong>Primary Diagnosis:</strong> ${carePlan.patientInfo.diagnosis}</div>
        </div>

        ${carePlan.problems.map(problem => `
          <div style="margin-bottom: 20px; page-break-inside: avoid;">
            <h3 style="background: #2563eb; color: white; padding: 8px; margin: 0 0 10px 0; font-size: 14px;">
              ${problem.number}. Problem: ${problem.problem}
            </h3>
            
            <div style="margin: 10px 0;">
              <strong style="color: #2563eb;">Nursing Diagnosis:</strong>
              <div style="margin: 5px 0; padding: 8px; background: #dbeafe; border-radius: 4px; font-size: 11px;">
                ${problem.nursingDiagnosis}
              </div>
            </div>
            
            <div style="margin: 10px 0;">
              <strong style="color: #059669;">Goals / Expected Outcomes:</strong>
              <div style="margin: 5px 0; padding: 6px; background: #ecfdf5; border-radius: 4px; font-size: 11px;">
                <strong>Short-term:</strong> ${problem.goals.shortTerm}
              </div>
              <div style="margin: 5px 0; padding: 6px; background: #ecfdf5; border-radius: 4px; font-size: 11px;">
                <strong>Long-term:</strong> ${problem.goals.longTerm}
              </div>
            </div>
            
            <div style="margin: 10px 0;">
              <strong style="color: #7c3aed;">Nursing Interventions:</strong>
              <ul style="margin: 5px 0; padding-left: 15px; font-size: 11px;">
                ${problem.interventions.map(intervention => `<li style="margin: 2px 0;">${intervention}</li>`).join('')}
              </ul>
            </div>
            
            <div style="margin: 10px 0;">
              <strong style="color: #ea580c;">Rationale:</strong>
              <ul style="margin: 5px 0; padding-left: 15px; font-size: 11px;">
                ${problem.rationale.map(rationale => `<li style="margin: 2px 0;">${rationale}</li>`).join('')}
              </ul>
            </div>
            
            <div style="margin: 10px 0;">
              <strong style="color: #dc2626;">Evaluation:</strong>
              <ul style="margin: 5px 0; padding-left: 15px; font-size: 11px;">
                ${problem.evaluation.map(evaluation => `<li style="margin: 2px 0;">${evaluation}</li>`).join('')}
              </ul>
            </div>
          </div>
        `).join('')}

        <div style="text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 10px;">
          <p>This care plan was generated using AI assistance and should be reviewed by a qualified healthcare professional.</p>
          <p>Generated by MedPro Care Plan System</p>
        </div>
      `
      
      document.body.appendChild(tempDiv)
      
      // Convert to canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      })
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgData = canvas.toDataURL('image/png')
      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }
      
      // Download PDF
      pdf.save(`Care_Plan_${carePlan.patientInfo.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`)
      
      // Clean up
      document.body.removeChild(tempDiv)
      
      toast.success("Care plan exported as PDF successfully")
    } catch (error) {
      console.error('PDF export error:', error)
      toast.error("Failed to export PDF")
    } finally {
      setIsExporting(false)
    }
  }

  const saveCarePlan = async () => {
    if (!carePlan) return

    try {
      const response = await fetch('/api/care-plan/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(carePlan)
      })

      if (!response.ok) {
        throw new Error('Failed to save care plan')
      }

      toast.success("Care plan saved successfully")
      
    } catch (error) {
      console.error('Save error:', error)
      toast.error("Failed to save care plan")
    }
  }

  const resetForm = () => {
    setPatientInfo("")
    setCarePlan(null)
  }

  return (
    <div className="mx-auto max-w-md min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="min-h-screen bottom-nav-spacing p-4">
        <PageHeader
          title="Care Plan Generator"
          subtitle="AI-powered comprehensive care plans"
          icon={<ClipboardList className="w-6 h-6" />}
        />

        {!carePlan ? (
          <Card className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Generate Professional Care Plan</h2>
              <p className="text-sm text-muted-foreground">
                Enter patient information and let AI create a comprehensive, evidence-based care plan
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Patient Information
                </label>
                
                <VoiceRecorder 
                  onTranscript={(text) => setPatientInfo(prev => prev + (prev ? ' ' : '') + text)}
                  placeholder="Record patient information..."
                />
                
                <Textarea
                  value={patientInfo}
                  onChange={(e) => setPatientInfo(e.target.value)}
                  placeholder="Enter comprehensive patient information including:&#10;&#10;• Patient name, age, gender&#10;• Primary diagnosis and symptoms&#10;• Medical history and comorbidities&#10;• Current medications&#10;• Allergies and contraindications&#10;• Social history (smoking, alcohol, etc.)&#10;• Physical examination findings&#10;• Laboratory results (if available)&#10;• Treatment preferences or limitations&#10;&#10;Example:&#10;John Smith, 65-year-old male with newly diagnosed Type 2 Diabetes Mellitus (HbA1c 8.5%). History of hypertension controlled with lisinopril 10mg daily. BMI 32, sedentary lifestyle, former smoker. No known drug allergies. Lives alone, retired. Recent labs show elevated glucose, normal kidney function."
                  className="min-h-[300px] text-sm mt-3"
                  disabled={isGenerating}
                />
              </div>

              <Button 
                onClick={generateCarePlan}
                disabled={isGenerating || !patientInfo.trim()}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Generating Professional Care Plan...
                  </>
                ) : (
                  <>
                    <ClipboardList className="w-5 h-5 mr-2" />
                    Generate Care Plan
                  </>
                )}
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Display care plan sections */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold">Patient Information</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div><strong>Name:</strong> {carePlan.patientInfo.name}</div>
                <div><strong>Age:</strong> {carePlan.patientInfo.age}</div>
                <div><strong>Primary Diagnosis:</strong> {carePlan.patientInfo.diagnosis}</div>
              </div>
            </Card>

            {carePlan.problems.map((problem) => {
              const problemText = `Problem ${problem.number}: ${problem.problem}. Nursing Diagnosis: ${problem.nursingDiagnosis}. Short-term goal: ${problem.goals.shortTerm}. Long-term goal: ${problem.goals.longTerm}. Interventions: ${problem.interventions.join(', ')}. Rationale: ${problem.rationale.join(', ')}. Evaluation: ${problem.evaluation.join(', ')}.`
              
              return (
              <Card key={problem.number} className="p-4">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{problem.number}. Problem: {problem.problem}</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => {}}
                    >
                      <Volume2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <AudioPlayer text={problemText} />
                  
                  <div className="space-y-3 text-sm">
                    <div>
                      <strong className="text-blue-600">Nursing Diagnosis:</strong>
                      <p className="mt-1 pl-4 border-l-2 border-blue-200">{problem.nursingDiagnosis}</p>
                    </div>
                    
                    <div>
                      <strong className="text-green-600">Goals / Expected Outcomes:</strong>
                      <div className="mt-1 space-y-1">
                        <div className="pl-4 border-l-2 border-green-200">
                          <strong>Short-term:</strong> {problem.goals.shortTerm}
                        </div>
                        <div className="pl-4 border-l-2 border-green-200">
                          <strong>Long-term:</strong> {problem.goals.longTerm}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <strong className="text-purple-600">Nursing Interventions:</strong>
                      <ul className="mt-1 space-y-1">
                        {problem.interventions.map((intervention, idx) => (
                          <li key={idx} className="flex items-start gap-2 pl-4">
                            <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0"></span>
                            {intervention}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <strong className="text-orange-600">Rationale:</strong>
                      <ul className="mt-1 space-y-1">
                        {problem.rationale.map((rationale, idx) => (
                          <li key={idx} className="flex items-start gap-2 pl-4">
                            <span className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0"></span>
                            {rationale}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <strong className="text-red-600">Evaluation:</strong>
                      <ul className="mt-1 space-y-1">
                        {problem.evaluation.map((evaluation, idx) => (
                          <li key={idx} className="flex items-start gap-2 pl-4">
                            <span className="w-1.5 h-1.5 bg-red-600 rounded-full mt-2 flex-shrink-0"></span>
                            {evaluation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            )})}

            {/* Action Buttons */}
            <div className="flex gap-3 pb-4">
              <Button 
                onClick={exportToPDF}
                disabled={isExporting}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
Export PDF
              </Button>
              <Button 
                onClick={saveCarePlan}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Save Plan
              </Button>
              <Button 
                onClick={resetForm}
                variant="outline"
                className="flex-1"
              >
                New Plan
              </Button>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}