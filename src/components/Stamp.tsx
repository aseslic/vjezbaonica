import { useId } from 'react'
import type { Stars } from '../lib/session'

const STAR = 'M0-10.5l3.1 6.3 6.9 1-5 4.9 1.2 6.9L0 5.3l-6.2 3.3 1.2-6.9-5-4.9 6.9-1z'

interface StampProps {
  verdict: string
  stars: Stars
  ring: string
}

/** Učiteljev pečat na kraju vježbe. */
export function Stamp({ verdict, stars, ring }: StampProps) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const long = verdict.length > 9
  return (
    <svg className="stamp" viewBox="0 0 240 240" role="img" aria-label={`Pečat: ${verdict} ${stars} od 3 zvjezdice`}>
      <defs>
        <path id={`${id}-ring`} d="M120 120m-91 0a91 91 0 1 1 182 0a91 91 0 1 1-182 0" />
        <filter id={`${id}-ink`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="noise" />
          <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 7 0 0 0 -2.1" result="mask" />
          <feComposite in="SourceGraphic" in2="mask" operator="in" />
        </filter>
      </defs>
      <g filter={`url(#${id}-ink)`}>
        <circle cx="120" cy="120" r="113" fill="none" stroke="currentColor" strokeWidth="7" />
        <circle cx="120" cy="120" r="76" fill="none" stroke="currentColor" strokeWidth="3" />
        <text fontSize="16" fontWeight="700" letterSpacing="2.5" fill="currentColor">
          <textPath href={`#${id}-ring`} startOffset="25%" textAnchor="middle">
            {ring}
          </textPath>
        </text>
        <text
          x="120"
          y="122"
          textAnchor="middle"
          fontSize={long ? 26 : 32}
          fontWeight="700"
          fill="currentColor"
          {...(long ? { textLength: 140, lengthAdjust: 'spacingAndGlyphs' } : {})}
        >
          {verdict}
        </text>
        <g transform="translate(120 156)">
          {[-26, 0, 26].map((x, i) => (
            <path
              key={x}
              d={STAR}
              transform={`translate(${x} 0)`}
              fill={i < stars ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          ))}
        </g>
      </g>
    </svg>
  )
}
