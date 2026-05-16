import { NextRequest, NextResponse } from 'next/server'
import { analyzeTranscription } from '@/app/lib/claude'
import type { Difficulty } from '@/app/lib/exercises'
import { recordUsage, costClaude } from '@/app/lib/usage'

export async function POST(request: NextRequest) {
  try {
    const { text, difficulty, exerciseText } = await request.json()
    const d = (difficulty || 'intermediaire') as Difficulty

    if (!text || typeof text !== 'string' || text.trim().length < 10) {
      return NextResponse.json({ error: 'Texte trop court ou manquant' }, { status: 400 })
    }

    const analysis = await analyzeTranscription(text, d, exerciseText || null)

    const usage = analysis._usage ?? { input_tokens: 0, output_tokens: 0 }
    const cost = costClaude(usage.input_tokens, usage.output_tokens)
    await recordUsage({
      provider: 'claude',
      detail: {
        model: 'claude-opus-4-5',
        difficulty: d,
        input_tokens:  usage.input_tokens,
        output_tokens: usage.output_tokens,
      },
      cost_usd: cost,
    })

    const { _usage, ...publicAnalysis } = analysis
    return NextResponse.json({ ...publicAnalysis, cost_usd: cost })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur analyse'
    console.error('ANALYZE ERROR:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
