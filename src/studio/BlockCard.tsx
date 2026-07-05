import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Block, MediaItem, TreatmentType } from '../shared/types'
import { AVAILABLE_TREATMENTS, defaultConfig } from '../shared/types'
import { useStudio } from './state'
import { TreatmentConfig } from './TreatmentConfig'

export function BlockCard({ block, media }: { block: Block; media: MediaItem[] }) {
  const { state, dispatch } = useStudio()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  })

  const selected = state.selectedBlockId === block.id

  const setTreatmentType = (type: TreatmentType) => {
    if (type === block.treatment.type) return
    dispatch({ type: 'SET_TREATMENT', id: block.id, treatment: { type, config: defaultConfig(type) } })
  }

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
          value={block.treatment.type}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => setTreatmentType(e.target.value as TreatmentType)}
        >
          {AVAILABLE_TREATMENTS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      <p className={`block-text${block.rawText ? '' : ' empty'}`}>
        {block.rawText || '(media block — no text)'}
      </p>
      <div onClick={(e) => e.stopPropagation()}>
        <TreatmentConfig
          block={block}
          media={media}
          compact
          onConfig={(patch) => dispatch({ type: 'UPDATE_CONFIG', id: block.id, patch })}
        />
      </div>
    </div>
  )
}
