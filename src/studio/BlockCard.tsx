import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ADDON_TYPES, AVAILABLE_TREATMENTS, addonsOf, textModeOf } from '../shared/types'
import type { Block, MediaItem, TreatmentType } from '../shared/types'
import { useStudio } from './state'
import { TreatmentConfig } from './TreatmentConfig'

function label(type: TreatmentType): string {
  return AVAILABLE_TREATMENTS.find((t) => t.value === type)?.label ?? type
}

export function BlockCard({ block, media }: { block: Block; media: MediaItem[] }) {
  const { state, dispatch } = useStudio()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  })

  const selected = state.selectedBlockId === block.id
  const addons = addonsOf(block)
  const availableAddons = ADDON_TYPES.filter((t) => !addons.some((a) => a.type === t))

  return (
    <div
      ref={setNodeRef}
      className={`block-card${selected ? ' selected' : ''}${isDragging ? ' dragging' : ''}`}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      onClick={() => dispatch({ type: 'SELECT_BLOCK', id: block.id })}
    >
      <div className="block-card-head">
        <button className="drag-handle" title="Drag to reorder" {...attributes} {...listeners}>
          ⠿
        </button>
        <span className="block-order">{block.order + 1}</span>
        <select
          className="treatment-select"
          title="Text style for this block"
          value={textModeOf(block).type}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => dispatch({ type: 'SET_TEXT_MODE', id: block.id, ttype: e.target.value as TreatmentType })}
        >
          <option value="plain">Plain</option>
          <option value="heading">Heading</option>
          <option value="sentence-focus">Sentence focus</option>
        </select>
        <select
          className="treatment-select addon-add"
          title="Add a feature to this block (you can combine several)"
          value=""
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            if (e.target.value) {
              dispatch({ type: 'ADD_TREATMENT', id: block.id, ttype: e.target.value as TreatmentType })
              dispatch({ type: 'SELECT_BLOCK', id: block.id })
            }
          }}
        >
          <option value="">+ Add feature…</option>
          {availableAddons.map((t) => (
            <option key={t} value={t}>
              {label(t)}
            </option>
          ))}
        </select>
      </div>
      <p className={`block-text${block.rawText ? '' : ' empty'}`}>
        {block.rawText || '(media block — no text)'}
      </p>
      {addons.length > 0 && (
        <div className="addon-chips" onClick={(e) => e.stopPropagation()}>
          {addons.map((t) => (
            <span key={t.type} className="addon-chip">
              {label(t.type)}
              <button
                className="chip-x"
                title={`Remove ${label(t.type)}`}
                onClick={() => dispatch({ type: 'REMOVE_TREATMENT', id: block.id, ttype: t.type })}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
      <div onClick={(e) => e.stopPropagation()}>
        {addons.map((t) => (
          <TreatmentConfig
            key={t.type}
            treatment={t}
            media={media}
            compact
            onConfig={(patch) =>
              dispatch({ type: 'UPDATE_TREATMENT_CONFIG', id: block.id, ttype: t.type, patch })
            }
          />
        ))}
      </div>
    </div>
  )
}
