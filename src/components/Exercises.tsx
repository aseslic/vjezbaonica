import { useEffect, useRef } from 'react'
import { acceptedAnswers, isNumericAnswer } from '../lib/answers'
import type { Answer, Outcome, SessionQuestion } from '../lib/session'
import type { ChoiceExercise, InputExercise, OrderExercise, TrueFalseExercise } from '../lib/types'
import { Icon } from './Icon'
import { RichText } from './RichText'

interface ViewProps {
  question: SessionQuestion
  answer: Answer | null
  onAnswer: (answer: Answer) => void
  outcome: Outcome | null
  onSubmit: () => void
}

export function ExerciseView(props: ViewProps) {
  switch (props.question.exercise.type) {
    case 'choice':
      return <ChoiceView {...props} exercise={props.question.exercise} />
    case 'input':
      return <InputView {...props} exercise={props.question.exercise} />
    case 'truefalse':
      return <TrueFalseView {...props} exercise={props.question.exercise} />
    case 'order':
      return <OrderView {...props} exercise={props.question.exercise} />
  }
}

type OptionState = '' | 'selected' | 'correct' | 'reveal' | 'wrong' | 'dim'

function optionState(isAnswer: boolean, selected: boolean, checked: boolean): OptionState {
  if (!checked) return selected ? 'selected' : ''
  if (isAnswer) return selected ? 'correct' : 'reveal'
  return selected ? 'wrong' : 'dim'
}

function StateMark({ state }: { state: OptionState }) {
  if (state === 'correct' || state === 'reveal') return <Icon name="check" />
  if (state === 'wrong') return <Icon name="cross" />
  return null
}

function ChoiceView({ question, exercise, answer, onAnswer, outcome }: ViewProps & { exercise: ChoiceExercise }) {
  const options = question.options ?? exercise.options
  const size = options.every((o) => o.length <= 4) ? ' options-compact' : options.every((o) => o.length <= 18) ? ' options-short' : ''
  return (
    <div className={`options${size}`} role="group" aria-label="Ponuđeni odgovori">
      {options.map((option) => {
        const selected = answer === option
        const state = optionState(option === exercise.answer, selected, outcome !== null)
        return (
          <button
            key={option}
            type="button"
            className={`option ${state}`}
            aria-pressed={selected}
            disabled={outcome !== null}
            onClick={() => onAnswer(option)}
          >
            <span className="option-text">
              <RichText text={option} />
            </span>
            <StateMark state={state} />
          </button>
        )
      })}
    </div>
  )
}

function TrueFalseView({ exercise, answer, onAnswer, outcome }: ViewProps & { exercise: TrueFalseExercise }) {
  const choices: Array<{ value: boolean; label: string }> = [
    { value: true, label: 'Tačno' },
    { value: false, label: 'Netačno' },
  ]
  return (
    <div className="options options-truefalse" role="group" aria-label="Tačno ili netačno">
      {choices.map(({ value, label }) => {
        const selected = answer === value
        const state = optionState(value === exercise.answer, selected, outcome !== null)
        return (
          <button
            key={label}
            type="button"
            className={`option tf-${value ? 'yes' : 'no'} ${state}`}
            aria-pressed={selected}
            disabled={outcome !== null}
            onClick={() => onAnswer(value)}
          >
            <span className="tf-symbol" aria-hidden="true">
              <Icon name={value ? 'check' : 'cross'} size={30} />
            </span>
            <span className="option-text">{label}</span>
          </button>
        )
      })}
    </div>
  )
}

const LETTERS = ['č', 'ć', 'dž', 'đ', 'š', 'ž']
const CAPITALS = ['Č', 'Ć', 'Dž', 'Đ', 'Š', 'Ž']

function InputView({ exercise, answer, onAnswer, outcome, onSubmit }: ViewProps & { exercise: InputExercise }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const numeric = acceptedAnswers(exercise.answer).every(isNumericAnswer)
  const value = typeof answer === 'string' ? answer : ''

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true })
  }, [])

  const insert = (text: string) => {
    const el = inputRef.current
    const start = el?.selectionStart ?? value.length
    const end = el?.selectionEnd ?? value.length
    onAnswer(value.slice(0, start) + text + value.slice(end))
    requestAnimationFrame(() => {
      el?.focus()
      el?.setSelectionRange(start + text.length, start + text.length)
    })
  }

  const state = outcome === null ? '' : outcome.correct ? 'correct' : 'wrong'
  const letters = exercise.caseSensitive ? [...LETTERS, ...CAPITALS] : LETTERS

  return (
    <form
      className="answer-form"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <input
        ref={inputRef}
        className={`answer-input${numeric ? ' numeric' : ''} ${state}`}
        value={value}
        onChange={(event) => onAnswer(numeric ? event.target.value.replace(/[^\d]/g, '') : event.target.value)}
        disabled={outcome !== null}
        inputMode={numeric ? 'numeric' : 'text'}
        enterKeyHint="done"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        maxLength={numeric ? 8 : 120}
        aria-label="Tvoj odgovor"
        placeholder={numeric ? '?' : 'Upiši ovdje'}
      />
      {!numeric && outcome === null && (
        <div className="letters" role="group" aria-label="Slova s kvačicama">
          {letters.map((letter) => (
            <button
              key={letter}
              type="button"
              className="letter"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => insert(letter)}
            >
              {letter}
            </button>
          ))}
        </div>
      )}
    </form>
  )
}

function OrderView({ question, exercise, answer, onAnswer, outcome }: ViewProps & { exercise: OrderExercise }) {
  const scrambled = question.scrambled ?? exercise.items
  const placed = Array.isArray(answer) ? answer : []
  const remaining = scrambled.map((_, i) => i).filter((i) => !placed.includes(i))
  const checked = outcome !== null

  return (
    <div className="order">
      <ol className="order-slots" aria-label="Tvoj redoslijed">
        {exercise.items.map((item, slot) => {
          const index = placed[slot]
          if (index === undefined) {
            return (
              <li key={slot} className="slot empty" aria-label={`Mjesto ${slot + 1} je prazno`}>
                {slot + 1}
              </li>
            )
          }
          const state = checked ? (scrambled[index] === item ? 'correct' : 'wrong') : ''
          return (
            <li key={slot} className={`slot ${state}`}>
              <button
                type="button"
                className="tile placed"
                disabled={checked}
                onClick={() => onAnswer(placed.filter((p) => p !== index))}
                aria-label={`${scrambled[index]} – dodirni da vratiš`}
              >
                {scrambled[index]}
              </button>
            </li>
          )
        })}
      </ol>
      {!checked && remaining.length > 0 && (
        <div className="order-pool" role="group" aria-label="Dodirni redom">
          {remaining.map((i) => (
            <button key={i} type="button" className="tile" onClick={() => onAnswer([...placed, i])}>
              {scrambled[i]}
            </button>
          ))}
        </div>
      )}
      {!checked && placed.length > 0 && (
        <button type="button" className="link-btn" onClick={() => onAnswer([])}>
          Kreni ispočetka
        </button>
      )}
    </div>
  )
}
