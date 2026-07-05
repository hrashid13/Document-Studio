import { createContext, useContext } from 'react'
import type { CSSProperties } from 'react'
import {
  accentValue,
  fontStack,
  getTreatment,
  migrateProject,
  textColorValue,
} from './types'
import type { Block, MediaItem, Project, Treatment } from './types'
import { TextContent } from './TextContent'
import { Reveal } from './treatments/ScrollReveal'
import { DragCompare } from './treatments/DragCompare'
import { ImageFigure } from './treatments/ImageFigure'
import { Attachment } from './treatments/Attachment'
import { ScrollySection } from './treatments/ScrollySection'
import './article.css'

// Maps a project-relative storedPath ("assets/x.jpg") to a displayable URL.
// The studio maps to the studio:// Electron protocol; the exported viewer
// resolves relative to index.html, so identity is the right default.
type AssetResolver = (storedPath: string) => string

const AssetContext = createContext<AssetResolver>((p) => p)

export function useAssetResolver(): AssetResolver {
  return useContext(AssetContext)
}

function MediaPart({ treatment, block, media }: { treatment: Treatment; block: Block; media: MediaItem[] }) {
  switch (treatment.type) {
    case 'drag-compare':
      return <DragCompare config={treatment.config} media={media} />
    case 'image-figure':
      return <ImageFigure config={treatment.config} media={media} />
    case 'attachment':
      return <Attachment config={treatment.config} media={media} />
    case 'scrolly':
      return (
        <ScrollySection
          config={treatment.config}
          media={media}
          focusText={!!getTreatment(block, 'sentence-focus')}
        />
      )
    default:
      return null
  }
}

const MEDIA_TYPES = new Set(['drag-compare', 'image-figure', 'attachment', 'scrolly'])

function BlockView({ block, media }: { block: Block; media: MediaItem[] }) {
  const mediaParts = block.treatments.filter((t) => MEDIA_TYPES.has(t.type))

  // Per-block manual font/color overrides.
  const style: CSSProperties = {}
  const font = fontStack(block.style?.font)
  const color = textColorValue(block.style?.textColor)
  if (font) style.fontFamily = font
  if (color) {
    style.color = color
    ;(style as Record<string, string>)['--ia-text'] = color
  }

  const inner = (
    <>
      <TextContent block={block} media={media} />
      {mediaParts.map((t, i) => (
        <MediaPart key={`${t.type}-${i}`} treatment={t} block={block} media={media} />
      ))}
    </>
  )

  const reveal = getTreatment(block, 'scroll-reveal')
  return (
    <div className="ia-block" style={style}>
      {reveal ? <Reveal config={reveal.config}>{inner}</Reveal> : inner}
    </div>
  )
}

export function ArticleRenderer({
  project: rawProject,
  resolveAsset,
}: {
  project: Project
  resolveAsset?: AssetResolver
}) {
  // Tolerate legacy single-treatment projects (old exports / project.json).
  const project = migrateProject(rawProject)
  const blocks = [...project.blocks].sort((a, b) => a.order - b.order)

  // Scroll-driven blocks near the end need room below them, or the reader can
  // never scroll them past the focus line and the effect stalls half-finished.
  const scrollDriven = blocks
    .slice(-3)
    .some((b) => b.treatments.some((t) => t.type === 'sentence-focus' || t.type === 'scrolly'))

  // Manual document-wide overrides sit on top of the theme via CSS variables.
  const docVars: Record<string, string> = {}
  const accent = accentValue(project.style?.accentColor)
  const font = fontStack(project.style?.font)
  const textColor = textColorValue(project.style?.textColor)
  if (accent) docVars['--ia-accent'] = accent
  if (font) docVars['--ia-font-body'] = font
  if (textColor) docVars['--ia-text'] = textColor

  return (
    <AssetContext.Provider value={resolveAsset ?? ((p) => p)}>
      <div className="ia-page" data-theme={project.theme ?? 'classic'} style={docVars as CSSProperties}>
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
