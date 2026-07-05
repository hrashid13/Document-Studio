import type { MediaItem, ScrollyStep, Treatment } from '../shared/types'

interface Props {
  treatment: Treatment
  media: MediaItem[]
  compact?: boolean
  onConfig: (patch: Record<string, unknown>) => void
}

function MediaPicker({
  label,
  value,
  media,
  kind,
  onChange,
}: {
  label: string
  value: unknown
  media: MediaItem[]
  kind: 'image' | 'file'
  onChange: (id: string) => void
}) {
  const items = media.filter((m) => m.type === kind)
  return (
    <label className="field">
      <span>{label}</span>
      <select value={String(value ?? '')} onChange={(e) => onChange(e.target.value)}>
        <option value="">— none —</option>
        {items.map((m) => (
          <option key={m.id} value={m.id}>
            {m.originalFilename}
            {m.tags.length ? ` (${m.tags.join(', ')})` : ''}
          </option>
        ))}
      </select>
    </label>
  )
}

function ScrollyStepsEditor({
  steps,
  visualType,
  media,
  onSteps,
}: {
  steps: ScrollyStep[]
  visualType: string
  media: MediaItem[]
  onSteps: (steps: ScrollyStep[]) => void
}) {
  const update = (i: number, patch: Partial<ScrollyStep>) =>
    onSteps(steps.map((s, j) => (j === i ? { ...s, ...patch } : s)))
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= steps.length) return
    const next = [...steps]
    ;[next[i], next[j]] = [next[j], next[i]]
    onSteps(next)
  }

  return (
    <div className="steps-editor">
      {steps.map((step, i) => (
        <div key={step.id ?? i} className="step-editor">
          <div className="step-editor-head">
            <span>Step {i + 1}</span>
            <span className="step-editor-actions">
              <button className="mini-btn" title="Move step up" onClick={() => move(i, -1)}>↑</button>
              <button className="mini-btn" title="Move step down" onClick={() => move(i, 1)}>↓</button>
              <button
                className="mini-btn"
                title="Remove step"
                onClick={() => onSteps(steps.filter((_, j) => j !== i))}
              >
                ✕
              </button>
            </span>
          </div>
          <label className="field">
            <span>Step text (shown while this step is active)</span>
            <textarea rows={3} value={step.text} onChange={(e) => update(i, { text: e.target.value })} />
          </label>
          {visualType === 'chart' ? (
            <label className="field">
              <span>Chart data — one “Label, value” per line</span>
              <textarea
                rows={4}
                placeholder={'Apples, 42\nOranges, 31\nPears, 12'}
                value={step.chartData ?? ''}
                onChange={(e) => update(i, { chartData: e.target.value })}
              />
            </label>
          ) : (
            <MediaPicker
              label="Pinned image while this step is active"
              value={step.imageId}
              media={media}
              kind="image"
              onChange={(id) => update(i, { imageId: id })}
            />
          )}
        </div>
      ))}
      <button
        className="btn"
        onClick={() =>
          onSteps([
            ...steps,
            {
              id: `step_${Date.now()}`,
              text: '',
              imageId: '',
              // Start from the previous step's data so charts morph rather than restart.
              chartData: steps[steps.length - 1]?.chartData ?? '',
            },
          ])
        }
      >
        + Add step
      </button>
    </div>
  )
}

/**
 * Config controls for one treatment on a block. `compact` renders only the
 * primary fields (shown inline on storyboard cards); the full form lives in
 * the Inspector.
 */
