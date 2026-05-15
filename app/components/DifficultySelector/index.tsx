'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { DIFFICULTIES, EXERCISES, type Difficulty, type Exercise } from '@/app/lib/exercises'
import { canAccessDifficulty } from '@/app/lib/plan'

/* ══════════════════════════════════════════
   Props
════════════════════════════════════════════ */
interface DifficultySelectorProps {
  step: 'niveau' | 'texte'
  onStepChange: (s: 'niveau' | 'texte') => void
  onSelect: (difficulty: Difficulty, exercise: Exercise) => void
}

/* ══════════════════════════════════════════
   Couleurs sémantiques
════════════════════════════════════════════ */
const DS: Record<Difficulty, { bg: string; text: string; border: string; dot: string }> = {
  debutant:      { bg: '#E2F1E8', text: '#197A4B', border: '#197A4B', dot: '#2BA265' },
  elementaire:   { bg: '#E5EEFB', text: '#1E5BB8', border: '#1E5BB8', dot: '#3D7BD9' },
  intermediaire: { bg: '#FBEFD9', text: '#A85A00', border: '#A85A00', dot: '#D08A2C' },
  avance:        { bg: '#F8E2D2', text: '#9A4A12', border: '#9A4A12', dot: '#C66318' },
  expert:        { bg: '#F7E1DE', text: '#A8261D', border: '#A8261D', dot: '#CC3328' },
}

/* ══════════════════════════════════════════
   Picto slots (index 0-4)
════════════════════════════════════════════ */
const SLOTS = [
  { bg: '#EEF2F8', color: '#1E5BB8' },
  { bg: '#FEF3E2', color: '#D08A2C' },
  { bg: '#E2F1E8', color: '#197A4B' },
  { bg: '#EEF2F8', color: '#1E5BB8' },
  { bg: '#EEF2F8', color: '#1E5BB8' },
]

/* ══════════════════════════════════════════
   Pictogrammes SVG
════════════════════════════════════════════ */
function Promenade({ c }: { c: string }) {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="20" cy="5" r="3" fill={c}/>
      <path d="M17 9.5L13 17h4.5l-1.5 9.5h2.5l2-9.5h1.5l2 9.5H27l-2.5-9.5H28L23 9.5z" fill={c}/>
    </svg>
  )
}
function Soleil({ c }: { c: string }) {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="5.5" fill={c}/>
      <line x1="16" y1="3" x2="16" y2="7" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="16" y1="25" x2="16" y2="29" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="3" y1="16" x2="7" y2="16" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="25" y1="16" x2="29" y2="16" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="7" y1="7" x2="10" y2="10" stroke={c} strokeWidth="2" strokeLinecap="round"/>
      <line x1="22" y1="22" x2="25" y2="25" stroke={c} strokeWidth="2" strokeLinecap="round"/>
      <line x1="25" y1="7" x2="22" y2="10" stroke={c} strokeWidth="2" strokeLinecap="round"/>
      <line x1="10" y1="22" x2="7" y2="25" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}
