import { NextResponse } from 'next/server'
import { supabase } from '@/app/lib/supabase'

export const dynamic = 'force-dynamic'

// GET /api/sessions/all  — pour le dashboard orthophoniste
export async function GET() {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .order('date', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}
