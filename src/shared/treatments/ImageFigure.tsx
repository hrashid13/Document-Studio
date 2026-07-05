import { findMedia } from '../types'
import type { MediaItem } from '../types'
import { useAssetResolver } from '../ArticleRenderer'

export function ImageFigure({ config, media }: { config: Record<string, unknown>; media: MediaItem[] }) {
  const resolve = useAssetResolver()
  const item = findMedia(media, config.imageId)
  const caption = String(config.caption ?? '')

  if (!item?.storedPath) {
    return <div className="ia-compare-placeholder">Image figure: pick an image in the block settings.</div>
  }
  return (
    <figure className="ia-figure">
      <img src={resolve(item.storedPath)} alt={caption || item.originalFilename} />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}
