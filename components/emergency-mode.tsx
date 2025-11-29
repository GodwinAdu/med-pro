"use client"

import { useState } from "react"
import { AlertTriangle, Phone, Heart, Zap, Pill, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const emergencyContacts = [
  { name: "Emergency Services", number: "911", type: "emergency" },
  { name: "Poison Control", number: "1-800-222-1222", type: "poison" },
  { name: "Crisis Hotline", number: "988", type: "mental" }
]

const criticalDrugs = [
  { name: "Epinephrine", indication: "Anaphylaxis", dosage: "0.3-0.5mg IM", route: "Intramuscular" },
  { name: "Naloxone", indication: "Opioid Overdose", dosage: "0.4-2mg IV/IM", route: "IV/IM" },
  { name: "Atropine", indication: "Bradycardia", dosage: "0.5-1mg IV", route: "Intravenous" },
  { name: "Adenosine", indication: "SVT", dosage: "6mg IV push", route: "Rapid IV" }
]

const vitalSigns = [
  { parameter: "Heart Rate", normal: "60-100 bpm", critical: "<50 or >120 bpm" },
  { parameter: "Blood Pressure", normal: "120/80 mmHg", critical: "<90/60 or >180/110" },
  { parameter: "Respiratory Rate", normal: "12-20/min", critical: "<10 or >30/min" },
  { parameter: "Temperature", normal: "98.6°F (37°C)", critical: "<95°F or >104°F" }
]

export function EmergencyMode() {
  const [activeTab, setActiveTab] = useState<'contacts' | 'drugs' | 'vitals'>('contacts')

  const callEmergency = (number: string) => {
    window.open(`tel:${number}`, '_self')
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive" className="fixed bottom-20 right-4 z-50 rounded-full w-14 h-14 shadow-lg">
          <AlertTriangle className="w-6 h-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Emergency Mode
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-1 mb-4">
          <Button
            variant={activeTab === 'contacts' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('contacts')}
            className="flex-1"
          >
            <Phone className="w-4 h-4 mr-1" />
            Contacts
          </Button>
          <Button
            variant={activeTab === 'drugs' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('drugs')}
            className="flex-1"
          >
            <Pill className="w-4 h-4 mr-1" />
            Drugs
          </Button>
          <Button
            variant={activeTab === 'vitals' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('vitals')}
            className="flex-1"
          >
            <Heart className="w-4 h-4 mr-1" />
            Vitals
          </Button>
        </div>

        {activeTab === 'contacts' && (
          <div className="space-y-2">
            {emergencyContacts.map((contact) => (
              <Card key={contact.number} className="border-red-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-sm">{contact.name}</h3>
                      <p className="text-lg font-mono">{contact.number}</p>
                    </div>
                    <Button
                      onClick={() => callEmergency(contact.number)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      Call
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'drugs' && (
          <div className="space-y-2">
            {criticalDrugs.map((drug) => (
              <Card key={drug.name} className="border-orange-200">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{drug.name}</h3>
                      <Badge variant="outline" className="text-xs mb-1">{drug.indication}</Badge>
                      <p className="text-sm"><strong>Dose:</strong> {drug.dosage}</p>
                      <p className="text-sm"><strong>Route:</strong> {drug.route}</p>
                    </div>
                    <Zap className="w-4 h-4 text-orange-500 mt-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'vitals' && (
          <div className="space-y-2">
            {vitalSigns.map((vital) => (
              <Card key={vital.parameter} className="border-blue-200">
                <CardContent className="p-3">
                  <h3 className="font-semibold text-sm mb-1">{vital.parameter}</h3>
                  <div className="space-y-1">
                    
                    <p className="text-sm"><span className="text-green-600">Normal:</span> {vital.normal}</p>
                    <p className="text-sm"><span className="text-red-600">Critical:</span> {vital.critical}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center gap-2 text-red-700">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Time is critical in emergencies</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}