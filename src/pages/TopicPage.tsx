import { findSubject, findTopic } from '../content'
import { Page, TopBar } from '../components/Layout'
import { Lesson } from '../components/Lesson'
import { lessonText } from '../lib/lessonText'
import { SpeakButton } from '../components/SpeakButton'
import { Stars } from '../components/Stars'
import { countLabel } from '../lib/plural'
import { topicKey, useProgress } from '../lib/progress'
import { href, routes } from '../lib/router'
import { buildPool } from '../lib/session'
import { useSettings } from '../lib/settings'
import { createRng } from '../lib/random'
import { NotFoundPage } from './NotFoundPage'

interface Params {
  grade: string
  subject: string
  topic: string
}

export function TopicPage({ grade, subject: subjectId, topic: topicId }: Params) {
  const g = Number(grade)
  const subject = findSubject(g, subjectId)
  const topic = findTopic(g, subjectId, topicId)
  const progress = useProgress()
  const { sessionSize } = useSettings()
  if (!subject || !topic) return <NotFoundPage />

  const best = progress.topics[topicKey(g, subject.id, topic.id)]
  const available = buildPool(topic, createRng(1)).length
  const count = Math.min(sessionSize, available)

  return (
    <Page
      paper={subject.paper}
      accent={subject.color}
      footer={
        <a className="btn btn-primary btn-wide" href={href(routes.practice(g, subject.id, topic.id))}>
          Vježbaj ({countLabel(count, 'zadatak', 'zadatka', 'zadataka')})
        </a>
      }
    >
      <TopBar back={routes.subject(g, subject.id)} title={subject.shortName ?? subject.name} />
      <header className="topic-head">
        <h1 className="page-title">{topic.title}</h1>
        {topic.lesson.length > 0 && <SpeakButton text={`${topic.title}. ${lessonText(topic.lesson)}`} label="Pročitaj lekciju" />}
      </header>
      {best && (
        <p className="best">
          Najbolji rezultat: <Stars count={best.bestStars} size={20} />
        </p>
      )}
      {topic.lesson.length > 0 ? (
        <Lesson blocks={topic.lesson} />
      ) : (
        <p className="lesson-empty">Ova tema nema lekciju. Kreni odmah na vježbu.</p>
      )}
    </Page>
  )
}
