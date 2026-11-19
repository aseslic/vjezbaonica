import { useEffect, useRef, useState } from 'react'
import { findSubject, findTopic } from '../content'
import { ExerciseView } from '../components/Exercises'
import { Icon } from '../components/Icon'
import { Page, TopBar, type FooterTone } from '../components/Layout'
import { RichText } from '../components/RichText'
import { SpeakButton } from '../components/SpeakButton'
import { Stamp } from '../components/Stamp'
import { saveSessionResult, topicKey } from '../lib/progress'
import { createRng, randomSeed } from '../lib/random'
import { href, routes } from '../lib/router'
import {
  buildSession,
  correctText,
  evaluate,
  instructionFor,
  isAnswerReady,
  prepare,
  promptFor,
  starsFor,
  verdictFor,
  type Answer,
  type Outcome,
  type SessionQuestion,
} from '../lib/session'
import { useSettings } from '../lib/settings'
import { playCorrect, playFinish, playWrong } from '../lib/sound'
import { speak, stopSpeaking } from '../lib/speech'
import type { Exercise, Subject, Topic } from '../lib/types'
import { NotFoundPage } from './NotFoundPage'

interface Params {
  grade: string
  subject: string
  topic: string
}

export function PracticePage({ grade, subject: subjectId, topic: topicId }: Params) {
  const g = Number(grade)
  const subject = findSubject(g, subjectId)
  const topic = findTopic(g, subjectId, topicId)
  const [round, setRound] = useState(0)
  if (!subject || !topic) return <NotFoundPage />
  return <PracticeSession key={round} subject={subject} topic={topic} onRestart={() => setRound((r) => r + 1)} />
}

const PRAISE = ['Tačno!', 'Bravo!', 'Super!', 'Tako je!', 'Odlično!']

function speechTextFor(exercise: Exercise): string {
  return exercise.speak ?? `${instructionFor(exercise)}. ${promptFor(exercise)}`
}

interface SessionProps {
  subject: Subject
  topic: Topic
  onRestart: () => void
  /** Sjeme za slučajni izbor zadataka (koristi se u testovima). */
  seed?: number
}

