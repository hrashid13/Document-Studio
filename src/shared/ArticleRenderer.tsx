import { createContext, useContext } from 'react'
import type { Block, MediaItem, Project } from './types'
import { Plain } from './treatments/Plain'
import { ScrollReveal } from './treatments/ScrollReveal'
import { DragCompare } from './treatments/DragCompare'
import { HoverAnnotate } from './treatments/HoverAnnotate'
import { ImageFigure } from './treatments/ImageFigure'
import { Attachment } from './treatments/Attachment'
import { ScrollySection } from './treatments/ScrollySection'
import { SentenceFocus } from './treatments/SentenceFocus'
import './article.css'

// Maps a project-relative storedPath ("assets/x.jpg") to a displayable URL.
// The studio maps to the studio:// Electron protocol; the exported viewer
// resolves relative to index.html, so identity is the right default.
type AssetResolver = (storedPath: string) => string

const AssetContext = createContext<AssetResolver>((p) => p)

export function useAssetResolver(): AssetResolver {
  return useContext(AssetContext)
}

export interface TreatmentProps {
  block: Block
  media: MediaItem[]
}

function BlockView({ block, media }: TreatmentProps) {
  switch (block.treatment.type) {
    case 'scroll-reveal':
      return <ScrollReveal block={block} media={media} />
    case 'drag-compare':
      return <DragCompare block={block} media={media} />
    case 'hover-annotate':
      return <HoverAnnotate block={block} media={media} />
    case 'image-figure':
      return <ImageFigure block={block} media={media} />
    case 'attachment':
      return <Attachment block={block} media={media} />
    case 'scrolly':
      return <ScrollySection block={block} media={media} />
    case 'sentence-focus':
      return <SentenceFocus block={block} media={media} />
    default:
      return <Plain block={block} media={media} />
  }
}

export function ArticleRenderer({
  project,
  resolveAsset,
}: {
  project: Project
  resolveAsset?: AssetResolver
}) {
  const blocks = [...project.blocks].sort((a, b) => a.order - b.order)
  // Scroll-driven blocks near the end need room below them, or the reader can
  // never scroll them past the focus line and the effect stalls half-finished.
  const scrollDriven = blocks
    .slice(-3)
    .some((b) => b.treatment.type === 'sentence-focus' || b.treatment.type === 'scrolly')
  return (
    <AssetContext.Provider value={resolveAsset ?? ((p) => p)}>
      <div className="ia-page" data-theme={project.theme ?? 'classic'}>
        <article className="ia-article">
          <header className="ia-header">
            <h1>{project.projectName}</h1>
          </header>
          {blocks.map((block) => (
            <BlockView key={block.id} block={block} media={project.media} />
          ))}
          {scrollDriven && <div className="ia-scroll-tail" aria-hidden="true" />}
          <footer className="ia-footer">
            <span>Made with Interactive Article Studio</span>
          </footer>
        </article>
      </div>
    </AssetContext.Provider>
  )
}
