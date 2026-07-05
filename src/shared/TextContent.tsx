import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { findMedia } from './types'
import type { Block, MediaItem, Treatment } from './types'
import { textModeOf } from './types'
import { useAssetResolver } from './ArticleRenderer'

/* --- Inline decorations (hover-annotate, inline-link) --------------------- */

function AnnotateSpan({
  phrase,
  config,
  media,
}: {
  phrase: string
  config: Record<string, unknown>
  media: MediaItem[]
}) {
  const resolve = useAssetResolver()
  const popoverType = String(config.popoverType ?? 'text')
  let popover: ReactNode
  if (popoverType === 'image') {
    const item = findMedia(media, config.imageId)
    popover = item?.storedPath ? (
      <img src={resolve(item.storedPath)} alt={item.originalFilename} />
    ) : (
      <em>Pick an image in the block settings.</em>
    )
  } else if (popoverType === 'link') {
    const url = String(config.url ?? '')
    popover = url ? (
      <a href={url} target="_blank" rel="noreferrer">
        {url}
      </a>
    ) : (
      <em>Enter a URL in the block settings.</em>
    )
  } else {
    const t = String(config.text ?? '')
    popover = t ? <span>{t}</span> : <em>Enter popover text in the block settings.</em>
  }
  return (
    <span className="ia-annotate" tabIndex={0}>
      {phrase}
      <span className="ia-popover">{popover}</span>
    </span>
  )
}

/**
 * Renders `text` with phrase decorations applied (first case-insensitive match
 * per decoration; overlapping matches are skipped).
 */
function decorate(text: string, decorations: Treatment[], media: MediaItem[]): ReactNode[] {
  const matches: { start: number; end: number; t: Treatment }[] = []
  const lower = text.toLowerCase()
  for (const t of decorations) {
    const phrase = String(t.config.triggerPhrase ?? '')
    if (!phrase) continue
    const idx = lower.indexOf(phrase.toLowerCase())
    if (idx < 0) continue
    matches.push({ start: idx, end: idx + phrase.length, t })
  }
  matches.sort((a, b) => a.start - b.start)

  const nodes: ReactNode[] = []
  let pos = 0
  for (const m of matches) {
    if (m.start < pos) continue // overlaps a previous decoration
    if (m.start > pos) nodes.push(text.slice(pos, m.start))
    const seg = text.slice(m.start, m.end)
    if (m.t.type === 'inline-link') {
      const url = String(m.t.config.url ?? '')
      nodes.push(
        <a key={`${m.start}-link`} className="ia-inline-link" href={url || '#'} target="_blank" rel="noreferrer">
          {seg}
        </a>,
      )
    } else {
      nodes.push(<AnnotateSpan key={`${m.start}-ann`} phrase={seg} config={m.t.config} media={media} />)
    }
    pos = m.end
  }
  if (pos < text.length) nodes.push(text.slice(pos))
  return nodes
}

/* --- Sentence focus -------------------------------------------------------- */

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?…])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

/**
 * Highlights whichever sentence is closest to the viewport's focus line
 * (slightly above center) while the paragraph is on screen. Distance-based so
 * the last sentences still activate when the page can't scroll further.
 * Also used for scrolly step text when combined with Sentence focus.
 */
export function FocusParagraph({
  text,
  mark,
  decorations = [],
  media = [],
}: {
  text: string
  mark: boolean
  decorations?: Treatment[]
  media?: MediaItem[]
}) {
  const sentences = splitSentences(text)
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
          <span className={`ia-focus${mark ? ' ia-focus-mark' : ''}${i === active ? ' active' : ''}`}>
            {decorate(s, decorations, media)}
          </span>{' '}
        </span>
      ))}
    </p>
  )
}

/* --- Block text ------------------------------------------------------------- */

/**
 * Renders a block's text according to its text mode (plain / heading /
 * sentence-focus) with inline decorations applied, plus any link buttons.
 */
export function TextContent({ block, media }: { block: Block; media: MediaItem[] }) {
  const mode = textModeOf(block)
  const decorations = block.treatments.filter(
    (t) =>
      t.type === 'hover-annotate' ||
      (t.type === 'inline-link' && String(t.config.display ?? 'inline') === 'inline'),
  )
  const buttons = block.treatments.filter(
    (t) => t.type === 'inline-link' && String(t.config.display ?? 'inline') === 'button',
  )

  const text = block.rawText
  let body: ReactNode = null
  if (text.trim()) {
    if (mode.type === 'heading') {
      const level = Number(mode.config.level ?? 1)
      body = <h2 className={`ia-heading ia-heading-${level >= 1 && level <= 3 ? level : 1}`}>{decorate(text, decorations, media)}</h2>
    } else if (mode.type === 'sentence-focus') {
      body = (
        <FocusParagraph
          text={text}
          mark={String(mode.config.style ?? 'dim') === 'mark'}
          decorations={decorations}
          media={media}
        />
      )
    } else {
      body = <p className="ia-paragraph">{decorate(text, decorations, media)}</p>
    }
  }

  if (!body && buttons.length === 0) return null
  return (
    <>
      {body}
      {buttons.map((t, i) => {
        const url = String(t.config.url ?? '')
        return (
          <p key={i} className="ia-link-button-row">
            <a className="ia-link-button" href={url || '#'} target="_blank" rel="noreferrer">
              {String(t.config.label ?? '') || url || 'Learn more'}
            </a>
          </p>
        )
      })}
    </>
  )
}
