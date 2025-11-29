"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner"

interface AudioPlayerProps {
  text: string
  autoPlay?: boolean
}

export function AudioPlayer({ text, autoPlay = false }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [rate, setRate] = useState(1)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const speak = () => {
    if ('speechSynthesis' in window) {
      // Stop any current speech
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = rate
      utterance.volume = isMuted ? 0 : 1
      utterance.pitch = 1
      
      utterance.onstart = () => setIsPlaying(true)
      utterance.onend = () => setIsPlaying(false)
      utterance.onerror = () => {
        setIsPlaying(false)
        toast.error("Speech synthesis failed")
      }
      
      utteranceRef.current = utterance
      window.speechSynthesis.speak(utterance)
    } else {
      toast.error("Text-to-speech not supported in this browser")
    }
  }

  const stop = () => {
    window.speechSynthesis.cancel()
    setIsPlaying(false)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (utteranceRef.current) {
      utteranceRef.current.volume = isMuted ? 1 : 0
    }
  }

  useEffect(() => {
    if (autoPlay && text) {
      speak()
    }
    
    return () => {
      window.speechSynthesis.cancel()
    }
  }, [text, autoPlay])

  return (
    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
      <Button
        onClick={isPlaying ? stop : speak}
        size="sm"
        variant="outline"
        className="h-8 w-8 p-0"
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
      </Button>

      <div className="flex items-center gap-2 flex-1">
        <span className="text-xs text-muted-foreground">Speed:</span>
        <Slider
          value={[rate]}
          onValueChange={(value) => setRate(value[0])}
          min={0.5}
          max={2}
          step={0.1}
          className="w-20"
        />
        <span className="text-xs text-muted-foreground w-8">{rate}x</span>
      </div>

      <Button
        onClick={toggleMute}
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0"
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
      </Button>
    </div>
  )
}