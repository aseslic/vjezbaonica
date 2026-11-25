import { describe, expect, it } from 'vitest'
import { expandedForm, generate, UNIT_PAIRS } from './generators'
import { createRng } from './random'
import type { Exercise, Generator } from './types'

/** Iz "23 + 15 = ?" računa rezultat, da provjerimo da generator daje tačne odgovore. */
function solve(question: string): number {
  const q = question.replace('−', '-').replace('·', '*').replace(':', '/')
  const m = q.match(/^(\d+) ([-+*/]) (\d+) = \?$/)
  if (m) {
    const [a, op, b] = [Number(m[1]), m[2], Number(m[3])]
    return op === '+' ? a + b : op === '-' ? a - b : op === '*' ? a * b : a / b
  }
  const missing = q.match(/^(\d+) \+ \? = (\d+)$/)
  if (missing) return Number(missing[2]) - Number(missing[1])
  throw new Error(`Nepoznat oblik pitanja: ${question}`)
}

function answerOf(ex: Exercise): string {
  if (ex.type === 'input') return Array.isArray(ex.answer) ? ex.answer[0] : (ex.answer as string)
  if (ex.type === 'choice') return ex.answer
  throw new Error('Neočekivan tip zadatka')
}

const many = (gen: Generator, seed = 1) => generate({ ...gen, count: 200 }, createRng(seed))

