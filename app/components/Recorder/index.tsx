'use client'

import { useState, useRef, useEffect } from 'react'

type RecorderState = 'idle' | 'recording' | 'processing'

type MicError =
  | { type: 'denied' }
  | { type: 'not_found' }
  | { type: 'in_use' }
  | { type: 'unknown'; message: string }

interface RecorderProps {
  onTranscription: (text: string) => void
  onAudioReady?: (blob: Blob) => void
  onError: (message: string) => void
  onStateChange?: (state: RecorderState) => void
}

function getMicError(err: unknown): MicError {
  if (!(err instanceof DOMException)) return { type: 'unknown', message: String(err) }
  if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') return { type: 'denied' }
  if (err.name === 'NotFoundError'   || err.name === 'DevicesNotFoundError')  return { type: 'not_found' }
  if (err.name === 'NotReadableError'|| err.name === 'TrackStartError')        return { type: 'in_use' }
  return { type: 'unknown', message: (err as DOMException).message }
}

function formatDuration(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

export default function Recorder({ onTranscription, onAudioReady, onError, onStateChange }: RecorderProps) {
  const [state, setState]         = useState<RecorderState>('idle')
  const [duration, setDuration]   = useState(0)
  const [micError, setMicError]   = useState<MicError | null>(null)
  const mediaRecorderRef          = useRef<MediaRecorder | null>(null)
  const chunksRef                 = useRef<Blob[]>([])
  const timerRef                  = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => { onStateChange?.(state) }, [state, onStateChange])

  const startRecording = async () => {
    setMicError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        if (blob.size < 1000) {
          setState('idle'); setDuration(0)
          onError('Enregistrement trop court. Parlez au moins 2 secondes.')
          return
        }
        onAudioReady?.(blob)
        await sendForTranscription(blob)
      }

      mediaRecorder.start(250)
      setState('recording'); setDuration(0)
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000)
    } catch (err) {
      setMicError(getMicError(err))
    }
  }

  const stopRecording = () => {
    if (duration < 2) {
      onError('Enregistrement trop court. Parlez au moins 2 secondes.')
      if (timerRef.current) clearInterval(timerRef.current)
      mediaRecorderRef.current?.stop(); setState('idle'); setDuration(0)
      return
    }
    if (timerRef.current) clearInterval(timerRef.current)
    mediaRecorderRef.current?.stop(); setState('processing')
  }

  const sendForTranscription = async (blob: Blob) => {
    const formData = new FormData()
    formData.append('audio', blob, 'recording.webm')
    try {
      const res  = await fetch('/api/transcribe', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur serveur')
      onTranscription(data.text)
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Erreur de transcription')
    } finally {
      setState('idle'); setDuration(0)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, width: '100%' }}>

      {/* ── Bouton d'enregistrement (140×140 px) ── */}
      <div style={{ position: 'relative', width: 200, height: 200, display: 'grid', placeItems: 'center' }}>

        {/* Halos pulsants pendant l'enregistrement — 3 couches décalées */}
        {state === 'recording' && (
          <>
            <div style={{
              position: 'absolute', width: 170, height: 170, borderRadius: '50%',
              background: '#DC4A4A', opacity: 0.30,
              animation: 'halo 1.8s ease-out infinite',
            }}/>
            <div style={{
              position: 'absolute', width: 170, height: 170, borderRadius: '50%',
              background: '#DC4A4A', opacity: 0.20,
              animation: 'halo 1.8s ease-out 0.6s infinite',
            }}/>
            <div style={{
              position: 'absolute', width: 170, height: 170, borderRadius: '50%',
              background: '#DC4A4A', opacity: 0.12,
              animation: 'halo 1.8s ease-out 1.2s infinite',
            }}/>
          </>
        )}

        <button
          onClick={state === 'recording' ? stopRecording : startRecording}
          disabled={state === 'processing'}
          aria-label={state === 'recording' ? "Arrêter l'enregistrement" : "Démarrer l'enregistrement"}
          style={{
            width: 140, height: 140, borderRadius: '50%',
            border: '6px solid #FFFFFF',
            background: state === 'recording' ? '#DC4A4A'
                       : state === 'processing' ? '#D6DEEA'
                       : micError              ? '#9FB0C6'
                       :                         '#1E5BB8',
            boxShadow: state === 'recording'
              ? '0 16px 40px rgba(168,38,29,0.40), 0 0 0 5px rgba(220,74,74,0.20)'
              : state === 'processing' ? '0 4px 12px rgba(14,27,44,0.08)'
              : '0 16px 40px rgba(30,91,184,0.35), 0 0 0 5px #E5EEFB',
            cursor: state === 'processing' ? 'not-allowed' : 'pointer',
            display: 'grid', placeItems: 'center',
            position: 'relative', zIndex: 2,
            transition: 'background 0.2s ease, box-shadow 0.2s ease',
          }}
        >
          {state === 'processing' ? (
            <svg style={{ width: 48, height: 48, color: '#9FB0C6' }} className="animate-spin" fill="none" viewBox="0 0 24 24">
              <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          ) : state === 'recording' ? (
            /* Carré stop */
            <div style={{ width: 44, height: 44, background: '#FFFFFF', borderRadius: 10 }}/>
          ) : (
            /* Icône micro */
            <svg width="52" height="52" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <rect x="11" y="4" width="10" height="14" rx="5" fill="#FFFFFF"/>
              <path d="M7 16a9 9 0 0 0 18 0" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <line x1="16" y1="25" x2="16" y2="29" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="12" y1="29" x2="20" y2="29" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          )}
        </button>
      </div>

      {/* ── Label d'état ── */}
      {!micError && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          {state === 'idle' && (
            <p style={{ fontSize: 17, color: '#324158', fontWeight: 600, margin: 0 }}>
              Appuyez pour enregistrer
            </p>
          )}
          {state === 'recording' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 10, height: 10, borderRadius: '50%', background: '#DC4A4A',
                  animation: 'blink 1.2s ease-in-out infinite',
                }}/>
                <p style={{ fontSize: 16, color: '#A8261D', fontWeight: 700, margin: 0 }}>
                  Enregistrement en cours…
                </p>
              </div>
              <p style={{
                fontSize: 42, fontWeight: 500, color: '#0E1B2C', margin: 0,
                fontFamily: 'var(--font-mono), JetBrains Mono, monospace',
                letterSpacing: '0.08em',
              }}>
                {formatDuration(duration)}
              </p>
            </>
          )}
          {state === 'processing' && (
            <p style={{ fontSize: 17, color: '#1E5BB8', fontWeight: 600, margin: 0 }}>
              Transcription en cours…
            </p>
          )}
        </div>
      )}

      {/* ── Visualiseur d'onde — 48 barres ── */}
      {state === 'recording' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, height: 56, width: '100%', maxWidth: 360 }}>
          {Array.from({ length: 48 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 3, borderRadius: 2, flexShrink: 0,
                background: `linear-gradient(180deg, #1E5BB8, #103E85)`,
                animation: `waveBar 0.55s ease-in-out ${(i % 12) * 0.046}s infinite alternate`,
                minHeight: 4,
              }}
            />
          ))}
        </div>
      )}

      {/* ── Erreur microphone ── */}
      {micError && <MicErrorCard error={micError} onRetry={startRecording} />}

      <style>{`
        @keyframes halo {
          0%   { transform: scale(1);    opacity: 0.6; }
          100% { transform: scale(2.0);  opacity: 0;   }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
        @keyframes waveBar {
          from { height: 4px;  }
          to   { height: 48px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .waveform-bar { animation: none !important; height: 10px !important; }
        }
      `}</style>
    </div>
  )
}