export function TreatmentConfig({ treatment, media, compact = false, onConfig }: Props) {
  const cfg = treatment.config

  switch (treatment.type) {
    case 'heading':
      return (
        <div className="config-form">
          <label className="field">
            <span>Heading size</span>
            <select
              value={String(cfg.level ?? 1)}
              onChange={(e) => onConfig({ level: Number(e.target.value) })}
            >
              <option value="1">Large</option>
              <option value="2">Medium</option>
              <option value="3">Small</option>
            </select>
          </label>
        </div>
      )

    case 'sentence-focus':
      return (
        <div className="config-form">
          <label className="field">
            <span>Highlight style</span>
            <select value={String(cfg.style ?? 'dim')} onChange={(e) => onConfig({ style: e.target.value })}>
              <option value="dim">Dim the rest</option>
              <option value="mark">Dim + accent highlight</option>
            </select>
          </label>
        </div>
      )

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
          <MediaPicker label="Image A (left / before)" value={cfg.imageA} media={media} kind="image" onChange={(id) => onConfig({ imageA: id })} />
          <MediaPicker label="Image B (right / after)" value={cfg.imageB} media={media} kind="image" onChange={(id) => onConfig({ imageB: id })} />
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
                <MediaPicker label="Popover image" value={cfg.imageId} media={media} kind="image" onChange={(id) => onConfig({ imageId: id })} />
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

    case 'inline-link': {
      const display = String(cfg.display ?? 'inline')
      return (
        <div className="config-form">
          <label className="field">
            <span>Show as</span>
            <select value={display} onChange={(e) => onConfig({ display: e.target.value })}>
              <option value="inline">Linked phrase in the text</option>
              <option value="button">Button below the text</option>
            </select>
          </label>
          <label className="field">
            <span>URL</span>
            <input
              value={String(cfg.url ?? '')}
              placeholder="https://…"
              onChange={(e) => onConfig({ url: e.target.value })}
            />
          </label>
          {display === 'inline' ? (
            <label className="field">
              <span>Phrase to link (must appear in the block text)</span>
              <input
                value={String(cfg.triggerPhrase ?? '')}
                placeholder="e.g. read the full report"
                onChange={(e) => onConfig({ triggerPhrase: e.target.value })}
              />
            </label>
          ) : (
            <label className="field">
              <span>Button label</span>
              <input value={String(cfg.label ?? '')} onChange={(e) => onConfig({ label: e.target.value })} />
            </label>
          )}
        </div>
      )
    }

    case 'image-figure':
      return (
        <div className="config-form">
          <MediaPicker label="Image" value={cfg.imageId} media={media} kind="image" onChange={(id) => onConfig({ imageId: id })} />
          {!compact && (
            <label className="field">
              <span>Caption (optional)</span>
              <input value={String(cfg.caption ?? '')} onChange={(e) => onConfig({ caption: e.target.value })} />
            </label>
          )}
        </div>
      )

    case 'attachment':
      return (
        <div className="config-form">
          <MediaPicker label="File" value={cfg.fileId} media={media} kind="file" onChange={(id) => onConfig({ fileId: id })} />
          {!compact && (
            <label className="field">
              <span>Label (defaults to the filename)</span>
              <input value={String(cfg.label ?? '')} onChange={(e) => onConfig({ label: e.target.value })} />
            </label>
          )}
        </div>
      )

    case 'scrolly': {
      const visualType = String(cfg.visualType ?? 'image')
      const steps = (Array.isArray(cfg.steps) ? cfg.steps : []) as ScrollyStep[]
      return (
        <div className="config-form">
          <label className="field">
            <span>Pinned visual</span>
            <select value={visualType} onChange={(e) => onConfig({ visualType: e.target.value })}>
              <option value="image">Image sequence</option>
              <option value="chart">Bar chart (morphs between steps)</option>
            </select>
          </label>
          <label className="field">
            <span>Visual side</span>
            <select value={String(cfg.position ?? 'left')} onChange={(e) => onConfig({ position: e.target.value })}>
              <option value="left">Left (text on right)</option>
              <option value="right">Right (text on left)</option>
            </select>
          </label>
          {compact ? (
            <p className="hint">
              {steps.length} step{steps.length === 1 ? '' : 's'} — select this block to edit them in the Inspector.
            </p>
          ) : (
            <>
              {visualType === 'chart' && (
                <label className="field">
                  <span>Chart title (optional)</span>
                  <input
                    value={String(cfg.chartTitle ?? '')}
                    onChange={(e) => onConfig({ chartTitle: e.target.value })}
                  />
                </label>
              )}
              <ScrollyStepsEditor
                steps={steps}
                visualType={visualType}
                media={media}
                onSteps={(next) => onConfig({ steps: next })}
              />
            </>
          )}
        </div>
      )
    }

    default:
      return compact ? null : <p className="hint">Plain text — no settings.</p>
  }
}
