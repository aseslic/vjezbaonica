import type { LessonBlock } from './types'

/** Cijela lekcija kao jedan tekst, za čitanje naglas. */
export function lessonText(blocks: LessonBlock[]): string {
  return blocks
    .map((b) => {
      if (b.type === 'list') return b.items.join('. ')
      if (b.type === 'calculation') return `${b.rows.join(` ${b.operator} `)} = ${b.result}`
      if (b.type === 'remember') return `Zapamti! ${b.text}`
      return b.text
    })
    .join('. ')
}
