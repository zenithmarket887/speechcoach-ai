import type { Difficulty } from './exercises'

export type Plan = 'free' | 'monthly' | 'annual'

export const FREE_DIFFICULTIES: Difficulty[] = ['debutant', 'elementaire']

export function isPremium(plan: Plan | undefined | null): boolean {
  return plan === 'monthly' || plan === 'annual'
}

export function canAccessDifficulty(_plan: Plan | undefined | null, _d: Difficulty): boolean {
  return true
}
