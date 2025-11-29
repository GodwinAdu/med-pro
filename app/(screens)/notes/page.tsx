"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BottomNav } from "@/components/bottom-nav"
import { ArrowLeft, Save, Sparkles, Stethoscope, UserCheck, X, Loader2, Wand2 } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

import { toast } from "sonner"

const nursingNoteTypes = [
  { value: "admission", label: "Admission Note" },
  { value: "initial-assessment", label: "Initial Assessment Note" },
  { value: "shift-routine", label: "Shift/Routine Note" },
  { value: "progress", label: "Progress Note" },
  { value: "pre-operative", label: "Pre-operative Note" },
  { value: "post-operative", label: "Post-operative Note" },
  { value: "transfer", label: "Transfer Note" },
  { value: "referral", label: "Referral Note" },
  { value: "incident", label: "Incident/Accident Note" },
  { value: "discharge", label: "Discharge Note" },
  { value: "death", label: "Death Note" },
  { value: "care-plan", label: "Nursing Care Plan Note" }
]

const doctorNoteTypes = [
  { value: "admission-clerking", label: "Admission Note (Clerking)" },
  { value: "daily-review", label: "Daily Review/Progress Note" },
  { value: "consultation", label: "Consultation Note" },
  { value: "pre-operative", label: "Pre-operative Note" },
  { value: "post-operative", label: "Post-operative Note" },
  { value: "procedure", label: "Procedure Note" },
  { value: "discharge-summary", label: "Discharge Summary" },
  { value: "referral", label: "Referral Note" },
  { value: "follow-up", label: "Follow-up Note" },
  { value: "death", label: "Death Note" },
  { value: "transfer", label: "Transfer Note" }
]

const generateNursingTemplate = (type: string) => {
  const templates = {
    "admission": `ADMISSION NOTE
Date/Time: ${new Date().toLocaleString()}
Patient Name: [Patient Name]
Age: [Age] years
Sex: [M/F]

REASON FOR ADMISSION:
[Chief complaint and reason for admission]

MEDICAL HISTORY:
- Past medical history: [List conditions]
- Surgical history: [List surgeries]
- Medications: [Current medications]
- Allergies: [Known allergies or NKDA]

VITAL SIGNS:
- BP: [___/___] mmHg
- Pulse: [___] bpm
- Respiratory rate: [___] /min
- Temperature: [___]°C
- SpO₂: [___%]
- Weight: [___] kg

PHYSICAL ASSESSMENT:
- General appearance: [Alert/confused/distressed]
- Neurological: [Conscious level, orientation]
- Cardiovascular: [Heart sounds, peripheral pulses]
- Respiratory: [Breath sounds, breathing pattern]
- Gastrointestinal: [Bowel sounds, abdomen]
- Genitourinary: [Urination pattern]
- Skin: [Color, temperature, integrity]
- Mobility: [Ambulatory/bed-bound/assistance needed]

INITIAL NURSING PLAN:
- Monitor vital signs q[frequency]
- [Specific nursing interventions]
- [Safety measures]
- [Patient education needs]

Nurse: [Your name]
Signature: ________________`,

    "shift-routine": `SHIFT NURSING NOTE
Date/Time: ${new Date().toLocaleString()}
Shift: [Day/Evening/Night]
Patient: [Name], [Age]y/o [M/F]

PATIENT CONDITION:
- General status: [Stable/improved/deteriorated]
- Level of consciousness: [Alert/drowsy/confused]
- Pain level: [0-10 scale] Location: [___]

VITAL SIGNS:
- BP: [___/___] mmHg
- Pulse: [___] bpm (regular/irregular)
- Resp: [___] /min
- Temp: [___]°C
- SpO₂: [___%]

MEDICATIONS ADMINISTERED:
- [Time] [Medication] [Dose] [Route]
- [Time] [Medication] [Dose] [Route]

NURSING INTERVENTIONS:
- [Interventions performed]
- [Patient response]
- [Any concerns or changes]

INTAKE/OUTPUT:
- Oral intake: [___] ml
- IV fluids: [___] ml
- Urine output: [___] ml

PLAN FOR NEXT SHIFT:
- [Continuing care]
- [Special observations needed]

Nurse: [Your name]`,

    "progress": `PROGRESS NOTE
Date/Time: ${new Date().toLocaleString()}
Patient: [Name]

SUBJECTIVE:
Patient reports: [Patient's complaints/concerns]

OBJECTIVE:
- Vital signs: BP [___/___], P [___], R [___], T [___]°C
- Physical findings: [Observable changes]
- Behavior/mood: [Patient's demeanor]

ASSESSMENT:
- Current condition: [Improving/stable/declining]
- Response to treatment: [Effective/needs adjustment]
- New concerns: [Any new issues identified]

PLAN:
- Continue current interventions
- [Any changes to care plan]
- [Communication with physician if needed]
- [Patient/family education]

Nurse: [Your name]`
  }
  
  return templates[type as keyof typeof templates] || `${type.toUpperCase()} NOTE\nDate/Time: ${new Date().toLocaleString()}\n\n[Please provide details for this note type]`
}

