import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/app/lib/supabase'

// GET /api/sessions?patientId=xxx
export async function GET(request: NextRequest) {
  const patientId = request.nextUrl.searchParams.get('patientId')
  if (!patientId) {
    return NextResponse.json({ error: 'patientId requis' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('patient_id', patientId)
    .order('date', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

// POST /api/sessions
export async function POST(request: NextRequest) {
  const session = await request.json()

  const { error } = await supabase.from('sessions').upsert({
    id:             session.id,
    patient_id:     session.patientId,
    patient_name:   session.patientName,
    date:           session.date,
    difficulty:     session.difficulty,
    exercise_id:    session.exerciseId,
    exercise_title: session.exerciseTitle,
    scores:         session.scores,
    defauts:        session.defauts,
    recommandations: session.recommandations,
    points_positifs: session.points_positifs,
    transcription:  session.transcription,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
