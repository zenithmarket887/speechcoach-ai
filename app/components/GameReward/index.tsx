'use client'

import { useEffect, useState } from 'react'
import type { SessionReward } from '@/app/lib/gamification'

export default function GameReward({ reward, onDismiss }: { reward: SessionReward; onDismiss: () => void }) {
  const [xpDisplayed, setXpDisplayed] = useState(0)
  const [visible, setVisible]         = useState(true)
  const [badgesVisible, setBadgesVisible] = useState(false)

  // Compteur XP animé
  useEffect(() => {
    let current = 0
    const step = Math.max(1, Math.ceil(reward.xpGained / 40))
    const interval = setInterval(() => {
      current = Math.min(current + step, reward.xpGained)
      setXpDisplayed(current)
      if (current >= reward.xpGained) {
        clearInterval(interval)
        setTimeout(() => setBadgesVisible(true), 200)
      }
    }, 30)
    return () => clearInterval(interval)
  }, [reward.xpGained])

  // Auto-dismiss si pas de badges ni record
  useEffect(() => {
    if (reward.newBadges.length === 0 && !reward.isPersonalBest) {
      const t = setTimeout(() => { setVisible(false); setTimeout(onDismiss, 300) }, 5000)
      return () => clearTimeout(t)
    }
  }, [reward.newBadges.length, reward.isPersonalBest, onDismiss])

  const dismiss = () => { setVisible(false); setTimeout(onDismiss, 300) }

  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      borderRadius: 18,
      background: 'linear-gradient(135deg, #1E5BB8 0%, #103E85 100%)',
      boxShadow: '0 8px 24px rgba(30,91,184,0.35)',
      opacity: visible ? 1 : 0,
      transform: visible ? 'scale(1)' : 'scale(0.96)',
      transition: 'opacity 0.3s ease, transform 0.3s ease',
    }}>
      {/* Cercles décoratifs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[
          { top: '-10%', left: '70%'  },
          { top: '20%',  left: '-5%'  },
          { top: '60%',  left: '85%'  },
          { top: '-20%', left: '40%'  },
        ].map((pos, i) => (
          <div key={i} style={{
            position: 'absolute', width: 96, height: 96, borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)', ...pos,
          }}/>
        ))}
      </div>

      <div style={{ position: 'relative', padding: '20px 22px', color: '#FFFFFF' }}>

        {/* En-tête : XP + fermer */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <p style={{
              margin: '0 0 4px',
              fontFamily: 'var(--font-mono), JetBrains Mono, monospace',
              fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.7)', fontWeight: 700,
            }}>
              Séance complétée ✓
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{
                fontSize: 52, fontWeight: 700, lineHeight: 1,
                fontFamily: 'var(--font-mono), JetBrains Mono, monospace',
              }}>+{xpDisplayed}</span>
              <span style={{ fontSize: 22, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>XP</span>
            </div>
          </div>
          <button
            onClick={dismiss}
            style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)', border: 'none',
              color: '#FFFFFF', cursor: 'pointer',
              display: 'grid', placeItems: 'center',
            }}
          >
            <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Record personnel */}
        {reward.isPersonalBest && (
          <div style={{
            marginBottom: 14,
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '12px 16px',
          }}>
            <span style={{ fontSize: 24 }}>🏅</span>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>Nouveau record personnel !</p>
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                Ancien record : {reward.previousBest} pts
              </p>
            </div>
          </div>
        )}

        {/* Badges débloqués */}
        {reward.newBadges.length > 0 && (
          <div style={{
            opacity: badgesVisible ? 1 : 0,
            transform: badgesVisible ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.5s ease, transform 0.5s ease',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <p style={{
              margin: 0,
              fontFamily: 'var(--font-mono), JetBrains Mono, monospace',
              fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.7)', fontWeight: 700,
            }}>
              {reward.newBadges.length === 1 ? 'Badge débloqué' : 'Badges débloqués'}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {reward.newBadges.map((badge, i) => (
                <div
                  key={badge.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: 'rgba(255,255,255,0.18)',
                    borderRadius: 12, padding: '10px 14px',
                    animation: badgesVisible ? `badgePop 0.4s ease ${i * 120}ms both` : 'none',
                  }}
                >
                  <span style={{ fontSize: 22 }}>{badge.emoji}</span>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 14, lineHeight: 1.3 }}>{badge.name}</p>
                    <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.7)', lineHeight: 1.3 }}>{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes badgePop {
          0%   { transform: scale(0.6); opacity: 0; }
          70%  { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
