'use client'

/* ──────────────────────────────────────────────────────────────
   Page Login désactivée temporairement.
   L'authentification obligatoire est retirée pendant la phase
   d'itération UX (cf. middleware.ts + app/lib/plan.ts).
   On redirige tout le monde vers /patient.
   Pour réactiver le formulaire : restaurer la version précédente
   depuis git history.
───────────────────────────────────────────────────────────── */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/patient')
  }, [router])

  return (
    <main style={{
      minHeight: '100vh',
      background: '#F4F6FA',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 20px',
      fontFamily: 'var(--font-atkinson), system-ui, sans-serif',
      color: '#5B6B82',
      fontSize: 16,
    }}>
      Redirection vers l’application…
    </main>
  )
}
