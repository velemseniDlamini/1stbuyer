import { NextResponse } from 'next/server'
import { chatCompletion, type ChatMessage } from '@/lib/moonshot'

const SYSTEM_PROMPT = `You generate short affordability insight bullets for "1st Buyer", a South African vehicle-affordability app. You will be given a user's real financial numbers (already calculated by the app — do not recompute or contradict them). Turn them into 3-5 short, specific, encouraging-but-honest bullet points a first-time car buyer would find useful, e.g. flagging a high expense-to-income ratio, suggesting a bigger deposit, noting how their credit band affects their rate, or confirming they're in good shape. Reference South African context (NCA, prime rate) only where relevant, briefly.

Respond ONLY with a JSON object: {"points": string[]}. Each point is one sentence, no markdown, no numbering prefix.`

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const summary: string | undefined = body.summary
    if (!summary) {
      return NextResponse.json({ error: 'summary is required' }, { status: 400 })
    }

    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: summary },
    ]

    const raw = await chatCompletion(messages, { jsonMode: true })
    let points: string[] = []
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed.points)) points = parsed.points.filter((p: unknown) => typeof p === 'string')
    } catch {
      // fall through with empty points; client keeps its static fallback text
    }

    return NextResponse.json({ points })
  } catch (err) {
    console.error('Insights error:', err)
    return NextResponse.json({ error: 'Insights temporarily unavailable' }, { status: 502 })
  }
}
