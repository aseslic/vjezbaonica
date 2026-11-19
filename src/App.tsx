import { useEffect } from 'react'
import { matchPath, usePath } from './lib/router'
import { GradesPage } from './pages/GradesPage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PracticePage } from './pages/PracticePage'
import { ProgressPage } from './pages/ProgressPage'
import { SettingsPage } from './pages/SettingsPage'
import { SubjectPage } from './pages/SubjectPage'
import { TopicPage } from './pages/TopicPage'

function Routes({ path }: { path: string }) {
  if (path === '/') return <HomePage />
  if (path === '/razred') return <GradesPage />
  if (path === '/napredak') return <ProgressPage />
  if (path === '/postavke') return <SettingsPage />

  const practice = matchPath('/razred/:grade/:subject/:topic/vjezba', path)
  if (practice) return <PracticePage key={path} grade={practice.grade} subject={practice.subject} topic={practice.topic} />
  const topic = matchPath('/razred/:grade/:subject/:topic', path)
  if (topic) return <TopicPage grade={topic.grade} subject={topic.subject} topic={topic.topic} />
  const subject = matchPath('/razred/:grade/:subject', path)
  if (subject) return <SubjectPage grade={subject.grade} subject={subject.subject} />

  return <NotFoundPage />
}

export default function App() {
  const path = usePath()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [path])
  return <Routes path={path} />
}
