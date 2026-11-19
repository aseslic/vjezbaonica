import { describe, expect, it } from 'vitest'
import { createRng } from './random'
import { buildSession, evaluate, isAnswerReady, prepare, starsFor, verdictFor } from './session'
import type { Topic } from './types'

const topic: Topic = {
  id: 'test',
  title: 'Test',
  lesson: [],
  exercises: [
    { type: 'choice', question: 'Koliko je 2 + 2?', options: ['3', '4', '5'], answer: '4' },
    { type: 'input', question: 'Glavni grad BiH?', answer: 'Sarajevo' },
    { type: 'truefalse', statement: 'Sedmica ima 7 dana.', answer: true },
    { type: 'order', question: 'Poredaj.', items: ['A', 'B', 'C'] },
  ],
  generators: [{ type: 'addition', max: 20, count: 10 }],
}

describe('buildSession', () => {
  it('bira zadani broj zadataka s jedinstvenim ključevima', () => {
    const session = buildSession(topic, 10, createRng(1))
    expect(session).toHaveLength(10)
    expect(new Set(session.map((q) => q.key)).size).toBe(10)
  })

  it('ne može izabrati više zadataka nego što ih tema ima', () => {
    const small: Topic = { ...topic, generators: [] }
    expect(buildSession(small, 10, createRng(1))).toHaveLength(4)
  })

  it('miješa stavke kod "poredaj" tako da nisu već poredane', () => {
    for (let seed = 0; seed < 20; seed++) {
      const q = prepare(topic.exercises![3], 'q0', createRng(seed))
      expect(q.scrambled).not.toEqual(['A', 'B', 'C'])
      expect([...q.scrambled!].sort()).toEqual(['A', 'B', 'C'])
    }
  })
})

describe('evaluate', () => {
  const rng = createRng(3)
  const [choice, input, truefalse, order] = topic.exercises!.map((ex, i) => prepare(ex, `q${i}`, rng))

  it('ocjenjuje izbor', () => {
    expect(evaluate(choice, '4').correct).toBe(true)
    expect(evaluate(choice, '5')).toMatchObject({ correct: false, correctText: '4' })
  })

  it('ocjenjuje upis', () => {
    expect(evaluate(input, ' sarajevo ').correct).toBe(true)
  })

  it('ocjenjuje tačno/netačno', () => {
    expect(evaluate(truefalse, true).correct).toBe(true)
    expect(evaluate(truefalse, false)).toMatchObject({ correct: false, correctText: 'Tačno' })
  })

  it('ocjenjuje redoslijed', () => {
    const scrambled = order.scrambled!
    const right = ['A', 'B', 'C'].map((item) => scrambled.indexOf(item))
    expect(evaluate(order, right).correct).toBe(true)
    expect(evaluate(order, [...right].reverse()).correct).toBe(false)
  })

  it('zna kad je odgovor spreman za provjeru', () => {
    expect(isAnswerReady(input, '  ')).toBe(false)
    expect(isAnswerReady(input, 'Mostar')).toBe(true)
    expect(isAnswerReady(order, [0, 1])).toBe(false)
    expect(isAnswerReady(order, [0, 1, 2])).toBe(true)
    expect(isAnswerReady(choice, null)).toBe(false)
  })
})

describe('zvjezdice i pečat', () => {
  it('dodjeljuje zvjezdice po uspjehu', () => {
    expect(starsFor(10, 10)).toBe(3)
    expect(starsFor(9, 10)).toBe(3)
    expect(starsFor(7, 10)).toBe(2)
    expect(starsFor(5, 10)).toBe(1)
    expect(starsFor(4, 10)).toBe(0)
    expect(starsFor(0, 0)).toBe(0)
  })

  it('piše natpis na pečatu', () => {
    expect(verdictFor(10, 10)).toBe('Odlično!')
    expect(verdictFor(7, 10)).toBe('Vrlo dobro!')
    expect(verdictFor(5, 10)).toBe('Dobro!')
    expect(verdictFor(1, 10)).toBe('Vježbaj još!')
  })
})
