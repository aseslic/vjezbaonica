import type { CSSProperties, ReactNode } from 'react'

interface CoverProps {
  href: string
  color: string
  icon: ReactNode
  /** Mali natpis na naljepnici, kao na pravoj svesci ("Predmet:"). */
  labelCaption?: string
  name: string
  /** Kockice napretka: jedna po temi, popunjena kad tema ima barem jednu zvjezdicu. */
  progress?: boolean[]
  onClick?: () => void
}

/** Korice sveske: predmet ili razred. */
export function Cover({ href, color, icon, labelCaption, name, progress, onClick }: CoverProps) {
  const done = progress?.filter(Boolean).length ?? 0
  return (
    <a className="cover" href={href} onClick={onClick} style={{ '--cover': color } as CSSProperties}>
      <span className="cover-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="cover-label">
        {labelCaption && <span className="cover-caption">{labelCaption}</span>}
        <span className="cover-name">{name}</span>
        {progress && progress.length > 0 && (
          <span className="cover-progress" role="img" aria-label={`Urađeno ${done} od ${progress.length} tema`}>
            {progress.map((on, i) => (
              <i key={i} className={on ? 'on' : undefined} />
            ))}
          </span>
        )}
      </span>
    </a>
  )
}
