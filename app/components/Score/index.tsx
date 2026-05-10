interface ScoreData {
  global: number
  fluidite: number
  hesitations: number
  repetitions: number
  mots_remplissage: number
}

function scoreColor(v: number) {
  return v >= 75 ? '#197A4B' : v >= 50 ? '#A85A00' : '#A8261D'
}

function ScoreRing({
  value, label, size = 'sm',
}: { value: number; label: string; size?: 'lg' | 'sm' }) {
  const r      = size === 'lg' ? 54 : 34
  const stroke = size === 'lg' ? 9  : 6
  const dim    = (r + stroke) * 2
  const circ   = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ
  const color  = scoreColor(value)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ position: 'relative', width: dim, height: dim }}>
        <svg width={dim} height={dim} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={dim/2} cy={dim/2} r={r} fill="none" stroke="#EEF2F8" strokeWidth={stroke}/>
          <circle
            cx={dim/2} cy={dim/2} r={r} fill="none"
            stroke={color} strokeWidth={stroke}
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <span style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, color: '#0E1B2C',
          fontFamily: 'var(--font-mono), JetBrains Mono, monospace',
          fontSize: size === 'lg' ? 32 : 16,
        }}>
          {value}
        </span>
      </div>
      <span style={{ fontSize: 13, color: '#5B6B82', textAlign: 'center', lineHeight: 1.3, fontWeight: 600 }}>
        {label}
      </span>
    </div>
  )
}

export default function Score({ scores }: { scores: ScoreData }) {
  const badge =
    scores.global >= 80 ? { label: 'Excellent',           bg: '#E2F1E8', color: '#197A4B' }
  : scores.global >= 60 ? { label: 'Bon',                 bg: '#E5EEFB', color: '#103E85' }
  : scores.global >= 40 ? { label: 'À améliorer',         bg: '#FBEFD9', color: '#A85A00' }
  :                        { label: 'Beaucoup de travail', bg: '#F7E1DE', color: '#A8261D' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Score global */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <ScoreRing value={scores.global} label="Score global" size="lg" />
        <span style={{
          padding: '5px 14px', borderRadius: 999,
          background: badge.bg, color: badge.color,
          fontSize: 13, fontWeight: 700,
        }}>
          {badge.label}
        </span>
      </div>

      {/* Sous-scores */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12, paddingTop: 20,
        borderTop: '1px solid #D6DEEA',
      }}>
        <ScoreRing value={scores.fluidite}         label="Fluidité"      />
        <ScoreRing value={scores.hesitations}       label="Hésitations"   />
        <ScoreRing value={scores.repetitions}       label="Répétitions"   />
        <ScoreRing value={scores.mots_remplissage}  label="Mots parasites"/>
      </div>
    </div>
  )
}
