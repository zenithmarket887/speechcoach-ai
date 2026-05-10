import type { Difficulty } from './exercises'

export interface SpeechSession {
  id: string
  patientId: string
  patientName: string
  date: string
  difficulty: Difficulty
  exerciseId: string
  exerciseTitle: string
  scores: {
    global: number
    fluidite: number
    hesitations: number
    repetitions: number
    mots_remplissage: number
  }
  defauts: { type: string; count: number; exemples: string[] }[]
  recommandations: string[]
  points_positifs: string[]
  transcription: string
}

// Convertit une ligne Supabase (snake_case) vers SpeechSession (camelCase)
function fromRow(row: Record<string, unknown>): SpeechSession {
  return {
    id:             row.id as string,
    patientId:      row.patient_id as string,
    patientName:    row.patient_name as string,
    date:           row.date as string,
    difficulty:     row.difficulty as Difficulty,
    exerciseId:     row.exercise_id as string,
    exerciseTitle:  row.exercise_title as string,
    scores:         row.scores as SpeechSession['scores'],
    defauts:        row.defauts as SpeechSession['defauts'],
    recommandations: row.recommandations as string[],
    points_positifs: row.points_positifs as string[],
    transcription:  row.transcription as string,
  }
}

export async function saveSession(session: SpeechSession): Promise<void> {
  await fetch('/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(session),
  })
}

export async function getPatientSessions(patientId: string): Promise<SpeechSession[]> {
  const res = await fetch(`/api/sessions?patientId=${encodeURIComponent(patientId)}`)
  if (!res.ok) return []
  const data = await res.json()
  return Array.isArray(data) ? data.map(fromRow) : []
}

export async function getAllSessions(): Promise<SpeechSession[]> {
  const res = await fetch('/api/sessions/all')
  if (!res.ok) return []
  const data = await res.json()
  return Array.isArray(data) ? data.map(fromRow) : []
}

export function getPatientList(sessions: SpeechSession[]) {
  const map = new Map<string, { id: string; name: string; lastDate: string; count: number; lastScore: number }>()
  for (const s of sessions) {
    if (!map.has(s.patientId)) {
      map.set(s.patientId, { id: s.patientId, name: s.patientName, lastDate: s.date, count: 1, lastScore: s.scores.global })
    } else {
      const e = map.get(s.patientId)!
      e.count++
      if (s.date > e.lastDate) { e.lastDate = s.date; e.lastScore = s.scores.global }
    }
  }
  return Array.from(map.values()).sort((a, b) => b.lastDate.localeCompare(a.lastDate))
}
