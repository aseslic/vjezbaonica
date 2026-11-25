/**
 * Generatori matematičkih zadataka. Svaka vježba dobije nove brojeve,
 * pa dijete može vježbati koliko god želi.
 *
 * Oznake su kao u našim udžbenicima: množenje "·", dijeljenje ":", oduzimanje "−".
 * Konvencija množenja: 3 · 4 = 4 + 4 + 4 (tri puta po četiri).
 */
import { plural } from './plural'
import { pick, randInt, type Rng } from './random'
import type { ChoiceExercise, EquationOp, Exercise, Generator, InputExercise, UnitGroup } from './types'

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
const stotica = (n: number) => `${n} ${plural(n, 'stotica', 'stotice', 'stotica')}`
const hiljada = (n: number) => `${n} ${plural(n, 'hiljada', 'hiljade', 'hiljada')}`

/** Mjesne vrijednosti od desna: jedinice, desetice, stotice, hiljade (u genitivu množine). */
const PLACES = ['jedinica', 'desetica', 'stotica', 'hiljada']
const PLACE_COUNT = [jedinica, desetica, stotica, hiljada]

/** 4357 → [4000, 300, 50, 7] (bez nula). */
export function expandedForm(n: number): number[] {
  const digits = String(n).split('').map(Number)
  return digits.map((d, i) => d * 10 ** (digits.length - 1 - i)).filter((part) => part > 0)
}

const DEFAULT_DIGITS = [2, 3, 4, 5, 6, 7, 8, 9]

const ROUNDING_NAMES: Record<number, string> = { 10: 'desetice', 100: 'stotice', 1000: 'hiljade' }

/** Parovi jedinica [veća, manja, koliko manjih ima u jednoj većoj]. */
export const UNIT_PAIRS: Record<UnitGroup, Array<[string, string, number]>> = {
  length: [
    ['km', 'm', 1000],
    ['hm', 'm', 100],
    ['dam', 'm', 10],
    ['m', 'dm', 10],
    ['m', 'cm', 100],
    ['dm', 'cm', 10],
    ['cm', 'mm', 10],
  ],
  mass: [
    ['t', 'kg', 1000],
    ['kg', 'dag', 100],
    ['kg', 'g', 1000],
    ['dag', 'g', 10],
    ['g', 'dg', 10],
    ['g', 'cg', 100],
    ['g', 'mg', 1000],
  ],
  volume: [
    ['kl', 'l', 1000],
    ['hl', 'l', 100],
    ['dal', 'l', 10],
    ['l', 'dl', 10],
    ['l', 'cl', 100],
    ['l', 'ml', 1000],
  ],
}

/** Nazivi jedinica: [1 metar, 2 metra, 5 metara]. */
const UNIT_NAMES: Record<string, [string, string, string]> = {
  km: ['kilometar', 'kilometra', 'kilometara'],
  hm: ['hektometar', 'hektometra', 'hektometara'],
  dam: ['dekametar', 'dekametra', 'dekametara'],
  m: ['metar', 'metra', 'metara'],
  dm: ['decimetar', 'decimetra', 'decimetara'],
  cm: ['centimetar', 'centimetra', 'centimetara'],
  mm: ['milimetar', 'milimetra', 'milimetara'],
  t: ['tona', 'tone', 'tona'],
  kg: ['kilogram', 'kilograma', 'kilograma'],
  dag: ['dekagram', 'dekagrama', 'dekagrama'],
  g: ['gram', 'grama', 'grama'],
  dg: ['decigram', 'decigrama', 'decigrama'],
  cg: ['centigram', 'centigrama', 'centigrama'],
  mg: ['miligram', 'miligrama', 'miligrama'],
  kl: ['kilolitar', 'kilolitra', 'kilolitara'],
  hl: ['hektolitar', 'hektolitra', 'hektolitara'],
  dal: ['dekalitar', 'dekalitra', 'dekalitara'],
  l: ['litar', 'litra', 'litara'],
  dl: ['decilitar', 'decilitra', 'decilitara'],
  cl: ['centilitar', 'centilitra', 'centilitara'],
  ml: ['mililitar', 'mililitra', 'mililitara'],
}

