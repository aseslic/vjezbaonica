/**
 * Tipovi sadržaja. Sav sadržaj (lekcije i zadaci) nalazi se u JSON datotekama
 * u folderu src/content/. Detaljan opis formata: docs/SADRZAJ.md
 */

/** Pozadina stranica predmeta: kockice (kao sveska za matematiku) ili linije. */
export type Paper = 'grid' | 'lines'

/** Jedan dio lekcije (učenja). */
export type LessonBlock =
  | { type: 'text'; text: string }
  | { type: 'remember'; text: string }
  | { type: 'example'; title?: string; text: string }
  | { type: 'list'; items: string[] }

interface ExerciseBase {
  /** Kratka uputa iznad pitanja, npr. "Izračunaj". Ako je nema, koristi se zadana uputa za tip zadatka. */
  instruction?: string
  /** Velika sličica iznad pitanja (emoji), npr. "🍎🍎🍎". */
  picture?: string
  /** Objašnjenje koje se prikaže nakon odgovora. */
  explanation?: string
  /** Tekst za čitanje naglas, ako treba da se razlikuje od pitanja. */
  speak?: string
}

/** Pitanje s ponuđenim odgovorima. */
export interface ChoiceExercise extends ExerciseBase {
  type: 'choice'
  question: string
  options: string[]
  /** Tačan odgovor – mora biti jedan od ponuđenih. */
  answer: string
  /** Miješati redoslijed odgovora? (zadano: da) */
  shuffle?: boolean
}

/** Pitanje na koje se odgovor upisuje. */
export interface InputExercise extends ExerciseBase {
  type: 'input'
  question: string
  /** Tačan odgovor ili više prihvatljivih odgovora. */
  answer: string | string[]
  /** Da li je važno veliko/malo slovo? (zadano: ne) */
  caseSensitive?: boolean
}

/** Tvrdnja koja je tačna ili netačna. */
export interface TrueFalseExercise extends ExerciseBase {
  type: 'truefalse'
  statement: string
  answer: boolean
}

/** Poredaj stavke pravilnim redom. Stavke se upisuju u TAČNOM redoslijedu. */
export interface OrderExercise extends ExerciseBase {
  type: 'order'
  question: string
  items: string[]
}

export type Exercise = ChoiceExercise | InputExercise | TrueFalseExercise | OrderExercise
export type ExerciseType = Exercise['type']

/** Automatski generisani matematički zadaci (svaki put drugačiji). */
export type Generator =
  | { type: 'addition'; max: number; count?: number }
  | { type: 'subtraction'; max: number; count?: number }
  | { type: 'missing-addend'; max: number; count?: number }
  | { type: 'multiplication'; tables: number[]; count?: number }
  | { type: 'division'; tables: number[]; count?: number }
  | { type: 'compare'; max: number; count?: number }
  | { type: 'neighbors'; max: number; count?: number }
  | { type: 'place-value'; max: number; count?: number }

export type GeneratorType = Generator['type']

export interface Topic {
  id: string
  title: string
  /** Kratak opis ispod naslova teme. */
  description?: string
  lesson: LessonBlock[]
  exercises?: Exercise[]
  generators?: Generator[]
}

export interface Subject {
  /** Razred (1–9). */
  grade: number
  id: string
  /** Puni naziv predmeta. */
  name: string
  /** Kraći naziv za korice sveske (ako je puni naziv predug). */
  shortName?: string
  /** Redoslijed prikaza (manji broj = prije). */
  order?: number
  icon: string
  /** Boja korica, npr. "#2F6FED". */
  color: string
  paper: Paper
  topics: Topic[]
}
