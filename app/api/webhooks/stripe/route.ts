import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { stripe, planFromPriceId } from '@/app/lib/stripe'
import { supabase } from '@/app/lib/supabase'

export const runtime = 'nodejs'

async function syncSubscription(sub: Stripe.Subscription) {
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id
  const firstItem = sub.items.data[0]
  const priceId = firstItem?.price.id
  const billingPlan = planFromPriceId(priceId)

  const status = sub.status
  const isActive = status === 'active' || status === 'trialing'

  const newPlan = isActive && billingPlan ? billingPlan : 'free'
  const periodEnd = firstItem?.current_period_end
  const renewsAt = isActive && periodEnd ? new Date(periodEnd * 1000).toISOString() : null

  await supabase
    .from('users')
    .update({
      plan: newPlan,
      stripe_subscription_id: isActive ? sub.id : null,
      plan_renews_at: renewsAt,
    })
    .eq('stripe_customer_id', customerId)
}

export async function POST(req: Request) {
  if (!stripe) return NextResponse.json({ error: 'Stripe non configuré.' }, { status: 503 })

  const sig = req.headers.get('stripe-signature')
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!sig || !secret) return NextResponse.json({ error: 'Signature manquante.' }, { status: 400 })

  const body = await req.text()
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'invalid signature'
    return NextResponse.json({ error: `Webhook invalide: ${msg}` }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const s = event.data.object as Stripe.Checkout.Session
        if (s.subscription) {
          const subId = typeof s.subscription === 'string' ? s.subscription : s.subscription.id
          const sub = await stripe.subscriptions.retrieve(subId)
          await syncSubscription(sub)
        }
        break
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        await syncSubscription(event.data.object as Stripe.Subscription)
        break
      }
    }
  } catch (err) {
    console.error('STRIPE WEBHOOK ERROR:', err)
    return NextResponse.json({ error: 'Traitement échoué.' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
