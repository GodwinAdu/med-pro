"use client"

import { useRef, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Loader2, User, Brain, Copy, Stethoscope, Crown, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { AudioPlayer } from "@/components/audio-player"
import { VoiceRecorder } from "@/components/voice-recorder"

interface Message {
    id: string
    role: "user" | "assistant"
    content: string
    timestamp?: Date
}

const medicalPrompts = [
    "Analyze symptoms",
    "Drug interactions", 
    "Treatment options",
    "Diagnostic help",
    "Clinical guidelines",
    "Emergency signs"
]

export default function ChatPage() {
    const router = useRouter()
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInput("")
        setIsLoading(true)

        const assistantMessageId = (Date.now() + 1).toString()
        const assistantMessage: Message = {
            id: assistantMessageId,
            role: "assistant",
            content: "",
            timestamp: new Date()
        }

        setMessages(prev => [...prev, assistantMessage])

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content }))
                })
            })

            if (response.status === 403) {
                const errorData = await response.json()
                console.log('Error data received:', errorData)
                setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId))
                
                if (errorData.trialExpired) {
                    toast.error("Trial Expired", {
                        description: "Your 14-day trial has ended. Upgrade to continue using MedAssist AI.",
                        action: {
                            label: "Upgrade",
                            onClick: () => router.push('/pricing')
                        }
                    })
                } else if (errorData.limitReached) {
                    toast.error("Usage Limit Reached", {
                        description: `You've used ${errorData.currentUsage}/${errorData.limit} messages this month. Upgrade for unlimited access.`,
                        action: {
                            label: "Upgrade",
                            onClick: () => router.push('/pricing')
                        }
                    })
                } else {
                    console.log('Showing access restricted toast')
                    toast.error("Access Restricted", {
                        description: errorData.error || "Please upgrade to continue using this feature.",
                        action: {
                            label: "Upgrade",
                            onClick: () => router.push('/pricing')
                        }
                    })
                }
                setIsLoading(false)
                return
            }

            if (!response.ok) {
                throw new Error('Failed to get response')
            }

            const reader = response.body?.getReader()
            const decoder = new TextDecoder()

            if (reader) {
                let isFirstChunk = true
                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break

                    const chunk = decoder.decode(value)
                    const lines = chunk.split('\n')

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6)
                            if (data === '[DONE]') {
                                setIsLoading(false)
                                return
                            }
                            
                            try {
                                const parsed = JSON.parse(data)
                                if (parsed.content) {
                                    if (isFirstChunk) {
                                        setIsLoading(false)
                                        isFirstChunk = false
                                    }
                                    setMessages(prev => prev.map(msg => 
                                        msg.id === assistantMessageId 
                                            ? { ...msg, content: msg.content + parsed.content }
                                            : msg
                                    ))
                                }
                            } catch (e) {
                                // Ignore parsing errors
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Chat error:", error)
            setMessages(prev => prev.map(msg => 
                msg.id === assistantMessageId 
                    ? { ...msg, content: "I'm experiencing technical difficulties. Please try your medical question again." }
                    : msg
            ))
        } finally {
            setIsLoading(false)
        }
    }

    const handleQuickPrompt = (prompt: string) => {
        setInput(prompt)
    }

    const copyMessage = (content: string) => {
        navigator.clipboard.writeText(content)
    }

    return (
        <div className="h-screen flex flex-col bg-background">
           

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center mb-4">
                            <Stethoscope className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-lg font-semibold mb-2">MedPro AI</h2>
                        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                            Professional medical AI assistant ready to help with clinical questions, diagnosis support, and medical guidance.
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {medicalPrompts.map((prompt) => (
                                <Button
                                    key={prompt}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleQuickPrompt(prompt)}
                                    className="text-xs"
                                >
                                    {prompt}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                <AnimatePresence initial={false}>
                    {messages.map((message) => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            {message.role === "assistant" && (
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center">
                                    <Brain className="w-4 h-4 text-white" />
                                </div>
                            )}

                            <div className="max-w-[80%]">
                                <Card
                                    className={`${message.role === "user" 
                                        ? "bg-blue-600 text-white" 
                                        : "bg-card border-border"
                                    }`}
                                >
                                    <div className="p-4">
                                        {message.role === "assistant" && (
                                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/50">
                                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                <span className="text-xs font-medium text-muted-foreground">MedAssist AI</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {message.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        )}
                                        <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>
                                    </div>
                                </Card>
                                
                                {message.role === "assistant" && message.content && (
                                    <div className="mt-2 ml-2 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => copyMessage(message.content)}
                                                className="h-7 px-2 text-xs"
                                            >
                                                <Copy className="w-3 h-3 mr-1" />
                                                Copy
                                            </Button>
                                        </div>
                                        <AudioPlayer text={message.content} />
                                    </div>
                                )}
                            </div>

                            {message.role === "user" && (
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3 justify-start"
                    >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center">
                            <Brain className="w-4 h-4 text-white" />
                        </div>
                        <Card className="bg-card border-border">
                            <div className="p-4 flex items-center gap-3">
                                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                <span className="text-sm text-muted-foreground">
                                    MedAssist AI is analyzing your medical question...
                                </span>
                            </div>
                        </Card>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-border p-3 bg-background space-y-3">
                <VoiceRecorder 
                    onTranscript={(text) => setInput(prev => prev + (prev ? ' ' : '') + text)}
                    placeholder="Record your medical question..."
                />
                
                <form onSubmit={handleSubmit} className="flex gap-3">
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask your medical question..."
                        disabled={isLoading}
                        className="flex-1 min-h-[50px] max-h-[120px] resize-none"
                        rows={2}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleSubmit(e)
                            }
                        }}
                    />
                    <Button 
                        type="submit" 
                        disabled={isLoading || !input.trim()} 
                        className="h-[50px] px-6 bg-blue-600 hover:bg-blue-700"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </Button>
                </form>
                
                <p className="text-xs text-muted-foreground text-center mt-3">
                    Professional medical AI assistant for educational purposes. Always consult healthcare providers for medical decisions.
                </p>
            </div>
        </div>
    )
}