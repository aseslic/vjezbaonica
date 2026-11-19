/** Napredak djeteta: zvjezdice po temama, broj riješenih zadataka i niz dana zaredom. */
import { starsFor, type Stars } from './session'
import { createStore, isRecord } from './store'

export interface TopicProgress {
  bestStars: Stars
  bestCorrect: number
  bestTotal: number
  plays: number
  /** Datum zadnje vježbe (GGGG-MM-DD). */
  lastPlayed: string
  /** Tačno vrijeme zadnje vježbe (ms), za "Nastavi gdje si stao". */
  lastPlayedAt: number
}

export interface ProgressData {
  version: 1
  topics: Record<string, TopicProgress>
  totalAnswered: number
  totalCorrect: number
  /** Broj dana zaredom s barem jednom vježbom. */
  streak: number
  lastDay: string | null
}

export function topicKey(grade: number, subjectId: string, topicId: string): string {
  return `${grade}/${subjectId}/${topicId}`
}

export function emptyProgress(): ProgressData {
  return { version: 1, topics: {}, totalAnswered: 0, totalCorrect: 0, streak: 0, lastDay: null }
}

/** Lokalni datum u obliku GGGG-MM-DD. */
export function dayString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Današnji lokalni datum (GGGG-MM-DD). */
export function todayString(): string {
  return dayString(new Date())
}

export function previousDay(day: string): string {
  const [y, m, d] = day.split('-').map(Number)
  return dayString(new Date(y, m - 1, d - 1))
}

/** Niz dana koji se prikazuje: ako se juče ili danas nije vježbalo, niz je prekinut. */
export function currentStreak(data: ProgressData, today: string): number {
  if (data.lastDay === today || data.lastDay === previousDay(today)) return data.streak
  return 0
}

export function recordSession(
  data: ProgressData,
  key: string,
  correct: number,
  total: number,
  now: Date,
): ProgressData {
  const today = dayString(now)
  const stars = starsFor(correct, total)
  const prev = data.topics[key]
  const better =
    !prev ||
    stars > prev.bestStars ||
    (stars === prev.bestStars && correct / Math.max(1, total) > prev.bestCorrect / Math.max(1, prev.bestTotal))
  const topic: TopicProgress = {
    bestStars: better ? stars : prev.bestStars,
    bestCorrect: better ? correct : prev.bestCorrect,
    bestTotal: better ? total : prev.bestTotal,
    plays: (prev?.plays ?? 0) + 1,
    lastPlayed: today,
    lastPlayedAt: now.getTime(),
  }
  let streak = 1
  if (data.lastDay === today) streak = Math.max(1, data.streak)
  else if (data.lastDay === previousDay(today)) streak = data.streak + 1
  return {
    ...data,
    topics: { ...data.topics, [key]: topic },
    totalAnswered: data.totalAnswered + total,
    totalCorrect: data.totalCorrect + correct,
    streak,
    lastDay: today,
  }
}

/** Zadnja vježbana tema (ključ), za dugme "Nastavi". */
export function lastPlayedKey(data: ProgressData): string | null {
  let best: string | null = null
  let bestAt = -1
  for (const [key, topic] of Object.entries(data.topics)) {
    if (topic.lastPlayedAt > bestAt) {
      best = key
      bestAt = topic.lastPlayedAt
    }
  }
  return best
}

const toNumber = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : 0)

export function sanitizeProgress(raw: unknown): ProgressData {
  if (!isRecord(raw) || raw.version !== 1 || !isRecord(raw.topics)) return emptyProgress()
  const topics: Record<string, TopicProgress> = {}
  for (const [key, value] of Object.entries(raw.topics)) {
    if (!isRecord(value)) continue
    const bestStars = toNumber(value.bestStars)
    topics[key] = {
      bestStars: (bestStars > 3 ? 3 : Math.floor(bestStars)) as Stars,
      bestCorrect: toNumber(value.bestCorrect),
      bestTotal: toNumber(value.bestTotal),
      plays: toNumber(value.plays),
      lastPlayed: typeof value.lastPlayed === 'string' ? value.lastPlayed : '',
      lastPlayedAt: toNumber(value.lastPlayedAt),
    }
  }
  return {
    version: 1,
    topics,
    totalAnswered: toNumber(raw.totalAnswered),
    totalCorrect: toNumber(raw.totalCorrect),
    streak: toNumber(raw.streak),
    lastDay: typeof raw.lastDay === 'string' ? raw.lastDay : null,
  }
}

export const progressStore = createStore<ProgressData>('vjezbaonica:napredak:v1', sanitizeProgress)

export const useProgress = progressStore.use

export function saveSessionResult(key: string, correct: number, total: number): void {
  progressStore.set((prev) => recordSession(prev, key, correct, total, new Date()))
}

export function resetProgress(): void {
  progressStore.set(emptyProgress())
}
