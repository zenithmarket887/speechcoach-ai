import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import { analyzeExpressivity } from '@/app/lib/hume'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non connecté.' }, { status: 401 })
    }
    if (session.user.plan === 'free') {
      return NextResponse.json(
        { error: 'L’analyse expressive est réservée aux plans Mensuel et Annuel.', upgrade: true },
        { status: 402 },
      )
    }

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
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur analyse expressivité'
    console.error('HUME ERROR:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
