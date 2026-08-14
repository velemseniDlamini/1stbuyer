// Server-only client for Kimi (Moonshot AI). Never import this from a
// 'use client' component — MOONSHOT_API_KEY must stay off the browser bundle.
// All calls go through Next.js route handlers (app/api/**).

const BASE_URL = 'https://api.moonshot.ai/v1'

function apiKey(): string {
  const key = process.env.MOONSHOT_API_KEY
  if (!key) throw new Error('MOONSHOT_API_KEY is not configured')
  return key
}

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }

export async function chatCompletion(
  messages: ChatMessage[],
  opts: { jsonMode?: boolean; model?: string } = {},
): Promise<string> {
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: opts.model ?? 'moonshot-v1-auto',
      messages,
      temperature: 0.4,
      ...(opts.jsonMode ? { response_format: { type: 'json_object' } } : {}),
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Moonshot chat completion failed: ${res.status} ${body}`)
  }

  const data = await res.json()
  const content = data?.choices?.[0]?.message?.content
  if (typeof content !== 'string') throw new Error('Moonshot returned no content')
  return content
}

const MAX_EXTRACTED_CHARS = 50000

// Uploads a file for text extraction (purpose=file-extract) and returns the
// extracted text. Used for "review my quotation" — the model itself never
// sees the raw binary, only the extracted content injected as context.
export async function extractFileText(file: File): Promise<string> {
  const form = new FormData()
  form.append('purpose', 'file-extract')
  form.append('file', file, file.name)

  const uploadRes = await fetch(`${BASE_URL}/files`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey()}` },
    body: form,
  })
  if (!uploadRes.ok) {
    const body = await uploadRes.text().catch(() => '')
    throw new Error(`Moonshot file upload failed: ${uploadRes.status} ${body}`)
  }
  const uploaded = await uploadRes.json()
  const fileId = uploaded?.id
  if (!fileId) throw new Error('Moonshot file upload returned no file id')

  const contentRes = await fetch(`${BASE_URL}/files/${fileId}/content`, {
    headers: { Authorization: `Bearer ${apiKey()}` },
  })
  if (!contentRes.ok) {
    const body = await contentRes.text().catch(() => '')
    throw new Error(`Moonshot file content fetch failed: ${contentRes.status} ${body}`)
  }
  const text = await contentRes.text()

  // Best-effort cleanup — file-extract is billed per upload, no need to keep it around.
  fetch(`${BASE_URL}/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${apiKey()}` },
  }).catch(() => {})

  return text.length > MAX_EXTRACTED_CHARS ? text.slice(0, MAX_EXTRACTED_CHARS) + '\n\n[truncated]' : text
}
