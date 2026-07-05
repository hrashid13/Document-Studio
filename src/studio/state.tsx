import { createContext, useContext, useEffect, useReducer, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import { defaultConfig, isTextMode, migrateProject } from '../shared/types'
import type { Block, BlockStyle, DocStyle, MediaItem, Project, Treatment, TreatmentType } from '../shared/types'

export interface StudioState {
  dir: string | null
  project: Project | null
  selectedBlockId: string | null
  view: 'edit' | 'preview'
  /** True while a media-library item is being dragged (shows storyboard drop zones). */
  draggingMedia: boolean
}

export type StudioAction =
  | { type: 'PROJECT_LOADED'; dir: string; project: Project }
  | { type: 'SET_BLOCKS'; blocks: Block[] }
  | { type: 'INSERT_BLOCK'; index: number; block: Block }
  | { type: 'SET_TEXT_MODE'; id: string; ttype: TreatmentType }
  | { type: 'ADD_TREATMENT'; id: string; ttype: TreatmentType }
  | { type: 'REMOVE_TREATMENT'; id: string; ttype: TreatmentType }
  | { type: 'UPDATE_TREATMENT_CONFIG'; id: string; ttype: TreatmentType; patch: Record<string, unknown> }
  | { type: 'UPDATE_BLOCK_TEXT'; id: string; rawText: string }
  | { type: 'SET_BLOCK_STYLE'; id: string; patch: BlockStyle }
  | { type: 'SET_DOC_STYLE'; patch: DocStyle }
  | { type: 'DELETE_BLOCK'; id: string }
  | { type: 'REORDER_BLOCKS'; from: number; to: number }
  | { type: 'ADD_MEDIA'; items: MediaItem[] }
  | { type: 'UPDATE_MEDIA'; id: string; patch: Partial<MediaItem> }
  | { type: 'SET_THEME'; theme: string }
  | { type: 'SELECT_BLOCK'; id: string | null }
  | { type: 'SET_VIEW'; view: 'edit' | 'preview' }
  | { type: 'SET_DRAGGING_MEDIA'; dragging: boolean }

const initialState: StudioState = {
  dir: null,
  project: null,
  selectedBlockId: null,
  view: 'edit',
  draggingMedia: false,
}

function withProject(state: StudioState, fn: (p: Project) => Project): StudioState {
  if (!state.project) return state
  return { ...state, project: fn(state.project) }
}

function withBlock(state: StudioState, id: string, fn: (b: Block) => Block): StudioState {
  return withProject(state, (p) => ({
    ...p,
    blocks: p.blocks.map((b) => (b.id === id ? fn(b) : b)),
  }))
}

/** Drops keys whose value is an empty string (used to clear style overrides). */
function cleanStyle<T extends Record<string, unknown>>(style: T): T | undefined {
  const entries = Object.entries(style).filter(([, v]) => v !== '' && v !== undefined)
  return entries.length ? (Object.fromEntries(entries) as T) : undefined
}

function reducer(state: StudioState, action: StudioAction): StudioState {
  switch (action.type) {
    case 'PROJECT_LOADED':
      return { ...initialState, dir: action.dir, project: migrateProject(action.project) }
    case 'SET_BLOCKS':
      return { ...withProject(state, (p) => ({ ...p, blocks: action.blocks })), selectedBlockId: null }
    case 'INSERT_BLOCK':
      return {
        ...withProject(state, (p) => {
          const sorted = [...p.blocks].sort((a, b) => a.order - b.order)
          sorted.splice(action.index, 0, action.block)
          return { ...p, blocks: sorted.map((b, i) => ({ ...b, order: i })) }
        }),
        selectedBlockId: action.block.id,
      }
    case 'SET_TEXT_MODE':
      return withBlock(state, action.id, (b) => ({
        ...b,
        treatments: [
          ...(action.ttype !== 'plain' ? [{ type: action.ttype, config: defaultConfig(action.ttype) }] : []),
          ...b.treatments.filter((t) => !isTextMode(t.type)),
        ],
      }))
    case 'ADD_TREATMENT':
      return withBlock(state, action.id, (b) =>
        b.treatments.some((t) => t.type === action.ttype)
          ? b
          : { ...b, treatments: [...b.treatments, { type: action.ttype, config: defaultConfig(action.ttype) }] },
      )
    case 'REMOVE_TREATMENT':
      return withBlock(state, action.id, (b) => ({
        ...b,
        treatments: b.treatments.filter((t) => t.type !== action.ttype),
      }))
    case 'UPDATE_TREATMENT_CONFIG':
      return withBlock(state, action.id, (b) => ({
        ...b,
        treatments: b.treatments.map((t) =>
          t.type === action.ttype ? { ...t, config: { ...t.config, ...action.patch } } : t,
        ),
      }))
    case 'UPDATE_BLOCK_TEXT':
      return withBlock(state, action.id, (b) => ({ ...b, rawText: action.rawText }))
    case 'SET_BLOCK_STYLE':
      return withBlock(state, action.id, (b) => ({
        ...b,
        style: cleanStyle({ ...b.style, ...action.patch }),
      }))
    case 'SET_DOC_STYLE':
      return withProject(state, (p) => ({ ...p, style: cleanStyle({ ...p.style, ...action.patch }) }))
    case 'DELETE_BLOCK':
      return {
        ...withProject(state, (p) => ({
          ...p,
          blocks: p.blocks.filter((b) => b.id !== action.id).map((b, i) => ({ ...b, order: i })),
        })),
        selectedBlockId: state.selectedBlockId === action.id ? null : state.selectedBlockId,
      }
    case 'REORDER_BLOCKS':
      return withProject(state, (p) => ({
        ...p,
        blocks: arrayMove([...p.blocks].sort((a, b) => a.order - b.order), action.from, action.to).map(
          (b, i) => ({ ...b, order: i }),
        ),
      }))
    case 'ADD_MEDIA':
      return withProject(state, (p) => ({ ...p, media: [...p.media, ...action.items] }))
    case 'UPDATE_MEDIA':
      return withProject(state, (p) => ({
        ...p,
        media: p.media.map((m) => (m.id === action.id ? { ...m, ...action.patch } : m)),
      }))
    case 'SET_THEME':
      return withProject(state, (p) => ({ ...p, theme: action.theme }))
    case 'SELECT_BLOCK':
      return { ...state, selectedBlockId: action.id }
    case 'SET_VIEW':
      return { ...state, view: action.view }
    case 'SET_DRAGGING_MEDIA':
      return { ...state, draggingMedia: action.dragging }
  }
}

interface StudioContextValue {
  state: StudioState
  dispatch: (action: StudioAction) => void
  saveStatus: 'idle' | 'saving' | 'saved'
}

const StudioContext = createContext<StudioContextValue | null>(null)

export function StudioProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const lastSaved = useRef<Project | null>(null)

  // Debounced autosave whenever the project object changes after load.
  useEffect(() => {
    if (!state.project || !state.dir || !window.studio) return
    if (lastSaved.current === null) {
      // First render after load: remember the loaded snapshot, don't re-save it.
      lastSaved.current = state.project
      return
    }
    if (lastSaved.current === state.project) return
    setSaveStatus('saving')
    const project = { ...state.project, updatedAt: new Date().toISOString() }
    const timer = setTimeout(async () => {
      await window.studio!.saveProject(project)
      lastSaved.current = state.project
      setSaveStatus('saved')
    }, 700)
    return () => clearTimeout(timer)
  }, [state.project, state.dir])

  // Reset the save tracker when a different project is loaded.
  useEffect(() => {
    lastSaved.current = null
    setSaveStatus('idle')
  }, [state.dir])

  return <StudioContext.Provider value={{ state, dispatch, saveStatus }}>{children}</StudioContext.Provider>
}

