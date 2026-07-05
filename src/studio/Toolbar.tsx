import { useState } from 'react'
import { THEMES } from '../shared/types'
import { extractDocxText, paragraphsToBlocks, splitIntoParagraphs } from '../lib/parseEssay'
import { useStudio } from './state'
import { HelpModal } from './Help'

export function Toolbar() {
  const { state, dispatch, saveStatus } = useStudio()
  const [helpOpen, setHelpOpen] = useState(false)
  const project = state.project

  const loadProject = async (kind: 'new' | 'open') => {
    const res = kind === 'new' ? await window.studio!.newProject() : await window.studio!.openProject()
    if (res.error) await window.studio!.message(res.error)
    if (res.dir && res.project) dispatch({ type: 'PROJECT_LOADED', dir: res.dir, project: res.project })
  }

  const importEssay = async () => {
    const res = await window.studio!.importEssay()
    if (res.canceled || !res.kind) return
    let text = ''
    if (res.kind === 'docx') {
      try {
        text = await extractDocxText(res.data!)
      } catch (err) {
        await window.studio!.message(`Could not read the .docx file: ${err instanceof Error ? err.message : err}`)
        return
      }
    } else {
      text = res.text ?? ''
    }
    const paragraphs = splitIntoParagraphs(text)
    if (paragraphs.length === 0) {
      await window.studio!.message('No paragraphs found in that file.')
      return
    }
    if (
      project!.blocks.length > 0 &&
      !(await window.studio!.confirm(
        `Importing "${res.name}" will replace the current ${project!.blocks.length} block(s).`,
        'Continue?',
      ))
    ) {
      return
    }
    dispatch({ type: 'SET_BLOCKS', blocks: paragraphsToBlocks(paragraphs) })
  }

  const exportArticle = async () => {
    const res = await window.studio!.exportArticle({ ...project!, updatedAt: new Date().toISOString() })
    if (res.error) await window.studio!.message(res.error)
  }

  const inPreview = state.view === 'preview'

  return (
    <div className="toolbar">
      <span className="app-title">Interactive Article Studio</span>
      {project && <span className="project-name">{project.projectName}</span>}
      <span className={`save-status ${saveStatus}`}>
        {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Saved' : ''}
      </span>
      <div className="toolbar-actions">
        <button className="btn subtle" onClick={() => loadProject('new')} title="Create a new project in an empty folder">
          New
        </button>
        <button className="btn subtle" onClick={() => loadProject('open')} title="Open an existing project folder">
          Open
        </button>
        {project && (
          <>
            <button
              className="btn"
              onClick={importEssay}
              title="Load a .txt, .md, or .docx essay — each paragraph becomes a block"
            >
              Import essay
            </button>
            <label className="theme-picker" title="Article theme: font pairing, accent color, and spacing">
              <span>Theme</span>
              <select
                value={project.theme ?? 'classic'}
                onChange={(e) => dispatch({ type: 'SET_THEME', theme: e.target.value })}
              >
                {THEMES.map((t) => (
                  <option key={t.id} value={t.id} title={t.description}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              className={`btn${inPreview ? ' active' : ''}`}
              onClick={() => dispatch({ type: 'SET_VIEW', view: inPreview ? 'edit' : 'preview' })}
              title="Toggle a live, scrollable render of the article — identical to the export"
            >
              {inPreview ? '✎ Back to editor' : '▶ Preview'}
            </button>
            <button
              className="btn primary"
              onClick={exportArticle}
              title="Write a self-contained web folder you can open anywhere or host"
            >
              Export…
            </button>
          </>
        )}
        <button className="btn subtle" onClick={() => setHelpOpen(true)} title="How to use the studio">
          ?
        </button>
      </div>
      {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}
    </div>
  )
}