function Arbre({ c }: { c: string }) {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M16 2L5 14h7l-4 9h16l-4-9h7z" fill={c}/>
      <rect x="14" y="23" width="4" height="7" rx="2" fill={c}/>
    </svg>
  )
}
function Chat({ c }: { c: string }) {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M8 14l-2-7 5 4" fill={c}/>
      <path d="M24 14l2-7-5 4" fill={c}/>
      <ellipse cx="16" cy="20" rx="9" ry="8" fill={c} opacity="0.15" stroke={c} strokeWidth="2"/>
      <circle cx="12" cy="19" r="2.2" fill={c}/>
      <circle cx="20" cy="19" r="2.2" fill={c}/>
      <path d="M12.5 24c1-1.5 6-1.5 7 0" stroke={c} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
    </svg>
  )
}
function Maison({ c }: { c: string }) {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M3 17L16 5l13 12" stroke={c} strokeWidth="2.5" strokeLinejoin="round" fill="none"/>
      <rect x="7" y="17" width="18" height="11" rx="1.5" fill={c} opacity="0.15" stroke={c} strokeWidth="2"/>
      <rect x="13.5" y="21" width="5" height="7" rx="1" fill={c}/>
      <rect x="8.5" y="19" width="4" height="4" rx="1" fill={c} opacity="0.7"/>
      <rect x="19.5" y="19" width="4" height="4" rx="1" fill={c} opacity="0.7"/>
    </svg>
  )
}
function Texte({ c }: { c: string }) {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="6" y="4" width="20" height="24" rx="3" fill={c} opacity="0.12" stroke={c} strokeWidth="2"/>
      <line x1="10" y1="11" x2="22" y2="11" stroke={c} strokeWidth="2" strokeLinecap="round"/>
      <line x1="10" y1="16" x2="22" y2="16" stroke={c} strokeWidth="2" strokeLinecap="round"/>
      <line x1="10" y1="21" x2="17" y2="21" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

const PICTOS = [Promenade, Soleil, Arbre, Chat, Maison]

function getPicto(idx: number) {
  return PICTOS[idx % 5] ?? Texte
}

/* ══════════════════════════════════════════
   Bouton TTS
════════════════════════════════════════════ */
function TTSBtn({ text }: { text: string }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel()
          const u = new SpeechSynthesisUtterance(text)
          u.lang = 'fr-FR'
          window.speechSynthesis.speak(u)
        }
      }}
      aria-label="Écouter ce texte"
      style={{
        width: 42, height: 42, borderRadius: 10, flexShrink: 0,
        background: '#FFFFFF', border: '2px solid #1E5BB8',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', padding: 0,
      }}
    >
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M11 5L6 9H2v6h4l5 4V5z" fill="#1E5BB8"/>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="#1E5BB8" strokeWidth="2" strokeLinecap="round"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="#1E5BB8" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </button>
  )
}

