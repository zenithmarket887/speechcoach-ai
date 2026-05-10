export async function transcribeAudio(audioBuffer, mimeType = 'audio/webm') {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY is not set')

  const formData = new FormData()
  const blob = new Blob([audioBuffer], { type: mimeType })
  formData.append('file', blob, 'recording.webm')
  formData.append('model_id', 'scribe_v1')
  formData.append('language_code', 'fr')

  const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
    method: 'POST',
    headers: { 'xi-api-key': apiKey },
    body: formData,
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.detail?.message || `ElevenLabs error ${response.status}`)
  }

  return response.json()
}
