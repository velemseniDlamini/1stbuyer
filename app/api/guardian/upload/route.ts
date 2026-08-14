import { NextResponse } from 'next/server'
import { extractFileText } from '@/lib/moonshot'

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 })
    }
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: 'File is too large (max 20MB)' }, { status: 413 })
    }

    const content = await extractFileText(file)
    return NextResponse.json({ filename: file.name, content })
  } catch (err) {
    console.error('Guardian upload error:', err)
    return NextResponse.json({ error: 'Could not read that document' }, { status: 502 })
  }
}
