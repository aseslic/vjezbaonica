import type { CSSProperties, ReactNode } from 'react'
import { href } from '../lib/router'
import type { Paper } from '../lib/types'
import { Icon } from './Icon'

export type FooterTone = 'neutral' | 'correct' | 'wrong'

interface PageProps {
  paper?: Paper
  className?: string
  /** Boja predmeta (korice) – koristi se za akcente na stranici. */
  accent?: string
  footer?: ReactNode
  footerTone?: FooterTone
  children: ReactNode
}

/** Stranica sveske: kockice ili linije, s crvenom marginom. */
export function Page({ paper = 'grid', className = '', accent, footer, footerTone = 'neutral', children }: PageProps) {
  const style = accent ? ({ '--accent': accent } as CSSProperties) : undefined
  return (
    <div className={`page paper-${paper} ${className}`} style={style}>
      <div className="page-inner">{children}</div>
      {footer && (
        <div className={`page-footer tone-${footerTone}`}>
          <div className="page-footer-inner">{footer}</div>
        </div>
      )}
    </div>
  )
}

interface TopBarProps {
  back?: string
  backLabel?: string
  title?: ReactNode
  actions?: ReactNode
}

export function TopBar({ back, backLabel = 'Nazad', title, actions }: TopBarProps) {
  return (
    <header className="topbar">
      {back && (
        <a className="icon-btn" href={href(back)} aria-label={backLabel}>
          <Icon name="back" />
        </a>
      )}
      <div className="topbar-title">{title}</div>
      {actions && <div className="topbar-actions">{actions}</div>}
    </header>
  )
}
