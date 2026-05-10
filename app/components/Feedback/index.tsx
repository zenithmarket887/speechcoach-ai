interface Defaut {
  type: 'hesitation' | 'repetition' | 'mot_remplissage' | 'begaiement'
  count: number
  exemples: string[]
}

interface FeedbackProps {
  defauts: Defaut[]
  recommandations: string[]
  points_positifs: string[]
}

const DEFAUT_CONFIG: Record<string, { label: string; bg: string; border: string; text: string; badge: string }> = {
  hesitation:      { label: 'Hésitations',    bg: '#FBEFD9', border: '#A85A00', text: '#5C3300', badge: '#A85A00' },
  hesitations:     { label: 'Hésitations',    bg: '#FBEFD9', border: '#A85A00', text: '#5C3300', badge: '#A85A00' },
  repetition:      { label: 'Répétitions',    bg: '#F8E2D2', border: '#9A4A12', text: '#4A2006', badge: '#9A4A12' },
  repetitions:     { label: 'Répétitions',    bg: '#F8E2D2', border: '#9A4A12', text: '#4A2006', badge: '#9A4A12' },
  mot_remplissage: { label: 'Mots parasites', bg: '#EEF2F8', border: '#9FB0C6', text: '#324158', badge: '#5B6B82' },
  mots_remplissage:{ label: 'Mots parasites', bg: '#EEF2F8', border: '#9FB0C6', text: '#324158', badge: '#5B6B82' },
  begaiement:      { label: 'Bégaiements',    bg: '#F7E1DE', border: '#A8261D', text: '#5A0E08', badge: '#A8261D' },
  begaiements:     { label: 'Bégaiements',    bg: '#F7E1DE', border: '#A8261D', text: '#5A0E08', badge: '#A8261D' },
}

const FALLBACK = { label: 'Autre', bg: '#EEF2F8', border: '#9FB0C6', text: '#324158', badge: '#5B6B82' }

export default function Feedback({ defauts, recommandations, points_positifs }: FeedbackProps) {
  const defautsAvecProblemes = defauts.filter((d) => d.count > 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Points positifs ── */}
      {points_positifs.length > 0 && (
        <div style={{
          background: '#E2F1E8', border: '2px solid #197A4B',
          borderRadius: 14, padding: '16px 20px',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            marginBottom: 10, fontWeight: 700, color: '#0E3F26', fontSize: 15,
          }}>
            <span style={{
              width: 24, height: 24, borderRadius: 6,
              background: '#197A4B', color: '#FFF',
              display: 'grid', placeItems: 'center',
              fontSize: 13, fontWeight: 700, flexShrink: 0,
            }}>✓</span>
            Points positifs
          </div>
          <ul style={{ margin: 0, padding: '0 0 0 34px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {points_positifs.map((p, i) => (
              <li key={i} style={{ fontSize: 15, color: '#0E3F26', lineHeight: 1.6 }}>{p}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Défauts détectés ── */}
      {defautsAvecProblemes.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{
            margin: 0,
            fontFamily: 'var(--font-mono), JetBrains Mono, monospace',
            fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
            color: '#5B6B82', fontWeight: 700,
          }}>Défauts détectés</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {defautsAvecProblemes.map((d) => {
              const cfg = DEFAUT_CONFIG[d.type] ?? FALLBACK
              return (
                <div key={d.type} style={{
                  background: cfg.bg,
                  border: `1.5px solid ${cfg.border}`,
                  borderRadius: 12, padding: '14px 16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: cfg.text }}>
                      {cfg.label}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-mono), JetBrains Mono, monospace',
                      fontSize: 22, fontWeight: 700, color: '#0E1B2C',
                    }}>{d.count}</span>
                  </div>
                  {d.exemples.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {d.exemples.slice(0, 3).map((ex, i) => (
                        <span key={i} style={{
                          fontSize: 11, background: 'rgba(255,255,255,0.7)',
                          borderRadius: 6, padding: '2px 8px',
                          fontFamily: 'var(--font-mono), JetBrains Mono, monospace',
                          color: cfg.text,
                        }}>
                          {ex}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Recommandations ── */}
      {recommandations.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{
            margin: 0,
            fontFamily: 'var(--font-mono), JetBrains Mono, monospace',
            fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
            color: '#5B6B82', fontWeight: 700,
          }}>Recommandations</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recommandations.map((r, i) => (
              <div key={i} style={{
                background: '#E5EEFB', border: '1.5px solid rgba(30,91,184,0.25)',
                borderRadius: 12, padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <span style={{
                  width: 28, height: 28, borderRadius: 28, flexShrink: 0,
                  background: '#1E5BB8', color: '#FFF',
                  display: 'grid', placeItems: 'center',
                  fontSize: 13, fontWeight: 700,
                  fontFamily: 'var(--font-mono), monospace',
                }}>{i + 1}</span>
                <span style={{ color: '#103E85', fontSize: 15, fontWeight: 500, lineHeight: 1.5 }}>{r}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
