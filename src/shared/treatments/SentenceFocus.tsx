import { useEffect, useRef, useState } from 'react'
import type { TreatmentProps } from '../ArticleRenderer'

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?…])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

/**
 * Highlights whichever sentence is closest to the viewport's focus line
 * (slightly above center) while the paragraph is on screen. Distance-based
 * rather than an intersection band so the last sentences still activate when
 * the page can't scroll any further.
 */
export function SentenceFocus({ block }: TreatmentProps) {
  const mark = String(block.treatment.config.style ?? 'dim') === 'mark'
  const sentences = splitSentences(block.rawText)
  const ref = useRef<HTMLParagraphElement>(null)
  const [active, setActive] = useState(-1)

  useEffect(() => {
    const update = () => {
      const p = ref.current
      if (!p) return
      const viewH = window.innerHeight
      const pr = p.getBoundingClientRect()
      if (pr.bottom < 0 || pr.top > viewH) {
        setActive(-1)
        return
      }
      const focusY = viewH * 0.45
      let best = -1
      let bestDist = Infinity
      p.querySelectorAll<HTMLSpanElement>('.ia-focus').forEach((span, i) => {
        const r = span.getBoundingClientRect()
        const dist = Math.abs(r.top + r.height / 2 - focusY)
        if (dist < bestDist) {
          bestDist = dist
          best = i
        }
      })
      setActive(best)
    }
    update()
    // Capture-phase so scrolls inside inner containers (studio preview) fire too.
    document.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      document.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <p className="ia-paragraph" ref={ref}>
      {sentences.map((s, i) => (
        <span key={i}>
          <span className={`ia-focus${mark ? ' ia-focus-mark' : ''}${i === active ? ' active' : ''}`}>{s}</span>{' '}
        </span>
      ))}
    </p>
  )
}
