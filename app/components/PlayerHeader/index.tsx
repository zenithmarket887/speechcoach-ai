'use client'

import type { GamificationState } from '@/app/lib/gamification'

export default function PlayerHeader({ state }: { state: GamificationState }) {
  const { level, progressPercent, xpToNext, totalXP, streak } = state
  const isMaxLevel = level.maxXP === Infinity

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

      {/* Niveau */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '5px 12px', borderRadius: 999,
        background: '#E5EEFB', color: '#103E85',
        fontSize: 13, fontWeight: 700,
      }}>
        <span>{level.emoji}</span>
        <span>{level.name}</span>
      </div>

      {/* Barre XP — masquée sur petits écrans */}
      <div className="hidden sm:flex" style={{ flexDirection: 'column', gap: 3, minWidth: 80 }}>
        <div style={{ height: 6, background: '#EEF2F8', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 3,
            background: '#1E5BB8',
            width: `${progressPercent}%`,
            transition: 'width 1s ease',
          }}/>
        </div>
        <p style={{
          margin: 0, fontSize: 11, textAlign: 'right', lineHeight: 1,
          color: '#5B6B82',
          fontFamily: 'var(--font-mono), JetBrains Mono, monospace',
          fontWeight: 700,
        }}>
          {isMaxLevel ? `${totalXP} XP` : `${xpToNext} XP`}
        </p>
      </div>

      {/* Streak */}
      {streak > 0 && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '5px 10px', borderRadius: 10,
          background: '#FBEFD9', color: '#5C3300',
          fontSize: 13, fontWeight: 700,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 3c1 4-4 5-4 10a4 4 0 0 0 8 0c0-2-1-3-1-5 2 1 4 3 4 6a7 7 0 0 1-14 0c0-5 5-8 7-11z" fill="#D08A2C"/>
          </svg>
          {streak}j
        </div>
      )}
    </div>
  )
}