export function PracticeSession({ subject, topic, onRestart, seed }: SessionProps) {
  const settings = useSettings()
  const [rng] = useState(() => createRng(seed ?? randomSeed()))
  const [questions, setQuestions] = useState<SessionQuestion[]>(() => buildSession(topic, settings.sessionSize, rng))
  const [total] = useState(() => questions.length)
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState<Answer | null>(null)
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const [firstTry, setFirstTry] = useState<Record<string, boolean>>({})
  const [finished, setFinished] = useState(false)
  const nextButton = useRef<HTMLButtonElement>(null)
  const promptRef = useRef<HTMLHeadingElement>(null)

  const question = questions[index]
  const exercise = question.exercise
  const isLast = index + 1 >= questions.length

  useEffect(() => {
    if (!finished && settings.speech === 'auto') speak(speechTextFor(exercise))
  }, [exercise, finished, settings.speech])

  useEffect(() => stopSpeaking, [])

  useEffect(() => {
    if (outcome) nextButton.current?.focus({ preventScroll: true })
  }, [outcome])

  const check = () => {
    if (outcome || !isAnswerReady(question, answer)) return
    const result = evaluate(question, answer as Answer)
    setOutcome(result)
    if (!question.retry) {
      setFirstTry((prev) => ({ ...prev, [question.key]: result.correct }))
      if (!result.correct) {
        setQuestions((prev) => [...prev, { ...prepare(exercise, question.key, rng), retry: true }])
      }
    }
    if (settings.sounds) {
      if (result.correct) playCorrect()
      else playWrong()
    }
  }

  const next = () => {
    if (!outcome) return
    if (!isLast) {
      setIndex(index + 1)
      setAnswer(null)
      setOutcome(null)
      requestAnimationFrame(() => {
        // Kod zadataka s upisom fokus ostaje u polju za odgovor.
        if (document.activeElement?.tagName !== 'INPUT') promptRef.current?.focus({ preventScroll: true })
      })
      window.scrollTo({ top: 0 })
      return
    }
    const correct = Object.values(firstTry).filter(Boolean).length
    saveSessionResult(topicKey(subject.grade, subject.id, topic.id), correct, total)
    if (settings.sounds) playFinish()
    stopSpeaking()
    setFinished(true)
    window.scrollTo({ top: 0 })
  }

  const topicPath = routes.topic(subject.grade, subject.id, topic.id)

  if (finished) {
    const correct = Object.values(firstTry).filter(Boolean).length
    const mistakes = questions.filter((q) => !q.retry && firstTry[q.key] === false)
    return (
      <Page paper={subject.paper} accent={subject.color}>
        <TopBar back={routes.subject(subject.grade, subject.id)} backLabel="Nazad na teme" title={topic.title} />
        <section className="results" aria-live="polite">
          <div className="stamp-wrap">
            <Stamp verdict={verdictFor(correct, total)} stars={starsFor(correct, total)} ring="★ VJEŽBAONICA ★" />
          </div>
          <p className="results-score">
            {correct} od {total} tačno
          </p>
          <div className="results-actions">
            <button type="button" className="btn btn-primary" onClick={onRestart}>
              Vježbaj ponovo
            </button>
            <a className="btn btn-secondary" href={href(routes.subject(subject.grade, subject.id))}>
              Nazad na teme
            </a>
          </div>
          {mistakes.length > 0 && (
            <section className="mistakes">
              <h2 className="section-title">Pogledaj još jednom</h2>
              <ul>
                {mistakes.map((q) => (
                  <li key={q.key}>
                    <span className="mistake-q">
                      <RichText text={promptFor(q.exercise)} />
                    </span>
                    <span className="mistake-a">
                      <Icon name="check" size={18} /> Tačan odgovor: {correctText(q.exercise)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </section>
      </Page>
    )
  }

  const tone: FooterTone = outcome ? (outcome.correct ? 'correct' : 'wrong') : 'neutral'
  const prompt = promptFor(exercise)
  const bigPrompt = prompt.length <= 16 && !prompt.includes('\n')

  const footer = outcome ? (
    <div className="feedback" role="status">
      <div className="feedback-text">
        <p className="feedback-title">
          <Icon name={outcome.correct ? 'check' : 'cross'} size={28} />
          {outcome.correct ? PRAISE[index % PRAISE.length] : 'Nije tačno'}
        </p>
        {outcome.hint === 'diacritics' && <p>Skoro! Pazi na slova s kvačicama: č, ć, dž, đ, š, ž.</p>}
        {outcome.hint === 'case' && <p>Skoro! Pazi na veliko i malo slovo.</p>}
        {!outcome.correct && (
          <p>
            Tačan odgovor: <strong>{outcome.correctText}</strong>
          </p>
        )}
        {exercise.explanation && (
          <p className="feedback-explanation">
            <RichText text={exercise.explanation} />
          </p>
        )}
        {!outcome.correct && !question.retry && <p className="feedback-note">Ovo pitanje ćemo ponoviti na kraju.</p>}
      </div>
      <button ref={nextButton} type="button" className="btn btn-primary btn-wide" onClick={next}>
        {isLast ? 'Završi' : 'Dalje'}
      </button>
    </div>
  ) : (
    <button type="button" className="btn btn-primary btn-wide" disabled={!isAnswerReady(question, answer)} onClick={check}>
      Provjeri
    </button>
  )

  return (
    <Page paper={subject.paper} accent={subject.color} className="practice" footer={footer} footerTone={tone}>
      <header className="practice-top">
        <a className="icon-btn" href={href(topicPath)} aria-label="Prekini vježbu" title="Prekini vježbu">
          <Icon name="close" />
        </a>
        <ol className="squares" aria-label={`Zadatak ${Math.min(index + 1, total)} od ${total}`}>
          {Array.from({ length: total }, (_, i) => {
            const key = `q${i}`
            const result = firstTry[key]
            const state = result === true ? 'ok' : result === false ? 'bad' : question.key === key ? 'now' : ''
            return (
              <li key={key} className={`square ${state}`}>
                {result === true && <Icon name="check" size={14} />}
                {result === false && <Icon name="cross" size={14} />}
              </li>
            )
          })}
        </ol>
      </header>

      <main className="question" key={`${question.key}-${index}`}>
        {question.retry && <p className="retry-badge">Ponovimo ovo pitanje</p>}
        <div className="question-head">
          <p className="instruction">{instructionFor(exercise)}</p>
          <SpeakButton text={speechTextFor(exercise)} label="Pročitaj zadatak" />
        </div>
        {exercise.picture && (
          <p className="picture" aria-hidden="true">
            {exercise.picture}
          </p>
        )}
        <h1 ref={promptRef} tabIndex={-1} className={`prompt${bigPrompt ? ' prompt-big' : ''}`}>
          <RichText text={prompt} />
        </h1>
        <ExerciseView question={question} answer={answer} onAnswer={setAnswer} outcome={outcome} onSubmit={check} />
      </main>
    </Page>
  )
}
