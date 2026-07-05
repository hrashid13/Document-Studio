import { useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import { findMedia } from '../types'
import { useAssetResolver } from '../ArticleRenderer'
import type { TreatmentProps } from '../ArticleRenderer'

export function DragCompare({ block, media }: TreatmentProps) {
  const resolve = useAssetResolver()
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const [pos, setPos] = useState(50)

  const cfg = block.treatment.config
  const mediaA = findMedia(media, cfg.imageA)
  const mediaB = findMedia(media, cfg.imageB)
  const labelA = String(cfg.labelA ?? '')
  const labelB = String(cfg.labelB ?? '')

  const updateFromPointer = (clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) return
    const pct = ((clientX - rect.left) / rect.width) * 100
    setPos(Math.min(100, Math.max(0, pct)))
  }

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    dragging.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    updateFromPointer(e.clientX)
  }
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging.current) updateFromPointer(e.clientX)
  }
  const onPointerUp = () => {
    dragging.current = false
  }

  if (!mediaA?.storedPath || !mediaB?.storedPath) {
    return (
      <div>
        <div className="ia-compare-placeholder">
          Drag-compare: pick two images (A and B) in the block settings.
        </div>
        {block.rawText && <p className="ia-paragraph">{block.rawText}</p>}
      </div>
    )
  }

  return (
    <div>
      <figure className="ia-compare">
        <div
          className="ia-compare-frame"
          ref={containerRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <img className="ia-compare-under" src={resolve(mediaB.storedPath)} alt={labelB || 'After'} draggable={false} />
          <div className="ia-compare-top" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
            <img src={resolve(mediaA.storedPath)} alt={labelA || 'Before'} draggable={false} />
          </div>
          <div className="ia-compare-divider" style={{ left: `${pos}%` }}>
            <div className="ia-compare-handle">⟨ ⟩</div>
          </div>
          {labelA && <span className="ia-compare-label ia-compare-label-a">{labelA}</span>}
          {labelB && <span className="ia-compare-label ia-compare-label-b">{labelB}</span>}
        </div>
      </figure>
      {block.rawText && <p className="ia-paragraph">{block.rawText}</p>}
    </div>
  )
}
