import { createStore, isRecord } from './store'

export type SpeechMode = 'off' | 'button' | 'auto'

export interface Settings {
  /** Razred koji se prikazuje na početnoj stranici. */
  grade: number | null
  /** Broj zadataka u jednoj vježbi. */
  sessionSize: number
  sounds: boolean
  /** Čitanje zadataka naglas: isključeno, na dugme 🔊 ili automatski. */
  speech: SpeechMode
}

export const SESSION_SIZES = [5, 10, 15] as const

export const DEFAULT_SETTINGS: Settings = {
  grade: null,
  sessionSize: 10,
  sounds: true,
  speech: 'button',
}

export function sanitizeSettings(raw: unknown): Settings {
  if (!isRecord(raw)) return { ...DEFAULT_SETTINGS }
  const grade = typeof raw.grade === 'number' && Number.isInteger(raw.grade) ? raw.grade : null
  const sessionSize = SESSION_SIZES.includes(raw.sessionSize as (typeof SESSION_SIZES)[number])
    ? (raw.sessionSize as number)
    : DEFAULT_SETTINGS.sessionSize
  const sounds = typeof raw.sounds === 'boolean' ? raw.sounds : DEFAULT_SETTINGS.sounds
  const speech = raw.speech === 'off' || raw.speech === 'button' || raw.speech === 'auto' ? raw.speech : 'button'
  return { grade, sessionSize, sounds, speech }
}

export const settingsStore = createStore<Settings>('vjezbaonica:postavke:v1', sanitizeSettings)

export const useSettings = settingsStore.use

export function updateSettings(patch: Partial<Settings>): void {
  settingsStore.set((prev) => ({ ...prev, ...patch }))
}
