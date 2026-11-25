/**
 * Provjera sadržaja. Pokreće se u testovima (`npm run provjeri`) i javlja
 * razumljive greške na bosanskom, npr. kad tačan odgovor nije među ponuđenima.
 */
import { acceptedAnswers } from './answers'
import { isRecord } from './store'

const EXERCISE_TYPES = ['choice', 'input', 'truefalse', 'order']
const BLOCK_TYPES = ['text', 'remember', 'example', 'list', 'calculation']
const CALCULATION_OPERATORS = ['+', '−', '·', ':']
/** Najmanja dozvoljena vrijednost za "max" kod generatora koji ga koriste. */
const GENERATOR_MIN_MAX: Record<string, number> = {
  addition: 2,
  subtraction: 2,
  'missing-addend': 3,
  compare: 1,
  neighbors: 2,
  'place-value': 10,
  'long-multiplication': 100,
  'long-division': 100,
  'division-remainder': 20,
}
const TABLE_GENERATORS = ['multiplication', 'division']
const DIGIT_GENERATORS = ['long-multiplication', 'long-division', 'division-remainder']
const ROUNDING_TO = [10, 100, 1000]
const UNIT_GROUPS = ['length', 'mass', 'volume']
const GENERATOR_TYPES = [...Object.keys(GENERATOR_MIN_MAX), ...TABLE_GENERATORS, 'rounding', 'unit-conversion']
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/

const isText = (v: unknown): v is string => typeof v === 'string' && v.trim() !== ''
const isTextList = (v: unknown, min: number): v is string[] =>
  Array.isArray(v) && v.length >= min && v.every(isText)
const isPositiveInt = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v > 0

function validateBlock(block: unknown, where: string, errors: string[]) {
  if (!isRecord(block) || !BLOCK_TYPES.includes(String(block.type))) {
    errors.push(`${where}: nepoznat tip dijela lekcije (dozvoljeno: ${BLOCK_TYPES.join(', ')}).`)
    return
  }
  if (block.type === 'list') {
    if (!isTextList(block.items, 1)) errors.push(`${where}: "items" mora biti lista s barem jednom stavkom.`)
  } else if (block.type === 'calculation') {
    if (!isTextList(block.rows, 2)) errors.push(`${where}: "rows" mora imati barem 2 broja, npr. ["347", "285"].`)
    if (!CALCULATION_OPERATORS.includes(String(block.operator))) {
      errors.push(`${where}: "operator" mora biti jedan od znakova ${CALCULATION_OPERATORS.join(' ')}.`)
    }
    if (!isText(block.result)) errors.push(`${where}: nedostaje rezultat ("result").`)
  } else if (!isText(block.text)) {
    errors.push(`${where}: nedostaje "text".`)
  }
}

function validateExercise(ex: unknown, where: string, errors: string[]) {
  if (!isRecord(ex) || !EXERCISE_TYPES.includes(String(ex.type))) {
    errors.push(`${where}: nepoznat tip zadatka (dozvoljeno: ${EXERCISE_TYPES.join(', ')}).`)
    return
  }
  for (const field of ['instruction', 'picture', 'explanation', 'speak']) {
    if (field in ex && !isText(ex[field])) errors.push(`${where}: "${field}" mora biti tekst.`)
  }
  switch (ex.type) {
    case 'choice': {
      if (!isText(ex.question)) errors.push(`${where}: nedostaje pitanje ("question").`)
      if (!isTextList(ex.options, 2)) {
        errors.push(`${where}: "options" mora imati barem 2 ponuđena odgovora.`)
        return
      }
      if (new Set(ex.options).size !== ex.options.length) errors.push(`${where}: ponuđeni odgovori se ponavljaju.`)
      if (!isText(ex.answer)) errors.push(`${where}: nedostaje tačan odgovor ("answer").`)
      else if (!ex.options.includes(ex.answer)) {
        errors.push(`${where}: tačan odgovor "${ex.answer}" nije među ponuđenim odgovorima.`)
      }
      if ('shuffle' in ex && typeof ex.shuffle !== 'boolean') errors.push(`${where}: "shuffle" mora biti true ili false.`)
      return
    }
    case 'input': {
      if (!isText(ex.question)) errors.push(`${where}: nedostaje pitanje ("question").`)
      const answers = typeof ex.answer === 'string' || Array.isArray(ex.answer) ? acceptedAnswers(ex.answer) : []
      if (answers.length === 0 || !answers.every(isText)) {
        errors.push(`${where}: "answer" mora biti tekst ili lista tekstova.`)
      }
      if ('caseSensitive' in ex && typeof ex.caseSensitive !== 'boolean') {
        errors.push(`${where}: "caseSensitive" mora biti true ili false.`)
      }
      return
    }
    case 'truefalse': {
      if (!isText(ex.statement)) errors.push(`${where}: nedostaje tvrdnja ("statement").`)
      if (typeof ex.answer !== 'boolean') errors.push(`${where}: "answer" mora biti true (tačno) ili false (netačno).`)
      return
    }
    case 'order': {
      if (!isText(ex.question)) errors.push(`${where}: nedostaje pitanje ("question").`)
      if (!isTextList(ex.items, 2)) errors.push(`${where}: "items" mora imati barem 2 stavke.`)
      else if (new Set(ex.items).size !== ex.items.length) errors.push(`${where}: stavke se ne smiju ponavljati.`)
      return
    }
  }
}

