/**
 * Čitanje zadataka naglas (Web Speech API). Radi bez interneta ako uređaj
 * ima instaliran glas. Traži bosanski, pa hrvatski, pa srpski glas.
 */

const PREFERRED_LANGS = ['bs', 'hr', 'sr']

export function speechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
}

function pickVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices()
  for (const lang of PREFERRED_LANGS) {
    const voice = voices.find((v) => v.lang.toLowerCase().replace('_', '-').startsWith(lang))
    if (voice) return voice
  }
  return null
}

/** Pretvara znakove u riječi da ih glas pravilno pročita. */
export function textForSpeech(text: string): string {
  return text
    .replace(/\*\*/g, '')
    .replace(/(\d)\s*·\s*(\d)/g, '$1 puta $2')
    .replace(/(\d)\s*:\s*(\d)/g, '$1 podijeljeno sa $2')
    .replace(/(\d)\s*[−-]\s*(\d)/g, '$1 minus $2')
    .replace(/\s*\+\s*/g, ' plus ')
    .replace(/\s*=\s*\?/g, ' je koliko?')
    .replace(/\s*=\s*/g, ' jednako ')
    .replace(/_{2,}/g, ' ... ')
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function speak(text: string): void {
  if (!speechSupported()) return
  const synth = window.speechSynthesis
  synth.cancel()
  const utterance = new SpeechSynthesisUtterance(textForSpeech(text))
  const voice = pickVoice()
  if (voice) {
    utterance.voice = voice
    utterance.lang = voice.lang
  } else {
    utterance.lang = 'bs-BA'
  }
  utterance.rate = 0.9
  synth.speak(utterance)
}

export function stopSpeaking(): void {
  if (speechSupported()) window.speechSynthesis.cancel()
}
