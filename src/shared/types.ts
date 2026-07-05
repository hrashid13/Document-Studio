// Schema for project.json (PRD section 6) — shared by studio, viewer, and export.

export type TreatmentType =
  | 'plain'
  | 'heading'
  | 'sentence-focus'
  | 'scroll-reveal'
  | 'drag-compare'
  | 'hover-annotate'
  | 'inline-link'
  | 'image-figure'
  | 'attachment'
  | 'scrolly'
  | 'click-expand'
  | 'parallax-image'
  | 'animated-stat'
  | 'pull-quote'
  | 'embedded-link'

/**
 * A block has exactly one TEXT MODE (how its text renders) plus any number of
 * ADD-ONS (effects, inline decorations, and media attached to the block).
 */
export const TEXT_MODES: TreatmentType[] = ['plain', 'heading', 'sentence-focus']

export const ADDON_TYPES: TreatmentType[] = [
  'scroll-reveal',
  'hover-annotate',
  'inline-link',
  'drag-compare',
  'image-figure',
  'attachment',
  'scrolly',
]

export interface TreatmentInfo {
  value: TreatmentType
  label: string
  description: string
  category: 'text' | 'addon'
}

/** Implemented treatments, with user-facing help text. */
export const AVAILABLE_TREATMENTS: TreatmentInfo[] = [
  {
    value: 'plain',
    label: 'Plain',
    description: 'Regular paragraph text using the article theme. The default for every imported paragraph.',
    category: 'text',
  },
  {
    value: 'heading',
    label: 'Heading',
    description: 'Renders the block as a section header in a bigger font. Three sizes available.',
    category: 'text',
  },
  {
    value: 'sentence-focus',
    label: 'Sentence focus',
    description: 'As the reader scrolls, the current sentence highlights while the rest of the paragraph dims — draws focus down the page.',
    category: 'text',
  },
  {
    value: 'scroll-reveal',
    label: 'Scroll reveal',
    description: 'The whole block fades and slides into view as the reader scrolls to it. Choose the direction and an optional delay.',
    category: 'addon',
  },
  {
    value: 'hover-annotate',
    label: 'Hover annotate',
    description: 'Underlines a phrase in the text; hovering it shows a popover with extra text, an image, or a link.',
    category: 'addon',
  },
  {
    value: 'inline-link',
    label: 'Inline link',
    description: 'Makes a phrase in the text a clickable link — or adds a styled link button below the block.',
    category: 'addon',
  },
  {
    value: 'image-figure',
    label: 'Image figure',
    description: 'A full-width image with an optional caption. Tip: drag an image from the media library straight into the storyboard to create one.',
    category: 'addon',
  },
  {
    value: 'attachment',
    label: 'File attachment',
    description: 'A download card for a file (PDF, etc.). Created when you drag a non-image file into the storyboard.',
    category: 'addon',
  },
  {
    value: 'drag-compare',
    label: 'Drag compare',
    description: 'A before/after image slider with a draggable divider. Pick two images from the media library.',
    category: 'addon',
  },
  {
    value: 'scrolly',
    label: 'Sticky scroll (scrollytelling)',
    description: 'A visual stays pinned on one side while text steps scroll past on the other. Each step can swap the pinned image, or morph a bar chart. Combine with Sentence focus to highlight step text line by line.',
    category: 'addon',
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

/** Manual font choices (web-safe stacks — no internet needed to view exports). */
export const FONTS: { id: string; label: string; stack: string }[] = [
  { id: 'georgia', label: 'Georgia (serif)', stack: "Georgia, 'Times New Roman', serif" },
  { id: 'palatino', label: 'Palatino (serif)', stack: "'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, serif" },
  { id: 'times', label: 'Times New Roman (serif)', stack: "'Times New Roman', Times, serif" },
  { id: 'system', label: 'System Sans', stack: "system-ui, 'Segoe UI', 'Helvetica Neue', sans-serif" },
  { id: 'arial', label: 'Arial (sans)', stack: "Arial, 'Helvetica Neue', Helvetica, sans-serif" },
  { id: 'verdana', label: 'Verdana (sans)', stack: 'Verdana, Geneva, Tahoma, sans-serif' },
  { id: 'courier', label: 'Courier (mono)', stack: "'Courier New', Courier, monospace" },
]

/** Manual accent colors — used for links, highlights, buttons, chart bars. */
export const ACCENT_COLORS: { id: string; label: string; value: string }[] = [
  { id: 'ember', label: 'Ember', value: '#c2410c' },
  { id: 'crimson', label: 'Crimson', value: '#b91c1c' },
  { id: 'cobalt', label: 'Cobalt', value: '#2563eb' },
  { id: 'ocean', label: 'Ocean', value: '#0e7490' },
  { id: 'teal', label: 'Teal', value: '#0d9488' },
  { id: 'forest', label: 'Forest', value: '#15803d' },
  { id: 'violet', label: 'Violet', value: '#7c3aed' },
  { id: 'magenta', label: 'Magenta', value: '#db2777' },
  { id: 'amber', label: 'Amber', value: '#b45309' },
  { id: 'slate', label: 'Slate', value: '#475569' },
]

/** Manual font (text) colors. */
export const TEXT_COLORS: { id: string; label: string; value: string }[] = [
  { id: 'ink', label: 'Ink (near-black)', value: '#1b1b1f' },
  { id: 'charcoal', label: 'Charcoal', value: '#3f3f46' },
  { id: 'sepia', label: 'Sepia', value: '#4a3f35' },
  { id: 'paper', label: 'Paper (for dark themes)', value: '#e8e6e3' },
]

export interface Treatment {
  type: TreatmentType
  config: Record<string, unknown>
}

export interface BlockStyle {
  /** FONTS id. */
  font?: string
  /** TEXT_COLORS id. */
  textColor?: string
}

export interface DocStyle {
  /** ACCENT_COLORS id — overrides the theme accent. */
  accentColor?: string
  /** FONTS id — overrides the theme body font. */
  font?: string
  /** TEXT_COLORS id — overrides the theme text color. */
  textColor?: string
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
  /** One text mode + any number of add-ons. */
  treatments: Treatment[]
  /** Manual font/color overrides for this block. */
  style?: BlockStyle
  /** Legacy single-treatment field (pre-multi-treatment projects). */
  treatment?: Treatment
}

export interface Project {
  projectName: string
  createdAt: string
  updatedAt: string
  /** One of THEMES ids; defaults to 'classic' when absent. */
  theme?: string
  /** Manual document-wide style overrides (sit on top of the theme). */
  style?: DocStyle
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
    case 'heading':
      return { level: 1 }
    case 'sentence-focus':
      return { style: 'dim' }
    case 'scroll-reveal':
      return { direction: 'up', delay: 0 }
    case 'drag-compare':
      return { imageA: '', imageB: '', labelA: 'Before', labelB: 'After' }
    case 'hover-annotate':
      return { triggerPhrase: '', popoverType: 'text', text: '', imageId: '', url: '' }
    case 'inline-link':
      return { display: 'inline', triggerPhrase: '', url: '', label: 'Learn more' }
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
    default:
      return {}
  }
}

export function isTextMode(type: TreatmentType): boolean {
  return TEXT_MODES.includes(type)
}

/** The block's text mode ('plain' when none is stored). */
export function textModeOf(block: Block): Treatment {
  return block.treatments.find((t) => isTextMode(t.type)) ?? { type: 'plain', config: {} }
}

export function addonsOf(block: Block): Treatment[] {
  return block.treatments.filter((t) => !isTextMode(t.type))
}

export function getTreatment(block: Block, type: TreatmentType): Treatment | undefined {
  return block.treatments.find((t) => t.type === type)
}

/** Upgrades legacy single-treatment blocks to the treatments array in place. */
export function migrateProject(project: Project): Project {
  return {
    ...project,
    blocks: project.blocks.map((b) => {
      if (Array.isArray(b.treatments)) return b
      const legacy = b.treatment
      const treatments = legacy && legacy.type !== 'plain' ? [legacy] : []
      const { treatment: _drop, ...rest } = b
      return { ...rest, treatments }
    }),
  }
}

export function findMedia(media: MediaItem[], id: unknown): MediaItem | undefined {
  return media.find((m) => m.id === id)
}

export function fontStack(id: unknown): string | undefined {
  return FONTS.find((f) => f.id === id)?.stack
}

export function accentValue(id: unknown): string | undefined {
  return ACCENT_COLORS.find((c) => c.id === id)?.value
}

export function textColorValue(id: unknown): string | undefined {
  return TEXT_COLORS.find((c) => c.id === id)?.value
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
