import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { sortedBlocks, useStudio } from './state'
import { BlockCard } from './BlockCard'

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

  if (blocks.length === 0) {
    return (
      <div className="panel-empty">
        <p>No blocks yet.</p>
        <p className="hint">Use “Import essay” in the toolbar to load a .txt, .md, or .docx file. Each paragraph becomes a block.</p>
      </div>
    )
  }

  return (
    <div className="storyboard">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          {blocks.map((block) => (
            <BlockCard key={block.id} block={block} media={state.project!.media} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  )
}