describe('generatori', () => {
  it('sabiranje ne prelazi zadani maksimum i ima tačne odgovore', () => {
    for (const ex of many({ type: 'addition', max: 100 })) {
      if (ex.type !== 'input') throw new Error('očekivan upis')
      const result = Number(answerOf(ex))
      expect(result).toBeLessThanOrEqual(100)
      expect(solve(ex.question)).toBe(result)
    }
  })

  it('oduzimanje nikad ne daje negativan rezultat', () => {
    for (const ex of many({ type: 'subtraction', max: 20 })) {
      if (ex.type !== 'input') throw new Error('očekivan upis')
      const result = Number(answerOf(ex))
      expect(result).toBeGreaterThan(0)
      expect(solve(ex.question)).toBe(result)
    }
  })

  it('nepoznati sabirak je tačno izračunat', () => {
    for (const ex of many({ type: 'missing-addend', max: 50 })) {
      if (ex.type !== 'input') throw new Error('očekivan upis')
      expect(solve(ex.question)).toBe(Number(answerOf(ex)))
    }
  })

  it('množenje koristi samo zadane brojeve tablice', () => {
    for (const ex of many({ type: 'multiplication', tables: [3] })) {
      if (ex.type !== 'input') throw new Error('očekivan upis')
      expect(ex.question).toMatch(/(^3 ·)|(· 3 =)/)
      expect(solve(ex.question)).toBe(Number(answerOf(ex)))
    }
  })

  it('dijeljenje je uvijek bez ostatka', () => {
    for (const ex of many({ type: 'division', tables: [2, 3, 4, 5, 6, 7, 8, 9, 10] })) {
      if (ex.type !== 'input') throw new Error('očekivan upis')
      expect(Number.isInteger(solve(ex.question))).toBe(true)
      expect(solve(ex.question)).toBe(Number(answerOf(ex)))
    }
  })

  it('poređenje bira pravilan znak', () => {
    for (const ex of many({ type: 'compare', max: 100 })) {
      if (ex.type !== 'choice') throw new Error('očekivan izbor')
      const [a, b] = ex.question.split(' ? ').map(Number)
      expect(ex.answer).toBe(a < b ? '<' : a > b ? '>' : '=')
      expect(ex.options).toContain(ex.answer)
    }
  })

  it('prethodnik i sljedbenik su susjedni brojevi', () => {
    for (const ex of many({ type: 'neighbors', max: 100 })) {
      if (ex.type !== 'input') throw new Error('očekivan upis')
      const n = Number(ex.question.match(/broja (\d+)/)?.[1])
      const expected = ex.question.includes('prethodnik') ? n - 1 : n + 1
      expect(Number(answerOf(ex))).toBe(expected)
      expect(expected).toBeGreaterThanOrEqual(0)
      expect(expected).toBeLessThanOrEqual(100)
    }
  })

  it('desetice i jedinice odgovaraju broju', () => {
    for (const ex of many({ type: 'place-value', max: 99 })) {
      if (ex.type !== 'input') throw new Error('očekivan upis')
      const answer = Number(answerOf(ex))
      const n = Number(ex.question.match(/broj (\d+)/)?.[1])
      if (ex.question.startsWith('Koliko desetica')) expect(answer).toBe(Math.floor(n / 10))
      else if (ex.question.startsWith('Koliko jedinica')) expect(answer).toBe(n % 10)
      else expect(answer).toBeGreaterThanOrEqual(10)
    }
  })

  it('ne ponavlja isto pitanje u jednoj vježbi', () => {
    const tasks = generate({ type: 'addition', max: 100, count: 30 }, createRng(7))
    const questions = tasks.map((t) => (t.type === 'input' ? t.question : ''))
    expect(new Set(questions).size).toBe(questions.length)
  })

  it('isto sjeme daje iste zadatke (ponovljivost)', () => {
    const a = generate({ type: 'addition', max: 100, count: 5 }, createRng(42))
    const b = generate({ type: 'addition', max: 100, count: 5 }, createRng(42))
    expect(a).toEqual(b)
  })

  it('pismeno množenje: proizvod ne prelazi max, objašnjenje je po mjesnim vrijednostima', () => {
    for (const ex of many({ type: 'long-multiplication', max: 1000 })) {
      if (ex.type !== 'input') throw new Error('očekivan upis')
      const result = Number(answerOf(ex))
      expect(result).toBeLessThanOrEqual(1000)
      expect(solve(ex.question)).toBe(result)
      expect(ex.explanation).toContain(`= ${result}.`)
    }
  })

  it('pismeno dijeljenje je bez ostatka i u zadanom opsegu', () => {
    for (const ex of many({ type: 'long-division', max: 1000, digits: [3, 7] })) {
      if (ex.type !== 'input') throw new Error('očekivan upis')
      const [n, d] = ex.question.split(' : ').map((x) => parseInt(x, 10))
      expect([3, 7]).toContain(d)
      expect(n).toBeLessThanOrEqual(1000)
      expect(n % d).toBe(0)
      expect(Number(answerOf(ex))).toBe(n / d)
    }
  })

  it('dijeljenje sa ostatkom: tačan odgovor je među ponuđenima, a ostatak manji od djelioca', () => {
    for (const ex of many({ type: 'division-remainder', max: 100 })) {
      if (ex.type !== 'choice') throw new Error('očekivan izbor')
      const [n, d] = ex.question.split(' : ').map((x) => parseInt(x, 10))
      expect(n).toBeLessThanOrEqual(100)
      expect(ex.answer).toBe(`${Math.floor(n / d)}, ostatak ${n % d}`)
      expect(n % d).toBeGreaterThan(0)
      expect(ex.options).toContain(ex.answer)
      expect(new Set(ex.options).size).toBe(ex.options.length)
      expect(ex.options.length).toBeGreaterThanOrEqual(3)
    }
  })

  it('zaokruživanje: najbliža desetica, stotica ili hiljada; polovina se zaokružuje naviše', () => {
    for (const to of [10, 100, 1000] as const) {
      for (const ex of many({ type: 'rounding', to, max: 10000 })) {
        if (ex.type !== 'input') throw new Error('očekivan upis')
        const n = Number(ex.question)
        const answer = Number(answerOf(ex))
        expect(answer % to).toBe(0)
        expect(Math.abs(answer - n)).toBeLessThanOrEqual(to / 2)
        if (n % to === to / 2) expect(answer).toBeGreaterThan(n)
      }
    }
  })

  it('pretvaranje mjernih jedinica računa tačno u oba smjera', () => {
    const factors = new Map(Object.values(UNIT_PAIRS).flat().map(([big, small, f]) => [`${big}>${small}`, f]))
    for (const ex of many({ type: 'unit-conversion', units: ['length', 'mass', 'volume'] })) {
      if (ex.type !== 'input') throw new Error('očekivan upis')
      const m = ex.question.match(/^(\d+) (\w+) = \? (\w+)$/)
      if (!m) throw new Error(`Nepoznat oblik: ${ex.question}`)
      const [value, from, to] = [Number(m[1]), m[2], m[3]]
      const answer = Number(answerOf(ex))
      if (factors.has(`${from}>${to}`)) expect(answer).toBe(value * factors.get(`${from}>${to}`)!)
      else expect(answer).toBe(value / factors.get(`${to}>${from}`)!)
    }
  })

  it('brojevi do 10 000: mjesne vrijednosti su tačne', () => {
    expect(expandedForm(4057)).toEqual([4000, 50, 7])
    for (const ex of many({ type: 'place-value', max: 9999 })) {
      if (ex.type !== 'input') throw new Error('očekivan upis')
      const answer = Number(answerOf(ex))
      const place = ex.question.match(/na mjestu (\w+) u broju (\d+)/)
      if (place) {
        const idx = ['jedinica', 'desetica', 'stotica', 'hiljada'].indexOf(place[1])
        expect(answer).toBe(Math.floor(Number(place[2]) / 10 ** idx) % 10)
      } else if (ex.question.endsWith('= ?')) {
        const sum = ex.question.replace(' = ?', '').split(' + ').map(Number).reduce((a, b) => a + b, 0)
        expect(answer).toBe(sum)
      } else {
        expect(ex.explanation).toBe(`${answer} = ${expandedForm(answer).join(' + ')}`)
      }
    }
  })
})
