/**
 * Čitanje zadataka naglas (Web Speech API). Radi bez interneta ako uređaj
 * ima instaliran glas. Traži bosanski, pa hrvatski, pa srpski glas.
 */

/** Redoslijed jezika: bosanski, hrvatski, srpski (dvoslovne i troslovne oznake, npr. "hr-HR", "hrv_HRV"). */
const PREFERRED_LANGS: string[][] = [
  ['bs', 'bos'],
  ['hr', 'hrv'],
  ['sr', 'srp'],
]
/** Neki uređaji glas označe samo imenom, bez tačne oznake jezika. */
const NAME_HINTS = [/bosn/i, /croat|hrvat/i, /serbi|srps/i]
/** Kad nema našeg glasa među ponuđenima, tražimo hrvatski: najčešće je instaliran na mobitelima. */
const FALLBACK_LANG = 'hr-HR'

export function speechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
}

type VoiceLike = Pick<SpeechSynthesisVoice, 'lang' | 'name' | 'localService'>

const langCode = (lang: string) => lang.toLowerCase().replace('_', '-').split('-')[0]

/** Bira najbolji glas: prvo po jeziku, pa po imenu; glas na uređaju ima prednost (radi bez interneta). */
export function chooseVoice<V extends VoiceLike>(voices: V[]): V | null {
  for (let i = 0; i < PREFERRED_LANGS.length; i++) {
    const matches = voices.filter((v) => PREFERRED_LANGS[i].includes(langCode(v.lang)) || NAME_HINTS[i].test(v.name))
    if (matches.length > 0) return matches.find((v) => v.localService) ?? matches[0]
  }
  return null
}

/** Mobiteli učitaju listu glasova tek malo kasnije, pa je pratimo kroz "voiceschanged". */
let voices: SpeechSynthesisVoice[] = []
const listeners = new Set<() => void>()

function refreshVoices() {
  voices = window.speechSynthesis.getVoices()
  listeners.forEach((l) => l())
}

if (speechSupported()) {
  refreshVoices()
  window.speechSynthesis.addEventListener?.('voiceschanged', refreshVoices)
}

/** Glas koji će se koristiti (ili null ako na uređaju nema bosanskog, hrvatskog ni srpskog glasa). */
export function currentVoice(): SpeechSynthesisVoice | null {
  if (!speechSupported()) return null
  // Bez obavještavanja slušalaca: ovo se poziva i pri iscrtavanju, pa ne smije izazvati novo iscrtavanje.
  if (voices.length === 0) voices = window.speechSynthesis.getVoices()
  return chooseVoice(voices)
}

/** Javlja kad se lista glasova promijeni (za prikaz u postavkama). */
export function onVoicesChanged(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
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
  const voice = currentVoice()
  if (voice) {
    utterance.voice = voice
    utterance.lang = voice.lang
  } else {
    utterance.lang = FALLBACK_LANG
  }
  utterance.rate = 0.9
  synth.speak(utterance)
}

export function stopSpeaking(): void {
  if (speechSupported()) window.speechSynthesis.cancel()
}