function MicErrorCard({ error, onRetry }: { error: MicError; onRetry: () => void }) {
  const configs = {
    denied:    { title: 'Accès au microphone refusé', icon: '🔒', steps: ["Cliquez sur l'icône 🔒 dans la barre d'adresse.", 'Choisissez "Autoriser" pour le microphone.', 'Rechargez la page, puis réessayez.'] },
    not_found: { title: 'Aucun microphone détecté',   icon: '🎙️', steps: ["Vérifiez qu'un microphone est branché.", 'Consultez les paramètres audio de votre système.', 'Réessayez après avoir connecté un micro.'] },
    in_use:    { title: 'Microphone occupé',          icon: '⚠️', steps: ['Une autre application utilise votre micro.', 'Fermez Zoom, Teams, ou toute app audio ouverte.', 'Puis réessayez.'] },
    unknown:   { title: 'Erreur microphone',          icon: '❌', steps: ['Vérifiez les permissions du navigateur.', 'Rechargez la page et réessayez.'] },
  }
  const cfg = configs[error.type]

  return (
    <div style={{
      width: '100%', maxWidth: 360,
      background: '#FBEFD9', border: '1.5px solid #A85A00',
      borderRadius: 14, padding: '16px 20px',
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 20 }}>{cfg.icon}</span>
        <p style={{ margin: 0, fontWeight: 700, color: '#5C3300', fontSize: 15 }}>{cfg.title}</p>
      </div>
      <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {cfg.steps.map((step, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: '#5C3300' }}>
            <span style={{
              flexShrink: 0, width: 20, height: 20, borderRadius: '50%',
              background: '#A85A00', color: '#FFF',
              display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700,
            }}>{i + 1}</span>
            {step}
          </li>
        ))}
      </ol>
      <button
        onClick={onRetry}
        style={{
          width: '100%', minHeight: 48, borderRadius: 12,
          background: '#A85A00', color: '#FFFFFF', border: 'none',
          fontWeight: 700, fontSize: 15, cursor: 'pointer',
          boxShadow: '0 3px 0 #7A3F00',
        }}
      >
        Réessayer
      </button>
    </div>
  )
}
