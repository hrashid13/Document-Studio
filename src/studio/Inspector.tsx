import { ACCENT_COLORS, AVAILABLE_TREATMENTS, FONTS, TEXT_COLORS, addonsOf, textModeOf } from '../shared/types'
import type { TreatmentType } from '../shared/types'
import { useStudio } from './state'
import { TreatmentConfig } from './TreatmentConfig'

function Swatches({
  colors,
  value,
  onChange,
}: {
  colors: { id: string; label: string; value: string }[]
  value: string | undefined
  onChange: (id: string) => void
}) {
  return (
    <div className="swatch-row">
      <button
        className={`swatch swatch-none${!value ? ' selected' : ''}`}
        title="Default (from theme)"
        onClick={() => onChange('')}
      >
        ∅
      </button>
      {colors.map((c) => (
        <button
          key={c.id}
          className={`swatch${value === c.id ? ' selected' : ''}`}
          style={{ background: c.value }}
          title={c.label}
          onClick={() => onChange(c.id)}
        />
      ))}
    </div>
  )
}

function FontSelect({ value, onChange }: { value: string | undefined; onChange: (id: string) => void }) {
  return (
    <select value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
      <option value="">Default (from theme)</option>
      {FONTS.map((f) => (
        <option key={f.id} value={f.id}>
          {f.label}
        </option>
      ))}
    </select>
  )
}

/** Shown when no block is selected: document-wide manual styles. */
function DocumentStyles() {
  const { state, dispatch } = useStudio()
  const style = state.project?.style

  return (
    <div className="inspector">
      <div className="panel-title">Inspector</div>
      <p className="hint">Select a block in the storyboard to edit its features — or style the whole document below.</p>

      <div className="inspector-section">
        <div className="section-title">Document styles</div>
        <p className="hint">These sit on top of the theme. Pick ∅ to go back to the theme's own value.</p>
        <label className="field">
          <span>Font (whole document)</span>
          <FontSelect value={style?.font} onChange={(font) => dispatch({ type: 'SET_DOC_STYLE', patch: { font } })} />
        </label>
        <div className="field">
          <span>Accent color (links, highlights, buttons, charts)</span>
          <Swatches
            colors={ACCENT_COLORS}
            value={style?.accentColor}
            onChange={(accentColor) => dispatch({ type: 'SET_DOC_STYLE', patch: { accentColor } })}
          />
        </div>
        <div className="field">
          <span>Font color (whole document)</span>
          <Swatches
            colors={TEXT_COLORS}
            value={style?.textColor}
            onChange={(textColor) => dispatch({ type: 'SET_DOC_STYLE', patch: { textColor } })}
          />
        </div>
      </div>
    </div>
  )
}

export function Inspector() {
  const { state, dispatch } = useStudio()
  const project = state.project
  if (!project) return null

  const block = project.blocks.find((b) => b.id === state.selectedBlockId)
  if (!block) return <DocumentStyles />

  const mode = textModeOf(block)
  const addons = addonsOf(block)
  const info = (t: TreatmentType) => AVAILABLE_TREATMENTS.find((x) => x.value === t)

  return (
    <div className="inspector">
      <div className="panel-title">Inspector</div>
      <div className="inspector-block-info">
        <span className="inspector-kicker">Block {block.order + 1}</span>
        <p className="inspector-text">{block.rawText || '(media block — no text)'}</p>
      </div>

      <div className="inspector-section">
        <div className="section-title">Text style · {info(mode.type)?.label}</div>
        <p className="hint">{info(mode.type)?.description}</p>
        <TreatmentConfig
          treatment={mode}
          media={project.media}
          onConfig={(patch) =>
            dispatch({ type: 'UPDATE_TREATMENT_CONFIG', id: block.id, ttype: mode.type, patch })
          }
        />
      </div>

      {addons.map((t) => (
        <div key={t.type} className="inspector-section">
          <div className="section-title">
            {info(t.type)?.label}
            <button
              className="mini-btn"
              title={`Remove ${info(t.type)?.label}`}
              onClick={() => dispatch({ type: 'REMOVE_TREATMENT', id: block.id, ttype: t.type })}
            >
              ✕
            </button>
          </div>
          <p className="hint">{info(t.type)?.description}</p>
          <TreatmentConfig
            treatment={t}
            media={project.media}
            onConfig={(patch) =>
              dispatch({ type: 'UPDATE_TREATMENT_CONFIG', id: block.id, ttype: t.type, patch })
            }
          />
        </div>
      ))}

      <div className="inspector-section">
        <div className="section-title">Block style</div>
        <label className="field">
          <span>Font (this block only)</span>
          <FontSelect
            value={block.style?.font}
            onChange={(font) => dispatch({ type: 'SET_BLOCK_STYLE', id: block.id, patch: { font } })}
          />
        </label>
        <div className="field">
          <span>Font color (this block only)</span>
          <Swatches
            colors={TEXT_COLORS}
            value={block.style?.textColor}
            onChange={(textColor) => dispatch({ type: 'SET_BLOCK_STYLE', id: block.id, patch: { textColor } })}
          />
        </div>
      </div>

      <button
        className="btn danger"
        onClick={async () => {
          if (await window.studio!.confirm('Delete this block?', 'Its text will be removed from the article.')) {
            dispatch({ type: 'DELETE_BLOCK', id: block.id })
          }
        }}
      >
        Delete block
      </button>
    </div>
  )
}
