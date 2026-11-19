/**
 * Generatori matematičkih zadataka. Svaka vježba dobije nove brojeve,
 * pa dijete može vježbati koliko god želi.
 *
 * Oznake su kao u našim udžbenicima: množenje "·", dijeljenje ":", oduzimanje "−".
 * Konvencija množenja: 3 · 4 = 4 + 4 + 4 (tri puta po četiri).
 */
import { plural } from './plural'
import { pick, randInt, type Rng } from './random'
import type { ChoiceExercise, Exercise, Generator, InputExercise } from './types'

export const DEFAULT_GENERATED_COUNT = 20

export const MINUS = '−'
export const TIMES = '·'
export const DIVIDE = ':'

function numberTask(
  question: string,
  answer: number,
  speak: string,
  explanation: string,
  instruction = 'Izračunaj',
): InputExercise {
  return { type: 'input', instruction, question, answer: String(answer), speak, explanation }
}

function additionExplanation(a: number, b: number): string {
  const sum = a + b
  const plain = `${a} + ${b} = ${sum}.`
  if (sum > 100) return plain
  const big = Math.max(a, b)
  const small = Math.min(a, b)
  if (small >= 10) {
    const [ta, ua, tb, ub] = [a - (a % 10), a % 10, b - (b % 10), b % 10]
    if (ua === 0 && ub === 0) return plain
    return `Saberi desetice pa jedinice: ${ta} + ${tb} = ${ta + tb}, ${ua} + ${ub} = ${ua + ub}, pa je ${ta + tb} + ${ua + ub} = ${sum}.`
  }
  if (big >= 10 && big % 10 !== 0) {
    const tens = big - (big % 10)
    const units = big % 10
    return `${units} + ${small} = ${units + small}, pa je ${tens} + ${units + small} = ${sum}.`
  }
  return plain
}

function subtractionExplanation(a: number, b: number): string {
  const res = a - b
  const plain = `${a} ${MINUS} ${b} = ${res}.`
  if (a > 100) return plain
  if (b >= 10) {
    const tb = b - (b % 10)
    const ub = b % 10
    if (ub === 0) return plain
    const step = a - tb
    return `Oduzmi prvo desetice pa jedinice: ${a} ${MINUS} ${tb} = ${step}, pa je ${step} ${MINUS} ${ub} = ${res}.`
  }
  const ua = a % 10
  if (a >= 10 && ua !== 0 && b > ua) {
    const rest = b - ua
    return `${a} ${MINUS} ${ua} = ${a - ua}, pa je ${a - ua} ${MINUS} ${rest} = ${res}.`
  }
  return plain
}

function multiplicationExplanation(x: number, y: number): string {
  const p = x * y
  if (x >= 2 && x <= 5) {
    return `${x} ${TIMES} ${y} = ${Array.from({ length: x }, () => y).join(' + ')} = ${p}.`
  }
  return `${x} ${TIMES} ${y} = ${p}.`
}

const desetica = (n: number) => `${n} ${plural(n, 'desetica', 'desetice', 'desetica')}`
const jedinica = (n: number) => `${n} ${plural(n, 'jedinica', 'jedinice', 'jedinica')}`

