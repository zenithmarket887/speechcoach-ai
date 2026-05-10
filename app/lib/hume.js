const HUME_API = 'https://api.hume.ai/v0/batch'

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function analyzeExpressivity(audioBuffer, mimeType = 'audio/webm') {
  const apiKey = process.env.HUME_API_KEY
  if (!apiKey) throw new Error('HUME_API_KEY non configurée')

  // 1. Soumettre le job
  const formData = new FormData()
  const blob = new Blob([audioBuffer], { type: mimeType })
  formData.append('file', blob, 'recording.webm')
  formData.append('json', JSON.stringify({ models: { prosody: {} } }))

  const submitRes = await fetch(`${HUME_API}/jobs`, {
    method: 'POST',
    headers: { 'X-Hume-Api-Key': apiKey },
    body: formData,
  })

  if (!submitRes.ok) {
    const err = await submitRes.text()
    throw new Error(`Hume soumission échouée (${submitRes.status}): ${err}`)
  }

  const { job_id } = await submitRes.json()
  if (!job_id) throw new Error('Hume: pas de job_id dans la réponse')

  // 2. Attendre la complétion (max 60s, poll toutes les 3s)
  let attempts = 0
  while (attempts < 20) {
    await sleep(3000)
    const statusRes = await fetch(`${HUME_API}/jobs/${job_id}`, {
      headers: { 'X-Hume-Api-Key': apiKey },
    })
    const status = await statusRes.json()
    const jobStatus = status.state?.status
    if (jobStatus === 'COMPLETED') break
    if (jobStatus === 'FAILED') throw new Error('Analyse Hume échouée')
    attempts++
  }
  if (attempts >= 20) throw new Error('Timeout Hume AI (>60s)')

  // 3. Récupérer les prédictions
  const predRes = await fetch(`${HUME_API}/jobs/${job_id}/predictions`, {
    headers: { 'X-Hume-Api-Key': apiKey },
  })
  if (!predRes.ok) throw new Error(`Hume: erreur récupération prédictions (${predRes.status})`)

  const predictions = await predRes.json()
  return processHumePredictions(predictions)
}

