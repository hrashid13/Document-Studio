// Schema for project.json (PRD section 6) — shared by studio, viewer, and export.

export type TreatmentType =
  | 'plain'
  | 'scroll-reveal'
  | 'drag-compare'
  | 'hover-annotate'
  | 'click-expand'
  | 'parallax-image'
  | 'animated-stat'
  | 'pull-quote'
  | 'embedded-link'

/** Treatments implemented in the MVP. The rest of TreatmentType ships later. */
export const AVAILABLE_TREATMENTS: { value: TreatmentType; label: string }[] = [
  { value: 'plain', label: 'Plain' },
  { value: 'scroll-reveal', label: 'Scroll reveal' },
  { value: 'drag-compare', label: 'Drag compare' },
  { value: 'hover-annotate', label: 'Hover annotate' },
]

export interface Treatment {
  type: TreatmentType
  config: Record<string, unknown>
}

export interface MediaItem {
  id: string
  type: 'image' | 'file' | 'link'
  originalFilename: string
  /** Project-relative path like "assets/media_0001.jpg" (absent for links). */
  storedPath?: string
  /** Target URL for link media items. */
  url?: string
  tags: string[]
  metadata?: { width?: number; height?: number }
}

export interface Block {
  id: string
  order: number
  rawText: string
  treatment: Treatment
}

export interface Project {
  projectName: string
  createdAt: string
  updatedAt: string
  media: MediaItem[]
  blocks: Block[]
}

export function defaultConfig(type: TreatmentType): Record<string, unknown> {
  switch (type) {
    case 'scroll-reveal':
      return { direction: 'up', delay: 0 }
    case 'drag-compare':
      return { imageA: '', imageB: '', labelA: 'Before', labelB: 'After' }
    case 'hover-annotate':
      return { triggerPhrase: '', popoverType: 'text', text: '', imageId: '', url: '' }
    default:
      return {}
  }
}

export function findMedia(media: MediaItem[], id: unknown): MediaItem | undefined {
  return media.find((m) => m.id === id)
}
