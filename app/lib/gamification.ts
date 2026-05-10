import type { SpeechSession } from './sessionStorage'
import type { Difficulty } from './exercises'

// ── Types ─────────────────────────────────────────────────────────────

export interface Badge {
  id: string
  name: string
  description: string
  emoji: string
  color: string // Tailwind classes
}

export interface Level {
  index: number
  name: string
  emoji: string
  minXP: number
  maxXP: number
  textColor: string
  bgColor: string
  barColor: string
}

export interface GamificationState {
  totalXP: number
  level: Level
  progressPercent: number
  xpInLevel: number
  xpToNext: number
  streak: number
  badges: Badge[]
}

export interface SessionReward {
  xpGained: number
  newBadges: Badge[]
  isPersonalBest: boolean
  previousBest: number
}

// ── Constantes ────────────────────────────────────────────────────────

export const XP_MULTIPLIERS: Record<Difficulty, number> = {
  debutant:      1,
  elementaire:   1.5,
  intermediaire: 2,
  avance:        3,
  expert:        4,
}

export const LEVELS: Level[] = [
  {
    index: 0, name: 'Apprenti',         emoji: '🌱',
    minXP: 0,    maxXP: 200,
    textColor: 'text-slate-600',  bgColor: 'bg-slate-100',  barColor: 'bg-slate-400',
  },
  {
    index: 1, name: 'Voix Naissante',   emoji: '🌿',
    minXP: 200,  maxXP: 500,
    textColor: 'text-teal-700',   bgColor: 'bg-teal-100',   barColor: 'bg-teal-500',
  },
  {
    index: 2, name: 'Orateur',          emoji: '🎤',
    minXP: 500,  maxXP: 1000,
    textColor: 'text-blue-700',   bgColor: 'bg-blue-100',   barColor: 'bg-blue-500',
  },
  {
    index: 3, name: 'Éloquent',         emoji: '⭐',
    minXP: 1000, maxXP: 2000,
    textColor: 'text-amber-700',  bgColor: 'bg-amber-100',  barColor: 'bg-amber-500',
  },
  {
    index: 4, name: 'Maître de Parole', emoji: '👑',
    minXP: 2000, maxXP: Infinity,
    textColor: 'text-purple-700', bgColor: 'bg-purple-100', barColor: 'bg-purple-500',
  },
]

export const ALL_BADGES: Badge[] = [
  {
    id: 'first_session',
    name: 'Première Parole',
    description: 'Première séance complétée',
    emoji: '🎙️',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  {
    id: 'streak_3',
    name: 'En Feu',
    description: '3 jours consécutifs de pratique',
    emoji: '🔥',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
  },
  {
    id: 'streak_7',
    name: 'Régularité',
    description: '7 jours consécutifs de pratique',
    emoji: '🗓️',
    color: 'bg-red-100 text-red-700 border-red-200',
  },
  {
    id: 'score_80',
    name: 'Bonne Performance',
    description: 'Premier score ≥ 80',
    emoji: '⭐',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  },
  {
    id: 'score_90',
    name: 'Excellence',
    description: 'Premier score ≥ 90',
    emoji: '💎',
    color: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  },
  {
    id: 'perfect_fluidity',
    name: 'Fluidité Parfaite',
    description: 'Aucune hésitation sur une séance entière',
    emoji: '🎯',
    color: 'bg-green-100 text-green-700 border-green-200',
  },
  {
    id: 'explorer',
    name: 'Explorateur',
    description: '5 exercices différents complétés',
    emoji: '🗺️',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  },
  {
    id: 'veteran',
    name: 'Vétéran',
    description: '10 séances au total',
    emoji: '🏆',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  {
    id: 'climber',
    name: 'Grimpeur',
    description: '+10 points vs séance précédente',
    emoji: '📈',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  {
    id: 'expert_done',
    name: 'Maîtrise',
    description: 'Exercice niveau Maîtrise complété',
    emoji: '🌟',
    color: 'bg-rose-100 text-rose-700 border-rose-200',
  },
]

// ── XP ────────────────────────────────────────────────────────────────

export function sessionXP(session: SpeechSession): number {
  const mult = XP_MULTIPLIERS[session.difficulty] ?? 1
  return Math.round(session.scores.global * mult)
}

export function computeTotalXP(sessions: SpeechSession[]): number {
  return sessions.reduce((sum, s) => sum + sessionXP(s), 0)
}

// ── Niveau ────────────────────────────────────────────────────────────

export function getLevel(totalXP: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVELS[i].minXP) return LEVELS[i]
  }
  return LEVELS[0]
}

export function getLevelProgress(totalXP: number) {
  const level = getLevel(totalXP)
  if (level.maxXP === Infinity) {
    return { progressPercent: 100, xpInLevel: totalXP - level.minXP, xpToNext: 0 }
  }
  const range = level.maxXP - level.minXP
  const xpInLevel = totalXP - level.minXP
  return {
    progressPercent: Math.min(100, Math.round((xpInLevel / range) * 100)),
    xpInLevel,
    xpToNext: level.maxXP - totalXP,
  }
}

// ── Streak ────────────────────────────────────────────────────────────

export function computeStreak(sessions: SpeechSession[]): number {
  if (sessions.length === 0) return 0

  // Jours uniques triés du plus récent au plus ancien
  const allDays = sessions.map((s) => s.date.slice(0, 10))
  const days = allDays.filter((v, i, a) => a.indexOf(v) === i).sort().reverse()

  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10)

  // La série doit inclure aujourd'hui ou hier
  if (days[0] !== today && days[0] !== yesterday) return 0

  let streak = 1
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]).getTime()
    const curr = new Date(days[i]).getTime()
    const diffDays = Math.round((prev - curr) / 86_400_000)
    if (diffDays === 1) {
      streak++
    } else {
      break
    }
  }
  return streak
}

