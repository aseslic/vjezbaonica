import { describe, expect, it } from 'vitest'
import { checkTextAnswer, isNumericAnswer, normalize, stripDiacritics } from './answers'
import { plural } from './plural'

describe('normalize', () => {
  it('uklanja višak razmaka i pretvara u mala slova', () => {
    expect(normalize('  Dobar   DAN ')).toBe('dobar dan')
  })
  it('čuva veliko slovo kad je to bitno', () => {
    expect(normalize(' Sarajevo ', true)).toBe('Sarajevo')
  })
})

describe('stripDiacritics', () => {
  it('uklanja kvačice, uključujući đ', () => {
    expect(stripDiacritics('čćšžđ ČĆŠŽĐ')).toBe('ccszd CCSZD')
  })
})

describe('checkTextAnswer', () => {
  it('prihvata tačan odgovor bez obzira na veliko slovo', () => {
    expect(checkTextAnswer('sarajevo', ['Sarajevo']).correct).toBe(true)
  })
  it('prihvata bilo koji od ponuđenih tačnih odgovora', () => {
    expect(checkTextAnswer('kuče', ['štene', 'kuče']).correct).toBe(true)
  })
  it('poredi brojeve kao brojeve', () => {
    expect(checkTextAnswer('07', ['7']).correct).toBe(true)
    expect(checkTextAnswer('1 000', ['1000']).correct).toBe(true)
    expect(checkTextAnswer('8', ['7']).correct).toBe(false)
  })
  it('daje savjet kad fale kvačice', () => {
    expect(checkTextAnswer('kuca', ['kuća'])).toEqual({ correct: false, hint: 'diacritics' })
    expect(checkTextAnswer('dak', ['đak'])).toEqual({ correct: false, hint: 'diacritics' })
  })
  it('daje savjet kad je pogrešno veliko slovo', () => {
    expect(checkTextAnswer('neretva', ['Neretva'], true)).toEqual({ correct: false, hint: 'case' })
    expect(checkTextAnswer('Neretva', ['Neretva'], true).correct).toBe(true)
  })
  it('prazan odgovor nije tačan', () => {
    expect(checkTextAnswer('   ', ['']).correct).toBe(false)
  })
})

describe('isNumericAnswer', () => {
  it('prepoznaje brojeve', () => {
    expect(isNumericAnswer('42')).toBe(true)
    expect(isNumericAnswer('četrdeset')).toBe(false)
  })
})

describe('plural', () => {
  it('bira pravilan oblik riječi', () => {
    const z = (n: number) => `${n} ${plural(n, 'zadatak', 'zadatka', 'zadataka')}`
    expect([1, 2, 5, 11, 12, 21, 22, 25].map(z)).toEqual([
      '1 zadatak',
      '2 zadatka',
      '5 zadataka',
      '11 zadataka',
      '12 zadataka',
      '21 zadatak',
      '22 zadatka',
      '25 zadataka',
    ])
  })
})
