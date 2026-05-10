import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import { supabase } from '@/app/lib/supabase'
import { stripe, PRICE_IDS, type BillingPlan } from '@/app/lib/stripe'

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe non configuré.' }, { status: 503 })
  }

  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Vous devez être connecté.' }, { status: 401 })
  }

  const { plan } = (await req.json().catch(() => ({}))) as { plan?: BillingPlan }
  if (plan !== 'monthly' && plan !== 'annual') {
    return NextResponse.json({ error: 'Plan invalide.' }, { status: 400 })
  }
  const priceId = PRICE_IDS[plan]
  if (!priceId) {
    return NextResponse.json({ error: `Prix Stripe non configuré pour ${plan}.` }, { status: 503 })
  }

  const { data: user } = await supabase
    .from('users')
    .select('login, name, stripe_customer_id, plan')
    .eq('login', session.user.id)
    .single()

  if (!user) return NextResponse.json({ error: 'Utilisateur introuvable.' }, { status: 404 })

  let customerId = user.stripe_customer_id as string | null
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.login,
      name: user.name,
      metadata: { login: user.login },
    })
    customerId = customer.id
    await supabase.from('users').update({ stripe_customer_id: customerId }).eq('login', user.login)
  }

  const origin = req.headers.get('origin') ?? process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

  const checkout = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/patient?subscribed=1`,
    cancel_url: `${origin}/#tarifs`,
    allow_promotion_codes: true,
    subscription_data: { metadata: { login: user.login } },
  })

  return NextResponse.json({ url: checkout.url })
}
