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
