'use client'

import Image from 'next/image'
import { Suspense, useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { isPremium } from '@/app/lib/plan'
import Recorder from '@/app/components/Recorder'
import Score from '@/app/components/Score'
import Feedback from '@/app/components/Feedback'
import DifficultySelector from '@/app/components/DifficultySelector'
import ExpressivityScore from '@/app/components/ExpressivityScore'
import GameReward from '@/app/components/GameReward'
import { DIFFICULTIES, type Difficulty, type Exercise } from '@/app/lib/exercises'
import { saveSession, getPatientSessions, type SpeechSession } from '@/app/lib/sessionStorage'
import {
  getGamificationState,
  computeSessionReward,
  ALL_BADGES,
  type GamificationState,
  type SessionReward,
} from '@/app/lib/gamification'

type AppState = 'setup' | 'recording' | 'analyzing' | 'results' | 'history'
type SetupStep = 'niveau' | 'texte'

interface Analysis {
  scores: { global: number; fluidite: number; hesitations: number; repetitions: number; mots_remplissage: number }
  defauts: { type: 'hesitation' | 'repetition' | 'mot_remplissage' | 'begaiement'; count: number; exemples: string[] }[]
  recommandations: string[]
  points_positifs: string[]
}

interface ExpressivityData {
  score: number
  emotions: { name: string; nameEn: string; percent: number }[]
  recommandations: string[]
}

// ── Couleurs Parole+ par niveau de difficulté ──
const DIFFICULTY_STYLE: Record<Difficulty, { bg: string; text: string; border: string; dot: string }> = {
  debutant:      { bg: '#E2F1E8', text: '#197A4B', border: '#197A4B', dot: '#2BA265' },
  elementaire:   { bg: '#E5EEFB', text: '#103E85', border: '#1E5BB8', dot: '#1E5BB8' },
  intermediaire: { bg: '#FBEFD9', text: '#A85A00', border: '#A85A00', dot: '#D08A2C' },
  avance:        { bg: '#F8E2D2', text: '#9A4A12', border: '#9A4A12', dot: '#C66318' },
  expert:        { bg: '#F7E1DE', text: '#A8261D', border: '#A8261D', dot: '#CC3328' },
}

const SCORE_COLOR = (s: number) =>
  s >= 75 ? '#197A4B' : s >= 50 ? '#A85A00' : '#A8261D'

function DifficultyBadge({ d }: { d: Difficulty }) {
  const st = DIFFICULTY_STYLE[d]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 12px', borderRadius: 999,
      background: st.bg, color: st.text,
      fontSize: 13, fontWeight: 700,
    }}>
      <span style={{ width: 8, height: 8, borderRadius: 8, background: st.dot, flexShrink: 0 }} />
      {DIFFICULTIES[d].label}
    </span>
  )
}

export default function PatientPage() {
  return (
    <Suspense fallback={null}>
      <PatientApp />
    </Suspense>
  )
}

