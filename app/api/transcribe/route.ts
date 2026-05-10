import { NextRequest, NextResponse } from 'next/server'
import { transcribeAudio } from '@/app/lib/elevenlabs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audio = formData.get('audio') as File

    if (!audio) {
      return NextResponse.json({ error: 'Aucun fichier audio fourni' }, { status: 400 })
    }

    const buffer = await audio.arrayBuffer()
    const result = await transcribeAudio(buffer, audio.type)

    return NextResponse.json({ text: result.text, language: result.language_code })
  } catch (err) {
    const raw = err instanceof Error ? err.message : 'Erreur de transcription'
    const message = raw.toLowerCase().includes('empty or corrupted')
      ? 'Enregistrement trop court ou silencieux. Parlez plus longtemps.'
      : raw
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
