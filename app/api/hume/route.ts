import { NextRequest, NextResponse } from 'next/server'
import { analyzeExpressivity } from '@/app/lib/hume'
import { recordUsage, costHume, estimateAudioSeconds } from '@/app/lib/usage'

export async function POST(request: NextRequest) {
  try {
    if (!process.env.HUME_API_KEY) {
      return NextResponse.json({ error: 'HUME_API_KEY non configurée' }, { status: 503 })
    }

    const formData = await request.formData()
    const audio = formData.get('audio') as File | null

    if (!audio) {
      return NextResponse.json({ error: 'Aucun fichier audio fourni' }, { status: 400 })
    }

    const buffer = await audio.arrayBuffer()
    const result = await analyzeExpressivity(buffer, audio.type || 'audio/webm')

    const seconds = estimateAudioSeconds(buffer.byteLength)
    const cost = costHume(seconds)
    await recordUsage({
      provider: 'hume',
      detail: { model: 'prosody', seconds, audio_bytes: buffer.byteLength },
      cost_usd: cost,
    })

    return NextResponse.json({ ...result, cost_usd: cost })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur analyse expressivité'
    console.error('HUME ERROR:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
