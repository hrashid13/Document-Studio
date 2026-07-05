import type { Block } from '../shared/types'

/**
 * Splits essay text into paragraph blocks on blank lines (PRD section 9).
 * Text is preserved exactly apart from trimming surrounding whitespace.
 */
export function splitIntoParagraphs(text: string): string[] {
  return text
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export async function extractDocxText(data: Uint8Array): Promise<string> {
  const mammoth = await import('mammoth/mammoth.browser')
  const buffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer
  const result = await mammoth.extractRawText({ arrayBuffer: buffer })
  return result.value
}

export function paragraphsToBlocks(paragraphs: string[]): Block[] {
  return paragraphs.map((rawText, i) => ({
    id: `block_${String(i + 1).padStart(4, '0')}`,
    order: i,
    rawText,
    treatments: [],
  }))
}
