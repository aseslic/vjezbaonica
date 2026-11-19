import { Fragment } from 'react'

/**
 * Tekst iz sadržaja: **riječ** se ističe žutim signirom, a novi red (\n) prelama liniju.
 */
export function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, li) => (
        <Fragment key={li}>
          {li > 0 && <br />}
          {line.split('**').map((part, i) => (i % 2 === 1 ? <mark key={i}>{part}</mark> : <Fragment key={i}>{part}</Fragment>))}
        </Fragment>
      ))}
    </>
  )
}
