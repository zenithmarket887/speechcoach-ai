'use client'

import { useEffect, useState } from 'react'

type Token = { word: string; emphasis: boolean }

function parseTokens(text: string): Token[] {
  const re = /\*\*([^*]+)\*\*([.,;:!?»"']*)|(\S+)/g
  const tokens: Token[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    if (m[1] !== undefined) tokens.push({ word: m[1] + (m[2] || ''), emphasis: true })
    else if (m[3] !== undefined) tokens.push({ word: m[3], emphasis: false })
  }
  return tokens
}

interface RhythmTextProps {
  text: string
  wordDurationMs: number
  active: boolean
}

export default function RhythmText({ text, wordDurationMs, active }: RhythmTextProps) {
  const tokens = parseTokens(text)
  const [index, setIndex] = useState(-1)

  useEffect(() => {
    if (!active) { setIndex(-1); return }
    // Démarre au 1er mot quand on (re)devient actif, mais conserve la position
    // si seule la vitesse change en cours de lecture.
    setIndex((i) => (i < 0 ? 0 : i))
    const id = setInterval(() => {
      setIndex((i) => {
        if (i + 1 >= tokens.length) { clearInterval(id); return i }
        return i + 1
      })
    }, wordDurationMs)
    return () => clearInterval(id)
  }, [active, wordDurationMs, tokens.length])

  return (
    <p style={{ margin: 0, fontSize: 18, lineHeight: 1.9, color: '#0E1B2C', fontWeight: 500 }}>
      {tokens.map((t, i) => {
        const isActive = active && i === index
        const isPast = active && i < index

        const color = isActive
          ? (t.emphasis ? '#7A4E00' : '#0E1B2C')
          : isPast
            ? '#9AA8BD'
            : (t.emphasis ? '#C77700' : '#0E1B2C')

        const bg = isActive
          ? (t.emphasis ? '#FFD93D' : '#FFF3B0')
          : 'transparent'

        return (
          <span
            key={i}
            style={{
              background: bg,
              color,
              fontWeight: t.emphasis ? 700 : 500,
              padding: '2px 4px',
              borderRadius: 5,
              transition: 'background 0.18s ease, color 0.18s ease',
              boxShadow: isActive ? '0 1px 0 rgba(0,0,0,0.04)' : 'none',
            }}
          >
            {t.word}
            {i < tokens.length - 1 ? ' ' : ''}
          </span>
        )
      })}
    </p>
  )
}
