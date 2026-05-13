import type { Difficulty } from './exercises'

export type Plan = 'free' | 'monthly' | 'annual'

export const FREE_DIFFICULTIES: Difficulty[] = ['debutant', 'elementaire']

export function isPremium(plan: Plan | undefined | null): boolean {
  return plan === 'monthly' || plan === 'annual'
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function canAccessDifficulty(plan: Plan | undefined | null, d: Difficulty): boolean {
  return true
}
