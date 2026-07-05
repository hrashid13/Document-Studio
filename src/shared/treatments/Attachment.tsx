import { findMedia } from '../types'
import type { MediaItem } from '../types'
import { useAssetResolver } from '../ArticleRenderer'

export function Attachment({ config, media }: { config: Record<string, unknown>; media: MediaItem[] }) {
  const resolve = useAssetResolver()
  const item = findMedia(media, config.fileId)
  const label = String(config.label ?? '') || item?.originalFilename || 'Attachment'

  if (!item?.storedPath) {
    return <div className="ia-compare-placeholder">Attachment: pick a file in the block settings.</div>
  }
  return (
    <a className="ia-attachment" href={resolve(item.storedPath)} download={item.originalFilename}>
      <span className="ia-attachment-icon">📎</span>
      <span>
        <span className="ia-attachment-name">{label}</span>
        <br />
        <span className="ia-attachment-hint">Click to download</span>
      </span>
    </a>
  )
}
