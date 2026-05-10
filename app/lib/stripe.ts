import Stripe from 'stripe'

const key = process.env.STRIPE_SECRET_KEY

export const stripe = key ? new Stripe(key) : null

export const PRICE_IDS = {
  monthly: process.env.STRIPE_PRICE_ID_MONTHLY ?? '',
  annual: process.env.STRIPE_PRICE_ID_ANNUAL ?? '',
} as const

export type BillingPlan = keyof typeof PRICE_IDS

export function planFromPriceId(priceId: string | null | undefined): 'monthly' | 'annual' | null {
  if (!priceId) return null
  if (priceId === PRICE_IDS.monthly) return 'monthly'
  if (priceId === PRICE_IDS.annual) return 'annual'
  return null
}
