import { describe, expect, it } from 'vitest'
import { chooseVoice, textForSpeech } from './speech'

const v = (lang: string, name = lang, localService = true) => ({ lang, name, localService })

describe('čitanje naglas', () => {
  it('bira bosanski, pa hrvatski, pa srpski glas', () => {
    expect(chooseVoice([v('en-US'), v('sr-RS'), v('hr-HR')])?.lang).toBe('hr-HR')
    expect(chooseVoice([v('hr-HR'), v('bs-BA')])?.lang).toBe('bs-BA')
    expect(chooseVoice([v('en-US'), v('sr-RS')])?.lang).toBe('sr-RS')
    expect(chooseVoice([v('en-US'), v('de-DE')])).toBeNull()
  })

  it('prepoznaje oznake kakve daju mobiteli: hr_HR, hrv-HRV, ili samo ime glasa', () => {
    expect(chooseVoice([v('en-US'), v('hr_HR')])?.lang).toBe('hr_HR')
    expect(chooseVoice([v('en-US'), v('hrv-HRV')])?.lang).toBe('hrv-HRV')
    expect(chooseVoice([v('en-US'), v('', 'Croatian Female')])?.name).toBe('Croatian Female')
  })

  it('daje prednost glasu instaliranom na uređaju', () => {
    expect(chooseVoice([v('hr-HR', 'Online', false), v('hr-HR', 'Lana', true)])?.name).toBe('Lana')
  })

  it('pretvara računske znakove u riječi', () => {
    expect(textForSpeech('3 · 4 = ?')).toBe('3 puta 4 je koliko?')
  })
})
