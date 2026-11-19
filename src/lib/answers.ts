/** Provjera upisanih odgovora. */

export type AnswerHint = 'diacritics' | 'case'

export interface CheckResult {
  correct: boolean
  /** Ako odgovor "skoro" valja: fale kvačice (č, ć, š, ž, đ) ili je pogrešno veliko/malo slovo. */
  hint?: AnswerHint
}

/** Uklanja višak razmaka i, ako veliko/malo slovo nije bitno, pretvara u mala slova. */
export function normalize(text: string, caseSensitive = false): string {
  const t = text.normalize('NFC').trim().replace(/\s+/g, ' ')
  return caseSensitive ? t : t.toLocaleLowerCase('bs')
}

/** "kuća" → "kuca", "đak" → "dak" (đ se ne rastavlja kroz NFD pa ga mijenjamo ručno). */
export function stripDiacritics(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
}

const INTEGER = /^[+-]?\d+$/

export function isNumericAnswer(text: string): boolean {
  return INTEGER.test(normalize(text).replace(/\s/g, ''))
}

export function checkTextAnswer(given: string, accepted: readonly string[], caseSensitive = false): CheckResult {
  const g = normalize(given, caseSensitive)
  if (g === '') return { correct: false }
  if (accepted.some((a) => normalize(a, caseSensitive) === g)) return { correct: true }

  // Brojevi: "07" i "7" su isti odgovor, kao i "1 000" i "1000".
  const compact = g.replace(/\s/g, '')
  if (INTEGER.test(compact)) {
    const n = Number(compact)
    if (accepted.some((a) => isNumericAnswer(a) && Number(normalize(a).replace(/\s/g, '')) === n)) {
      return { correct: true }
    }
  }

  if (caseSensitive && accepted.some((a) => normalize(a) === normalize(given))) {
    return { correct: false, hint: 'case' }
  }
  const plain = stripDiacritics(normalize(given))
  if (accepted.some((a) => stripDiacritics(normalize(a)) === plain)) {
    return { correct: false, hint: 'diacritics' }
  }
  return { correct: false }
}

export function acceptedAnswers(answer: string | readonly string[]): string[] {
  return typeof answer === 'string' ? [answer] : [...answer]
}
