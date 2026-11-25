import { describe, expect, it } from 'vitest'
import { validateSubject } from './validate'

const valid = {
  grade: 2,
  id: 'matematika',
  name: 'Matematika',
  icon: '🔢',
  color: '#2F6FED',
  paper: 'grid',
  topics: [
    {
      id: 'tema',
      title: 'Tema',
      lesson: [{ type: 'text', text: 'Tekst' }],
      exercises: [{ type: 'choice', question: 'Pitanje?', options: ['a', 'b'], answer: 'a' }],
    },
  ],
}

const withExercise = (exercise: unknown) => ({ ...valid, topics: [{ ...valid.topics[0], exercises: [exercise] }] })

describe('validateSubject', () => {
  it('ispravan predmet nema grešaka', () => {
    expect(validateSubject(valid, 'test.json')).toEqual([])
  })

  it('javlja kad tačan odgovor nije među ponuđenima', () => {
    const errors = validateSubject(withExercise({ type: 'choice', question: '?', options: ['a', 'b'], answer: 'c' }), 'test.json')
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('nije među ponuđenim odgovorima')
    expect(errors[0]).toContain('tema "tema"')
  })

  it('javlja nepoznat tip zadatka', () => {
    expect(validateSubject(withExercise({ type: 'kviz' }), 't.json')[0]).toContain('nepoznat tip zadatka')
  })

  it('traži true/false kod tvrdnji', () => {
    const errors = validateSubject(withExercise({ type: 'truefalse', statement: 'X', answer: 'da' }), 't.json')
    expect(errors[0]).toContain('true (tačno) ili false (netačno)')
  })

  it('javlja ponovljene stavke kod "poredaj"', () => {
    const errors = validateSubject(withExercise({ type: 'order', question: '?', items: ['a', 'a'] }), 't.json')
    expect(errors[0]).toContain('ne smiju ponavljati')
  })

  it('provjerava generatore', () => {
    const bad = {
      ...valid,
      topics: [{ ...valid.topics[0], generators: [{ type: 'multiplication', tables: [12] }, { type: 'sabiranje', max: 10 }] }],
    }
    const errors = validateSubject(bad, 't.json')
    expect(errors).toHaveLength(2)
    expect(errors[0]).toContain('od 1 do 10')
    expect(errors[1]).toContain('nepoznat generator')
  })

  it('provjerava osnovne podatke o predmetu', () => {
    const errors = validateSubject({ ...valid, grade: 12, id: 'Moja Okolina', color: 'plava', paper: 'karirano' }, 't.json')
    expect(errors).toHaveLength(4)
  })

  it('javlja temu bez zadataka i duple oznake tema', () => {
    const topic = { id: 'ista', title: 'Ista', lesson: [] }
    const errors = validateSubject({ ...valid, topics: [topic, topic] }, 't.json')
    expect(errors.some((e) => e.includes('isti "id"'))).toBe(true)
    expect(errors.some((e) => e.includes('nema nijedan zadatak'))).toBe(true)
  })

  it('provjerava nove generatore i pismeno računanje u lekciji', () => {
    const topic = {
      ...valid.topics[0],
      lesson: [{ type: 'calculation', rows: ['347'], operator: 'x', result: '' }],
      generators: [
        { type: 'rounding', to: 50, max: 1000 },
        { type: 'long-division', max: 1000, digits: [1, 12] },
        { type: 'unit-conversion', units: ['dužina'] },
      ],
    }
    const errors = validateSubject({ ...valid, topics: [topic] }, 't.json')
    expect(errors.some((e) => e.includes('"rows" mora imati barem 2 broja'))).toBe(true)
    expect(errors.some((e) => e.includes('"operator" mora biti'))).toBe(true)
    expect(errors.some((e) => e.includes('nedostaje rezultat'))).toBe(true)
    expect(errors.some((e) => e.includes('"to" mora biti 10'))).toBe(true)
    expect(errors.some((e) => e.includes('"digits" mora biti'))).toBe(true)
    expect(errors.some((e) => e.includes('"units" mora biti'))).toBe(true)
  })
})

