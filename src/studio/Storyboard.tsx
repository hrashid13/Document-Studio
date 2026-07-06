import { useState } from 'react'
import type { DragEvent } from 'react'
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { blockForMedia, nextBlockId, sortedBlocks, useStudio } from './state'
import { BlockCard } from './BlockCard'

const MEDIA_MIME = 'application/x-ia-media'

/**
 * Sits between blocks: click to insert a blank block there, or drop a
 * media-library item to insert it as a figure/attachment block.
 */
function InsertZone({ index }: { index: number }) {
  const { state, dispatch } = useStudio()
  const [over, setOver] = useState(false)

  const insertBlank = () => {
    if (!state.project) return
    dispatch({
      type: 'INSERT_BLOCK',
      index,
      block: { id: nextBlockId(state.project.blocks), order: 0, rawText: '', treatments: [] },
    })
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setOver(false)
    const mediaId = e.dataTransfer.getData(MEDIA_MIME)
    const item = state.project?.media.find((m) => m.id === mediaId)
    if (!item || !state.project) return
    const block = blockForMedia(item, nextBlockId(state.project.blocks))
    dispatch({ type: 'INSERT_BLOCK', index, block })
    dispatch({ type: 'SET_DRAGGING_MEDIA', dragging: false })
  }

  return (
    <div
      className={`insert-zone${state.draggingMedia ? ' visible' : ''}${over ? ' over' : ''}`}
      title="Click to add a blank block here"
      onClick={insertBlank}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes(MEDIA_MIME)) {
          e.preventDefault()
          e.dataTransfer.dropEffect = 'copy'
          setOver(true)
        }
      }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
    >
      <span>{state.draggingMedia ? 'drop media here to insert a block' : '+ add a blank block here'}</span>
    </div>
  )
}

export function Storyboard() {
  const { state, dispatch } = useStudio()
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  if (!state.project) return null
  const blocks = sortedBlocks(state.project)

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const from = blocks.findIndex((b) => b.id === active.id)
    const to = blocks.findIndex((b) => b.id === over.id)
    if (from < 0 || to < 0) return
    dispatch({ type: 'REORDER_BLOCKS', from, to })
  }

  const addBlankAtEnd = () => {
    if (!state.project) return
    dispatch({
      type: 'INSERT_BLOCK',
      index: blocks.length,
      block: { id: nextBlockId(state.project.blocks), order: 0, rawText: '', treatments: [] },
    })
  }

  if (blocks.length === 0) {
    return (
      <div className="storyboard">
        <InsertZone index={0} />
        <div className="panel-empty">
          <p>No blocks yet.</p>
          <p className="hint">
            Use “Import essay” in the toolbar to load a .txt, .md, or .docx file — each paragraph becomes a block. You
            can also drag media from the left panel into this area, or start from scratch:
          </p>
          <button className="btn" onClick={addBlankAtEnd}>
            + Add a blank block
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="storyboard">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          {blocks.map((block, i) => (
            <div key={block.id}>
              <InsertZone index={i} />
              <BlockCard block={block} media={state.project!.media} />
            </div>
          ))}
          <InsertZone index={blocks.length} />
        </SortableContext>
      </DndContext>
      <button className="btn add-block-btn" onClick={addBlankAtEnd} title="Add a blank block at the end">
        + Add block
      </button>
    </div>
  )
}
