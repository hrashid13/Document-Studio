import { findMedia } from '../types'
import { useAssetResolver } from '../ArticleRenderer'
import type { TreatmentProps } from '../ArticleRenderer'

export function Attachment({ block, media }: TreatmentProps) {
  const resolve = useAssetResolver()
  const cfg = block.treatment.config
  const item = findMedia(media, cfg.fileId)
  const label = String(cfg.label ?? '') || item?.originalFilename || 'Attachment'

  return (
    <div>
      {item?.storedPath ? (
        <a className="ia-attachment" href={resolve(item.storedPath)} download={item.originalFilename}>
          <span className="ia-attachment-icon">📎</span>
          <span>
            <span className="ia-attachment-name">{label}</span>
            <br />
            <span className="ia-attachment-hint">Click to download</span>
          </span>
        </a>
      ) : (
        <div className="ia-compare-placeholder">Attachment: pick a file in the block settings.</div>
      )}
      {block.rawText && <p className="ia-paragraph">{block.rawText}</p>}
    </div>
  )
}