export function useStudio(): StudioContextValue {
  const ctx = useContext(StudioContext)
  if (!ctx) throw new Error('useStudio must be used inside StudioProvider')
  return ctx
}

/** Maps project-relative asset paths to the studio:// Electron protocol. */
export function resolveStudioAsset(storedPath: string): string {
  return `studio://project/${storedPath}`
}

export function nextMediaIndex(media: MediaItem[]): number {
  let max = 0
  for (const m of media) {
    const match = /^media_(\d+)$/.exec(m.id)
    if (match) max = Math.max(max, Number(match[1]))
  }
  return max + 1
}

export function nextBlockId(blocks: Block[]): string {
  let max = 0
  for (const b of blocks) {
    const match = /^block_(\d+)$/.exec(b.id)
    if (match) max = Math.max(max, Number(match[1]))
  }
  return `block_${String(max + 1).padStart(4, '0')}`
}

/** Builds the block created when a media item is dropped into the storyboard. */
export function blockForMedia(item: MediaItem, id: string): Block {
  const treatment: Treatment =
    item.type === 'image'
      ? { type: 'image-figure', config: { ...defaultConfig('image-figure'), imageId: item.id } }
      : { type: 'attachment', config: { ...defaultConfig('attachment'), fileId: item.id } }
  return { id, order: 0, rawText: '', treatments: [treatment] }
}

export function sortedBlocks(project: Project): Block[] {
  return [...project.blocks].sort((a, b) => a.order - b.order)
}
