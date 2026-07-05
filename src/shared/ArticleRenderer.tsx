import { createContext, useContext } from 'react'
import type { Block, MediaItem, Project } from './types'
import { Plain } from './treatments/Plain'
import { ScrollReveal } from './treatments/ScrollReveal'
import { DragCompare } from './treatments/DragCompare'
import { HoverAnnotate } from './treatments/HoverAnnotate'
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
  return (
    <AssetContext.Provider value={resolveAsset ?? ((p) => p)}>
      <div className="ia-page">
        <article className="ia-article">
          <header className="ia-header">
            <h1>{project.projectName}</h1>
          </header>
          {blocks.map((block) => (
            <BlockView key={block.id} block={block} media={project.media} />
          ))}
          <footer className="ia-footer">
            <span>Made with Interactive Article Studio</span>
          </footer>
        </article>
      </div>
    </AssetContext.Provider>
  )
}