const unitName = (n: number, unit: string) => `${n} ${plural(n, ...UNIT_NAMES[unit])}`

const ROMAN: Array<[number, string]> = [
  [1000, 'M'],
  [900, 'CM'],
  [500, 'D'],
  [400, 'CD'],
  [100, 'C'],
  [90, 'XC'],
  [50, 'L'],
  [40, 'XL'],
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
]

/** Rastav broja na dijelove za rimske cifre: 94 → [[90, 'XC'], [4, 'IV']]. */
function romanParts(n: number): Array<[number, string]> {
  const parts: Array<[number, string]> = []
  let rest = n
  for (const [value, letters] of ROMAN) {
    while (rest >= value) {
      parts.push([value, letters])
      rest -= value
    }
  }
  return parts
}

/** 14 → "XIV" */
export function toRoman(n: number): string {
  return romanParts(n)
    .map(([, letters]) => letters)
    .join('')
}

/** Ima li sabiranje prelaz preko desetice (jedinice daju 10 ili više)? */
const additionCarries = (a: number, b: number) => (a % 10) + (b % 10) >= 10
/** Ima li oduzimanje prelaz (jedinica umanjenika manje nego umanjioca)? */
const subtractionBorrows = (a: number, b: number) => a % 10 < b % 10

/** Jednačina s nepoznatim brojem x. Rezultat: [zapis, rješenje, objašnjenje]. */
function equation(op: EquationOp, max: number, rng: Rng): [string, number, string] {
  const small = max <= 100
  switch (op) {
    case '+': {
      const b = randInt(rng, 3, max)
      const x = randInt(rng, 1, b - 1)
      const a = b - x
      return rng() < 0.5
        ? [`${a} + x = ${b}`, x, `x = ${b} ${MINUS} ${a} = ${x}. Provjera: ${a} + ${x} = ${b}.`]
        : [`x + ${a} = ${b}`, x, `x = ${b} ${MINUS} ${a} = ${x}. Provjera: ${x} + ${a} = ${b}.`]
    }
    case '−': {
      if (rng() < 0.5) {
        const a = randInt(rng, 3, max)
        const x = randInt(rng, 1, a - 1)
        const b = a - x
        return [`${a} ${MINUS} x = ${b}`, x, `x = ${a} ${MINUS} ${b} = ${x}. Provjera: ${a} ${MINUS} ${x} = ${b}.`]
      }
      const x = randInt(rng, 3, max)
      const a = randInt(rng, 1, x - 1)
      const b = x - a
      return [`x ${MINUS} ${a} = ${b}`, x, `x = ${b} + ${a} = ${x}. Provjera: ${x} ${MINUS} ${a} = ${b}.`]
    }
    case '·': {
      const a = randInt(rng, 2, small ? 10 : 9)
      const x = randInt(rng, 2, small ? 10 : Math.max(2, Math.floor(max / a)))
      const b = a * x
      return rng() < 0.5
        ? [`${a} ${TIMES} x = ${b}`, x, `x = ${b} ${DIVIDE} ${a} = ${x}. Provjera: ${a} ${TIMES} ${x} = ${b}.`]
        : [`x ${TIMES} ${a} = ${b}`, x, `x = ${b} ${DIVIDE} ${a} = ${x}. Provjera: ${x} ${TIMES} ${a} = ${b}.`]
    }
    case ':': {
      const q = randInt(rng, 2, small ? 10 : 9)
      const d = randInt(rng, 2, small ? 10 : Math.max(2, Math.floor(max / q)))
      const n = q * d
      return rng() < 0.5
        ? [`${n} ${DIVIDE} x = ${q}`, d, `x = ${n} ${DIVIDE} ${q} = ${d}. Provjera: ${n} ${DIVIDE} ${d} = ${q}.`]
        : [`x ${DIVIDE} ${d} = ${q}`, n, `x = ${q} ${TIMES} ${d} = ${n}. Provjera: ${n} ${DIVIDE} ${d} = ${q}.`]
    }
  }
}

