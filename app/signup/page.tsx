'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

function speak(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = 'fr-FR'
  window.speechSynthesis.speak(utter)
}

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
        <path d="M11 5L6 9H2v6h4l5 4V5z" fill="#5B6B82" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="#5B6B82" strokeWidth="2" strokeLinecap="round" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="#5B6B82" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  )
}

function SignupForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const params = useSearchParams()
  const planParam = params.get('plan')
  const nextParam = params.get('next')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Les deux mots de passe ne correspondent pas.')
      return
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erreur lors de la création du compte.')
        setLoading(false)
        return
      }

      const result = await signIn('credentials', {
        login: data.login,
        password,
        redirect: false,
      })
      if (result?.error) {
        setError('Compte créé, mais connexion impossible. Connectez-vous manuellement.')
        setLoading(false)
        router.push('/login')
        return
      }

      // Si l'utilisateur arrive depuis la page tarifs avec un plan choisi, on enchaîne sur Stripe
      if (planParam === 'monthly' || planParam === 'annual') {
        const c = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan: planParam }),
        })
        const cdata = await c.json()
        if (c.ok && cdata.url) {
          window.location.href = cdata.url
          return
        }
        // En cas d'échec checkout, on continue vers /patient
      }

      const dest = nextParam && nextParam.startsWith('/') ? nextParam : '/patient'
      router.push(dest)
      router.refresh()
    } catch {
      setError('Erreur réseau. Veuillez réessayer.')
      setLoading(false)
    }
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
      <div style={{ width: '100%', maxWidth: 460 }}>

        {/* ── Logo ── */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <Link href="/" aria-label="Retour à l'accueil">
            <Image
              src="/logo-final.png"
              alt="Parole+ AI"
              width={220}
              height={60}
              priority
              style={{ objectFit: 'contain' }}
            />
          </Link>
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
            Créer votre compte.
          </h1>
          <p style={{ margin: '0 0 28px', fontSize: 16, color: '#5B6B82', lineHeight: 1.5 }}>
            Quelques minutes par jour pour garder ou retrouver votre voix.
          </p>

          <form onSubmit={handleSubmit}>

            {/* Nom */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <label htmlFor="field-name" style={{ fontSize: 15, fontWeight: 700, color: '#0E1B2C' }}>
                  Votre nom
                </label>
                <TTSButton label="Votre nom" />
              </div>
              <input
                id="field-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                autoComplete="name"
                name="name"
                className="field-big"
                placeholder="Marie Tremblay"
                required
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <label htmlFor="field-email" style={{ fontSize: 15, fontWeight: 700, color: '#0E1B2C' }}>
                  Courriel
                </label>
                <TTSButton label="Courriel" />
              </div>
              <input
                id="field-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                name="email"
                className="field-big"
                placeholder="vous@exemple.ca"
                required
              />
            </div>

            {/* Mot de passe */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <label htmlFor="field-password" style={{ fontSize: 15, fontWeight: 700, color: '#0E1B2C' }}>
                  Mot de passe
                </label>
                <TTSButton label="Mot de passe, au moins 6 caractères" />
              </div>
              <input
                id="field-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
                name="new-password"
                className="field-big"
                placeholder="Au moins 6 caractères"
                minLength={6}
                required
              />
            </div>

            {/* Confirmation */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <label htmlFor="field-confirm" style={{ fontSize: 15, fontWeight: 700, color: '#0E1B2C' }}>
                  Confirmer le mot de passe
                </label>
                <TTSButton label="Confirmer le mot de passe" />
              </div>
              <input
                id="field-confirm"
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                autoComplete="new-password"
                name="confirm-password"
                className="field-big"
                placeholder="Retapez votre mot de passe"
                minLength={6}
                required
              />
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

            {/* Bouton */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary-lg"
              style={{ fontSize: 17 }}
            >
              {loading ? (
                <>
                  <svg style={{ width: 20, height: 20 }} className="animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Création en cours…
                </>
              ) : (
                <>
                  Créer mon compte
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </>
              )}
            </button>

            <p style={{ margin: '20px 0 0', fontSize: 13, color: '#5B6B82', textAlign: 'center', lineHeight: 1.5 }}>
              En créant un compte, vous commencez avec le plan <strong>Gratuit</strong>. Pas de carte requise.
            </p>
          </form>
        </div>

        {/* ── Lien connexion ── */}
        <div style={{
          background: '#FFFFFF',
          border: '1.5px solid #D6DEEA',
          borderRadius: 16,
          padding: '18px 24px',
          textAlign: 'center',
        }}>
          <p style={{ margin: 0, fontSize: 15, color: '#5B6B82' }}>
            Vous avez déjà un compte ?{' '}
            <Link href="/login" style={{ color: '#1E5BB8', fontWeight: 700, textDecoration: 'none' }}>
              Se connecter →
            </Link>
          </p>
        </div>

      </div>
    </main>
  )
}
