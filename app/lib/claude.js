import Anthropic from '@anthropic-ai/sdk'

const DIFFICULTY_INSTRUCTIONS = {
  debutant: `Niveau DÉBUTANT — critères souples :
BARÈME : 85-100 = aucun défaut | 70-84 = 1-2 défauts mineurs | 50-69 = hésitations notables | < 50 = nombreux blocages
- 2-3 "euh" par phrase acceptable. Recommandations courtes et encourageantes.`,

  elementaire: `Niveau ÉLÉMENTAIRE :
BARÈME : 80-100 = fluide | 65-79 = 1-2 hésitations par paragraphe | 50-64 = hésitations fréquentes | < 50 = nombreux défauts
- 1 "euh" toléré par phrase, au-delà pénalisé. Répétitions évidentes comptées.`,

  intermediaire: `Niveau INTERMÉDIAIRE — SOIS EXTRÊMEMENT SÉVÈRE ET RÉALISTE. LA MOYENNE D'UN LOCUTEUR ORDINAIRE EST 55/100.

CALIBRATION OBLIGATOIRE — compare la prestation à ces repères :
• 90-100 : présentateur TV professionnel. Zéro "euh", zéro hésitation, débit parfait. RARISSIME.
• 75-89 : très bon orateur entraîné. Maximum 1-2 imperfections sur TOUT le discours.
• 60-74 : locuteur correct mais perfectible. 3-5 défauts visibles.
• 45-59 : locuteur ordinaire. Hésitations régulières, quelques répétitions. C'EST LA NORMALE.
• 30-44 : locuteur qui peine. Hésitations fréquentes, rythme cassé, répétitions.
• < 30 : discours très haché, difficile à suivre.

RÈGLES DE PLAFONNEMENT ABSOLUES (non négociables) :
- Fluidité hésitante perceptible → score global plafonné à 70 MAXIMUM
- 2+ "euh" détectés → score global plafonné à 65 MAXIMUM
- 4+ "euh" détectés → score global plafonné à 55 MAXIMUM
- Répétitions de mots → score global plafonné à 60 MAXIMUM
- Rythme irrégulier ou pauses excessives → -10 points sur fluidité
- Mots de remplissage ("donc", "voilà", "du coup", "en fait", "genre") → -8 pts/occurrence

RAPPEL : un score de 95/100 signifie "présentateur professionnel parfait".
Un score de 75/100 signifie "très bon orateur entraîné".
Sois honnête : la plupart des gens se situent entre 40 et 65.`,

  avance: `Niveau AVANCÉ — critères très stricts :
BARÈME : 75-100 = excellent | 55-74 = correct | 35-54 = passable | < 35 = insuffisant
- La moindre hésitation plafonne le score global à 70. Répétition → plafonné à 60.
- Évalue précision articulatoire, liaisons, débit.`,

  expert: `Niveau EXPERT — critères de concours :
BARÈME : 85-100 = niveau professionnel absolu | 65-84 = très bon | 45-64 = correct | < 45 = insuffisant
- 1 seul "euh" → maximum 75 en global. 2 "euh" → maximum 60.
- Score 90+ réservé aux prestations dignes d'un comédien ou présentateur aguerri.
- Évalue débit, intonation, musicalité, précision sur mots complexes.`,
}

export async function analyzeTranscription(text, difficulty = 'intermediaire', exerciseText = null) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const difficultyInstruction = DIFFICULTY_INSTRUCTIONS[difficulty] || DIFFICULTY_INSTRUCTIONS.intermediaire

  const referenceBlock = exerciseText
    ? `\nTEXTE DE RÉFÉRENCE (ce que le patient devait lire) :\n"${exerciseText}"\n`
    : ''

  const message = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Tu es un orthophoniste expert. Analyse ce discours et retourne UNIQUEMENT un JSON valide (sans markdown, sans texte avant ou après).

${difficultyInstruction}
${referenceBlock}
DISCOURS TRANSCRIT :
"${text}"

STRUCTURE JSON ATTENDUE :
{
  "scores": {
    "global": <0-100>,
    "fluidite": <0-100>,
    "hesitations": <0-100>,
    "repetitions": <0-100>,
    "mots_remplissage": <0-100>
  },
  "defauts": [
    { "type": "hesitation", "count": <n>, "exemples": ["..."] },
    { "type": "repetition", "count": <n>, "exemples": ["..."] },
    { "type": "mot_remplissage", "count": <n>, "exemples": ["..."] },
    { "type": "begaiement", "count": <n>, "exemples": ["..."] }
  ],
  "recommandations": ["...", "..."],
  "points_positifs": ["...", "..."]
}

RÈGLES :
- Scores : 100 = parfait, 0 = très nombreux problèmes
- Hésitations : "euh", "hm", "um", "bah", "ben" ET pauses silencieuses anormales, débit haché, ruptures de rythme
- Mots de remplissage : "donc", "voilà", "du coup", "en fait", "genre", "quoi", "c'est-à-dire"
- Répétitions : mots ou groupes de mots répétés consécutivement
- Bégaiements : syllabes répétées ("je-je", "c'est c'est")
- COHÉRENCE OBLIGATOIRE entre les scores : si fluidité < 90, alors hésitations NE PEUT PAS être 100. Si fluidité < 80, hésitations ≤ 80. Les deux scores doivent refléter les mêmes problèmes.
- Le score global ne peut pas être supérieur à la moyenne de fluidité et hésitations.
- 2 à 3 recommandations adaptées au niveau ${difficulty}
- 1 à 2 points positifs même si le discours est imparfait`,
      },
    ],
  })

  const raw = message.content[0].text.trim()
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
  const analysis = JSON.parse(cleaned)
  return {
    analysis,
    usage: {
      input_tokens:  message.usage?.input_tokens  ?? 0,
      output_tokens: message.usage?.output_tokens ?? 0,
    },
  }
}
