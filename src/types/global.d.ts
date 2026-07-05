import type { MediaItem, Project } from '../shared/types'

interface ProjectResult {
  canceled?: boolean
  error?: string
  dir?: string
  project?: Project
}

interface EssayResult {
  canceled?: boolean
  name?: string
  kind?: 'text' | 'docx'
  text?: string
  data?: Uint8Array
}

interface MediaResult {
  canceled?: boolean
  error?: string
  items?: MediaItem[]
}

interface ExportResult {
  canceled?: boolean
  error?: string
  dest?: string
}

export interface StudioAPI {
  newProject(): Promise<ProjectResult>
  openProject(): Promise<ProjectResult>
  saveProject(project: Project): Promise<{ ok?: boolean; error?: string }>
  importEssay(): Promise<EssayResult>
  importMedia(startIndex: number): Promise<MediaResult>
  importMediaPaths(paths: string[], startIndex: number): Promise<MediaResult>
  exportArticle(project: Project): Promise<ExportResult>
  getPathForFile(file: File): string
}

declare global {
  interface Window {
    studio?: StudioAPI
  }
}
