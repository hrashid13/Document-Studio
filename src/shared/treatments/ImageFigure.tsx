import { findMedia } from '../types'
import { useAssetResolver } from '../ArticleRenderer'
import type { TreatmentProps } from '../ArticleRenderer'

export function ImageFigure({ block, media }: TreatmentProps) {
  const resolve = useAssetResolver()
  const cfg = block.treatment.config
  const item = findMedia(media, cfg.imageId)
  const caption = String(cfg.caption ?? '')

  return (
    <div>
      {item?.storedPath ? (
        <figure className="ia-figure">
          <img src={resolve(item.storedPath)} alt={caption || item.originalFilename} />
          {caption && <figcaption>{caption}</figcaption>}
        </figure>
      ) : (
        <div className="ia-compare-placeholder">Image figure: pick an image in the block settings.</div>
      )}
      {block.rawText && <p className="ia-paragraph">{block.rawText}</p>}
    </div>
  )
}
