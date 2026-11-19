/** Kratki zvukovi za tačan i netačan odgovor (bez audio datoteka, preko Web Audio API). */

type AudioContextConstructor = typeof AudioContext

let context: AudioContext | null = null

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor: AudioContextConstructor | undefined =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioContextConstructor }).webkitAudioContext
  if (!Ctor) return null
  try {
    context ??= new Ctor()
    if (context.state === 'suspended') void context.resume()
    return context
  } catch {
    return null
  }
}

function tone(freq: number, start: number, duration: number, type: OscillatorType = 'sine', volume = 0.12) {
  const ctx = audio()
  if (!ctx) return
  const t0 = ctx.currentTime + start
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  osc.connect(gain).connect(ctx.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.05)
}

export function playCorrect(): void {
  tone(784, 0, 0.18) // G5
  tone(1047, 0.1, 0.28) // C6
}

export function playWrong(): void {
  tone(220, 0, 0.3, 'triangle', 0.1)
}

export function playFinish(): void {
  ;[523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.3))
}
