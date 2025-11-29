"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BottomNav } from "@/components/bottom-nav"
import { ArrowLeft, Shield, Lock, Eye, Database } from "lucide-react"
import Link from "next/link"

export default function PrivacyPolicyPage() {
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
            <h1 className="text-xl font-bold">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground">Last updated: December 2024</p>
          </div>
        </div>

        <div className="space-y-4">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-white border-blue-200">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-blue-900">Your Privacy Matters</h2>
            </div>
            <p className="text-sm text-blue-800">
              We are committed to protecting your medical information and personal data with the highest standards of security and confidentiality.
            </p>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Database className="w-4 h-4" />
              Information We Collect
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-medium">Medical Information:</h4>
                <p className="text-muted-foreground">Symptoms, diagnoses, prescriptions, care plans, and health data you provide</p>
              </div>
              <div>
                <h4 className="font-medium">Account Information:</h4>
                <p className="text-muted-foreground">Name, email, phone number, and subscription details</p>
              </div>
              <div>
                <h4 className="font-medium">Usage Data:</h4>
                <p className="text-muted-foreground">App interactions, feature usage, and preferences for personalization</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              How We Use Your Information
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Provide AI-powered medical assistance and recommendations</li>
              <li>• Generate prescriptions, care plans, and medical documentation</li>
              <li>• Personalize your experience with relevant suggestions</li>
              <li>• Process payments and manage subscriptions</li>
              <li>• Improve our services and develop new features</li>
              <li>• Comply with legal and regulatory requirements</li>
            </ul>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Information Sharing
            </h3>
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                We do not sell, trade, or share your personal medical information with third parties except:
              </p>
              <ul className="space-y-1 text-muted-foreground ml-4">
                <li>• With your explicit consent</li>
                <li>• To comply with legal obligations</li>
                <li>• To protect rights, property, or safety</li>
                <li>• With service providers under strict confidentiality agreements</li>
              </ul>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3">Data Security</h3>
            <p className="text-sm text-muted-foreground mb-3">
              We implement industry-standard security measures including:
            </p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• End-to-end encryption for sensitive data</li>
              <li>• Secure cloud storage with regular backups</li>
              <li>• Regular security audits and updates</li>
              <li>• Access controls and authentication</li>
            </ul>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3">Your Rights</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Access your personal data</li>
              <li>• Correct inaccurate information</li>
              <li>• Delete your account and data</li>
              <li>• Export your medical records</li>
              <li>• Opt-out of non-essential communications</li>
            </ul>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3">Data Retention</h3>
            <p className="text-sm text-muted-foreground">
              We retain your data for as long as your account is active or as needed to provide services. 
              Medical records may be retained longer as required by law or for legitimate medical purposes.
            </p>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3">Contact Us</h3>
            <p className="text-sm text-muted-foreground">
              For privacy concerns or data requests, contact us at:
            </p>
            <p className="text-sm font-medium mt-2">privacy@doctorapp.com</p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-amber-50 to-white border-amber-200">
            <p className="text-sm text-amber-800">
              <strong>Medical Disclaimer:</strong> This app provides AI-assisted medical information for educational purposes. 
              Always consult qualified healthcare professionals for medical decisions.
            </p>
          </Card>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}