const generateDoctorTemplate = (type: string) => {
  const templates = {
    "admission-clerking": `DOCTOR'S ADMISSION NOTE (CLERKING)
Date/Time: ${new Date().toLocaleString()}
Name: [Patient Name]
Age: [Age] years
Sex: [M/F]
Hospital Number: [___]

CHIEF COMPLAINT:
[Main reason for admission]

HISTORY OF PRESENTING COMPLAINT:
[Detailed history of current illness]
- Onset: [When symptoms started]
- Duration: [How long]
- Character: [Description of symptoms]
- Associated symptoms: [Related symptoms]
- Relieving/aggravating factors: [What makes it better/worse]

PAST MEDICAL HISTORY:
- [Previous medical conditions]
- [Previous surgeries]
- [Previous hospitalizations]

MEDICATIONS:
- [Current medications with doses]

ALLERGIES:
[Known allergies or NKDA]

SOCIAL HISTORY:
- Smoking: [Yes/No, pack years]
- Alcohol: [Usage pattern]
- Occupation: [___]

FAMILY HISTORY:
[Relevant family medical history]

VITAL SIGNS:
- BP: [___/___] mmHg
- Pulse: [___] bpm
- Respiratory rate: [___] /min
- Temperature: [___]°C
- SpO₂: [___%]
- Weight: [___] kg

PHYSICAL EXAMINATION:
General: [Appearance, distress level]
CVS: [Heart sounds, murmurs, peripheral pulses]
Respiratory: [Breath sounds, chest expansion]
Abdomen: [Inspection, palpation, bowel sounds]
CNS: [Consciousness, orientation, reflexes]
Others: [Relevant system examination]

INVESTIGATIONS:
[Lab results, imaging, ECG findings]

ASSESSMENT:
[Clinical impression/diagnosis]

PLAN:
1. [Treatment plan]
2. [Investigations needed]
3. [Monitoring requirements]
4. [Specialist referrals if needed]

Doctor: [Your name]
Designation: [___]`,

    "daily-review": `DAILY REVIEW/PROGRESS NOTE (SOAP Format)
Date/Time: ${new Date().toLocaleString()}
Patient: [Name], [Age]y/o [M/F]

SUBJECTIVE:
Patient reports: [Patient's complaints, symptoms, concerns]

OBJECTIVE:
Vital Signs: BP [___/___], P [___], R [___], T [___]°C, SpO₂ [___%]
Physical Examination:
- General: [Appearance, alertness]
- Relevant system findings: [Key physical findings]
Laboratory/Investigations: [Recent results]

ASSESSMENT:
- Primary diagnosis: [Current assessment]
- Progress: [Improving/stable/deteriorating]
- Response to treatment: [Effectiveness of current plan]
- New issues: [Any new concerns]

PLAN:
1. Continue: [Current effective treatments]
2. Modify: [Changes to treatment]
3. Add: [New interventions]
4. Monitor: [Parameters to watch]
5. Review: [When to reassess]

Doctor: [Your name]`,

    "discharge-summary": `DISCHARGE SUMMARY
Date of Admission: [___]
Date of Discharge: ${new Date().toLocaleDateString()}
Patient: [Name], [Age]y/o [M/F]
Hospital Number: [___]

FINAL DIAGNOSIS:
Primary: [Main diagnosis]
Secondary: [Other conditions]

HOSPITAL COURSE:
[Summary of patient's stay, treatments given, response to treatment, complications if any]

INVESTIGATIONS PERFORMED:
[Key lab results, imaging, procedures]

MEDICATIONS ON DISCHARGE:
1. [Medication] [Dose] [Frequency] [Duration]
2. [Medication] [Dose] [Frequency] [Duration]

DISCHARGE INSTRUCTIONS:
- Activity: [Restrictions/recommendations]
- Diet: [Special dietary instructions]
- Wound care: [If applicable]
- Warning signs: [When to seek medical attention]

FOLLOW-UP:
- [Specialty] clinic in [timeframe]
- GP follow-up in [timeframe]
- [Any specific appointments]

PROGNOSIS:
[Expected outcome]

Discharging Doctor: [Your name]
Designation: [___]`
  }
  
  return templates[type as keyof typeof templates] || `${type.toUpperCase()} NOTE\nDate/Time: ${new Date().toLocaleString()}\n\n[Please provide details for this note type]`
}

