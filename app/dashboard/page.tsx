'use client'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { getPatientList, getAllSessions, getPatientSessions, type SpeechSession } from '@/app/lib/sessionStorage'
import { DIFFICULTIES } from '@/app/lib/exercises'

const SCORE_COLOR = (s: number) =>
  s >= 75 ? '#197A4B' : s >= 50 ? '#A85A00' : '#A8261D'

const DIFFICULTY_STYLE: Record<string, { bg: string; text: string }> = {
  debutant:      { bg: '#E2F1E8', text: '#197A4B' },
  elementaire:   { bg: '#E5EEFB', text: '#103E85' },
  intermediaire: { bg: '#FBEFD9', text: '#A85A00' },
  avance:        { bg: '#F8E2D2', text: '#9A4A12' },
  expert:        { bg: '#F7E1DE', text: '#A8261D' },
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color = value >= 75 ? '#197A4B' : value >= 50 ? '#A85A00' : '#A8261D'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#5B6B82' }}>
        <span>{label}</span>
        <span style={{ fontWeight: 700, color: '#0E1B2C', fontFamily: 'var(--font-mono), monospace' }}>{value}</span>
      </div>
      <div style={{ height: 6, background: '#EEF2F8', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 3, background: color, width: `${value}%`, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  )
}

function LineChart({ sessions }: { sessions: SpeechSession[] }) {
  if (sessions.length < 2) return (
    <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5B6B82', fontSize: 14 }}>
      Minimum 2 séances pour afficher le graphique
    </div>
  )
  const reversed = [...sessions].reverse()
  const scores = reversed.map(s => s.scores.global)
  const min = Math.max(0, Math.min(...scores) - 10)
  const max = Math.min(100, Math.max(...scores) + 10)
  const W = 300; const H = 80; const pad = 10
  const pts = scores.map((v, i) => {
    const x = pad + (i / (scores.length - 1)) * (W - 2 * pad)
    const y = H - pad - ((v - min) / (max - min)) * (H - 2 * pad)
    return `${x},${y}`
  }).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%' }} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke="#1E5BB8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {scores.map((v, i) => {
        const x = pad + (i / (scores.length - 1)) * (W - 2 * pad)
        const y = H - pad - ((v - min) / (max - min)) * (H - 2 * pad)
        return <circle key={i} cx={x} cy={y} r="3.5" fill="white" stroke="#1E5BB8" strokeWidth="2" />
      })}
    </svg>
  )
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [patients, setPatients] = useState<ReturnType<typeof getPatientList>>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [sessions, setSessions] = useState<SpeechSession[]>([])

  useEffect(() => {
    getAllSessions().then((all) => {
      const list = getPatientList(all)
      setPatients(list)
      if (list.length > 0) {
        setSelected(list[0].id)
        setSessions(all.filter((s) => s.patientId === list[0].id))
      }
    })
  }, [])

  const selectPatient = async (id: string) => {
    setSelected(id)
    const s = await getPatientSessions(id)
    setSessions(s)
  }

  const avg = sessions.length > 0
    ? Math.round(sessions.reduce((s, x) => s + x.scores.global, 0) / sessions.length)
    : null

  const trend = sessions.length >= 2
    ? sessions[0].scores.global - sessions[sessions.length - 1].scores.global
    : null

  return (
    <main style={{ minHeight: '100vh', background: '#EEF2F8' }}>

      {/* ── Barre de navigation ── */}
      <header style={{ background: '#FFFFFF', borderBottom: '1.5px solid #D6DEEA', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Image src="/logo-mark.png" alt="Parole+" width={36} height={36} style={{ borderRadius: 36, objectFit: 'contain' }} />
          <span style={{ fontWeight: 700, fontSize: 18, color: '#0E1B2C', letterSpacing: '-0.3px' }}>Parole + AI</span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '4px 12px', borderRadius: 999,
            background: '#E5EEFB', color: '#103E85',
            fontSize: 12, fontWeight: 700,
          }}>
            Orthophoniste
          </span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 14, color: '#5B6B82' }}>{session?.user.name}</span>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            style={{ background: 'transparent', border: 'none', color: '#5B6B82', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            Déconnexion
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 20px' }}>
        {patients.length === 0 ? (
          <div style={{
            background: '#FFFFFF', border: '1.5px solid #D6DEEA', borderRadius: 18,
            padding: '80px 32px', textAlign: 'center',
            boxShadow: '0 2px 4px rgba(14,27,44,0.06)',
          }}>
            <p style={{ fontSize: 40, margin: '0 0 14px' }}>📋</p>
            <p style={{ fontWeight: 700, fontSize: 20, color: '#0E1B2C', margin: '0 0 8px' }}>Aucune séance enregistrée</p>
            <p style={{ color: '#5B6B82', fontSize: 15, margin: 0 }}>Les séances de vos patients apparaîtront ici après leur première analyse.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24 }}>

            {/* ── Colonne patients ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{
                fontFamily: 'var(--font-mono), monospace',
                fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
                color: '#5B6B82', fontWeight: 700, margin: '0 0 4px 2px',
              }}>Patients</p>
              {patients.map((p) => {
                const isSelected = selected === p.id
                return (
                  <button
                    key={p.id}
                    onClick={() => selectPatient(p.id)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '14px 16px',
                      borderRadius: 14, cursor: 'pointer',
                      border: `2px solid ${isSelected ? '#1E5BB8' : '#D6DEEA'}`,
                      background: isSelected ? '#1E5BB8' : '#FFFFFF',
                      color: isSelected ? '#FFFFFF' : '#0E1B2C',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 4px 12px rgba(30,91,184,0.25)' : '0 2px 4px rgba(14,27,44,0.04)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</span>
                      <span style={{
                        fontSize: 22, fontWeight: 700,
                        color: isSelected ? '#FFFFFF' : SCORE_COLOR(p.lastScore),
                        fontFamily: 'var(--font-mono), monospace',
                      }}>
                        {p.lastScore}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: isSelected ? 'rgba(255,255,255,0.7)' : '#5B6B82' }}>
                      {p.count} séance{p.count > 1 ? 's' : ''} · {new Date(p.lastDate).toLocaleDateString('fr-FR')}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* ── Détail patient ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {selected && sessions.length > 0 && (
                <>
                  {/* Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                    {[
                      { label: 'Score moyen', value: avg !== null ? `${avg}` : '—', color: avg !== null ? SCORE_COLOR(avg) : '#5B6B82' },
                      { label: 'Séances totales', value: `${sessions.length}`, color: '#1E5BB8' },
                      {
                        label: 'Tendance',
                        value: trend !== null ? (trend > 0 ? `+${trend}` : `${trend}`) : '—',
                        color: trend !== null ? (trend > 0 ? '#197A4B' : trend < 0 ? '#A8261D' : '#5B6B82') : '#5B6B82',
                      },
                    ].map((stat) => (
                      <div key={stat.label} style={{
                        background: '#FFFFFF', border: '1.5px solid #D6DEEA',
                        borderRadius: 14, padding: '16px', textAlign: 'center',
                        boxShadow: '0 2px 4px rgba(14,27,44,0.06)',
                      }}>
                        <p style={{
                          fontSize: 32, fontWeight: 700, margin: '0 0 4px',
                          color: stat.color,
                          fontFamily: 'var(--font-mono), monospace',
                        }}>{stat.value}</p>
                        <p style={{ fontSize: 12, color: '#5B6B82', margin: 0 }}>{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Graphique */}
                  <div style={{
                    background: '#FFFFFF', border: '1.5px solid #D6DEEA',
                    borderRadius: 14, padding: '20px',
                    boxShadow: '0 2px 4px rgba(14,27,44,0.06)',
                  }}>
                    <p style={{ fontWeight: 700, fontSize: 14, color: '#0E1B2C', margin: '0 0 12px' }}>Progression du score global</p>
                    <LineChart sessions={sessions} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#5B6B82', marginTop: 8 }}>
                      <span>{new Date(sessions[sessions.length - 1].date).toLocaleDateString('fr-FR')}</span>
                      <span>{new Date(sessions[0].date).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>

                  {/* Historique */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <p style={{
                      fontFamily: 'var(--font-mono), monospace',
                      fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
                      color: '#5B6B82', fontWeight: 700, margin: 0,
                    }}>Historique des séances</p>

                    {sessions.map((s) => {
                      const st = DIFFICULTY_STYLE[s.difficulty] ?? { bg: '#EEF2F8', text: '#5B6B82' }
                      return (
                        <div key={s.id} style={{
                          background: '#FFFFFF', border: '1.5px solid #D6DEEA',
                          borderRadius: 14, padding: '16px 20px',
                          boxShadow: '0 2px 4px rgba(14,27,44,0.06)',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{
                                padding: '3px 10px', borderRadius: 999,
                                background: st.bg, color: st.text,
                                fontSize: 12, fontWeight: 700,
                              }}>
                                {DIFFICULTIES[s.difficulty as keyof typeof DIFFICULTIES]?.label ?? s.difficulty}
                              </span>
                              <span style={{ fontSize: 14, fontWeight: 600, color: '#0E1B2C' }}>{s.exerciseTitle}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                              <span style={{
                                fontSize: 28, fontWeight: 700,
                                color: SCORE_COLOR(s.scores.global),
                                fontFamily: 'var(--font-mono), monospace',
                              }}>
                                {s.scores.global}
                              </span>
                              <span style={{ fontSize: 12, color: '#5B6B82' }}>
                                {new Date(s.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                            <ScoreBar label="Fluidité" value={s.scores.fluidite} />
                            <ScoreBar label="Hésitations" value={s.scores.hesitations} />
                            <ScoreBar label="Répétitions" value={s.scores.repetitions} />
                            <ScoreBar label="Mots parasites" value={s.scores.mots_remplissage} />
                          </div>
                          {s.recommandations.length > 0 && (
                            <div style={{
                              marginTop: 12, background: '#E5EEFB',
                              borderRadius: 10, padding: '10px 14px',
                            }}>
                              <p style={{ margin: 0, fontSize: 13, color: '#103E85' }}>
                                💡 {s.recommandations[0]}
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