function generateOne(gen: Generator, rng: Rng): Exercise {
  switch (gen.type) {
    case 'addition': {
      let sum = randInt(rng, 2, gen.max)
      let a = randInt(rng, 1, sum - 1)
      // Bez prelaza: biramo dok jedinice ne daju manje od 10.
      for (let i = 0; gen.carry === false && additionCarries(a, sum - a) && i < 100; i++) {
        sum = randInt(rng, 2, gen.max)
        a = randInt(rng, 1, sum - 1)
      }
      const b = sum - a
      return numberTask(`${a} + ${b} = ?`, sum, `Koliko je ${a} plus ${b}?`, additionExplanation(a, b))
    }
    case 'subtraction': {
      let a = randInt(rng, 2, gen.max)
      let b = randInt(rng, 1, a - 1)
      for (let i = 0; gen.carry === false && subtractionBorrows(a, b) && i < 100; i++) {
        a = randInt(rng, 2, gen.max)
        b = randInt(rng, 1, a - 1)
      }
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
      if (gen.max >= 100) return largePlaceValue(randInt(rng, 100, Math.min(gen.max, 9999)), rng)
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
    case 'rounding': {
      const to = gen.to
      let n = randInt(rng, to + 1, gen.max)
      while (n % to === 0) n = randInt(rng, to + 1, gen.max)
      const lower = n - (n % to)
      const upper = lower + to
      const answer = (n % to) * 2 >= to ? upper : lower
      const name = ROUNDING_NAMES[to]
      const explanation =
        (n % to) * 2 === to
          ? `${n} je tačno na sredini između ${lower} i ${upper}. Tada zaokružujemo naviše: ${n} ≈ ${upper}.`
          : `${n} je između ${lower} i ${upper}, a bliže je broju ${answer}. Zato je ${n} ≈ ${answer}.`
      return numberTask(String(n), answer, `Zaokruži broj ${n} na ${name}.`, explanation, `Zaokruži na ${name}`)
    }
    case 'long-multiplication': {
      const d = pick(gen.digits ?? DEFAULT_DIGITS, rng)
      const x = randInt(rng, 11, Math.max(11, Math.floor(gen.max / d)))
      const parts = expandedForm(x)
      const explanation =
        parts.length > 1
          ? `${x} ${TIMES} ${d} = ${parts.map((p) => `${p} ${TIMES} ${d}`).join(' + ')} = ${parts.map((p) => p * d).join(' + ')} = ${x * d}.`
          : `${x} ${TIMES} ${d} = ${x * d}.`
      return numberTask(`${x} ${TIMES} ${d} = ?`, x * d, `Koliko je ${x} puta ${d}?`, explanation)
    }
    case 'long-division': {
      const d = pick(gen.digits ?? DEFAULT_DIGITS, rng)
      const q = randInt(rng, 11, Math.max(11, Math.floor(gen.max / d)))
      const n = q * d
      return numberTask(
        `${n} ${DIVIDE} ${d} = ?`,
        q,
        `Koliko je ${n} podijeljeno sa ${d}?`,
        `${n} ${DIVIDE} ${d} = ${q}, jer je ${q} ${TIMES} ${d} = ${n}.`,
      )
    }
    case 'division-remainder': {
      const d = pick(gen.digits ?? DEFAULT_DIGITS, rng)
      const q = randInt(rng, 1, Math.max(1, Math.floor((gen.max - (d - 1)) / d)))
      const r = randInt(rng, 1, d - 1)
      const n = q * d + r
      const label = (quotient: number, rest: number) => `${quotient}, ostatak ${rest}`
      const answer = label(q, r)
      const options = [answer, label(q + 1, r), label(q, r === d - 1 ? r - 1 : r + 1), label(q - 1, r + d)]
      const task: ChoiceExercise = {
        type: 'choice',
        instruction: 'Odaberi rezultat i ostatak',
        question: `${n} ${DIVIDE} ${d} = ?`,
        options: [...new Set(options)],
        answer,
        speak: `Koliko je ${n} podijeljeno sa ${d}, i koliki je ostatak?`,
        explanation: `${q} ${TIMES} ${d} = ${q * d}, a ${n} ${MINUS} ${q * d} = ${r}. Ostatak je uvijek manji od djelioca.`,
      }
      return task
    }
    case 'roman': {
      const n = randInt(rng, 1, gen.max)
      const roman = toRoman(n)
      const parts = romanParts(n)
      const explanation =
        parts.length > 1
          ? `${parts.map(([, l]) => l).join(' + ')} = ${parts.map(([v]) => v).join(' + ')} = ${n}, pa je ${n} = ${roman}.`
          : `${roman} = ${n}.`
      if (rng() < 0.5) {
        return numberTask(roman, n, `Koji broj je napisan rimskim ciframa ${roman}?`, explanation, 'Napiši arapskim ciframa')
      }
      return {
        type: 'input',
        instruction: 'Napiši rimskim ciframa',
        question: String(n),
        answer: roman,
        speak: `Napiši broj ${n} rimskim ciframa.`,
        explanation,
      }
    }
    case 'equation': {
      const [question, x, explanation] = equation(pick(gen.ops, rng), gen.max, rng)
      return numberTask(question, x, `Riješi jednačinu: ${question}`, explanation, 'Izračunaj nepoznati broj x')
    }
    case 'unit-conversion': {
      const [big, small, factor] = pick(UNIT_PAIRS[pick(gen.units, rng)], rng)
      const n = randInt(rng, 2, 9)
      const m = n * factor
      if (rng() < 0.6) {
        return numberTask(
          `${n} ${big} = ? ${small}`,
          m,
          `Koliko ${UNIT_NAMES[small][2]} ima ${unitName(n, big)}?`,
          `1 ${big} = ${factor} ${small}, a ${n} ${TIMES} ${factor} = ${m}, pa je ${n} ${big} = ${m} ${small}.`,
          'Pretvori mjerne jedinice',
        )
      }
      return numberTask(
        `${m} ${small} = ? ${big}`,
        n,
        `Koliko ${UNIT_NAMES[big][2]} je ${unitName(m, small)}?`,
        `1 ${big} = ${factor} ${small}, a ${m} ${DIVIDE} ${factor} = ${n}, pa je ${m} ${small} = ${n} ${big}.`,
        'Pretvori mjerne jedinice',
      )
    }
  }
}

/** Brojevi do 10 000: hiljade, stotice, desetice i jedinice. */
function largePlaceValue(n: number, rng: Rng): Exercise {
  const digits = String(n).split('').map(Number).reverse()
  const parts = expandedForm(n)
  const explanation = `${n} = ${parts.join(' + ')}`
  const variant = randInt(rng, 0, 2)
  if (variant === 0) {
    const place = randInt(rng, 0, digits.length - 1)
    const q = `Koja cifra je na mjestu ${PLACES[place]} u broju ${n}?`
    return numberTask(q, digits[place], q, explanation, 'Upiši cifru')
  }
  if (variant === 1) {
    const q = parts.join(' + ')
    return numberTask(`${q} = ?`, n, `Koji broj je ${q}?`, explanation, 'Napiši broj')
  }
  const named = digits
    .map((d, place) => (d > 0 ? PLACE_COUNT[place](d) : ''))
    .filter(Boolean)
    .reverse()
  const phrase = named.length > 1 ? `${named.slice(0, -1).join(', ')} i ${named[named.length - 1]}` : named[0]
  const q = `Koji broj ima ${phrase}?`
  return numberTask(q, n, q, explanation, 'Upiši broj')
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
