'use client'

interface Emotion { name: string; nameEn: string; percent: number }

interface ExpressivityData {
  score: number
  emotions: Emotion[]
  recommandations: string[]
}

const EMOTION_COLORS: Record<string, string> = {
  Enthousiasme: '#1E5BB8',
  Détermination: '#103E85',
  Intérêt:       '#197A4B',
  Excitation:    '#A85A00',
  Joie:          '#D08A2C',
  Ennui:         '#9FB0C6',
  Fatigue:       '#9FB0C6',
  Anxiété:       '#A8261D',
  Concentration: '#324158',
  Réflexion:     '#5B6B82',
  Calme:         '#3DB1D9',
  Admiration:    '#E07AAB',
  Satisfaction:  '#197A4B',
  Fierté:        '#A85A00',
  Triomphe:      '#9A4A12',
  Amusement:     '#D08A2C',
}

function getEmotionColor(name: string) { return EMOTION_COLORS[name] ?? '#9FB0C6' }

function ScoreRing({ value }: { value: number }) {
  const r = 50; const stroke = 9
  const dim = (r + stroke) * 2
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ
  const color = value >= 75 ? '#197A4B' : value >= 50 ? '#A85A00' : '#A8261D'

  return (
    <div style={{ position: 'relative', width: dim, height: dim }}>
      <svg width={dim} height={dim} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={dim/2} cy={dim/2} r={r} fill="none" stroke="#EEF2F8" strokeWidth={stroke}/>
        <circle cx={dim/2} cy={dim/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}/>
      </svg>
      <span style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: 28, color: '#0E1B2C',
        fontFamily: 'var(--font-mono), JetBrains Mono, monospace',
      }}>{value}</span>
    </div>
  )
}

export default function ExpressivityScore({ data }: { data: ExpressivityData }) {
  const { score, emotions, recommandations } = data

  const badge =
    score >= 80 ? { label: 'Très expressif', bg: '#E5EEFB', color: '#103E85' }
  : score >= 60 ? { label: 'Expressif',      bg: '#E2F1E8', color: '#197A4B' }
  : score >= 40 ? { label: 'Peu expressif',  bg: '#FBEFD9', color: '#A85A00' }
  :               { label: 'À développer',   bg: '#F7E1DE', color: '#A8261D' }

  const maxPct = emotions[0]?.percent ?? 1

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Titre */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 4, height: 22, background: '#7B5CD9', borderRadius: 2 }}/>
        <h3 style={{ margin: 0, fontWeight: 700, fontSize: 18, color: '#0E1B2C' }}>Analyse expressive</h3>
        <span style={{ fontSize: 12, color: '#5B6B82', fontWeight: 600, fontFamily: 'var(--font-mono), monospace' }}>
          via Hume AI
        </span>
      </div>

      {/* Score */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <ScoreRing value={score} />
        <span style={{ fontSize: 14, color: '#5B6B82', fontWeight: 600 }}>Expressivité</span>
        <span style={{ padding: '5px 14px', borderRadius: 999, background: badge.bg, color: badge.color, fontSize: 13, fontWeight: 700 }}>
          {badge.label}
        </span>
      </div>

      {/* Émotions */}
      {emotions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 16, borderTop: '1px solid #D6DEEA' }}>
          <p style={{ margin: 0, fontFamily: 'var(--font-mono), monospace', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#5B6B82', fontWeight: 700 }}>
            Émotions dominantes
          </p>
          {emotions.map((e) => (
            <div key={e.nameEn}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <span style={{ fontSize: 15, color: '#0E1B2C', fontWeight: 600 }}>{e.name}</span>
                <span style={{ fontSize: 13, color: '#5B6B82', fontWeight: 600, fontFamily: 'var(--font-mono), monospace' }}>
                  {e.percent.toFixed(1)} %
                </span>
              </div>
              <div style={{ height: 6, background: '#EEF2F8', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 3, background: getEmotionColor(e.name),
                  width: `${Math.round((e.percent / maxPct) * 100)}%`,
                  transition: 'width 0.8s ease',
                }}/>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recommandations expressivité */}
      {recommandations.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ margin: 0, fontFamily: 'var(--font-mono), monospace', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#5B6B82', fontWeight: 700 }}>
            Recommandations expressivité
          </p>
          {recommandations.map((rec, i) => (
            <div key={i} style={{
              background: '#F1ECFA', border: '1.5px solid #C8B8EC',
              borderRadius: 12, padding: '12px 16px',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <span style={{
                width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                background: '#7B5CD9', color: '#FFF',
                display: 'grid', placeItems: 'center',
                fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono), monospace',
              }}>{i + 1}</span>
              <p style={{ margin: 0, fontSize: 14, color: '#3D2A78', fontWeight: 500, lineHeight: 1.5 }}>{rec}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
