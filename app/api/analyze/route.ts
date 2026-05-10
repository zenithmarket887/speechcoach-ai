import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import { canAccessDifficulty } from '@/app/lib/plan'
import { analyzeTranscription } from '@/app/lib/claude'
import type { Difficulty } from '@/app/lib/exercises'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non connecté.' }, { status: 401 })
    }

    const { text, difficulty, exerciseText } = await request.json()
    const d = (difficulty || 'intermediaire') as Difficulty

    if (!canAccessDifficulty(session.user.plan, d)) {
      return NextResponse.json(
        { error: 'Ce niveau est réservé aux plans Mensuel et Annuel.', upgrade: true },
        { status: 402 },
      )
    }

    if (!text || typeof text !== 'string' || text.trim().length < 10) {
      return NextResponse.json({ error: 'Texte trop court ou manquant' }, { status: 400 })
    }

    const analysis = await analyzeTranscription(text, d, exerciseText || null)
    return NextResponse.json(analysis)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur analyse'
    console.error('ANALYZE ERROR:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
