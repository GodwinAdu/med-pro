"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BottomNav } from "@/components/bottom-nav"
import { ArrowLeft, FileText, AlertTriangle, CreditCard, Users } from "lucide-react"
import Link from "next/link"

export default function TermsOfServicePage() {
  return (
    <div className="mx-auto max-w-md min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="min-h-screen bottom-nav-spacing p-4">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/profile">
            <Button variant="outline" size="sm" className="hover:bg-muted">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Terms of Service</h1>
            <p className="text-sm text-muted-foreground">Last updated: December 2024</p>
          </div>
        </div>

        <div className="space-y-4">
          <Card className="p-4 bg-gradient-to-br from-red-50 to-white border-red-200">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h2 className="font-semibold text-red-900">Important Medical Disclaimer</h2>
            </div>
            <p className="text-sm text-red-800">
              This app provides AI-assisted medical information for educational and reference purposes only. 
              It is not a substitute for professional medical advice, diagnosis, or treatment.
            </p>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Acceptance of Terms
            </h3>
            <p className="text-sm text-muted-foreground">
              By using this application, you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our services.
            </p>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3">Service Description</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Our app provides AI-powered medical assistance including:
            </p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Symptom analysis and preliminary diagnosis suggestions</li>
              <li>• Prescription generation and drug information</li>
              <li>• Nursing care plan development</li>
              <li>• Medical documentation and PDF export</li>
              <li>• Voice-to-text and text-to-speech functionality</li>
            </ul>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3">User Responsibilities</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Provide accurate and complete medical information</li>
              <li>• Use the app responsibly and ethically</li>
              <li>• Maintain confidentiality of your account credentials</li>
              <li>• Comply with applicable laws and regulations</li>
              <li>• Seek professional medical advice for serious conditions</li>
              <li>• Not use the app for emergency medical situations</li>
            </ul>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Payments and Credit System
            </h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground">Pay-Per-Use Model:</h4>
                <p>Our app operates on a credit-based system where you purchase credits and use them for specific features.</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground">Feature Costs:</h4>
                <p>Chat: 5 credits, Diagnosis: 5 credits, Prescription: 8 credits, Care Plan: 15 credits, Drug Search: 2 credits, Voice: 3 credits</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground">Payment Processing:</h4>
                <p>All payments are processed securely through Paystack. Credits are added to your account immediately upon successful payment.</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground">No Refund Policy:</h4>
                <p>All credit purchases are final and non-refundable. Credits do not expire and remain in your account for future use.</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3">Prohibited Uses</h3>
            <p className="text-sm text-muted-foreground mb-2">You may not use our service to:</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Provide medical advice to others without proper qualifications</li>
              <li>• Share or distribute generated prescriptions illegally</li>
              <li>• Attempt to reverse engineer or hack the system</li>
              <li>• Upload malicious content or spam</li>
              <li>• Violate any applicable laws or regulations</li>
              <li>• Impersonate healthcare professionals</li>
            </ul>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3">Intellectual Property</h3>
            <p className="text-sm text-muted-foreground">
              All content, features, and functionality are owned by us and protected by copyright, 
              trademark, and other intellectual property laws. You retain ownership of your medical data.
            </p>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3">Limitation of Liability</h3>
            <p className="text-sm text-muted-foreground">
              We provide the service "as is" without warranties. We are not liable for any medical 
              decisions made based on app suggestions. Our liability is limited to the amount paid for services.
            </p>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3">Account Termination</h3>
            <p className="text-sm text-muted-foreground">
              We may suspend or terminate accounts for violations of these terms. 
              You may delete your account at any time through the app settings. Upon account deletion, unused credits will be forfeited.
            </p>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Referral Program
            </h3>
            <p className="text-sm text-muted-foreground">
              Referrers receive 50 credits, new users get 25 credits when using a referral code. Referral abuse or fraud may result in account suspension and forfeiture of bonus credits.
            </p>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3">Changes to Terms</h3>
            <p className="text-sm text-muted-foreground">
              We may update these terms periodically. Continued use of the service constitutes acceptance of updated terms.
            </p>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3">Contact Information</h3>
            <p className="text-sm text-muted-foreground">
              For questions about these terms, contact us at:
            </p>
            <p className="text-sm font-medium mt-2">jutechdevs@gmail.com</p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-amber-50 to-white border-amber-200">
            <p className="text-sm text-amber-800">
              <strong>Emergency Notice:</strong> This app is not for medical emergencies. 
              Call emergency services (911/999) or visit the nearest hospital for urgent medical care.
            </p>
          </Card>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}