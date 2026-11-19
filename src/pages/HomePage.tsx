import { catalog, findSubject, findTopic, gradeLabel, resolveGrade } from '../content'
import { Cover } from '../components/Cover'
import { Icon, LogoMark } from '../components/Icon'
import { Page } from '../components/Layout'
import { countLabel } from '../lib/plural'
import { currentStreak, todayString, lastPlayedKey, topicKey, useProgress } from '../lib/progress'
import { href, routes } from '../lib/router'
import { useSettings } from '../lib/settings'
import { GradesPage } from './GradesPage'

export function HomePage() {
  const settings = useSettings()
  const progress = useProgress()
  const entry = resolveGrade(settings.grade)

  // Prvo pokretanje: prvo pitamo za razred.
  if (settings.grade === null && catalog.grades.length > 1) return <GradesPage firstRun />

  if (!entry) {
    return (
      <Page>
        <h1 className="page-title">Još nema sadržaja</h1>
        <p>Dodaj JSON datoteku s lekcijama u folder src/content/ (upute su u docs/SADRZAJ.md).</p>
      </Page>
    )
  }

  const streak = currentStreak(progress, todayString())
  const lastKey = lastPlayedKey(progress)
  const [lastGrade, lastSubjectId, lastTopicId] = lastKey?.split('/') ?? []
  const lastTopic =
    lastKey && Number(lastGrade) === entry.grade ? findTopic(entry.grade, lastSubjectId, lastTopicId) : undefined
  const lastSubject = lastTopic ? findSubject(entry.grade, lastSubjectId) : undefined

  return (
    <Page paper="grid" className="home">
      <header className="home-top">
        <span className="brand">
          <LogoMark size={36} />
          <span className="brand-name">Vježbaonica</span>
        </span>
        <nav className="home-nav" aria-label="Glavni meni">
          <a className="icon-btn" href={href(routes.progress())} aria-label="Moj napredak" title="Moj napredak">
            <Icon name="star" />
          </a>
          <a className="icon-btn" href={href(routes.settings())} aria-label="Postavke" title="Postavke">
            <Icon name="settings" />
          </a>
        </nav>
      </header>

      <section className="home-hero">
        <h1 className="home-title">Šta danas vježbamo?</h1>
        <div className="home-meta">
          {catalog.grades.length > 1 ? (
            <a className="grade-chip" href={href(routes.grades())}>
              {gradeLabel(entry.grade)}
              <span className="grade-chip-action">promijeni</span>
            </a>
          ) : (
            <span className="grade-chip static">{gradeLabel(entry.grade)}</span>
          )}
          {streak > 0 && (
            <span className="streak" title="Dani zaredom s vježbom">
              <span aria-hidden="true">🔥</span> {countLabel(streak, 'dan', 'dana', 'dana')} zaredom
            </span>
          )}
        </div>
      </section>

      {lastTopic && lastSubject && (
        <a className="continue" href={href(routes.topic(entry.grade, lastSubject.id, lastTopic.id))}>
          <span className="continue-icon" aria-hidden="true">
            {lastSubject.icon}
          </span>
          <span>
            <span className="continue-caption">Nastavi s vježbanjem</span>
            <span className="continue-title">{lastTopic.title}</span>
          </span>
        </a>
      )}

      <div className="covers">
        {entry.subjects.map((subject) => (
          <Cover
            key={subject.id}
            href={href(routes.subject(entry.grade, subject.id))}
            color={subject.color}
            icon={subject.icon}
            labelCaption="Predmet:"
            name={subject.shortName ?? subject.name}
            progress={subject.topics.map(
              (t) => (progress.topics[topicKey(entry.grade, subject.id, t.id)]?.bestStars ?? 0) > 0,
            )}
          />
        ))}
      </div>
    </Page>
  )
}
