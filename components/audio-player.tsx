"use client"

import { useEffect, useState } from "react"
import { Play, Pause, Volume2, Loader2, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useVoice } from "@/hooks/use-voice"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface AudioPlayerProps {
  text: string
  autoPlay?: boolean
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'
}

export function AudioPlayer({ text, autoPlay = false, voice = 'alloy' }: AudioPlayerProps) {
  const router = useRouter()
  const [isDownloading, setIsDownloading] = useState(false)
  const { speak, stopSpeaking, isSpeaking, isLoading } = useVoice({
    onError: (error) => {
      if (error.includes('Insufficient coins')) {
        toast.error("Insufficient Coins", {
          description: "Need 3 coins for text-to-speech.",
          action: {
            label: "Buy Coins",
            onClick: () => router.push('/coins')
          }
        })
      } else {
        toast.error("Speech Error", { description: error })
      }
    }
  })

  const handlePlay = () => {
    if (isSpeaking) {
      stopSpeaking()
    } else {
      speak(text, voice)
    }
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const response = await fetch('/api/voice/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice }),
      })

      if (response.ok) {
        const audioBlob = await response.blob()
        const url = URL.createObjectURL(audioBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = `audio-${Date.now()}.mp3`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success("Audio downloaded successfully")
      } else {
        const error = await response.json()
        if (error.insufficientCoins) {
          toast.error("Insufficient Coins", {
            description: "Need 3 coins to download audio.",
            action: {
              label: "Buy Coins",
              onClick: () => router.push('/coins')
            }
          })
        } else {
          toast.error("Download failed", { description: error.error })
        }
      }
    } catch (error) {
      toast.error("Download failed", { description: "Network error" })
    } finally {
      setIsDownloading(false)
    }
  }

  useEffect(() => {
    if (autoPlay && text && !isSpeaking) {
      speak(text, voice)
    }
  }, [text, autoPlay, voice, speak, isSpeaking])

  return (
    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
      <Button
        onClick={handlePlay}
        size="sm"
        variant="outline"
        className="h-8 w-8 p-0"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isSpeaking ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
      </Button>

      <Button
        onClick={handleDownload}
        size="sm"
        variant="outline"
        className="h-8 w-8 p-0"
        disabled={isDownloading}
      >
        {isDownloading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
      </Button>

      <div className="flex items-center gap-2 flex-1">
        <Volume2 className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">
          {isLoading ? 'Generating...' : isDownloading ? 'Downloading...' : isSpeaking ? 'Playing...' : 'MedPro Voice'}
        </span>
      </div>
    </div>
  )
}