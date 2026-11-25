import type { LessonBlock } from '../lib/types'
import { RichText } from './RichText'

export function Lesson({ blocks }: { blocks: LessonBlock[] }) {
  return (
    <div className="lesson">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'text':
            return (
              <p key={i}>
                <RichText text={block.text} />
              </p>
            )
          case 'remember':
            return (
              <aside key={i} className="remember">
                <p className="remember-title">Zapamti!</p>
                <p>
                  <RichText text={block.text} />
                </p>
              </aside>
            )
          case 'example':
            return (
              <div key={i} className="example">
                <p className="example-title">{block.title ?? 'Primjer'}</p>
                <p>
                  <RichText text={block.text} />
                </p>
              </div>
            )
          case 'calculation':
            return (
              <figure key={i} className="calculation-wrap">
                {block.title && <figcaption className="example-title">{block.title}</figcaption>}
                <div className="calculation" role="img" aria-label={`${block.rows.join(` ${block.operator} `)} = ${block.result}`}>
                  {block.rows.map((row, r) => (
                    <span key={r} className="calc-row">
                      <span className="calc-op">{r === block.rows.length - 1 ? block.operator : ''}</span>
                      <span className="calc-num">{row}</span>
                    </span>
                  ))}
                  <span className="calc-line" />
                  <span className="calc-row calc-result">
                    <span className="calc-op" />
                    <span className="calc-num">{block.result}</span>
                  </span>
                </div>
              </figure>
            )
          case 'list':
            return (
              <ul key={i}>
                {block.items.map((item, j) => (
                  <li key={j}>
                    <RichText text={item} />
                  </li>
                ))}
              </ul>
            )
        }
      })}
    </div>
  )
}
