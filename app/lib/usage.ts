import { supabase } from './supabase'

// Tarifs publics (USD) — vérifier sur les sites officiels et ajuster si besoin
// https://www.anthropic.com/pricing  ·  https://elevenlabs.io/pricing  ·  https://hume.ai/pricing
export const PRICING = {
  claude_haiku: {
    input_per_million:  1.0,
    output_per_million: 5.0,
  },
  elevenlabs_scribe: {
    per_minute: 0.40 / 60,
  },
  hume_prosody: {
    per_minute: 0.0276,
  },
} as const

// Estimation grossière de la durée audio à partir de la taille du buffer.
// Hypothèse : WebM/Opus ~ 32 kbps ≈ 4000 octets/sec.
export function estimateAudioSeconds(bufferBytes: number): number {
  return Math.max(1, Math.round(bufferBytes / 4000))
}

export type UsageEntry = {
  timestamp: string
  provider: 'claude' | 'elevenlabs' | 'hume'
  detail: Record<string, number | string>
  cost_usd: number
}

export async function recordUsage(entry: Omit<UsageEntry, 'timestamp'>): Promise<void> {
  const { error } = await supabase.from('api_usage').insert({
    provider: entry.provider,
    cost_usd: entry.cost_usd,
    detail: entry.detail,
  })
  if (error) console.error('[usage] insert error:', error.message)
}

export function costClaude(inputTokens: number, outputTokens: number): number {
  return (
    (inputTokens  * PRICING.claude_haiku.input_per_million  +
     outputTokens * PRICING.claude_haiku.output_per_million) / 1_000_000
  )
}

export function costElevenLabs(seconds: number): number {
  return (seconds / 60) * PRICING.elevenlabs_scribe.per_minute
}

export function costHume(seconds: number): number {
  return (seconds / 60) * PRICING.hume_prosody.per_minute
}

export type UsageSummary = {
  total_usd: number
  session_count: number
  by_provider: { claude: number; elevenlabs: number; hume: number }
  last_entries: UsageEntry[]
}

export async function getUsageSummary(): Promise<UsageSummary> {
  const { data, error } = await supabase.from('api_usage').select('*').range(0, 9999)

  if (error || !data) {
    return { total_usd: 0, session_count: 0, by_provider: { claude: 0, elevenlabs: 0, hume: 0 }, last_entries: [] }
  }

  const sorted = [...data].sort((a, b) =>
    new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime()
  )

  const by_provider = { claude: 0, elevenlabs: 0, hume: 0 }
  let total = 0
  for (const row of sorted) {
    const cost = Number(row.cost_usd)
    total += cost
    if (row.provider in by_provider) {
      by_provider[row.provider as keyof typeof by_provider] += cost
    }
  }
  const session_count = sorted.filter((r) => r.provider === 'claude').length

  const last_entries: UsageEntry[] = sorted.slice(0, 10).map((r) => ({
    timestamp: r.created_at as string,
    provider: r.provider as UsageEntry['provider'],
    detail: r.detail as Record<string, number | string>,
    cost_usd: Number(r.cost_usd),
  }))

  return { total_usd: total, session_count, by_provider, last_entries }
}
