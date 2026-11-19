import { useState } from 'react'
import { catalog, gradeLabel } from '../content'
import { Page, TopBar } from '../components/Layout'
import { Stars } from '../components/Stars'
import { currentStreak, todayString, resetProgress, topicKey, useProgress } from '../lib/progress'
import { routes } from '../lib/router'

export function ProgressPage() {
  const progress = useProgress()
  const [confirming, setConfirming] = useState(false)
  const streak = currentStreak(progress, todayString())
  const percent = progress.totalAnswered > 0 ? Math.round((progress.totalCorrect / progress.totalAnswered) * 100) : 0
  const started = Object.keys(progress.topics).length > 0

  return (
    <Page paper="grid">
      <TopBar back={routes.home()} title="Moj napredak" />

      <section className="report" aria-label="Đačka knjižica">
        <h1 className="report-title">Đačka knjižica</h1>
        <dl className="report-rows">
          <div>
            <dt>Riješeno zadataka</dt>
            <dd>{progress.totalAnswered}</dd>
          </div>
          <div>
            <dt>Tačnih odgovora</dt>
            <dd>{progress.totalAnswered > 0 ? `${progress.totalCorrect} (${percent} %)` : '–'}</dd>
          </div>
          <div>
            <dt>Dana zaredom</dt>
            <dd>{streak > 0 ? `${streak} 🔥` : '–'}</dd>
          </div>
        </dl>
      </section>

      {!started && <p className="empty-note">Kad završiš prvu vježbu, ovdje će se pojaviti tvoje zvjezdice.</p>}

      {catalog.grades.map(({ grade, subjects }) => {
        const played = subjects.some((s) => s.topics.some((t) => progress.topics[topicKey(grade, s.id, t.id)]))
        if (!played) return null
        return (
          <section key={grade} className="progress-grade">
            <h2 className="section-title">{gradeLabel(grade)}</h2>
            {subjects.map((subject) => (
              <div key={subject.id} className="progress-subject">
                <h3 className="progress-subject-title">
                  <span aria-hidden="true">{subject.icon}</span> {subject.shortName ?? subject.name}
                </h3>
                <ul className="progress-topics">
                  {subject.topics.map((topic) => {
                    const p = progress.topics[topicKey(grade, subject.id, topic.id)]
                    return (
                      <li key={topic.id}>
                        <span>{topic.title}</span>
                        <Stars count={p?.bestStars ?? 0} size={18} />
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </section>
        )
      })}

      <section className="danger-zone">
        <p className="empty-note">Napredak se čuva samo na ovom uređaju.</p>
        {started &&
          (confirming ? (
            <div className="confirm" role="alertdialog" aria-label="Potvrda brisanja">
              <p>Sigurno? Ovo briše sve zvjezdice i rezultate.</p>
              <div className="confirm-actions">
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    resetProgress()
                    setConfirming(false)
                  }}
                >
                  Da, obriši
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setConfirming(false)}>
                  Odustani
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="link-btn danger" onClick={() => setConfirming(true)}>
              Obriši napredak
            </button>
          ))}
      </section>
    </Page>
  )
}