function PatientApp() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const justSubscribed = searchParams.get('subscribed') === '1'
  const [subscribedBanner, setSubscribedBanner] = useState(justSubscribed)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    if (justSubscribed) {
      update().catch(() => {})
      router.replace('/patient', { scroll: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [justSubscribed])

  const openPortal = async () => {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/portal', { method: 'POST' })
      const data = await res.json()
      if (res.ok && data.url) window.location.href = data.url
      else alert(data.error || 'Impossible d’ouvrir le portail.')
    } finally {
      setPortalLoading(false)
    }
  }

  const plan = session?.user.plan ?? 'free'
  const userIsPremium = isPremium(plan)

  const [appState, setAppState]   = useState<AppState>('setup')
  const [setupStep, setSetupStep] = useState<SetupStep>('niveau')
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediaire')
  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [transcription, setTranscription] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [expressivity, setExpressivity] = useState<ExpressivityData | null>(null)
  const [humeLoading, setHumeLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<SpeechSession[]>([])
  const [gamificationState, setGamificationState] = useState<GamificationState | null>(null)
  const [sessionReward, setSessionReward] = useState<SessionReward | null>(null)

  useEffect(() => {
    if (session?.user?.id) {
      getPatientSessions(session.user.id).then((sessions) => {
        setGamificationState(getGamificationState(sessions))
      })
    }
  }, [session?.user?.id])

  const handleSetupDone = (d: Difficulty, ex: Exercise) => {
    setDifficulty(d); setExercise(ex); setAppState('recording'); setError(null)
  }

  const handleTranscription = (text: string) => { setTranscription(text); setError(null) }
  const handleAudioReady = (blob: Blob) => { setAudioBlob(blob) }

  const handleAnalyze = async () => {
    if (!transcription) return
    setAppState('analyzing')
    setError(null)
    setExpressivity(null)
    setHumeLoading(false)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: transcription, difficulty, exerciseText: exercise?.text ?? null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur analyse')
      setAnalysis(data)
      window.dispatchEvent(new Event('usage-updated'))

      if (session?.user) {
        const newSession: SpeechSession = {
          id: `${session.user.id}-${Date.now()}`,
          patientId: session.user.id,
          patientName: session.user.name,
          date: new Date().toISOString(),
          difficulty,
          exerciseId: exercise?.id ?? '',
          exerciseTitle: exercise?.title ?? '',
          scores: data.scores,
          defauts: data.defauts,
          recommandations: data.recommandations,
          points_positifs: data.points_positifs,
          transcription: transcription,
        }
        await saveSession(newSession)
        const allSessions = await getPatientSessions(session.user.id)
        const reward = computeSessionReward(allSessions, newSession)
        setSessionReward(reward)
        setGamificationState(getGamificationState(allSessions))
      }

      setAppState('results')

      if (audioBlob) {
        setHumeLoading(true)
        const fd = new FormData()
        fd.append('audio', audioBlob, 'recording.webm')
        fetch('/api/hume', { method: 'POST', body: fd })
          .then((r) => r.json())
          .then((hume) => { if (hume && !hume.error) setExpressivity(hume) })
          .catch(() => {})
          .finally(() => {
            setHumeLoading(false)
            window.dispatchEvent(new Event('usage-updated'))
          })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      setAppState('recording')
    }
  }

  const handleShowHistory = async () => {
    if (session?.user) {
      const sessions = await getPatientSessions(session.user.id)
      setHistory(sessions)
    }
    setAppState('history')
  }

  const handleReset = () => {
    setAppState('setup')
    setSetupStep('niveau')
    setTranscription(null)
    setAudioBlob(null)
    setAnalysis(null)
    setExpressivity(null)
    setError(null)
    setExercise(null)
    setSessionReward(null)
  }

  return (
    <main style={{ minHeight: '100vh', background: '#EEF2F8' }}>

      {/* ══════════════ HEADER ══════════════ */}
      <header style={{
        background: '#FFFFFF',
        borderBottom: '1.5px solid #D6DEEA',
        position: 'sticky', top: 0, zIndex: 20,
      }}>
        {/* ── Ligne principale : avatar | niveau | streak + nav ── */}
        <div style={{
          maxWidth: 720, margin: '0 auto', padding: '10px 20px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          {/* Logo — toujours visible */}
          <div style={{ flexShrink: 0 }}>
            <Image src="/logo-final.png" alt="Parole+ AI" width={120} height={33} priority style={{ objectFit: 'contain', display: 'block' }} />
          </div>

          {/* Badge niveau centré */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            {gamificationState && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '6px 14px', borderRadius: 999,
                background: '#FEF9ED', border: '1.5px solid #E5C96A',
                fontSize: 14, fontWeight: 700, color: '#7A5A00',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" fill="#D08A2C"/>
                </svg>
                {gamificationState.level.name}
              </div>
            )}
          </div>

          {/* Streak + nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {gamificationState && gamificationState.streak > 0 && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '5px 10px', borderRadius: 999,
                background: '#FEF3E2', border: '1.5px solid #F5C078',
                fontSize: 14, fontWeight: 700, color: '#A85A00',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 3c1 4-4 5-4 10a4 4 0 0 0 8 0c0-2-1-3-1-5 2 1 4 3 4 6a7 7 0 0 1-14 0c0-5 5-8 7-11z" fill="#D08A2C"/>
                </svg>
                {gamificationState.streak}j
              </div>
            )}
            <button
              onClick={handleShowHistory}
              aria-label="Historique"
              style={{
                background: '#EEF2F8', border: '1.5px solid #D6DEEA',
                borderRadius: 8, padding: '5px 10px',
                color: '#324158', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', minHeight: 32,
              }}
            >
              Historique
            </button>
            {/* Bouton Premium / portail abonnement : visible uniquement si l'utilisateur a un plan payant.
                Le CTA "Premium" pour les non-abonnés est masqué tant que les verrous Premium sont désactivés. */}
            {userIsPremium && (
              <button
                onClick={openPortal}
                disabled={portalLoading}
                aria-label="Gérer mon abonnement"
                title="Gérer mon abonnement"
                style={{
                  background: '#FEF9ED', border: '1.5px solid #E5C96A',
                  borderRadius: 8, padding: '5px 10px',
                  color: '#7A5A00', fontSize: 13, fontWeight: 700,
                  cursor: portalLoading ? 'wait' : 'pointer', minHeight: 32,
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" fill="#D08A2C"/>
                </svg>
                {portalLoading ? '…' : (plan === 'annual' ? 'Annuel' : 'Mensuel')}
              </button>
            )}
            {/* Bouton Déconnexion masqué tant que l'auth est désactivée (signOut redirigerait vers /login → /patient, donc inutile).
                Visible uniquement si une session existe. */}
            {session && (
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                aria-label="Déconnexion"
                style={{
                  background: 'transparent', border: '1.5px solid #D6DEEA',
                  borderRadius: 8, padding: '5px 10px',
                  color: '#5B6B82', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', minHeight: 32,
                }}
              >
                Déco.
              </button>
            )}
          </div>
        </div>

        {/* ── Stepper sub-bar (visible pendant le setup) ── */}
        {appState === 'setup' && (
          <div style={{
            borderTop: '1px solid #F0F4FA',
            padding: '10px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {/* Étape 1 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: setupStep === 'texte' ? '#197A4B' : '#1E5BB8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {setupStep === 'texte' ? (
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-7" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                ) : (
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#FFF', fontFamily: 'var(--font-mono), monospace' }}>1</span>
                )}
              </div>
              <span style={{
                fontSize: 14, fontWeight: 700,
                color: setupStep === 'texte' ? '#197A4B' : '#0E1B2C',
              }}>Niveau</span>
            </div>

            {/* Connecteur */}
            <div style={{ width: 36, height: 2, background: setupStep === 'texte' ? '#197A4B' : '#D6DEEA', margin: '0 6px' }}/>

            {/* Étape 2 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: setupStep === 'texte' ? '#1E5BB8' : 'transparent',
                border: setupStep === 'texte' ? 'none' : '2px solid #D6DEEA',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: setupStep === 'texte' ? '#FFF' : '#9FB0C6', fontFamily: 'var(--font-mono), monospace' }}>2</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: setupStep === 'texte' ? '#0E1B2C' : '#9FB0C6' }}>Texte</span>
            </div>

            {/* Connecteur */}
            <div style={{ width: 36, height: 2, background: '#D6DEEA', margin: '0 6px' }}/>

            {/* Étape 3 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: 'transparent', border: '2px solid #D6DEEA',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#9FB0C6', fontFamily: 'var(--font-mono), monospace' }}>3</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#9FB0C6' }}>Lire</span>
            </div>
          </div>
        )}
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {subscribedBanner && (
          <div style={{
            background: '#E2F1E8', border: '1.5px solid #197A4B',
            borderRadius: 14, padding: '14px 18px',
            display: 'flex', alignItems: 'flex-start', gap: 12,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="12" cy="12" r="10" fill="#197A4B"/>
              <path d="M7 12l3.5 3.5L17 9" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0E5C36' }}>
                Bienvenue dans Premium.
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 14, color: '#197A4B', lineHeight: 1.5 }}>
                Tous les niveaux et l’analyse expressive sont maintenant débloqués. Merci de soutenir le projet.
              </p>
            </div>
            <button
              onClick={() => setSubscribedBanner(false)}
              aria-label="Fermer"
              style={{ background: 'transparent', border: 'none', color: '#197A4B', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 4 }}
            >
              ×
            </button>
          </div>
        )}

        {/* ════════════ SETUP ════════════ */}
        {appState === 'setup' && (
          <DifficultySelector
            step={setupStep}
            onStepChange={setSetupStep}
            onSelect={handleSetupDone}
          />
        )}

        {/* ════════════ RECORDING ════════════ */}
        {appState === 'recording' && (
          <>
            {/* Bouton retour vers la sélection du texte */}
            <div>
              <button
                onClick={() => {
                  setTranscription(null)
                  setAudioBlob(null)
                  setError(null)
                  setAppState('setup')
                  setSetupStep('texte')
                }}
                aria-label="Revenir à la sélection du texte"
                style={{
                  background: '#FFFFFF', border: '1.5px solid #D6DEEA',
                  borderRadius: 999, padding: '8px 16px',
                  fontSize: 14, fontWeight: 600, color: '#324158',
                  cursor: 'pointer', minHeight: 38,
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Changer de texte
              </button>
            </div>

            <div style={{ textAlign: 'center' }}>
              <h1 style={{
                fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif',
                fontSize: 32, fontWeight: 700, margin: '0 0 12px', color: '#0E1B2C',
              }}>
                Enregistrement
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <DifficultyBadge d={difficulty} />
                {exercise && <span style={{ color: '#5B6B82', fontSize: 15, fontWeight: 600 }}>{exercise.title}</span>}
              </div>
            </div>

            {/* Texte à lire */}
            {exercise && (
              <div style={{ background: '#FFFFFF', border: '1.5px solid #D6DEEA', borderRadius: 18, padding: '20px 24px', boxShadow: '0 2px 4px rgba(14,27,44,0.06)' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: 12,
                }}>
                  <span style={{
                    fontFamily: 'var(--font-mono), JetBrains Mono, monospace',
                    fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
                    color: '#5B6B82', fontWeight: 700,
                  }}>Texte à lire</span>
                  <button
                    type="button"
                    onClick={() => {
                      if ('speechSynthesis' in window) {
                        window.speechSynthesis.cancel()
                        const u = new SpeechSynthesisUtterance(exercise.text)
                        u.lang = 'fr-FR'
                        window.speechSynthesis.speak(u)
                      }
                    }}
                    aria-label="Écouter le texte à lire"
                    style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: '#EEF2F8', border: '1.5px solid #D6DEEA',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', padding: 0,
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M11 5L6 9H2v6h4l5 4V5z" fill="#5B6B82"/>
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="#5B6B82" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="#5B6B82" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
                <p style={{ margin: 0, fontSize: 18, lineHeight: 1.75, color: '#0E1B2C', fontWeight: 500 }}>
                  {exercise.text}
                </p>
              </div>
            )}

            {/* Enregistreur */}
            <div style={{ background: '#FFFFFF', border: '1.5px solid #D6DEEA', borderRadius: 18, padding: '40px 28px', boxShadow: '0 2px 4px rgba(14,27,44,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Recorder onTranscription={handleTranscription} onAudioReady={handleAudioReady} onError={setError} />

              {error && (
                <div style={{
                  marginTop: 20, display: 'flex', alignItems: 'flex-start', gap: 12,
                  background: '#F7E1DE', border: '1.5px solid #A8261D',
                  borderRadius: 14, padding: '14px 18px',
                  color: '#A8261D', fontSize: 15, maxWidth: 400, width: '100%',
                }}>
                  <svg style={{ width: 18, height: 18, marginTop: 1, flexShrink: 0 }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              {transcription && (
                <div style={{ marginTop: 28, width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ background: '#F4F6FA', border: '1.5px solid #D6DEEA', borderRadius: 14, padding: '16px 20px' }}>
                    <div style={{
                      fontFamily: 'var(--font-mono), JetBrains Mono, monospace',
                      fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
                      color: '#5B6B82', fontWeight: 700, marginBottom: 10,
                    }}>Transcription</div>
                    <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: '#0E1B2C' }}>{transcription}</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <button
                      onClick={handleReset}
                      className="btn-ghost"
                      style={{ width: '100%', borderRadius: 14 }}
                    >
                      Recommencer
                    </button>
                    <button
                      onClick={handleAnalyze}
                      style={{
                        background: '#1E5BB8', color: '#FFFFFF', border: 'none',
                        borderRadius: 14, fontWeight: 700, fontSize: 17,
                        minHeight: 56, boxShadow: '0 4px 0 #103E85',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        cursor: 'pointer', width: '100%',
                        transition: 'transform 0.08s ease',
                      }}
                    >
                      Analyser →
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleReset}
              style={{
                background: 'transparent', border: 'none',
                color: '#5B6B82', fontSize: 15, fontWeight: 600,
                textAlign: 'center', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              ← Changer d&apos;exercice
            </button>
          </>
        )}

        {/* ════════════ ANALYZING ════════════ */}
        {appState === 'analyzing' && (
          <div style={{
            background: '#FFFFFF', border: '1.5px solid #D6DEEA', borderRadius: 18,
            padding: '64px 32px', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 20,
            boxShadow: '0 2px 4px rgba(14,27,44,0.06)',
          }}>
            <div style={{
              width: 64, height: 64,
              background: '#E5EEFB', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg style={{ width: 32, height: 32, color: '#1E5BB8' }} className="animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 700, fontSize: 18, color: '#0E1B2C', margin: '0 0 6px' }}>Analyse en cours…</p>
              <p style={{ fontSize: 15, color: '#5B6B82', margin: 0 }}>{DIFFICULTIES[difficulty].scoringNote}</p>
            </div>
          </div>
        )}

        {/* ════════════ RESULTS ════════════ */}
        {appState === 'results' && analysis && (
          <>
            {sessionReward && (
              <GameReward reward={sessionReward} onDismiss={() => setSessionReward(null)} />
            )}

            <div style={{ textAlign: 'center' }}>
              <h1 style={{
                fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif',
                fontSize: 32, fontWeight: 700, margin: '0 0 14px', color: '#0E1B2C',
              }}>
                Vos résultats
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <DifficultyBadge d={difficulty} />
                {exercise && <span style={{ color: '#5B6B82', fontSize: 15, fontWeight: 600 }}>— {exercise.title}</span>}
              </div>
            </div>

            {/* Score */}
            <div style={{ background: '#FFFFFF', border: '1.5px solid #D6DEEA', borderRadius: 18, padding: 24, boxShadow: '0 2px 4px rgba(14,27,44,0.06)' }}>
              <Score scores={analysis.scores} />
            </div>

            {/* Feedback */}
            <div style={{ background: '#FFFFFF', border: '1.5px solid #D6DEEA', borderRadius: 18, padding: 24, boxShadow: '0 2px 4px rgba(14,27,44,0.06)' }}>
              <Feedback defauts={analysis.defauts} recommandations={analysis.recommandations} points_positifs={analysis.points_positifs} />
            </div>

            {/* Expressivité Hume */}
            {(humeLoading || expressivity) && (
              <div style={{ background: '#FFFFFF', border: '1.5px solid #D6DEEA', borderRadius: 18, padding: 24, boxShadow: '0 2px 4px rgba(14,27,44,0.06)' }}>
                {humeLoading && !expressivity ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 4, height: 20, background: '#C8B8EC', borderRadius: 2 }} className="animate-pulse" />
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#5B6B82' }} className="animate-pulse">
                        Analyse expressive en cours…
                      </span>
                      <svg style={{ width: 16, height: 16, color: '#7B5CD9', marginLeft: 'auto' }} className="animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
                      <div style={{ width: 96, height: 96, borderRadius: '50%', background: '#EEF2F8' }} className="animate-pulse" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[80, 60, 45].map((w) => (
                        <div key={w} style={{ height: 10, background: '#EEF2F8', borderRadius: 5, width: `${w}%` }} className="animate-pulse" />
                      ))}
                    </div>
                  </div>
                ) : expressivity ? (
                  <ExpressivityScore data={expressivity} />
                ) : null}
              </div>
            )}

            {/* Transcription */}
            <details style={{ background: '#FFFFFF', border: '1.5px solid #D6DEEA', borderRadius: 18, padding: 20 }}>
              <summary style={{
                fontSize: 15, fontWeight: 700, color: '#324158', cursor: 'pointer',
                listStyle: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                Voir la transcription
                <svg style={{ width: 16, height: 16, color: '#5B6B82' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p style={{ margin: '14px 0 0', fontSize: 15, color: '#324158', lineHeight: 1.7, borderTop: '1px solid #D6DEEA', paddingTop: 14 }}>
                {transcription}
              </p>
            </details>

            {/* Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <button
                onClick={handleShowHistory}
                style={{
                  minHeight: 56, borderRadius: 14,
                  background: '#FFFFFF', border: '2px solid #D6DEEA',
                  color: '#0E1B2C', fontSize: 16, fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Mon historique
              </button>
              <button
                onClick={handleReset}
                style={{
                  minHeight: 56, borderRadius: 14,
                  background: '#1E5BB8', color: '#FFFFFF',
                  border: 'none', boxShadow: '0 4px 0 #103E85',
                  fontSize: 16, fontWeight: 700, cursor: 'pointer',
                }}
              >
                Nouvelle séance
              </button>
            </div>
          </>
        )}

        {/* ════════════ HISTORY ════════════ */}
        {appState === 'history' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: '#0E1B2C', letterSpacing: '-0.4px' }}>
                Mes séances
              </h1>
              <button
                onClick={handleReset}
                style={{
                  background: '#E5EEFB', border: 'none',
                  color: '#1E5BB8', fontSize: 14, fontWeight: 700,
                  borderRadius: 10, padding: '8px 16px', cursor: 'pointer',
                }}
              >
                + Nouvelle séance
              </button>
            </div>

            {/* Badges & niveau */}
            {gamificationState && (
              <div style={{ background: '#FFFFFF', border: '1.5px solid #D6DEEA', borderRadius: 18, padding: 20, boxShadow: '0 2px 4px rgba(14,27,44,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0E1B2C' }}>Mes badges</p>
                  <span style={{ fontSize: 13, color: '#5B6B82', fontFamily: 'var(--font-mono), monospace' }}>
                    {gamificationState.badges.length}/{ALL_BADGES.length} débloqués
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                  {ALL_BADGES.map((badge) => {
                    const earned = gamificationState.badges.some((b) => b.id === badge.id)
                    return (
                      <div
                        key={badge.id}
                        title={earned ? badge.description : `Objectif : ${badge.description}`}
                        style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center',
                          padding: '10px 4px', borderRadius: 12,
                          border: `1.5px solid ${earned ? '#D6DEEA' : '#D6DEEA'}`,
                          background: earned ? '#F4F6FA' : '#F4F6FA',
                          opacity: earned ? 1 : 0.35,
                          filter: earned ? 'none' : 'grayscale(1)',
                          textAlign: 'center',
                        }}
                      >
                        <span style={{ fontSize: 22 }}>{badge.emoji}</span>
                        <p style={{ fontSize: 9, fontWeight: 700, margin: '4px 0 0', lineHeight: 1.3, color: '#324158' }}>
                          {badge.name}
                        </p>
                      </div>
                    )
                  })}
                </div>

                {/* XP + niveau */}
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #D6DEEA' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#1E5BB8' }}>
                      {gamificationState.level.emoji} {gamificationState.level.name}
                    </span>
                    <span style={{
                      fontSize: 12, color: '#5B6B82',
                      fontFamily: 'var(--font-mono), monospace', fontWeight: 700,
                    }}>
                      {gamificationState.totalXP} XP
                    </span>
                  </div>
                  <div style={{ height: 8, background: '#EEF2F8', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 4,
                      background: '#1E5BB8',
                      width: `${gamificationState.progressPercent}%`,
                      transition: 'width 1s ease',
                    }} />
                  </div>
                  {gamificationState.xpToNext > 0 && (
                    <p style={{ fontSize: 11, color: '#5B6B82', textAlign: 'right', margin: '6px 0 0', fontFamily: 'var(--font-mono), monospace' }}>
                      {gamificationState.xpToNext} XP pour le prochain niveau
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Liste des séances */}
            {history.length === 0 ? (
              <div style={{
                background: '#FFFFFF', border: '1.5px solid #D6DEEA', borderRadius: 18,
                padding: '48px 32px', textAlign: 'center',
              }}>
                <p style={{ fontSize: 40, margin: '0 0 12px' }}>🎙️</p>
                <p style={{ fontWeight: 700, fontSize: 18, color: '#0E1B2C', margin: '0 0 6px' }}>Aucune séance enregistrée</p>
                <p style={{ color: '#5B6B82', fontSize: 15, margin: 0 }}>Faites votre première séance pour voir votre historique.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {history.map((s) => {
                  const d = s.difficulty as Difficulty
                  const st = DIFFICULTY_STYLE[d] ?? DIFFICULTY_STYLE.debutant
                  return (
                    <div key={s.id} style={{
                      background: '#FFFFFF', border: '1.5px solid #D6DEEA',
                      borderRadius: 18, padding: '18px 22px',
                      boxShadow: '0 2px 4px rgba(14,27,44,0.06)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 5,
                              padding: '3px 10px', borderRadius: 999,
                              background: st.bg, color: st.text,
                              fontSize: 12, fontWeight: 700,
                            }}>
                              {DIFFICULTIES[d]?.label}
                            </span>
                            <span style={{ fontSize: 14, fontWeight: 600, color: '#0E1B2C' }}>{s.exerciseTitle}</span>
                          </div>
                          <p style={{ margin: 0, fontSize: 13, color: '#5B6B82' }}>
                            {new Date(s.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <span style={{
                          fontSize: 32, fontWeight: 700, color: SCORE_COLOR(s.scores.global),
                          fontFamily: 'var(--font-mono), monospace',
                        }}>
                          {s.scores.global}
                        </span>
                      </div>
                      <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: 8, paddingTop: 12, borderTop: '1px solid #D6DEEA',
                      }}>
                        {[
                          ['Fluidité', s.scores.fluidite],
                          ['Hésitations', s.scores.hesitations],
                          ['Répétitions', s.scores.repetitions],
                          ['Parasites', s.scores.mots_remplissage],
                        ].map(([label, val]) => (
                          <div key={label as string} style={{ textAlign: 'center' }}>
                            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: SCORE_COLOR(val as number) }}>{val}</p>
                            <p style={{ margin: 0, fontSize: 11, color: '#5B6B82', marginTop: 2 }}>{label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
