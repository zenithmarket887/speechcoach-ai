import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import { supabase } from '@/app/lib/supabase'
import { stripe } from '@/app/lib/stripe'

export async function POST(req: Request) {
  if (!stripe) return NextResponse.json({ error: 'Stripe non configuré.' }, { status: 503 })

  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Non connecté.' }, { status: 401 })

  const { data: user } = await supabase
    .from('users')
    .select('stripe_customer_id')
    .eq('login', session.user.id)
    .single()

  if (!user?.stripe_customer_id) {
    return NextResponse.json({ error: 'Aucun abonnement à gérer.' }, { status: 404 })
  }

  const origin = req.headers.get('origin') ?? process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const portal = await stripe.billingPortal.sessions.create({
    customer: user.stripe_customer_id,
    return_url: `${origin}/patient`,
  })

  return NextResponse.json({ url: portal.url })
}
