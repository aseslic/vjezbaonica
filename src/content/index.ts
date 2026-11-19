/**
 * Učitava sav sadržaj iz JSON datoteka u ovom folderu.
 * Nova datoteka (npr. 3-razred/moja-okolina.json) automatski se pojavljuje u aplikaciji.
 */
import type { Subject, Topic } from '../lib/types'
import { validateSubject } from '../lib/validate'

export interface GradeEntry {
  grade: number
  subjects: Subject[]
}

export interface Catalog {
  grades: GradeEntry[]
  errors: string[]
}

export function buildCatalog(files: Record<string, unknown>): Catalog {
  const errors: string[] = []
  const byGrade = new Map<number, Subject[]>()
  const seen = new Set<string>()

  for (const [path, data] of Object.entries(files).sort(([a], [b]) => a.localeCompare(b))) {
    const file = path.replace(/^\.\//, '')
    const fileErrors = validateSubject(data, file)
    if (fileErrors.length > 0) {
      errors.push(...fileErrors)
      continue
    }
    const subject = data as Subject
    const id = `${subject.grade}/${subject.id}`
    if (seen.has(id)) {
      errors.push(`${file}: predmet "${subject.id}" za ${subject.grade}. razred već postoji u drugoj datoteci.`)
      continue
    }
    seen.add(id)
    byGrade.set(subject.grade, [...(byGrade.get(subject.grade) ?? []), subject])
  }

  const grades = [...byGrade.entries()]
    .sort(([a], [b]) => a - b)
    .map(([grade, subjects]) => ({
      grade,
      subjects: subjects.sort((a, b) => (a.order ?? 99) - (b.order ?? 99) || a.name.localeCompare(b.name, 'bs')),
    }))
  return { grades, errors }
}

const files = import.meta.glob('./**/*.json', { eager: true, import: 'default' })

export const catalog = buildCatalog(files)

if (catalog.errors.length > 0) {
  console.error(`Greške u sadržaju (${catalog.errors.length}):\n${catalog.errors.join('\n')}`)
}

export function gradeLabel(grade: number): string {
  return `${grade}. razred`
}

export function findGrade(grade: number): GradeEntry | undefined {
  return catalog.grades.find((g) => g.grade === grade)
}

export function findSubject(grade: number, subjectId: string): Subject | undefined {
  return findGrade(grade)?.subjects.find((s) => s.id === subjectId)
}

export function findTopic(grade: number, subjectId: string, topicId: string): Topic | undefined {
  return findSubject(grade, subjectId)?.topics.find((t) => t.id === topicId)
}

/** Razred za početnu stranicu: odabrani, ako postoji, inače prvi dostupni. */
export function resolveGrade(preferred: number | null): GradeEntry | undefined {
  return (preferred !== null ? findGrade(preferred) : undefined) ?? catalog.grades[0]
}
