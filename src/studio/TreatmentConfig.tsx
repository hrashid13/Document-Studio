import type { Block, MediaItem } from '../shared/types'

interface Props {
  block: Block
  media: MediaItem[]
  compact?: boolean
  onConfig: (patch: Record<string, unknown>) => void
}

function ImagePicker({
  label,
  value,
  media,
  onChange,
}: {
  label: string
  value: unknown
  media: MediaItem[]
  onChange: (id: string) => void
}) {
  const images = media.filter((m) => m.type === 'image')
  return (
    <label className="field">
      <span>{label}</span>
      <select value={String(value ?? '')} onChange={(e) => onChange(e.target.value)}>
        <option value="">— none —</option>
        {images.map((m) => (
          <option key={m.id} value={m.id}>
            {m.originalFilename}
            {m.tags.length ? ` (${m.tags.join(', ')})` : ''}
          </option>
        ))}
      </select>
    </label>
  )
}

/**
 * Config controls for a block's treatment. `compact` renders only the primary
 * fields (shown inline on storyboard cards); the full form lives in the
 * Inspector.
 */
export function TreatmentConfig({ block, media, compact = false, onConfig }: Props) {
  const cfg = block.treatment.config

  switch (block.treatment.type) {
    case 'scroll-reveal':
      return (
        <div className="config-form">
          <label className="field">
            <span>Direction</span>
            <select
              value={String(cfg.direction ?? 'up')}
              onChange={(e) => onConfig({ direction: e.target.value })}
            >
              <option value="up">Up</option>
              <option value="left">From left</option>
              <option value="right">From right</option>
            </select>
          </label>
          {!compact && (
            <label className="field">
              <span>Delay (seconds)</span>
              <input
                type="number"
                min={0}
                step={0.1}
                value={Number(cfg.delay ?? 0)}
                onChange={(e) => onConfig({ delay: Number(e.target.value) || 0 })}
              />
            </label>
          )}
        </div>
      )

    case 'drag-compare':
      return (
        <div className="config-form">
          <ImagePicker label="Image A (left / before)" value={cfg.imageA} media={media} onChange={(id) => onConfig({ imageA: id })} />
          <ImagePicker label="Image B (right / after)" value={cfg.imageB} media={media} onChange={(id) => onConfig({ imageB: id })} />
          {!compact && (
            <>
              <label className="field">
                <span>Label A</span>
                <input value={String(cfg.labelA ?? '')} onChange={(e) => onConfig({ labelA: e.target.value })} />
              </label>
              <label className="field">
                <span>Label B</span>
                <input value={String(cfg.labelB ?? '')} onChange={(e) => onConfig({ labelB: e.target.value })} />
              </label>
            </>
          )}
        </div>
      )

    case 'hover-annotate': {
      const popoverType = String(cfg.popoverType ?? 'text')
      return (
        <div className="config-form">
          <label className="field">
            <span>Trigger phrase (must appear in the block text)</span>
            <input
              value={String(cfg.triggerPhrase ?? '')}
              placeholder="e.g. the turning point"
              onChange={(e) => onConfig({ triggerPhrase: e.target.value })}
            />
          </label>
          {!compact && (
            <>
              <label className="field">
                <span>Popover type</span>
                <select value={popoverType} onChange={(e) => onConfig({ popoverType: e.target.value })}>
                  <option value="text">Text</option>
                  <option value="image">Image</option>
                  <option value="link">Link</option>
                </select>
              </label>
              {popoverType === 'text' && (
                <label className="field">
                  <span>Popover text</span>
                  <textarea
                    rows={3}
                    value={String(cfg.text ?? '')}
                    onChange={(e) => onConfig({ text: e.target.value })}
                  />
                </label>
              )}
              {popoverType === 'image' && (
                <ImagePicker label="Popover image" value={cfg.imageId} media={media} onChange={(id) => onConfig({ imageId: id })} />
              )}
              {popoverType === 'link' && (
                <label className="field">
                  <span>URL</span>
                  <input
                    value={String(cfg.url ?? '')}
                    placeholder="https://…"
                    onChange={(e) => onConfig({ url: e.target.value })}
                  />
                </label>
              )}
            </>
          )}
        </div>
      )
    }

    default:
      return compact ? null : <p className="hint">Plain text — no settings.</p>
  }
}
