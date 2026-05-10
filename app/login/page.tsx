'use client'

import Image from 'next/image'
import { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

/* ─── Synthèse vocale (Web Speech API) ─── */
function speak(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = 'fr-FR'
  window.speechSynthesis.speak(utter)
}

/* ─── Bouton synthèse vocale ─── */
function TTSButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => speak(label)}
      aria-label={`Écouter : ${label}`}
      title={`Écouter : ${label}`}
      style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        background: '#EEF2F8', border: '1.5px solid #D6DEEA',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', padding: 0,
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M11 5L6 9H2v6h4l5 4V5z" fill="#5B6B82"/>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="#5B6B82" strokeWidth="2" strokeLinecap="round"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="#5B6B82" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </button>
  )
}

/* ─── Pictogrammes compte ─── */
function PictoOrtho() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="10" r="6" fill="#1E5BB8"/>
      <path d="M4 28c0-6.6 5.4-12 12-12s12 5.4 12 12" fill="#1E5BB8"/>
      <circle cx="24" cy="22" r="6" fill="#E5EEFB" stroke="#1E5BB8" strokeWidth="1.5"/>
      <path d="M21 22h6M24 19v6" stroke="#1E5BB8" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function PictoPatient() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="10" r="6" fill="#5B6B82"/>
      <path d="M4 28c0-6.6 5.4-12 12-12s12 5.4 12 12" fill="#5B6B82"/>
    </svg>
  )
}

