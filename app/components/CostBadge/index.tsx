'use client'

import { useEffect, useState } from 'react'

type Summary = {
  total_usd: number
  session_count: number
  by_provider: { claude: number; elevenlabs: number; hume: number }
}

export default function CostBadge() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [open, setOpen] = useState(false)

  const refresh = async () => {
    try {
      const r = await fetch('/api/usage', { cache: 'no-store' })
      if (!r.ok) return
      setSummary(await r.json())
    } catch {
      /* silent */
    }
  }

  useEffect(() => {
    refresh()
    const handler = () => refresh()
    window.addEventListener('usage-updated', handler)
    return () => window.removeEventListener('usage-updated', handler)
  }, [])

  if (!summary) return null

  const fmt = (n: number) => `$${n.toFixed(3)}`

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Coût des séances"
        title="Coût cumulé"
        style={{
          background: '#E5EEFB', border: '1.5px solid #9FB0C6',
          borderRadius: 8, padding: '5px 10px',
          color: '#103E85', fontSize: 13, fontWeight: 700,
          cursor: 'pointer', minHeight: 32,
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontFamily: 'var(--font-mono), JetBrains Mono, monospace',
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 1 0 0 7h5a3.5 3.5 0 1 1 0 7H6" stroke="#1E5BB8" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
        {fmt(summary.total_usd)}
      </button>

      {open && (
        <div
          role="dialog"
          style={{
            position: 'absolute', top: '110%', right: 0, zIndex: 30,
            background: '#FFFFFF', border: '1.5px solid #D6DEEA',
            borderRadius: 14, padding: 14, minWidth: 240,
            boxShadow: '0 6px 18px rgba(14,27,44,0.10)',
            fontFamily: 'var(--font-atkinson), sans-serif',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: '#5B6B82', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            Coût cumulé
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#0E1B2C', marginBottom: 4, fontFamily: 'var(--font-mono), JetBrains Mono, monospace' }}>
            {fmt(summary.total_usd)}
          </div>
          <div style={{ fontSize: 12, color: '#5B6B82', marginBottom: 12 }}>
            {summary.session_count} séance{summary.session_count > 1 ? 's' : ''}
            {summary.session_count > 0 && ` · ${fmt(summary.total_usd / summary.session_count)} / séance`}
          </div>
          <div style={{ borderTop: '1px solid #EEF2F8', paddingTop: 10, display: 'grid', gap: 6 }}>
            <Row label="Claude (analyse)" value={fmt(summary.by_provider.claude)} />
            <Row label="ElevenLabs (transcription)" value={fmt(summary.by_provider.elevenlabs)} />
            <Row label="Hume (expressivité)" value={fmt(summary.by_provider.hume)} />
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
      <span style={{ color: '#324158' }}>{label}</span>
      <span style={{ color: '#0E1B2C', fontWeight: 700, fontFamily: 'var(--font-mono), JetBrains Mono, monospace' }}>{value}</span>
    </div>
  )
}
