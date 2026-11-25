import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { PracticeSession } from './pages/PracticePage'
import { progressStore } from './lib/progress'
import { settingsStore } from './lib/settings'
import type { Subject } from './lib/types'

function resetStores() {
  localStorage.clear()
  settingsStore.reset()
  progressStore.reset()
}

async function go(path: string) {
  await act(async () => {
    window.location.hash = path
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  })
}

beforeEach(resetStores)
afterEach(() => {
  cleanup()
  window.location.hash = ''
})

describe('aplikacija', () => {
  it('pri prvom pokretanju pita za razred, pa prikazuje predmete', async () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'U koji razred ideš?' })).toBeTruthy()
    fireEvent.click(screen.getByRole('link', { name: /2\. razred/ }))
    await go('/')
    expect(screen.getByRole('heading', { name: 'Šta danas vježbamo?' })).toBeTruthy()
    expect(screen.getByRole('link', { name: /Matematika/ })).toBeTruthy()
  })

  it('otvara temu s lekcijom i dugmetom za vježbu', async () => {
    render(<App />)
    await go('/razred/2/matematika/sabiranje-i-oduzimanje-do-100')
    expect(screen.getByRole('heading', { name: 'Sabiranje i oduzimanje do 100 bez prelaza' })).toBeTruthy()
    expect(screen.getByText('Zapamti!')).toBeTruthy()
    expect(screen.getByRole('link', { name: /Vježbaj/ })).toBeTruthy()
  })

  it('prikazuje poruku za nepostojeću stranicu', async () => {
    render(<App />)
    await go('/razred/2/nepostojeci-predmet')
    expect(screen.getByRole('heading', { name: 'Ova stranica ne postoji' })).toBeTruthy()
  })
})

const subject: Subject = {
  grade: 2,
  id: 'test',
  name: 'Test',
  icon: '🧪',
  color: '#2F6FED',
  paper: 'grid',
  topics: [
    {
      id: 'tema',
      title: 'Test tema',
      lesson: [],
      exercises: [
        { type: 'choice', question: 'Koliko je 2 + 2?', options: ['4', '5'], answer: '4' },
        { type: 'truefalse', statement: 'Sedmica ima 7 dana.', answer: true },
      ],
    },
  ],
}

describe('vježba', () => {
  it('ponavlja netačno pitanje na kraju i upisuje rezultat', () => {
    render(<PracticeSession subject={subject} topic={subject.topics[0]} onRestart={() => {}} seed={1} />)
    const check = () => fireEvent.click(screen.getByRole('button', { name: 'Provjeri' }))
    const next = () => fireEvent.click(screen.getByRole('button', { name: /Dalje|Završi/ }))

    // Odgovori: na pitanje o sabiranju namjerno pogrešno, na tvrdnju tačno.
    const answer = (wrongOnPurpose: boolean) => {
      if (screen.queryByRole('button', { name: /Netačno/ })) {
        fireEvent.click(screen.getByRole('button', { name: /^Tačno/ }))
      } else {
        fireEvent.click(screen.getByRole('button', { name: wrongOnPurpose ? '5' : '4' }))
      }
    }

    answer(true)
    check()
    next()
    answer(true)
    check()
    next()
    // Treće pitanje je ponavljanje onog na koje je odgovor bio netačan.
    expect(screen.getByText('Ponovimo ovo pitanje')).toBeTruthy()
    answer(false)
    check()
    next()

    expect(screen.getByText('1 od 2 tačno')).toBeTruthy()
    expect(screen.getByRole('img', { name: /Pečat: Dobro!/ })).toBeTruthy()
    expect(progressStore.get().topics['2/test/tema'].bestStars).toBe(1)
  })
})