// ── Badges ────────────────────────────────────────────────────────────

export function computeEarnedBadges(sessions: SpeechSession[]): Badge[] {
  if (sessions.length === 0) return []

  const earned = new Set<string>()

  // Première séance
  if (sessions.length >= 1) earned.add('first_session')

  // Séries
  const streak = computeStreak(sessions)
  if (streak >= 3) earned.add('streak_3')
  if (streak >= 7) earned.add('streak_7')

  // Scores
  const scores = sessions.map((s) => s.scores.global)
  if (scores.some((s) => s >= 80)) earned.add('score_80')
  if (scores.some((s) => s >= 90)) earned.add('score_90')

  // Fluidité parfaite (hesitations ≥ 95 ET fluidite ≥ 90)
  if (sessions.some((s) => s.scores.hesitations >= 95 && s.scores.fluidite >= 90)) {
    earned.add('perfect_fluidity')
  }

  // Explorateur : 5 exercices différents
  const uniqueExercises = sessions.map((s) => s.exerciseId).filter((v, i, a) => a.indexOf(v) === i)
  if (uniqueExercises.length >= 5) earned.add('explorer')

  // Vétéran : 10 séances
  if (sessions.length >= 10) earned.add('veteran')

  // Grimpeur : +10 pts vs séance précédente (à n'importe quel moment)
  // Sessions stockées newest-first
  for (let i = 0; i < sessions.length - 1; i++) {
    if (sessions[i].scores.global - sessions[i + 1].scores.global >= 10) {
      earned.add('climber')
      break
    }
  }

  // Expert
  if (sessions.some((s) => s.difficulty === 'expert')) earned.add('expert_done')

  return ALL_BADGES.filter((b) => earned.has(b.id))
}

// ── État complet ──────────────────────────────────────────────────────

export function getGamificationState(sessions: SpeechSession[]): GamificationState {
  const totalXP = computeTotalXP(sessions)
  const level = getLevel(totalXP)
  const { progressPercent, xpInLevel, xpToNext } = getLevelProgress(totalXP)
  const streak = computeStreak(sessions)
  const badges = computeEarnedBadges(sessions)

  return { totalXP, level, progressPercent, xpInLevel, xpToNext, streak, badges }
}

// ── Récompense après une séance ───────────────────────────────────────

export function computeSessionReward(
  allSessions: SpeechSession[], // newest-first, inclut la nouvelle séance
  newSession: SpeechSession,
): SessionReward {
  const xpGained = sessionXP(newSession)

  // Séances précédentes (sans la nouvelle)
  const prevSessions = allSessions.filter((s) => s.id !== newSession.id)
  const prevBadgeIds = new Set(computeEarnedBadges(prevSessions).map((b) => b.id))
  const currentBadges = computeEarnedBadges(allSessions)
  const newBadges = currentBadges.filter((b) => !prevBadgeIds.has(b.id))

  const previousBest =
    prevSessions.length > 0 ? Math.max(...prevSessions.map((s) => s.scores.global)) : 0
  const isPersonalBest =
    prevSessions.length > 0 && newSession.scores.global > previousBest

  return { xpGained, newBadges, isPersonalBest, previousBest }
}
