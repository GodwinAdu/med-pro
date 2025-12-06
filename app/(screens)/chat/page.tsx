"use client"

import { useRef, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Loader2, User, Brain, Copy, Stethoscope, Sparkles, Trash2, RotateCcw, ArrowLeft, History, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { AudioPlayer } from "@/components/audio-player"
import { VoiceRecorder } from "@/components/voice-recorder"
import Link from "next/link"

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
    const searchParams = useSearchParams()
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [loadingSession, setLoadingSession] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        textareaRef.current?.focus()
    }, [])

    useEffect(() => {
        const sessionParam = searchParams.get('session')
        if (sessionParam) {
            loadSession(sessionParam)
        }
    }, [searchParams])

    const loadSession = async (id: string) => {
        setLoadingSession(true)
        try {
            const response = await fetch(`/api/chat/session?id=${id}`)
            if (response.ok) {
                const data = await response.json()
                setMessages(data.session.messages)
                setSessionId(data.session.id)
                toast.success('Chat loaded')
            } else {
                toast.error('Failed to load chat')
            }
        } catch (error) {
            console.error('Failed to load session:', error)
            toast.error('Failed to load chat')
        } finally {
            setLoadingSession(false)
        }
    }

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
                
                if (errorData.insufficientCoins) {
                    toast.error("Insufficient Coins", {
                        description: `Need 5 coins to chat. You have ${errorData.coinBalance || 0} coins.`,
                        action: {
                            label: "Buy Coins",
                            onClick: () => router.push('/coins')
                        }
                    })
                } else {
                    toast.error("Access Denied", {
                        description: errorData.error || "Unable to access chat feature.",
                        action: {
                            label: "Buy Coins",
                            onClick: () => router.push('/coins')
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

    const saveChat = async () => {
        if (messages.length === 0) return

        try {
            const response = await fetch('/api/chat/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId,
                    messages: messages.map(m => ({
                        role: m.role,
                        content: m.content,
                        timestamp: m.timestamp
                    }))
                })
            })

            if (response.ok) {
                const data = await response.json()
                if (!sessionId) {
                    setSessionId(data.sessionId)
                }
            }
        } catch (error) {
            console.error('Failed to save chat:', error)
        }
    }

    const clearChat = () => {
        setMessages([])
        setSessionId(null)
        toast.success("Chat cleared")
    }

    useEffect(() => {
        if (messages.length > 0) {
            const timer = setTimeout(() => {
                saveChat()
            }, 2000)
            return () => clearTimeout(timer)
        }
    }, [messages])

    return (
        <div className="h-screen flex flex-col bg-gradient-to-b from-blue-50/30 via-background to-background overflow-hidden">
            {/* Modern Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-sm">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                        <Link href="/">
                            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                                    <Brain className="w-5 h-5 text-white" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                            </div>
                            <div>
                                <h1 className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    MedPro AI Assistant
                                </h1>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" />
                                    Powered by GPT-4
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/chat/history')}
                            className="h-9 text-xs"
                        >
                            <History className="w-4 h-4 mr-1" />
                            History
                        </Button>
                        {messages.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearChat}
                                className="h-9 text-xs"
                            >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Clear
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {messages.length === 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center h-full text-center px-4"
                    >
                        <div className="relative mb-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
                                <Stethoscope className="w-10 h-10 text-white" />
                            </div>
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl blur-xl -z-10"
                            />
                        </div>
                        
                        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Welcome to MedPro AI
                        </h2>
                        <p className="text-sm text-muted-foreground mb-8 max-w-md leading-relaxed">
                            Your intelligent medical assistant powered by advanced AI. Get instant help with clinical questions, diagnosis support, and evidence-based medical guidance.
                        </p>
                        
                        <div className="w-full max-w-md space-y-3">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Quick Start</p>
                            <div className="grid grid-cols-2 gap-2">
                                {medicalPrompts.map((prompt, index) => (
                                    <motion.div
                                        key={prompt}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <Button
                                            variant="outline"
                                            onClick={() => handleQuickPrompt(prompt)}
                                            className="w-full h-auto py-3 px-4 text-xs font-medium hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all"
                                        >
                                            <Sparkles className="w-3 h-3 mr-2" />
                                            {prompt}
                                        </Button>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
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
                                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                                    <Brain className="w-5 h-5 text-white" />
                                </div>
                            )}

                            <div className="max-w-[85%]">
                                {message.role === "user" ? (
                                    <div className="space-y-1">
                                        <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl px-4 py-2.5 shadow-sm">
                                            <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                                                {message.content}
                                            </div>
                                        </div>
                                        {message.timestamp && (
                                            <div className="text-xs text-muted-foreground text-right px-2">
                                                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        <div className="bg-white dark:bg-card border border-border/50 rounded-2xl px-4 py-3 shadow-sm">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse" />
                                                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">MedPro AI</span>
                                            </div>
                                            <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                                {message.content}
                                            </div>
                                            {message.content && (
                                                <div className="mt-3 flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            copyMessage(message.content)
                                                            toast.success("Copied to clipboard")
                                                        }}
                                                        className="h-7 px-2 text-xs hover:bg-blue-50 hover:text-blue-700"
                                                    >
                                                        <Copy className="w-3 h-3 mr-1" />
                                                        Copy
                                                    </Button>
                                                    <AudioPlayer text={message.content} />
                                                </div>
                                            )}
                                        </div>
                                        {message.timestamp && (
                                            <div className="text-xs text-muted-foreground px-2">
                                                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {message.role === "user" && (
                                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center shadow-md">
                                    <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
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
                        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                            <Brain className="w-5 h-5 text-white" />
                        </div>
                        <div className="bg-white dark:bg-card border border-border/50 rounded-2xl px-4 py-3 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex gap-1">
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                                        className="w-2 h-2 rounded-full bg-blue-600"
                                    />
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                                        className="w-2 h-2 rounded-full bg-blue-600"
                                    />
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                                        className="w-2 h-2 rounded-full bg-blue-600"
                                    />
                                </div>
                                <span className="text-sm text-muted-foreground font-medium">
                                    Analyzing...
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {loadingSession && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-20">
                    <Card className="p-6 shadow-xl">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            <p className="text-sm font-medium">Loading conversation...</p>
                        </div>
                    </Card>
                </div>
            )}

            <div className="sticky bottom-0 border-t border-border/50 bg-background/95 backdrop-blur-lg shadow-lg">
                <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                        <VoiceRecorder 
                            onTranscript={(text) => setInput(prev => prev + (prev ? ' ' : '') + text)}
                            placeholder="Record your medical question..."
                        />
                    </div>
                    
                    <form onSubmit={handleSubmit} className="flex gap-3">
                        <div className="flex-1 relative">
                            <Textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your medical question here..."
                                disabled={isLoading || loadingSession}
                                className="min-h-[56px] max-h-[120px] resize-none pr-12 border-2 focus:border-blue-500 rounded-xl shadow-sm"
                                rows={2}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault()
                                        handleSubmit(e)
                                    }
                                }}
                            />
                            {input && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setInput("")}
                                    className="absolute right-2 top-2 h-8 w-8 p-0 hover:bg-gray-100"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                        <Button 
                            type="submit" 
                            disabled={isLoading || loadingSession || !input.trim()} 
                            className="h-[56px] px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all rounded-xl disabled:opacity-50"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5" />
                            )}
                        </Button>
                    </form>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>🏥 Professional AI assistant for medical education</span>
                        <span className="hidden sm:inline">Press Enter to send • Shift+Enter for new line</span>
                    </div>
                </div>
            </div>
        </div>
    )
}