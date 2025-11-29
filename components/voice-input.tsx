"use client"

import { useState } from "react"
import { Mic, MicOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface VoiceInputProps {
  onResult: (text: string) => void
  placeholder?: string
}

export function VoiceInput({ onResult, placeholder = "Speak..." }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false)

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Voice input not supported in this browser")
      return
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript
      onResult(text)
      toast.success("Voice input captured")
    }

    recognition.onerror = () => {
      toast.error("Voice input failed")
      setIsListening(false)
    }

    recognition.start()
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={startListening}
      disabled={isListening}
      className={`${isListening ? 'bg-red-50 border-red-200' : ''}`}
    >
      {isListening ? (
        <>
          <MicOff className="w-4 h-4 mr-2 text-red-500" />
          Listening...
        </>
      ) : (
        <>
          <Mic className="w-4 h-4 mr-2" />
          Voice
        </>
      )}
    </Button>
  )
}