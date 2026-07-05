import { AVAILABLE_TREATMENTS } from '../shared/types'
import { useStudio } from './state'
import { TreatmentConfig } from './TreatmentConfig'

export function Inspector() {
  const { state, dispatch } = useStudio()
  if (!state.project) return null

  const block = state.project.blocks.find((b) => b.id === state.selectedBlockId)
  if (!block) {
    return (
      <div className="inspector">
        <div className="panel-title">Inspector</div>
        <p className="hint">Select a block in the storyboard to edit its treatment settings.</p>
      </div>
    )
  }

  const label = AVAILABLE_TREATMENTS.find((t) => t.value === block.treatment.type)?.label ?? block.treatment.type

  return (
    <div className="inspector">
      <div className="panel-title">Inspector</div>
      <div className="inspector-block-info">
        <span className="inspector-kicker">
          Block {block.order + 1} · {label}
        </span>
        <p className="inspector-text">{block.rawText}</p>
      </div>
      <TreatmentConfig
        block={block}
        media={state.project.media}
        onConfig={(patch) => dispatch({ type: 'UPDATE_CONFIG', id: block.id, patch })}
      />
      <button
        className="btn danger"
        onClick={() => {
          if (confirm('Delete this block? The text will be removed from the article.')) {
            dispatch({ type: 'DELETE_BLOCK', id: block.id })
          }
        }}
      >
        Delete block
      </button>
    </div>
  )
}
