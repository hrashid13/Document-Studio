import { findMedia } from '../types'
import { useAssetResolver } from '../ArticleRenderer'
import type { TreatmentProps } from '../ArticleRenderer'

export function HoverAnnotate({ block, media }: TreatmentProps) {
  const resolve = useAssetResolver()
  const cfg = block.treatment.config
  const phrase = String(cfg.triggerPhrase ?? '')
  const text = block.rawText

  const index = phrase ? text.toLowerCase().indexOf(phrase.toLowerCase()) : -1
  if (index < 0) {
    return <p className="ia-paragraph">{text}</p>
  }

  const before = text.slice(0, index)
  const match = text.slice(index, index + phrase.length)
  const after = text.slice(index + phrase.length)

  const popoverType = String(cfg.popoverType ?? 'text')
  let popover = null
  if (popoverType === 'image') {
    const item = findMedia(media, cfg.imageId)
    popover = item?.storedPath ? (
      <img src={resolve(item.storedPath)} alt={item.originalFilename} />
    ) : (
      <em>Pick an image in the block settings.</em>
    )
  } else if (popoverType === 'link') {
    const url = String(cfg.url ?? '')
    popover = url ? (
      <a href={url} target="_blank" rel="noreferrer">
        {url}
      </a>
    ) : (
      <em>Enter a URL in the block settings.</em>
    )
  } else {
    const t = String(cfg.text ?? '')
    popover = t ? <span>{t}</span> : <em>Enter popover text in the block settings.</em>
  }

  return (
    <p className="ia-paragraph">
      {before}
      <span className="ia-annotate" tabIndex={0}>
        {match}
        <span className="ia-popover">{popover}</span>
      </span>
      {after}
    </p>
  )
}
