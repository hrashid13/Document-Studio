import { createRoot } from 'react-dom/client'
import { ArticleRenderer } from '../shared/ArticleRenderer'
import type { Project } from '../shared/types'

// Entry point of the exported bundle. The export step writes an index.html
// that inlines the project as window.__ARTICLE_DATA__ and loads this script.
// Assets resolve relative to index.html, so no resolver override is needed.

declare global {
  interface Window {
    __ARTICLE_DATA__?: Project
  }
}

const project = window.__ARTICLE_DATA__
const rootEl = document.getElementById('root')

if (project && rootEl) {
  createRoot(rootEl).render(<ArticleRenderer project={project} />)
} else if (rootEl) {
  rootEl.textContent = 'No article data found in this page.'
}
