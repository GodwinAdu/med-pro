"use client"

import { useState, useRef } from "react"
import { Mic, Square, Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface VoiceRecorderProps {
  onTranscript: (text: string) => void
  placeholder?: string
}

export function VoiceRecorder({ onTranscript, placeholder = "Click to record..." }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const recognitionRef = useRef<any>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Setup MediaRecorder for audio playback
      const mediaRecorder = new MediaRecorder(stream)
      const chunks: BlobPart[] = []
      
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data)
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      
      // Setup Speech Recognition for transcription
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
        const recognition = new SpeechRecognition()
        
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'
        
        recognition.onresult = (event) => {
          let finalTranscript = ''
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript
            }
          }
          if (finalTranscript) {
            onTranscript(finalTranscript)
          }
        }
        
        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error)
          toast.error("Speech recognition failed")
        }
        
        recognitionRef.current = recognition
        recognition.start()
      }
      
      setIsRecording(true)
      toast.success("Recording started")
      
    } catch (error) {
      console.error('Error starting recording:', error)
      toast.error("Failed to start recording")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
    }
    
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    
    setIsRecording(false)
    toast.success("Recording stopped")
  }

  const playRecording = () => {
    if (audioUrl) {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
      
      const audio = new Audio(audioUrl)
      audioRef.current = audio
      
      audio.onplay = () => setIsPlaying(true)
      audio.onended = () => setIsPlaying(false)
      audio.onpause = () => setIsPlaying(false)
      
      audio.play()
    }
  }

  const pausePlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  return (
    <div className="flex items-center gap-2 p-3 border rounded-lg bg-background">
      <Button
        onClick={isRecording ? stopRecording : startRecording}
        size="sm"
        variant={isRecording ? "destructive" : "default"}
        className="h-10 w-10 p-0 rounded-full"
      >
        {isRecording ? (
          <Square className="w-4 h-4" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </Button>

      <div className="flex-1 text-sm text-muted-foreground">
        {isRecording ? "Recording... Speak now" : placeholder}
      </div>

      {audioUrl && (
        <Button
          onClick={isPlaying ? pausePlayback : playRecording}
          size="sm"
          variant="outline"
          className="h-8 w-8 p-0"
        >
          {isPlaying ? (
            <Pause className="w-3 h-3" />
          ) : (
            <Play className="w-3 h-3" />
          )}
        </Button>
      )}
    </div>
  )
}