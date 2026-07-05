import { useState } from 'react'
import type { DragEvent } from 'react'
import type { MediaItem } from '../shared/types'
import { nextMediaIndex, resolveStudioAsset, useStudio } from './state'

function MediaCard({ item }: { item: MediaItem }) {
  const { dispatch } = useStudio()
  const [tagsDraft, setTagsDraft] = useState(item.tags.join(', '))

  const commitTags = () => {
    const tags = tagsDraft
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    dispatch({ type: 'UPDATE_MEDIA', id: item.id, patch: { tags } })
  }

  return (
    <div className="media-card">
      <div className="media-thumb">
        {item.type === 'image' && item.storedPath ? (
          <img src={resolveStudioAsset(item.storedPath)} alt={item.originalFilename} />
        ) : (
          <span className="media-icon">{item.type === 'link' ? '🔗' : '📄'}</span>
        )}
      </div>
      <div className="media-meta">
        <span className="media-name" title={item.url ?? item.originalFilename}>
          {item.originalFilename}
        </span>
        <input
          className="media-tags"
          placeholder="tags: before, hero…"
          value={tagsDraft}
          onChange={(e) => setTagsDraft(e.target.value)}
          onBlur={commitTags}
          onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
        />
      </div>
    </div>
  )
}

export function MediaLibrary() {
  const { state, dispatch } = useStudio()
  const [urlDraft, setUrlDraft] = useState('')
  const [dragOver, setDragOver] = useState(false)

  if (!state.project) return null
  const media = state.project.media

  const addItems = (items: MediaItem[]) => {
    dispatch({ type: 'ADD_MEDIA', items })
    // Measure image dimensions asynchronously and patch metadata in.
    for (const item of items) {
      if (item.type !== 'image' || !item.storedPath) continue
      const img = new Image()
      img.onload = () =>
        dispatch({
          type: 'UPDATE_MEDIA',
          id: item.id,
          patch: { metadata: { width: img.naturalWidth, height: img.naturalHeight } },
        })
      img.src = resolveStudioAsset(item.storedPath)
    }
  }

  const importViaDialog = async () => {
    const res = await window.studio!.importMedia(nextMediaIndex(media))
    if (res.error) alert(res.error)
    if (res.items) addItems(res.items)
  }

  const onDrop = async (e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const paths = Array.from(e.dataTransfer.files)
      .map((f) => window.studio!.getPathForFile(f))
      .filter(Boolean)
    if (!paths.length) return
    const res = await window.studio!.importMediaPaths(paths, nextMediaIndex(media))
    if (res.error) alert(res.error)
    if (res.items) addItems(res.items)
  }

  const addUrl = () => {
    const url = urlDraft.trim()
    if (!url) return
    const id = `media_${String(nextMediaIndex(media)).padStart(4, '0')}`
    dispatch({
      type: 'ADD_MEDIA',
      items: [{ id, type: 'link', originalFilename: url, url, tags: [] }],
    })
    setUrlDraft('')
  }

  return (
    <div
      className={`media-library${dragOver ? ' drag-over' : ''}`}
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
    >
      <div className="panel-title">Media library</div>
      <button className="btn" onClick={importViaDialog}>
        + Add files
      </button>
      <div className="media-url-row">
        <input
          placeholder="Paste a URL…"
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addUrl()}
        />
        <button className="btn" onClick={addUrl}>
          Add
        </button>
      </div>
      {media.length === 0 ? (
        <p className="hint">Drop images or files here, or paste a link. Tag items (e.g. “before”, “after”) to find them faster.</p>
      ) : (
        <div className="media-list">
          {media.map((item) => (
            <MediaCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
