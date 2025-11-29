"use client"

import { useState, useRef, useCallback } from 'react'

interface UseVoiceOptions {
  onTranscription?: (text: string) => void
  onSpeechStart?: () => void
  onSpeechEnd?: () => void
  onError?: (error: string) => void
}

export function useVoice(options: UseVoiceOptions = {}) {
  const [isRecording, setIsRecording] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const startRecording = useCallback(async () => {
    try {
      setIsLoading(true)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        const formData = new FormData()
        formData.append('audio', audioBlob, 'recording.wav')

        try {
          const response = await fetch('/api/voice/speech-to-text', {
            method: 'POST',
            body: formData,
          })

          if (response.ok) {
            const { text } = await response.json()
            options.onTranscription?.(text)
          } else {
            const error = await response.json()
            options.onError?.(error.error || 'Transcription failed')
          }
        } catch (error) {
          options.onError?.('Network error during transcription')
        }

        stream.getTracks().forEach(track => track.stop())
        setIsLoading(false)
      }

      mediaRecorder.start()
      setIsRecording(true)
      setIsLoading(false)
    } catch (error) {
      options.onError?.('Microphone access denied')
      setIsLoading(false)
    }
  }, [options])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }, [isRecording])

  const speak = useCallback(async (text: string, voice: string = 'alloy') => {
    if (!text.trim()) return

    setIsSpeaking(true)
    setIsLoading(true)
    options.onSpeechStart?.()

    try {
      const response = await fetch('/api/voice/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice }),
      })

      if (response.ok) {
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        
        if (audioRef.current) {
          audioRef.current.pause()
        }
        
        const audio = new Audio(audioUrl)
        audioRef.current = audio
        
        audio.onended = () => {
          setIsSpeaking(false)
          setIsLoading(false)
          options.onSpeechEnd?.()
          URL.revokeObjectURL(audioUrl)
        }
        
        audio.onerror = () => {
          setIsSpeaking(false)
          setIsLoading(false)
          options.onError?.('Audio playback failed')
          URL.revokeObjectURL(audioUrl)
        }
        
        await audio.play()
        setIsLoading(false)
      } else {
        const error = await response.json()
        options.onError?.(error.error || 'Speech generation failed')
        setIsSpeaking(false)
        setIsLoading(false)
      }
    } catch (error) {
      options.onError?.('Network error during speech generation')
      setIsSpeaking(false)
      setIsLoading(false)
    }
  }, [options])

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsSpeaking(false)
      setIsLoading(false)
      options.onSpeechEnd?.()
    }
  }, [options])

  return {
    isRecording,
    isSpeaking,
    isLoading,
    startRecording,
    stopRecording,
    speak,
    stopSpeaking,
  }
}