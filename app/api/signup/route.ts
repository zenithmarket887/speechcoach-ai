import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabase } from '@/app/lib/supabase'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: Request) {
  const { name, email, password } = await req.json()

  if (!name?.trim() || !email?.trim() || !password?.trim()) {
    return NextResponse.json({ error: 'Tous les champs sont requis.' }, { status: 400 })
  }
  if (!EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: 'Adresse courriel invalide.' }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 6 caractères.' }, { status: 400 })
  }

  const login = email.trim().toLowerCase()
  const password_hash = await bcrypt.hash(password, 12)

  const { data, error } = await supabase
    .from('users')
    .insert({ login, name: name.trim(), password_hash, role: 'patient' })
    .select('id, login, name, role')
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Un compte existe déjà avec ce courriel.' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ login: data.login, name: data.name }, { status: 201 })
}