function validateGenerator(gen: unknown, where: string, errors: string[]) {
  if (!isRecord(gen)) {
    errors.push(`${where}: generator mora biti objekat.`)
    return
  }
  const type = String(gen.type)
  if (!GENERATOR_TYPES.includes(type)) {
    errors.push(`${where}: nepoznat generator "${type}" (dozvoljeno: ${GENERATOR_TYPES.join(', ')}).`)
    return
  }
  if (type in GENERATOR_MIN_MAX && (!isPositiveInt(gen.max) || gen.max < GENERATOR_MIN_MAX[type])) {
    errors.push(`${where}: "max" mora biti cijeli broj, najmanje ${GENERATOR_MIN_MAX[type]}.`)
  }
  if (TABLE_GENERATORS.includes(type)) {
    const ok =
      Array.isArray(gen.tables) &&
      gen.tables.length > 0 &&
      gen.tables.every((t) => isPositiveInt(t) && t <= 10)
    if (!ok) errors.push(`${where}: "tables" mora biti lista brojeva od 1 do 10, npr. [2, 3, 4].`)
  }
  if (DIGIT_GENERATORS.includes(type) && 'digits' in gen) {
    const ok =
      Array.isArray(gen.digits) &&
      gen.digits.length > 0 &&
      gen.digits.every((d) => isPositiveInt(d) && d >= 2 && d <= 9)
    if (!ok) errors.push(`${where}: "digits" mora biti lista jednocifrenih brojeva od 2 do 9, npr. [2, 3, 4].`)
  }
  if (type === 'rounding') {
    if (!ROUNDING_TO.includes(Number(gen.to))) {
      errors.push(`${where}: "to" mora biti 10 (desetice), 100 (stotice) ili 1000 (hiljade).`)
    } else if (!isPositiveInt(gen.max) || gen.max < 2 * Number(gen.to)) {
      errors.push(`${where}: "max" mora biti cijeli broj, najmanje ${2 * Number(gen.to)}.`)
    }
  }
  if (type === 'unit-conversion') {
    const ok =
      Array.isArray(gen.units) && gen.units.length > 0 && gen.units.every((u) => UNIT_GROUPS.includes(String(u)))
    if (!ok) {
      errors.push(`${where}: "units" mora biti lista od: "length" (dužina), "mass" (masa), "volume" (zapremina).`)
    }
  }
  if ('count' in gen && !isPositiveInt(gen.count)) errors.push(`${where}: "count" mora biti pozitivan cijeli broj.`)
}

/** Vraća listu grešaka (prazna lista = sve je u redu). */
export function validateSubject(data: unknown, file: string): string[] {
  const errors: string[] = []
  if (!isRecord(data)) return [`${file}: datoteka mora sadržavati jedan JSON objekat.`]
  if (!isPositiveInt(data.grade) || data.grade > 9) errors.push(`${file}: "grade" mora biti razred od 1 do 9.`)
  if (!isText(data.id) || !ID_PATTERN.test(data.id)) {
    errors.push(`${file}: "id" smije imati samo mala slova bez kvačica, brojeve i crtice (npr. "moja-okolina").`)
  }
  if (!isText(data.name)) errors.push(`${file}: nedostaje naziv predmeta ("name").`)
  if ('shortName' in data && !isText(data.shortName)) errors.push(`${file}: "shortName" mora biti tekst.`)
  if ('order' in data && typeof data.order !== 'number') errors.push(`${file}: "order" mora biti broj.`)
  if (!isText(data.icon)) errors.push(`${file}: nedostaje ikona ("icon"), npr. "🔢".`)
  if (!isText(data.color) || !COLOR_PATTERN.test(data.color)) {
    errors.push(`${file}: "color" mora biti boja u obliku "#2F6FED".`)
  }
  if (data.paper !== 'grid' && data.paper !== 'lines') errors.push(`${file}: "paper" mora biti "grid" ili "lines".`)
  if (!Array.isArray(data.topics) || data.topics.length === 0) {
    errors.push(`${file}: predmet mora imati barem jednu temu ("topics").`)
    return errors
  }

  const topicIds = new Set<string>()
  data.topics.forEach((topic: unknown, ti: number) => {
    const where = `${file} › tema ${ti + 1}`
    if (!isRecord(topic)) {
      errors.push(`${where}: tema mora biti objekat.`)
      return
    }
    const label = isText(topic.id) ? `${file} › tema "${topic.id}"` : where
    if (!isText(topic.id) || !ID_PATTERN.test(topic.id)) {
      errors.push(`${where}: "id" smije imati samo mala slova bez kvačica, brojeve i crtice.`)
    } else if (topicIds.has(topic.id)) {
      errors.push(`${label}: dvije teme imaju isti "id".`)
    } else {
      topicIds.add(topic.id)
    }
    if (!isText(topic.title)) errors.push(`${label}: nedostaje naslov ("title").`)
    if ('description' in topic && !isText(topic.description)) errors.push(`${label}: "description" mora biti tekst.`)
    if (!Array.isArray(topic.lesson)) errors.push(`${label}: nedostaje lekcija ("lesson"), može biti i prazna lista [].`)
    else topic.lesson.forEach((b: unknown, bi: number) => validateBlock(b, `${label} › lekcija, dio ${bi + 1}`, errors))

    const exercises = 'exercises' in topic ? topic.exercises : []
    const generators = 'generators' in topic ? topic.generators : []
    if (!Array.isArray(exercises)) errors.push(`${label}: "exercises" mora biti lista.`)
    else exercises.forEach((ex: unknown, ei: number) => validateExercise(ex, `${label} › zadatak ${ei + 1}`, errors))
    if (!Array.isArray(generators)) errors.push(`${label}: "generators" mora biti lista.`)
    else generators.forEach((g: unknown, gi: number) => validateGenerator(g, `${label} › generator ${gi + 1}`, errors))
    const count = (Array.isArray(exercises) ? exercises.length : 0) + (Array.isArray(generators) ? generators.length : 0)
    if (count === 0) errors.push(`${label}: tema nema nijedan zadatak ni generator.`)
  })
  return errors
}
