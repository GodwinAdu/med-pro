"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BottomNav } from "@/components/bottom-nav"
import { ArrowLeft, Heart, Stethoscope, Brain, Shield, Zap, Users, Award, Mail, Globe } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
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
            <h1 className="text-xl font-bold">About MedPro</h1>
            <p className="text-sm text-muted-foreground">Version 1.0.0</p>
          </div>
        </div>

        <div className="space-y-4">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-white border-blue-200">
            <div className="flex items-center gap-3 mb-3">
              <Heart className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-blue-900">Our Mission</h2>
            </div>
            <p className="text-sm text-blue-800">
              Empowering healthcare professionals with AI-powered tools to provide better patient care, 
              streamline medical workflows, and improve health outcomes worldwide.
            </p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-purple-50 to-white border-purple-200">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              Lead Developer
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-purple-900">Godwin Adu</h4>
                  <p className="text-xs text-purple-700 font-medium">Psychiatric Nurse & Software Developer</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Graduate of Psychiatric Nursing Training College, Ankaful. Combining clinical expertise 
                    in mental health nursing with advanced software development skills to create innovative 
                    healthcare solutions that bridge the gap between medical practice and technology.
                  </p>
                </div>
              </div>
              <div className="bg-purple-100 rounded-lg p-3">
                <p className="text-xs text-purple-800">
                  <strong>Vision:</strong> Leveraging firsthand healthcare experience to build intuitive, 
                  practical tools that truly serve the needs of medical professionals and improve patient outcomes.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Stethoscope className="w-4 h-4" />
              What We Do
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              MedPro is a comprehensive medical assistant app designed for healthcare professionals, 
              students, and medical practitioners. We combine artificial intelligence with medical expertise 
              to provide reliable, efficient healthcare support.
            </p>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Key Features
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Stethoscope className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <p className="text-xs font-medium">AI Diagnosis</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Heart className="w-6 h-6 mx-auto mb-2 text-red-600" />
                <p className="text-xs font-medium">Care Plans</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Zap className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
                <p className="text-xs font-medium">Prescriptions</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Brain className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                <p className="text-xs font-medium">Drug Database</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Why Choose MedPro?
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Award className="w-4 h-4 text-green-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium">Evidence-Based</h4>
                  <p className="text-xs text-muted-foreground">Built on medical literature and clinical guidelines</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium">Secure & Private</h4>
                  <p className="text-xs text-muted-foreground">HIPAA-compliant with end-to-end encryption</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium">Fast & Efficient</h4>
                  <p className="text-xs text-muted-foreground">Instant AI responses with offline capabilities</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-4 h-4 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium">User-Friendly</h4>
                  <p className="text-xs text-muted-foreground">Intuitive design for busy healthcare professionals</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3">Our Story</h3>
            <p className="text-sm text-muted-foreground">
              Founded by a team of healthcare professionals and AI experts, MedPro was born from the need 
              to bridge the gap between advanced medical knowledge and practical healthcare delivery. 
              We believe technology should enhance, not replace, the human touch in medicine.
            </p>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3">Supported Specialties</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-muted-foreground">General Medicine</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-muted-foreground">Emergency Care</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-muted-foreground">Pediatrics</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-muted-foreground">Nursing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-muted-foreground">Pharmacy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                <span className="text-muted-foreground">Mental Health</span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Award className="w-4 h-4" />
              Core Values
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                <div>
                  <h4 className="text-sm font-medium">Patient-Centered Care</h4>
                  <p className="text-xs text-muted-foreground">Every feature designed with patient safety and outcomes in mind</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                <div>
                  <h4 className="text-sm font-medium">Clinical Excellence</h4>
                  <p className="text-xs text-muted-foreground">Evidence-based practices backed by medical research</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5"></div>
                <div>
                  <h4 className="text-sm font-medium">Innovation & Accessibility</h4>
                  <p className="text-xs text-muted-foreground">Making advanced healthcare tools accessible to all professionals</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3">Technology Stack</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-muted/50 p-2 rounded">
                <span className="font-medium">Frontend:</span> Next.js, React
              </div>
              <div className="bg-muted/50 p-2 rounded">
                <span className="font-medium">Backend:</span> Node.js, MongoDB
              </div>
              <div className="bg-muted/50 p-2 rounded">
                <span className="font-medium">AI:</span> OpenAI GPT-4
              </div>
              <div className="bg-muted/50 p-2 rounded">
                <span className="font-medium">Payments:</span> Paystack
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Contact Us
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>jutechdevs@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span>+233 551 556650</span>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-green-50 to-white border-green-200">
            <p className="text-sm text-green-800 text-center">
              <strong>Thank you</strong> for choosing MedPro to support your healthcare journey. 
              Together, we're making quality healthcare more accessible.
            </p>
          </Card>

          <div className="text-center text-xs text-muted-foreground py-4">
            ©{new Date().getFullYear()} MedPro. All rights reserved.
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}