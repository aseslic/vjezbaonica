import { describe, expect, it } from 'vitest'
import { currentStreak, emptyProgress, lastPlayedKey, previousDay, recordSession, sanitizeProgress } from './progress'

const day = (d: string, hour = 12) => new Date(`${d}T${String(hour).padStart(2, '0')}:00:00`)

describe('previousDay', () => {
  it('računa jučerašnji datum, i preko granice mjeseca i godine', () => {
    expect(previousDay('2026-11-19')).toBe('2026-11-18')
    expect(previousDay('2026-03-01')).toBe('2026-02-28')
    expect(previousDay('2027-01-01')).toBe('2026-12-31')
  })
})

describe('recordSession', () => {
  it('pamti najbolji rezultat teme', () => {
    let p = recordSession(emptyProgress(), '2/matematika/x', 8, 10, day('2026-11-19'))
    p = recordSession(p, '2/matematika/x', 5, 10, day('2026-11-19', 13))
    const t = p.topics['2/matematika/x']
    expect(t.bestStars).toBe(2)
    expect(t.bestCorrect).toBe(8)
    expect(t.plays).toBe(2)
    expect(p.totalAnswered).toBe(20)
    expect(p.totalCorrect).toBe(13)
  })

  it('broji dane zaredom', () => {
    let p = recordSession(emptyProgress(), 'a', 5, 5, day('2026-11-17'))
    p = recordSession(p, 'a', 5, 5, day('2026-11-18'))
    p = recordSession(p, 'a', 5, 5, day('2026-11-18', 18))
    expect(p.streak).toBe(2)
    p = recordSession(p, 'a', 5, 5, day('2026-11-19'))
    expect(p.streak).toBe(3)
    expect(currentStreak(p, '2026-11-20')).toBe(3)
    expect(currentStreak(p, '2026-11-21')).toBe(0)
    p = recordSession(p, 'a', 5, 5, day('2026-11-25'))
    expect(p.streak).toBe(1)
  })

  it('pronalazi zadnju vježbanu temu', () => {
    let p = recordSession(emptyProgress(), 'prva', 5, 5, day('2026-11-18'))
    p = recordSession(p, 'druga', 5, 5, day('2026-11-19'))
    expect(lastPlayedKey(p)).toBe('druga')
    expect(lastPlayedKey(emptyProgress())).toBeNull()
  })
})

describe('sanitizeProgress', () => {
  it('vraća prazan napredak za oštećene podatke', () => {
    expect(sanitizeProgress('nešto čudno')).toEqual(emptyProgress())
    expect(sanitizeProgress({ version: 99 })).toEqual(emptyProgress())
  })

  it('popravlja neispravne vrijednosti', () => {
    const p = sanitizeProgress({ version: 1, topics: { a: { bestStars: 7, plays: -1 } }, streak: 'x' })
    expect(p.topics.a.bestStars).toBe(3)
    expect(p.topics.a.plays).toBe(0)
    expect(p.streak).toBe(0)
  })
})
