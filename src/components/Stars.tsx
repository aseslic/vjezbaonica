import type { Stars as StarCount } from '../lib/session'

const STAR = 'M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3-4.6-4.4 6.3-.9z'

export function Stars({ count, size = 22 }: { count: StarCount; size?: number }) {
  return (
    <span className="stars" role="img" aria-label={`${count} od 3 zvjezdice`}>
      {[0, 1, 2].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d={STAR} className={i < count ? 'star-on' : 'star-off'} strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      ))}
    </span>
  )
}