/* ─── Données comptes démo ─── */
const DEMO_ACCOUNTS = [
  { label: 'Orthophoniste', name: 'Compte ortho', l: 'ortho@speechcoach.fr', p: 'ortho2024', kind: 'ortho' as const, bg: '#E5EEFB', border: '#1E5BB8', text: '#103E85' },
  { label: 'Doux',     name: 'Marie Dupont',   l: 'p001', p: 'marie123',     kind: 'patient' as const, bg: '#EEF2F8', border: '#D6DEEA', text: '#324158' },
  { label: 'Doux',     name: 'Jean Martin',    l: 'p002', p: 'jean123',      kind: 'patient' as const, bg: '#EEF2F8', border: '#D6DEEA', text: '#324158' },
  { label: 'Soutenu',  name: 'Sophie Bernard', l: 'p003', p: 'sophie123',    kind: 'patient' as const, bg: '#FBEFD9', border: '#A85A00', text: '#A85A00' },
  { label: 'Exigeant', name: 'Manuel',         l: 'p004', p: 'appartement11',kind: 'patient' as const, bg: '#F8E2D2', border: '#9A4A12', text: '#9A4A12' },
]

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const [login, setLogin]         = useState('')
  const [password, setPassword]   = useState('')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [, setPwdRO]              = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const showDemo = searchParams.get('demo') === '1'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await signIn('credentials', { login, password, redirect: false })
    if (result?.error) {
      setError('Identifiants incorrects. Vérifiez votre courriel et votre mot de passe.')
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  const fillDemo = (l: string, p: string) => {
    setLogin(l)
    setPassword(p)
    setPwdRO(false)
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: '#F4F6FA',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 20px',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* ── Logo ── */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <Image
            src="/logo-final.png"
            alt="Parole+ AI"
            width={220}
            height={60}
            priority
            style={{ objectFit: 'contain' }}
          />
        </div>

        {/* ── Formulaire ── */}
        <div style={{
          background: '#FFFFFF',
          border: '1.5px solid #D6DEEA',
          borderRadius: 24,
          padding: '32px 28px',
          boxShadow: '0 6px 18px rgba(14,27,44,0.10)',
          marginBottom: 16,
        }}>
          <h1 style={{
            fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif',
            fontSize: 28, fontWeight: 700, color: '#0E1B2C',
            margin: '0 0 6px', lineHeight: 1.2,
          }}>
            Bon retour parmi vous.
          </h1>
          <p style={{ margin: '0 0 28px', fontSize: 16, color: '#5B6B82', lineHeight: 1.5 }}>
            Connectez-vous pour reprendre votre entraînement.
          </p>

          <form onSubmit={handleSubmit} autoComplete="off">

            {/* Courriel */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <label
                  htmlFor="field-login"
                  style={{ fontSize: 15, fontWeight: 700, color: '#0E1B2C' }}
                >
                  Courriel
                </label>
                <TTSButton label="Courriel" />
              </div>
              <input
                id="field-login"
                type="email"
                value={login}
                onChange={e => setLogin(e.target.value)}
                autoComplete="email"
                name="email"
                className="field-big"
                placeholder="vous@exemple.ca"
                required
              />
            </div>

            {/* Mot de passe */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <label
                  htmlFor="field-password"
                  style={{ fontSize: 15, fontWeight: 700, color: '#0E1B2C' }}
                >
                  Mot de passe
                </label>
                <TTSButton label="Mot de passe" />
              </div>
              <input
                id="field-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                name="password"
                className="field-big"
                placeholder="••••••••"
                required
              />
              <div style={{ marginTop: 10, textAlign: 'right' }}>
                <a
                  href={`mailto:sebastien.girard@paroleplus.ca?subject=${encodeURIComponent('Mot de passe oublié — Parole+')}&body=${encodeURIComponent(`Bonjour Sébastien,\n\nJ'ai oublié mon mot de passe.\n\nMon courriel de connexion : ${login || '[remplissez votre courriel ici]'}\n\nMerci de m'envoyer un nouveau mot de passe ou un lien de réinitialisation.\n\nCordialement,`)}`}
                  style={{ fontSize: 14, color: '#1E5BB8', fontWeight: 600, textDecoration: 'none' }}
                >
                  Mot de passe oublié&nbsp;?
                </a>
              </div>
            </div>

            {/* Erreur */}
            {error && (
              <div style={{
                background: '#F7E1DE', border: '1.5px solid #A8261D',
                borderRadius: 12, padding: '12px 16px',
                marginBottom: 20,
                display: 'flex', alignItems: 'flex-start', gap: 10,
              }}>
                <svg style={{ width: 18, height: 18, color: '#A8261D', flexShrink: 0, marginTop: 1 }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span style={{ fontSize: 14, color: '#A8261D', lineHeight: 1.5 }}>{error}</span>
              </div>
            )}

            {/* Bouton Se connecter */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary-lg"
              style={{ fontSize: 17 }}
            >
              {loading ? (
                <>
                  <svg style={{ width: 20, height: 20 }} className="animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Connexion en cours…
                </>
              ) : (
                <>
                  Se connecter
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>

            <p style={{ margin: '20px 0 0', fontSize: 15, color: '#5B6B82', textAlign: 'center', lineHeight: 1.5 }}>
              Pas encore de compte ?{' '}
              <a href="/signup" style={{ color: '#1E5BB8', fontWeight: 700, textDecoration: 'none' }}>
                Créer un compte gratuit →
              </a>
            </p>
          </form>
        </div>

        {/* ── Comptes de démo (masqués sauf si ?demo=1) ── */}
        {showDemo && (
        <div style={{
          background: '#FFFFFF',
          border: '1.5px solid #D6DEEA',
          borderRadius: 20,
          padding: '22px 24px',
          boxShadow: '0 2px 4px rgba(14,27,44,0.06)',
        }}>
          <p style={{
            fontFamily: 'var(--font-mono), JetBrains Mono, monospace',
            fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
            color: '#5B6B82', fontWeight: 700, margin: '0 0 14px',
          }}>
            Comptes de démonstration
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {DEMO_ACCOUNTS.map(({ label, name, l, p, kind, bg, border, text }) => (
              <button
                key={l}
                type="button"
                onClick={() => fillDemo(l, p)}
                aria-label={`Se connecter en tant que ${name} (${label})`}
                style={{
                  width: '100%', minHeight: 64,
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '10px 14px',
                  borderRadius: 14,
                  background: bg,
                  border: `1.5px solid ${border}`,
                  cursor: 'pointer',
                  transition: 'filter 0.1s ease',
                  textAlign: 'left',
                }}
              >
                {/* Picto */}
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: '#FFFFFF',
                  border: `1.5px solid ${border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {kind === 'ortho' ? <PictoOrtho /> : <PictoPatient />}
                </div>

                {/* Texte */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0E1B2C', lineHeight: 1.2 }}>
                    {name}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: text, marginTop: 2 }}>
                    {label} · {l}
                  </p>
                </div>

                {/* Flèche */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: text, flexShrink: 0 }} aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            ))}
          </div>
        </div>
        )}

      </div>
    </main>
  )
}
