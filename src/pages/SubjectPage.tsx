import { findSubject, gradeLabel } from '../content'
import { Page, TopBar } from '../components/Layout'
import { Stars } from '../components/Stars'
import { topicKey, useProgress } from '../lib/progress'
import { href, routes } from '../lib/router'
import { NotFoundPage } from './NotFoundPage'

export function SubjectPage({ grade, subject: subjectId }: { grade: string; subject: string }) {
  const g = Number(grade)
  const subject = findSubject(g, subjectId)
  const progress = useProgress()
  if (!subject) return <NotFoundPage />

  return (
    <Page paper={subject.paper} accent={subject.color}>
      <TopBar back={routes.home()} title={gradeLabel(g)} />
      <header className="subject-head">
        <span className="subject-icon" aria-hidden="true">
          {subject.icon}
        </span>
        <h1 className="page-title">{subject.name}</h1>
      </header>
      <ol className="topic-list">
        {subject.topics.map((topic, i) => {
          const best = progress.topics[topicKey(g, subject.id, topic.id)]
          return (
            <li key={topic.id}>
              <a className="topic-row" href={href(routes.topic(g, subject.id, topic.id))}>
                <span className="topic-num" aria-hidden="true">
                  {i + 1}.
                </span>
                <span className="topic-text">
                  <span className="topic-title">{topic.title}</span>
                  {topic.description && <span className="topic-desc">{topic.description}</span>}
                  <Stars count={best?.bestStars ?? 0} size={18} />
                </span>
              </a>
            </li>
          )
        })}
      </ol>
    </Page>
  )
}
