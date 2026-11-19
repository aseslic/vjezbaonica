/**
 * Provjera cijelog sadržaja. Pokreni: npm run provjeri
 * Ako nešto nije u redu u JSON datotekama, ovdje dobiješ tačnu poruku šta i gdje.
 */
import { describe, expect, it } from 'vitest'
import { buildPool } from '../lib/session'
import { createRng } from '../lib/random'
import { catalog } from './index'

describe('sadržaj', () => {
  it('sve datoteke su ispravne', () => {
    expect(catalog.errors, `Greške u sadržaju:\n${catalog.errors.join('\n')}`).toEqual([])
  })

  it('postoji barem jedan razred s predmetima', () => {
    expect(catalog.grades.length).toBeGreaterThan(0)
  })

  it('svaka tema ima barem 5 zadataka za vježbu', () => {
    for (const { grade, subjects } of catalog.grades) {
      for (const subject of subjects) {
        for (const topic of subject.topics) {
          const count = buildPool(topic, createRng(1)).length
          expect(count, `${grade}. razred › ${subject.name} › ${topic.title}`).toBeGreaterThanOrEqual(5)
        }
      }
    }
  })
})