interface Note {
  id: string
  title: string
  content: string
  noteType: string
  profession: string
  timestamp: string
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("nurses")
  const [selectedType, setSelectedType] = useState("")
  const [noteTitle, setNoteTitle] = useState("")
  const [noteContent, setNoteContent] = useState("")
  const [userInput, setUserInput] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [showGenerator, setShowGenerator] = useState(false)
  const [expandedNote, setExpandedNote] = useState<string | null>(null)

  const handleTypeSelect = (type: string) => {
    setSelectedType(type)
    const selectedOption = activeTab === "nurses" 
      ? nursingNoteTypes.find(t => t.value === type)
      : doctorNoteTypes.find(t => t.value === type)
    
    setNoteTitle(selectedOption?.label || "")
    setNoteContent("")
    setUserInput("")
    setShowGenerator(true)
  }

  const generateAINote = async () => {
    if (!userInput.trim()) {
      toast.error("Please provide patient information")
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/notes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          noteType: selectedType,
          profession: activeTab,
          userInput: userInput.trim(),
          noteTitle
        })
      })

      if (response.ok) {
        const data = await response.json()
        setNoteContent(data.generatedNote)
        toast.success("Note generated successfully!")
      } else {
        throw new Error('Failed to generate note')
      }
    } catch (error) {
      console.error('Error generating note:', error)
      toast.error('Failed to generate note. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/notes/fetch')
      if (response.ok) {
        const data = await response.json()
        setNotes(data.notes)
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!noteContent.trim()) {
      toast.error("Please add note content")
      return
    }
    
    try {
      const response = await fetch('/api/notes/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: noteTitle,
          content: noteContent,
          noteType: selectedType,
          profession: activeTab
        })
      })

      if (response.ok) {
        const data = await response.json()
        setNotes(prev => [data.note, ...prev])
        setNoteTitle("")
        setNoteContent("")
        setUserInput("")
        setSelectedType("")
        setShowGenerator(false)
        toast.success("Note saved successfully")
      } else {
        throw new Error('Failed to save note')
      }
    } catch (error) {
      toast.error('Failed to save note')
    }
  }

  const handleDeleteNote = async (id: string) => {
    try {
      const response = await fetch(`/api/notes/delete?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setNotes(prev => prev.filter(note => note.id !== id))
        toast.success("Note deleted")
      } else {
        throw new Error('Failed to delete note')
      }
    } catch (error) {
      toast.error('Failed to delete note')
    }
  }

  return (
    <div className="mx-auto max-w-md min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="min-h-screen bottom-nav-spacing p-4">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/">
            <Button variant="outline" size="sm" className="hover:bg-muted">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Nurses/Doctors Notes</h1>
            <p className="text-sm text-muted-foreground">Professional clinical documentation</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="nurses" className="flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              Nurses
            </TabsTrigger>
            <TabsTrigger value="doctors" className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4" />
              Doctors
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nurses" className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Select Nursing Note Type</Label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.open('/api/notes/guidelines?profession=nurses', '_blank')}
                  className="text-xs"
                >
                  📄 Guidelines PDF
                </Button>
              </div>
              <Select value={selectedType} onValueChange={handleTypeSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose note type..." />
                </SelectTrigger>
                <SelectContent>
                  {nursingNoteTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Card>
          </TabsContent>

          <TabsContent value="doctors" className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Select Doctor's Note Type</Label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.open('/api/notes/guidelines?profession=doctors', '_blank')}
                  className="text-xs"
                >
                  📄 Guidelines PDF
                </Button>
              </div>
              <Select value={selectedType} onValueChange={handleTypeSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose note type..." />
                </SelectTrigger>
                <SelectContent>
                  {doctorNoteTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Card>
          </TabsContent>
        </Tabs>

        {/* AI Note Generator */}
        {showGenerator && selectedType && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 mb-6"
          >
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-white border-blue-200">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Wand2 className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">AI Note Generator</h3>
                </div>
                
                <div>
                  <Label className="text-sm font-medium mb-2 block text-blue-800">
                    Provide Brief Patient Information
                  </Label>
                  <p className="text-xs text-blue-600 mb-3">
                    {activeTab === "nurses" 
                      ? "Example: Patient John Doe, 45M, admitted 2pm with chest pain, BP 160/90, alert and oriented, no allergies, diabetic on metformin"
                      : "Example: Mr. Smith, 60M, chest pain 2hrs, radiating to left arm, sweating, HTN, DM, on amlodipine, ECG shows ST elevation"
                    }
                  </p>
                  <Textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="min-h-[120px] border-2 focus:border-blue-500"
                    placeholder={`Enter key patient details for ${noteTitle.toLowerCase()}...`}
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={generateAINote} 
                    disabled={isGenerating || !userInput.trim()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Note
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowGenerator(false)
                      setSelectedType("")
                      setUserInput("")
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Generated Note Editor */}
        {noteContent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 mb-6"
          >
            <Card className="p-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Save className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-green-900">Generated Note - Review & Save</h3>
                </div>
                
                <div>
                  <Label className="text-sm font-medium mb-2 block">Note Title</Label>
                  <Input
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="Enter note title"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium mb-2 block">Generated Note Content</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Review and edit the generated note as needed before saving.
                  </p>
                  <Textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="min-h-[400px] font-mono text-sm border-2 focus:border-green-500"
                    placeholder="Generated note content will appear here..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSave} className="flex-1 bg-green-600 hover:bg-green-700">
                    <Save className="w-4 h-4 mr-2" />
                    Save Note
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowGenerator(true)
                      setNoteContent("")
                    }}
                  >
                    Regenerate
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedType("")
                      setNoteTitle("")
                      setNoteContent("")
                      setUserInput("")
                      setShowGenerator(false)
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Saved Notes */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Saved Notes ({notes.length})</h2>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
                  </div>
                </Card>
              ))}
            </div>
          ) : notes.length === 0 ? (
            <Card className="p-6 text-center">
              <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Notes Yet</h3>
              <p className="text-muted-foreground text-sm">
                Select a note type above to create your first professional clinical note.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {notes.map((note, index) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div 
                        className="flex-1 min-w-0 cursor-pointer" 
                        onClick={() => setExpandedNote(expandedNote === note.id ? null : note.id)}
                      >
                        <h4 className="font-medium text-sm mb-1 truncate">
                          {note.title}
                        </h4>
                        {expandedNote === note.id ? (
                          <div className="text-sm text-muted-foreground mb-2 whitespace-pre-wrap">
                            {note.content}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
                            {note.content}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {note.timestamp}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-muted-foreground hover:text-red-600 hover:bg-red-50 p-1 h-auto"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}