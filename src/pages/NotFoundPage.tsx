import { Page, TopBar } from '../components/Layout'
import { href, routes } from '../lib/router'

export function NotFoundPage() {
  return (
    <Page paper="grid">
      <TopBar back={routes.home()} title="Vježbaonica" />
      <h1 className="page-title">Ova stranica ne postoji</h1>
      <p>Možda je tema preimenovana ili uklonjena.</p>
      <a className="btn btn-primary" href={href(routes.home())}>
        Idi na početnu
      </a>
    </Page>
  )
}