/* ══════════════════════════════════════════
   Composant principal
════════════════════════════════════════════ */
export default function DifficultySelector({ step, onStepChange, onSelect }: DifficultySelectorProps) {
  const { data: session } = useSession()
  const plan = session?.user.plan ?? 'free'

  const [difficulty, setDifficulty]       = useState<Difficulty>('debutant')
  const [selectedExercise, setSelectedEx] = useState<Exercise>(EXERCISES.debutant[0])

  const st = DS[difficulty]

  /* ── ÉTAPE 1 : Niveau ── */
  if (step === 'niveau') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Carte blanche */}
        <div style={{
          background: '#FFFFFF', border: '1.5px solid #D6DEEA',
          borderRadius: 18, padding: '20px 16px',
          boxShadow: '0 2px 4px rgba(14,27,44,0.06)',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif',
            fontSize: 24, fontWeight: 700, color: '#0E1B2C',
            margin: '0 0 16px',
          }}>
            Choisissez votre niveau
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(Object.keys(DIFFICULTIES) as Difficulty[]).map((d) => {
              const s = DS[d]
              const isActive = d === difficulty
              const locked = !canAccessDifficulty(plan, d)
              return (
                <button
                  key={d}
                  onClick={() => { if (!locked) setDifficulty(d) }}
                  disabled={locked}
                  aria-label={locked ? `${DIFFICULTIES[d].label} — verrouillé, plan Premium requis` : DIFFICULTIES[d].label}
                  style={{
                    width: '100%', minHeight: 64,
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '12px 16px', borderRadius: 14,
                    border: `2px solid ${isActive ? s.border : '#D6DEEA'}`,
                    background: locked ? '#F4F6FA' : (isActive ? s.bg : '#FFFFFF'),
                    cursor: locked ? 'not-allowed' : 'pointer',
                    opacity: locked ? 0.65 : 1,
                    textAlign: 'left',
                    transition: 'all 0.12s ease',
                  }}
                >
                  <span style={{
                    width: 12, height: 12, borderRadius: '50%', flexShrink: 0,
                    background: isActive ? s.dot : '#D6DEEA',
                  }}/>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: isActive ? s.text : '#0E1B2C' }}>
                      {DIFFICULTIES[d].label}
                    </p>
                    <p style={{ margin: 0, fontSize: 13, color: '#5B6B82', marginTop: 2 }}>
                      {DIFFICULTIES[d].description}
                    </p>
                  </div>
                  {locked ? (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '4px 10px', borderRadius: 999,
                      background: '#FEF9ED', border: '1.5px solid #E5C96A',
                      fontSize: 12, fontWeight: 700, color: '#7A5A00',
                      flexShrink: 0,
                    }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <rect x="5" y="11" width="14" height="9" rx="2" fill="#7A5A00"/>
                        <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="#7A5A00" strokeWidth="2" fill="none"/>
                      </svg>
                      Premium
                    </span>
                  ) : isActive ? (
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%',
                      background: s.border, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M3 8l4 4 6-7" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  ) : null}
                </button>
              )
            })}
          </div>

          {/* Bannière "Débloquez les niveaux Soutenu/Exigeant/Maîtrise" masquée
              tant que les verrous Premium sont désactivés (cf. canAccessDifficulty). */}
        </div>

        {/* Bouton Continuer — sur fond gris, hors carte */}
        <button
          onClick={() => {
            setSelectedEx(EXERCISES[difficulty][0])
            onStepChange('texte')
          }}
          style={{
            width: '100%', minHeight: 80,
            background: '#1E5BB8', color: '#FFFFFF', border: 'none',
            borderRadius: 18, fontWeight: 700, fontSize: 18,
            boxShadow: '0 4px 0 #103E85', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}
        >
          Continuer
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    )
  }

  /* ── ÉTAPE 2 : Texte ── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Carte blanche : back + badge + titre + cartes */}
      <div style={{
        background: '#FFFFFF', border: '1.5px solid #D6DEEA',
        borderRadius: 18, padding: '16px 16px',
        boxShadow: '0 2px 4px rgba(14,27,44,0.06)',
      }}>

        {/* Ligne : Retour + Badge niveau */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 14,
        }}>
          <button
            onClick={() => onStepChange('niveau')}
            style={{
              background: '#FFFFFF', border: '1.5px solid #D6DEEA',
              borderRadius: 999, padding: '6px 14px',
              fontSize: 14, fontWeight: 600, color: '#324158',
              cursor: 'pointer', minHeight: 36,
              display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Niveau
          </button>

          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 12px', borderRadius: 999,
            background: st.bg, color: st.text,
            fontSize: 13, fontWeight: 700,
            border: `1.5px solid ${st.border}`,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: st.dot }}/>
            {DIFFICULTIES[difficulty].label}
          </span>
        </div>

        {/* Titre */}
        <h2 style={{
          fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif',
          fontSize: 24, fontWeight: 700, color: '#0E1B2C',
          margin: '0 0 14px',
        }}>
          Choisissez un texte
        </h2>

        {/* Cartes d'exercice */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {EXERCISES[difficulty].map((ex, i) => {
            const isActive = ex.id === selectedExercise.id
            const slot     = SLOTS[i % 5]
            const Picto    = getPicto(i)

            return (
              <button
                key={ex.id}
                onClick={() => setSelectedEx(ex)}
                style={{
                  width: '100%', minHeight: 80,
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '12px 12px 12px 12px',
                  borderRadius: 14,
                  border: `2px solid ${isActive ? '#197A4B' : '#D6DEEA'}`,
                  background: isActive ? '#F0FAF4' : '#FFFFFF',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'border-color 0.12s ease, background 0.12s ease',
                }}
              >
                {/* Picto 56×56 */}
                <div style={{
                  width: 56, height: 56, borderRadius: 12, flexShrink: 0,
                  background: slot.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Picto c={slot.color} />
                </div>

                {/* Titre + coche */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#0E1B2C' }}>
                    {ex.title}
                  </span>
                  {isActive && (
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: '#197A4B', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M3 8l4 4 6-7" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </div>

                {/* TTS */}
                <TTSBtn text={ex.text} />
              </button>
            )
          })}
        </div>
      </div>

      {/* Bouton Continuer — sur fond gris, hors carte */}
      <button
        onClick={() => onSelect(difficulty, selectedExercise)}
        style={{
          width: '100%', minHeight: 80,
          background: '#1E5BB8', color: '#FFFFFF', border: 'none',
          borderRadius: 18, fontWeight: 700, fontSize: 18,
          boxShadow: '0 4px 0 #103E85', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}
      >
        Continuer
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  )
}
