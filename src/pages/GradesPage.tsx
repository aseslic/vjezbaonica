import { catalog, gradeLabel } from '../content'
import { Cover } from '../components/Cover'
import { LogoMark } from '../components/Icon'
import { Page, TopBar } from '../components/Layout'
import { href, routes } from '../lib/router'
import { updateSettings } from '../lib/settings'

const GRADE_COLORS = ['#F2A93B', '#2F6FED', '#E04A5A', '#2E9E5B', '#8A5CF6', '#E2702E', '#1E9AA8', '#C2477F', '#5C6BC0']

/** Odabir razreda. Kod prvog pokretanja (`firstRun`) prikazuje se umjesto početne stranice. */
export function GradesPage({ firstRun = false }: { firstRun?: boolean }) {
  return (
    <Page paper="grid">
      {firstRun ? (
        <header className="home-top">
          <span className="brand">
            <LogoMark size={36} />
            <span className="brand-name">Vježbaonica</span>
          </span>
        </header>
      ) : (
        <TopBar back={routes.home()} />
      )}
      <h1 className="page-title">{firstRun ? 'U koji razred ideš?' : 'Odaberi razred'}</h1>
      {firstRun && <p className="lead">Razred možeš kasnije promijeniti u postavkama.</p>}
      <div className="covers">
        {catalog.grades.map(({ grade, subjects }) => (
          <div key={grade} className="cover-with-note">
            <Cover
              href={href(routes.home())}
              onClick={() => updateSettings({ grade })}
              color={GRADE_COLORS[(grade - 1) % GRADE_COLORS.length]}
              icon={<span className="cover-number">{grade}.</span>}
              name={gradeLabel(grade)}
            />
            <p className="cover-note">{subjects.map((s) => s.shortName ?? s.name).join(', ')}</p>
          </div>
        ))}
      </div>
    </Page>
  )
}
