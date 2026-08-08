'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ShieldCheck,
  Send,
  Mic,
  Scale,
  ArrowUpRight,
  Trash2,
  Sparkles,
} from 'lucide-react'
import { askGuardian, suggestedQuestions, type GuardianReply } from '@/lib/guardian'
import { cn } from '@/lib/utils'

type Message =
  | { id: string; role: 'user'; content: string }
  | { id: string; role: 'assistant'; reply: GuardianReply }

const intro: GuardianReply = {
  answer:
    "Molo! I'm Guardian, your car-buying advocate. I know South African car-buying law inside out — the CPA, the NCA, eNaTIS, finance and insurance. Ask me anything before you set foot in a dealership.",
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'intro', role: 'assistant', reply: intro },
  ])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [listening, setListening] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  function toggleVoiceInput() {
    const SpeechRecognition =
      (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Voice input is not supported in this browser.')
      return
    }
    if (listening) {
      recognitionRef.current?.stop()
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-ZA'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript))
    }
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)
    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, thinking])

  function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: trimmed }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setThinking(true)
    setTimeout(() => {
      const reply = askGuardian(trimmed)
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: 'assistant', reply }])
      setThinking(false)
    }, 750)
  }

  return (
    <div className="flex h-dvh flex-col md:h-full">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-xl">
        <span className="relative flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground gold-glow">
          <ShieldCheck className="size-5" />
          <span className="absolute -right-0.5 -top-0.5 size-3 rounded-full border-2 border-background bg-success" />
        </span>
        <div className="flex-1">
          <p className="font-bold leading-tight">Guardian</p>
          <p className="text-xs text-success">Online · Your advocate</p>
        </div>
        <button
          type="button"
          onClick={() => setMessages([{ id: 'intro', role: 'assistant', reply: intro }])}
          aria-label="Clear chat"
          className="flex size-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-muted"
        >
          <Trash2 className="size-4" />
        </button>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
        {messages.map((msg) =>
          msg.role === 'user' ? (
            <div key={msg.id} className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">
                {msg.content}
              </div>
            </div>
          ) : (
            <AssistantBubble key={msg.id} reply={msg.reply} />
          ),
        )}

        {thinking && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="flex size-7 items-center justify-center rounded-full bg-primary/15 text-primary">
              <ShieldCheck className="size-4" />
            </span>
            <span className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="size-2 animate-bounce rounded-full bg-primary/60"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </span>
          </div>
        )}
      </div>

      {/* Suggestions */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-2">
        {suggestedQuestions.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => send(q)}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-primary/40 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
          >
            <Sparkles className="size-3" />
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
        className="flex items-center gap-2 border-t border-border bg-background px-4 py-3 pb-24 md:pb-3"
      >
        <div className="flex flex-1 items-center gap-2 rounded-full border border-border bg-card px-4 py-1">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                e.preventDefault()
                send(input)
              }
            }}
            placeholder="Ask Guardian anything…"
            className="flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={toggleVoiceInput}
            aria-label={listening ? 'Stop voice input' : 'Voice input'}
            className={cn(
              'transition-colors',
              listening ? 'animate-pulse text-primary' : 'text-muted-foreground hover:text-primary',
            )}
          >
            <Mic className="size-5" />
          </button>
        </div>
        <button
          type="submit"
          aria-label="Send message"
          disabled={!input.trim()}
          className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-95 disabled:opacity-40"
        >
          <Send className="size-5" />
        </button>
      </form>
    </div>
  )
}

function AssistantBubble({ reply }: { reply: GuardianReply }) {
  return (
    <div className="flex gap-2">
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
        <ShieldCheck className="size-4" />
      </span>
      <div className="max-w-[88%] space-y-3">
        <div className="rounded-2xl rounded-tl-md border border-border bg-card px-4 py-3 text-sm leading-relaxed">
          {reply.answer}
        </div>

        {reply.citation && (
          <div className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-xs font-medium text-primary">
            <Scale className="size-3.5 shrink-0" />
            {reply.citation}
          </div>
        )}

        {reply.steps && (
          <ol className="space-y-1.5 rounded-lg border border-border bg-card/50 px-3 py-2.5">
            {reply.steps.map((step, i) => (
              <li key={i} className="flex gap-2 text-xs leading-relaxed">
                <span className="font-bold text-primary">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        )}

        {reply.link && (
          <Link
            href={reply.link.href}
            className={cn(
              'inline-flex items-center gap-1 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground',
            )}
          >
            {reply.link.label}
            <ArrowUpRight className="size-3.5" />
          </Link>
        )}
      </div>
    </div>
  )
}
