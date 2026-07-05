import { extractDocxText, paragraphsToBlocks, splitIntoParagraphs } from '../lib/parseEssay'
import { useStudio } from './state'

export function Toolbar() {
  const { state, dispatch, saveStatus } = useStudio()
  const project = state.project

  const loadProject = async (kind: 'new' | 'open') => {
    const res = kind === 'new' ? await window.studio!.newProject() : await window.studio!.openProject()
    if (res.error) alert(res.error)
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
        alert(`Could not read the .docx file: ${err instanceof Error ? err.message : err}`)
        return
      }
    } else {
      text = res.text ?? ''
    }
    const paragraphs = splitIntoParagraphs(text)
    if (paragraphs.length === 0) {
      alert('No paragraphs found in that file.')
      return
    }
    if (
      project!.blocks.length > 0 &&
      !confirm(`Importing "${res.name}" will replace the current ${project!.blocks.length} block(s). Continue?`)
    ) {
      return
    }
    dispatch({ type: 'SET_BLOCKS', blocks: paragraphsToBlocks(paragraphs) })
  }

  const exportArticle = async () => {
    const res = await window.studio!.exportArticle({ ...project!, updatedAt: new Date().toISOString() })
    if (res.error) alert(res.error)
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
        <button className="btn subtle" onClick={() => loadProject('new')}>
          New
        </button>
        <button className="btn subtle" onClick={() => loadProject('open')}>
          Open
        </button>
        {project && (
          <>
            <button className="btn" onClick={importEssay}>
              Import essay
            </button>
            <button
              className={`btn${inPreview ? ' active' : ''}`}
              onClick={() => dispatch({ type: 'SET_VIEW', view: inPreview ? 'edit' : 'preview' })}
            >
              {inPreview ? '✎ Back to editor' : '▶ Preview'}
            </button>
            <button className="btn primary" onClick={exportArticle}>
              Export…
            </button>
          </>
        )}
      </div>
    </div>
  )
}
