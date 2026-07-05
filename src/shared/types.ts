// Schema for project.json (PRD section 6) — shared by studio, viewer, and export.

export type TreatmentType =
  | 'plain'
  | 'scroll-reveal'
  | 'drag-compare'
  | 'hover-annotate'
  | 'image-figure'
  | 'attachment'
  | 'scrolly'
  | 'sentence-focus'
  | 'click-expand'
  | 'parallax-image'
  | 'animated-stat'
  | 'pull-quote'
  | 'embedded-link'

export interface TreatmentInfo {
  value: TreatmentType
  label: string
  description: string
}

/** Treatments implemented so far, with user-facing help text. */
export const AVAILABLE_TREATMENTS: TreatmentInfo[] = [
  {
    value: 'plain',
    label: 'Plain',
    description: 'Regular paragraph text using the article theme. The default for every imported paragraph.',
  },
  {
    value: 'scroll-reveal',
    label: 'Scroll reveal',
    description: 'The paragraph fades and slides into view as the reader scrolls to it. Choose the direction and an optional delay.',
  },
  {
    value: 'drag-compare',
    label: 'Drag compare',
    description: 'A before/after image slider with a draggable divider. Pick two images from the media library.',
  },
  {
    value: 'hover-annotate',
    label: 'Hover annotate',
    description: 'Underlines a phrase in the paragraph; hovering it shows a popover with extra text, an image, or a link.',
  },
  {
    value: 'image-figure',
    label: 'Image figure',
    description: 'A full-width image with an optional caption. Tip: drag an image from the media library straight into the storyboard to create one.',
  },
  {
    value: 'attachment',
    label: 'File attachment',
    description: 'A download card for a file (PDF, etc.). Created when you drag a non-image file into the storyboard.',
  },
  {
    value: 'scrolly',
    label: 'Sticky scroll (scrollytelling)',
    description: 'A visual stays pinned on one side while text steps scroll past on the other. Each step can swap the pinned image, or morph a bar chart (re-sort, new values). Edit the steps in the Inspector.',
  },
  {
    value: 'sentence-focus',
    label: 'Sentence focus',
    description: 'As the reader scrolls, the current sentence highlights while the rest of the paragraph dims — draws focus down the page.',
  },
]

export interface ThemeInfo {
  id: string
  label: string
  description: string
}

/** Built-in visual themes: font pairing + accent + spacing (see article.css). */
export const THEMES: ThemeInfo[] = [
  { id: 'classic', label: 'Classic', description: 'Serif body, warm paper background, ember accent.' },
  { id: 'modern', label: 'Modern', description: 'Clean sans-serif, white background, cobalt accent, tighter spacing.' },
  { id: 'editorial', label: 'Editorial', description: 'Palatino body with big display headings, crimson accent, roomy spacing.' },
  { id: 'night', label: 'Night', description: 'Dark background, light text, mint accent.' },
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
  /** One of THEMES ids; defaults to 'classic' when absent. */
  theme?: string
  media: MediaItem[]
  blocks: Block[]
}

export interface ScrollyStep {
  id: string
  text: string
  /** Image shown while this step is active (visualType 'image'). */
  imageId?: string
  /** Chart rows while this step is active (visualType 'chart'): one "Label, value" per line. */
  chartData?: string
}

export function defaultConfig(type: TreatmentType): Record<string, unknown> {
  switch (type) {
    case 'scroll-reveal':
      return { direction: 'up', delay: 0 }
    case 'drag-compare':
      return { imageA: '', imageB: '', labelA: 'Before', labelB: 'After' }
    case 'hover-annotate':
      return { triggerPhrase: '', popoverType: 'text', text: '', imageId: '', url: '' }
    case 'image-figure':
      return { imageId: '', caption: '' }
    case 'attachment':
      return { fileId: '', label: '' }
    case 'scrolly':
      return {
        visualType: 'image',
        position: 'left',
        chartTitle: '',
        steps: [{ id: 'step_1', text: '', imageId: '', chartData: '' }] as ScrollyStep[],
      }
    case 'sentence-focus':
      return { style: 'dim' }
    default:
      return {}
  }
}

export function findMedia(media: MediaItem[], id: unknown): MediaItem | undefined {
  return media.find((m) => m.id === id)
}

/** Parses scrolly chart data: one "Label, value" per line. */
export function parseChartData(raw: unknown): { label: string; value: number }[] {
  return String(raw ?? '')
    .split('\n')
    .map((line) => {
      const comma = line.lastIndexOf(',')
      if (comma < 0) return null
      const label = line.slice(0, comma).trim()
      const value = Number(line.slice(comma + 1).trim())
      if (!label || !Number.isFinite(value)) return null
      return { label, value }
    })
    .filter((d): d is { label: string; value: number } => d !== null)
}