function generateOne(gen: Generator, rng: Rng): Exercise {
  switch (gen.type) {
    case 'addition': {
      const sum = randInt(rng, 2, gen.max)
      const a = randInt(rng, 1, sum - 1)
      const b = sum - a
      return numberTask(`${a} + ${b} = ?`, sum, `Koliko je ${a} plus ${b}?`, additionExplanation(a, b))
    }
    case 'subtraction': {
      const a = randInt(rng, 2, gen.max)
      const b = randInt(rng, 1, a - 1)
      return numberTask(
        `${a} ${MINUS} ${b} = ?`,
        a - b,
        `Koliko je ${a} minus ${b}?`,
        subtractionExplanation(a, b),
      )
    }
    case 'missing-addend': {
      const c = randInt(rng, 3, gen.max)
      const a = randInt(rng, 1, c - 1)
      const x = c - a
      return numberTask(
        `${a} + ? = ${c}`,
        x,
        `Koliko treba dodati broju ${a} da dobiješ ${c}?`,
        `${c} ${MINUS} ${a} = ${x}, pa je ${a} + ${x} = ${c}.`,
        'Koji broj nedostaje?',
      )
    }
    case 'multiplication': {
      const t = pick(gen.tables, rng)
      const f = randInt(rng, 1, 10)
      const [x, y] = rng() < 0.5 ? [f, t] : [t, f]
      return numberTask(
        `${x} ${TIMES} ${y} = ?`,
        x * y,
        `Koliko je ${x} puta ${y}?`,
        multiplicationExplanation(x, y),
      )
    }
    case 'division': {
      const t = pick(gen.tables, rng)
      const q = randInt(rng, 1, 10)
      const p = t * q
      return numberTask(
        `${p} ${DIVIDE} ${t} = ?`,
        q,
        `Koliko je ${p} podijeljeno sa ${t}?`,
        `${p} ${DIVIDE} ${t} = ${q}, jer je ${q} ${TIMES} ${t} = ${p}.`,
      )
    }
    case 'compare': {
      const a = randInt(rng, 0, gen.max)
      let b = a
      if (rng() >= 0.2) {
        while (b === a) b = randInt(rng, 0, gen.max)
      }
      const answer = a < b ? '<' : a > b ? '>' : '='
      const explanation =
        a < b
          ? `${a} je manje od ${b}, pa pišemo ${a} < ${b}.`
          : a > b
            ? `${a} je veće od ${b}, pa pišemo ${a} > ${b}.`
            : `Brojevi su jednaki, pa pišemo ${a} = ${b}.`
      const task: ChoiceExercise = {
        type: 'choice',
        instruction: 'Koji znak nedostaje?',
        question: `${a} ? ${b}`,
        options: ['<', '=', '>'],
        answer,
        shuffle: false,
        speak: `Koji znak ide između brojeva ${a} i ${b}?`,
        explanation,
      }
      return task
    }
    case 'neighbors': {
      const n = randInt(rng, 1, gen.max - 1)
      if (rng() < 0.5) {
        return numberTask(
          `Koji broj je prethodnik broja ${n}?`,
          n - 1,
          `Koji broj je prethodnik broja ${n}?`,
          `Prethodnik dolazi neposredno prije broja: ${n - 1}, ${n}.`,
          'Upiši broj',
        )
      }
      return numberTask(
        `Koji broj je sljedbenik broja ${n}?`,
        n + 1,
        `Koji broj je sljedbenik broja ${n}?`,
        `Sljedbenik dolazi neposredno poslije broja: ${n}, ${n + 1}.`,
        'Upiši broj',
      )
    }
    case 'place-value': {
      const n = randInt(rng, 10, Math.min(gen.max, 99))
      const tens = Math.floor(n / 10)
      const units = n % 10
      const explanation = `${n} = ${tens * 10} + ${units}, to je ${desetica(tens)} i ${jedinica(units)}.`
      const variant = randInt(rng, 0, 2)
      if (variant === 0) {
        const q = `Koliko desetica ima broj ${n}?`
        return numberTask(q, tens, q, explanation, 'Upiši broj')
      }
      if (variant === 1) {
        const q = `Koliko jedinica ima broj ${n}?`
        return numberTask(q, units, q, explanation, 'Upiši broj')
      }
      const q = `Koji broj ima ${desetica(tens)} i ${jedinica(units)}?`
      return numberTask(q, n, q, explanation, 'Upiši broj')
    }
  }
}

/** Pravi zadane brojeve zadataka bez ponavljanja istog pitanja. */
export function generate(gen: Generator, rng: Rng): Exercise[] {
  const count = gen.count ?? DEFAULT_GENERATED_COUNT
  const out: Exercise[] = []
  const seen = new Set<string>()
  for (let attempts = 0; out.length < count && attempts < count * 30; attempts++) {
    const task = generateOne(gen, rng)
    const key = task.type === 'truefalse' ? task.statement : task.question
    if (seen.has(key)) continue
    seen.add(key)
    out.push(task)
  }
  return out
}
