import { NextRequest, NextResponse } from 'next/server'
import { transcribeAudio } from '@/app/lib/elevenlabs'
import { recordUsage, costElevenLabs, estimateAudioSeconds } from '@/app/lib/usage'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audio = formData.get('audio') as File

    if (!audio) {
      return NextResponse.json({ error: 'Aucun fichier audio fourni' }, { status: 400 })
    }

    const buffer = await audio.arrayBuffer()
    const result = await transcribeAudio(buffer, audio.type)

    const words = (result.words ?? []) as Array<{ end?: number }>
    const lastEnd = words.length ? Math.ceil(words[words.length - 1].end ?? 0) : 0
    const seconds = lastEnd > 0 ? lastEnd : estimateAudioSeconds(buffer.byteLength)
    const cost = costElevenLabs(seconds)

    await recordUsage({
      provider: 'elevenlabs',
      detail: { model: 'scribe_v1', seconds, audio_bytes: buffer.byteLength },
      cost_usd: cost,
    })

    return NextResponse.json({ text: result.text, language: result.language_code, cost_usd: cost })
  } catch (err) {
    const raw = err instanceof Error ? err.message : 'Erreur de transcription'
    const message = raw.toLowerCase().includes('empty or corrupted')
      ? 'Enregistrement trop court ou silencieux. Parlez plus longtemps.'
      : raw
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
