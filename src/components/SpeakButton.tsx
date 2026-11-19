import { useSettings } from '../lib/settings'
import { speak, speechSupported } from '../lib/speech'
import { Icon } from './Icon'

/** Dugme 🔊 koje čita tekst naglas (prikazuje se samo ako uređaj to podržava). */
export function SpeakButton({ text, label = 'Pročitaj naglas' }: { text: string; label?: string }) {
  const { speech } = useSettings()
  if (speech === 'off' || !speechSupported()) return null
  return (
    <button type="button" className="icon-btn speak-btn" onClick={() => speak(text)} aria-label={label} title={label}>
      <Icon name="speaker" />
    </button>
  )
}
