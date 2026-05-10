import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import { authOptions } from '@/app/lib/auth'
import { supabase } from '@/app/lib/supabase'

// GET /api/users — liste des patients (ortho seulement)
export async function GET() {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'orthophoniste') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('users')
    .select('id, login, name, role, created_at')
    .eq('role', 'patient')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/users — créer un patient (ortho seulement)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'orthophoniste') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const { name, login, password } = await req.json()
  if (!name?.trim() || !login?.trim() || !password?.trim()) {
    return NextResponse.json({ error: 'Tous les champs sont requis.' }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 6 caractères.' }, { status: 400 })
  }

  const password_hash = await bcrypt.hash(password, 12)

  const { data, error } = await supabase
    .from('users')
    .insert({ login: login.trim().toLowerCase(), name: name.trim(), password_hash, role: 'patient' })
    .select('id, login, name, role, created_at')
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Ce code de connexion est déjà utilisé.' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
