/** Sastavljanje vježbe (sesije) i ocjenjivanje odgovora. */
import { acceptedAnswers, checkTextAnswer, type AnswerHint } from './answers'
import { generate } from './generators'
import { shuffle, type Rng } from './random'
import type { Exercise, Topic } from './types'

export interface SessionQuestion {
  /** Jedinstven ključ pitanja u ovoj vježbi. */
  key: string
  exercise: Exercise
  /** Redoslijed ponuđenih odgovora (za "choice"). */
  options?: string[]
  /** Izmiješane stavke (za "order"). */
  scrambled?: string[]
  /** Pitanje koje se ponavlja jer je prvi odgovor bio netačan. */
  retry?: boolean
}

/** Odgovor djeteta: tekst/odabrana opcija, tačno/netačno ili redoslijed (indeksi izmiješanih stavki). */
export type Answer = string | boolean | number[]

export interface Outcome {
  correct: boolean
  hint?: AnswerHint
  /** Tačan odgovor, spreman za prikaz. */
  correctText: string
}

export const DEFAULT_INSTRUCTIONS: Record<Exercise['type'], string> = {
  choice: 'Odaberi tačan odgovor',
  input: 'Upiši odgovor',
  truefalse: 'Da li je ovo tačno?',
  order: 'Dodiruj redom, jedno po jedno',
}

export function instructionFor(exercise: Exercise): string {
  return exercise.instruction ?? DEFAULT_INSTRUCTIONS[exercise.type]
}

/** Glavni tekst pitanja (kod "tačno/netačno" to je tvrdnja). */
export function promptFor(exercise: Exercise): string {
  return exercise.type === 'truefalse' ? exercise.statement : exercise.question
}

/** Svi zadaci teme: napisani + automatski generisani. */
export function buildPool(topic: Topic, rng: Rng): Exercise[] {
  const pool: Exercise[] = [...(topic.exercises ?? [])]
  for (const gen of topic.generators ?? []) pool.push(...generate(gen, rng))
  return pool
}

function scramble(items: readonly string[], rng: Rng): string[] {
  if (items.length < 2) return [...items]
  for (let i = 0; i < 10; i++) {
    const mixed = shuffle(items, rng)
    if (mixed.some((item, idx) => item !== items[idx])) return mixed
  }
  return [...items].reverse()
}

export function prepare(exercise: Exercise, key: string, rng: Rng): SessionQuestion {
  if (exercise.type === 'choice') {
    const options = exercise.shuffle === false ? [...exercise.options] : shuffle(exercise.options, rng)
    return { key, exercise, options }
  }
  if (exercise.type === 'order') return { key, exercise, scrambled: scramble(exercise.items, rng) }
  return { key, exercise }
}

/** Nasumično bira `size` zadataka iz teme (ili sve, ako ih ima manje). */
export function buildSession(topic: Topic, size: number, rng: Rng): SessionQuestion[] {
  const pool = shuffle(buildPool(topic, rng), rng).slice(0, Math.max(1, size))
  return pool.map((exercise, i) => prepare(exercise, `q${i}`, rng))
}

export function correctText(exercise: Exercise): string {
  switch (exercise.type) {
    case 'choice':
      return exercise.answer
    case 'input':
      return acceptedAnswers(exercise.answer)[0]
    case 'truefalse':
      return exercise.answer ? 'Tačno' : 'Netačno'
    case 'order':
      return exercise.items.join(', ')
  }
}

export function evaluate(question: SessionQuestion, answer: Answer): Outcome {
  const { exercise } = question
  const correctAnswer = correctText(exercise)
  switch (exercise.type) {
    case 'choice':
      return { correct: answer === exercise.answer, correctText: correctAnswer }
    case 'input': {
      const result = checkTextAnswer(String(answer), acceptedAnswers(exercise.answer), exercise.caseSensitive)
      return { ...result, correctText: correctAnswer }
    }
    case 'truefalse':
      return { correct: answer === exercise.answer, correctText: correctAnswer }
    case 'order': {
      const scrambled = question.scrambled ?? exercise.items
      const sequence = Array.isArray(answer) ? answer.map((i) => scrambled[i]) : []
      const correct =
        sequence.length === exercise.items.length && sequence.every((item, i) => item === exercise.items[i])
      return { correct, correctText: correctAnswer }
    }
  }
}

/** Da li je odgovor dovoljno popunjen da se može provjeriti. */
export function isAnswerReady(question: SessionQuestion, answer: Answer | null): boolean {
  if (answer === null) return false
  if (question.exercise.type === 'input') return String(answer).trim() !== ''
  if (question.exercise.type === 'order') {
    return Array.isArray(answer) && answer.length === question.exercise.items.length
  }
  return true
}

export type Stars = 0 | 1 | 2 | 3

export function starsFor(correct: number, total: number): Stars {
  if (total <= 0) return 0
  const ratio = correct / total
  if (ratio >= 0.9) return 3
  if (ratio >= 0.7) return 2
  if (ratio >= 0.5) return 1
  return 0
}

/** Natpis na pečatu, kao kod učiteljice. */
export function verdictFor(correct: number, total: number): string {
  const stars = starsFor(correct, total)
  if (stars === 3) return 'Odlično!'
  if (stars === 2) return 'Vrlo dobro!'
  if (stars === 1) return 'Dobro!'
  return 'Vježbaj još!'
}