function processHumePredictions(predictions) {
  // Log pour diagnostic (visible dans les logs serveur Next.js)
  console.log('[Hume] structure brute:', JSON.stringify(predictions).slice(0, 500))

  // Hume batch v0 — deux structures possibles selon la version
  // Structure A (v0 standard) : predictions[0].results.predictions[0].models.prosody
  // Structure B (v0 alt)      : predictions[0].models.prosody
  const prosodyA =
    predictions?.[0]?.results?.predictions?.[0]?.models?.prosody
  const prosodyB =
    predictions?.[0]?.models?.prosody
  const prosody = prosodyA ?? prosodyB

  const grouped = prosody?.grouped_predictions ?? []
  const segments = grouped.flatMap((g) => g.predictions ?? [])

  console.log('[Hume] segments trouvés:', segments.length)

  if (segments.length === 0) {
    return { score: 50, emotions: [], recommandations: ['Aucune donnée émotionnelle détectée.'] }
  }

  // Moyenner les émotions sur tous les segments
  const totals = {}
  for (const seg of segments) {
    for (const e of seg.emotions ?? []) {
      totals[e.name] = (totals[e.name] ?? 0) + e.score
    }
  }

  const n = segments.length
  const avg = Object.entries(totals)
    .map(([name, total]) => ({ name, score: total / n }))
    .sort((a, b) => b.score - a.score)

  const get = (name) => avg.find((e) => e.name === name)?.score ?? 0

  // Émotions clés pour l'expressivité
  const enthusiasm   = get('Enthusiasm')
  const interest     = get('Interest')
  const excitement   = get('Excitement')
  const joy          = get('Joy')
  const determination = get('Determination')
  const boredom      = get('Boredom')
  const tiredness    = get('Tiredness')
  const anxiety      = get('Anxiety')

  // Formule calibrée sur valeurs typiques Hume prosody (~48 émotions, somme ≈ 1)
  // Valeurs réelles observées : emotion dominante ≈ 0.05-0.15, baseline ≈ 0.02 par émotion
  // Un locuteur expressif : enthusiasm≈0.10, interest≈0.12  → score visé ~80
  // Un locuteur neutre   : enthusiasm≈0.04, interest≈0.08   → score visé ~55
  // Un locuteur monotone : boredom≈0.10, tiredness≈0.08     → score visé ~25
  const positive = enthusiasm * 1.0 + interest * 0.8 + excitement * 0.9 + joy * 0.7 + determination * 0.6
  const negative = boredom * 1.2 + tiredness * 0.9
  // baseline positive d'un locuteur neutre ≈ 0.18 → ancre à 55
  const raw = (positive - 0.18) * 250 + 55 - negative * 200
  // Plancher à 20 : même un discours très monotone montre un effort minimal
  const score = Math.max(20, Math.min(100, Math.round(raw)))

  // Traductions françaises
  const FR = {
    Enthusiasm: 'Enthousiasme',
    Determination: 'Détermination',
    Interest: 'Intérêt',
    Excitement: 'Excitation',
    Joy: 'Joie',
    Boredom: 'Ennui',
    Tiredness: 'Fatigue',
    Anxiety: 'Anxiété',
    Concentration: 'Concentration',
    Contemplation: 'Réflexion',
    Calmness: 'Calme',
    Admiration: 'Admiration',
    Satisfaction: 'Satisfaction',
    Pride: 'Fierté',
    Amusement: 'Amusement',
    Awkwardness: 'Gêne',
    Confusion: 'Confusion',
    Disappointment: 'Déception',
    Distress: 'Détresse',
    Doubt: 'Doute',
    Fear: 'Peur',
    Gratitude: 'Gratitude',
    Nostalgia: 'Nostalgie',
    Relief: 'Soulagement',
    Sadness: 'Tristesse',
    Triumph: 'Triomphe',
    Sympathy: 'Sympathie',
    'Surprise (positive)': 'Surprise +',
    'Surprise (negative)': 'Surprise -',
    'Empathic Pain': 'Empathie',
  }

  const topEmotions = avg.slice(0, 5).map((e) => ({
    name: FR[e.name] ?? e.name,
    nameEn: e.name,
    percent: Math.round(e.score * 100 * 10) / 10, // 1 décimale
  }))

  const recommandations = buildRecommandations({ enthusiasm, boredom, tiredness, anxiety, determination, joy, score })

  return { score, emotions: topEmotions, recommandations }
}

function buildRecommandations({ enthusiasm, boredom, tiredness, anxiety, determination, joy, score }) {
  const recs = []

  if (boredom > 0.06 || tiredness > 0.06) {
    recs.push('Variez davantage votre intonation : montez le ton sur les mots importants et descendez-le en fin de phrase pour éviter la monotonie.')
  }

  if (enthusiasm < 0.04 && joy < 0.03) {
    recs.push('Renforcez votre enthousiasme en souriant légèrement pendant que vous parlez — cela s\'entend directement dans la voix.')
  }

  if (anxiety > 0.08) {
    recs.push('Prenez 2-3 respirations abdominales profondes avant de commencer pour relâcher la tension vocale liée au trac.')
  }

  if (determination < 0.05) {
    recs.push('Adoptez un débit plus affirmé sur vos idées principales pour transmettre davantage de conviction et d\'autorité.')
  }

  if (score >= 70 && recs.length === 0) {
    recs.push('Votre expressivité est bonne ! Maintenez cette variété émotionnelle tout au long de vos interventions.')
  }

  if (recs.length < 2) {
    recs.push('Accentuez les mots-clés de chaque phrase pour amplifier l\'impact émotionnel de votre message.')
  }

  return recs.slice(0, 3)
}
