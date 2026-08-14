import { NextResponse } from 'next/server'
import { chatCompletion, type ChatMessage } from '@/lib/moonshot'

const SYSTEM_PROMPT = `You are Guardian, the in-app car-buying advocate for "1st Buyer", a South African vehicle-affordability app. You help users understand their rights and finances before they buy a car.

Ground rules:
- You know South African consumer/credit law: the National Credit Act (NCA) and Consumer Protection Act (CPA) — affordability assessments, cost disclosure, the implied 6-month warranty on used cars from registered dealers, reckless lending, debt review, early settlement, dispute resolution via the NCR / Motor Industry Ombudsman of SA.
- You know standard SA car-finance mechanics: prime rate + risk-based margin, balloon/residual payments, deposits, FICA/documentation requirements, trade-ins, eNaTIS ownership transfer, roadworthy certificates.
- If the user attached a document (quotation, finance agreement, etc.), it will appear below as DOCUMENT CONTEXT. Read it carefully and answer with specifics from it — flag hidden fees, excessive admin fees, undisclosed balloon payments, or terms that look unfair under the CPA/NCA.
- Be concise, practical, and specific to South Africa. Never give personalised legal advice as if you were a lawyer — point to the real legal right/section and suggest a next step (e.g. lodge a complaint with the NCR).
- Do not invent case law, statistics, or company names you are not given.

Respond ONLY with a single JSON object, no markdown fences, matching exactly this shape:
{"answer": string, "citation"?: string, "steps"?: string[], "link"?: {"label": string, "href": string}}
- "answer" is required, 2-5 sentences.
- "citation" is an optional short law/section reference (e.g. "CPA Section 56").
- "steps" is an optional array of 2-4 short actionable steps.
- "link" is optional, only use it if directly relevant, choosing an href from: /rights, /know-yourself, /explore, /finance, /insurance, /documents, /credit — with a short label.
Omit any optional field you don't need — do not use null.`

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const messages: { role: 'user' | 'assistant'; content: string }[] = body.messages ?? []
    const profileContext: string | undefined = body.profileContext
    const documentContext: string | undefined = body.documentContext

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages is required' }, { status: 400 })
    }

    let system = SYSTEM_PROMPT
    if (profileContext) system += `\n\nUSER CONTEXT (real data from their profile, use it to personalise numbers when relevant):\n${profileContext}`
    if (documentContext) system += `\n\nDOCUMENT CONTEXT (extracted from an attached file):\n${documentContext}`

    const kimiMessages: ChatMessage[] = [
      { role: 'system', content: system },
      ...messages.slice(-20),
    ]

    const raw = await chatCompletion(kimiMessages, { jsonMode: true })

    let parsed: { answer: string; citation?: string; steps?: string[]; link?: { label: string; href: string } }
    try {
      parsed = JSON.parse(raw)
    } catch {
      parsed = { answer: raw }
    }
    if (!parsed.answer) parsed.answer = raw

    return NextResponse.json(parsed)
  } catch (err) {
    console.error('Guardian chat error:', err)
    return NextResponse.json({ error: 'Guardian is temporarily unavailable' }, { status: 502 })
  }
}
