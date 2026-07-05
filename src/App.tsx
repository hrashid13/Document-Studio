import { Inspector } from './studio/Inspector'
import { MediaLibrary } from './studio/MediaLibrary'
import { Preview } from './studio/Preview'
import { Storyboard } from './studio/Storyboard'
import { Toolbar } from './studio/Toolbar'
import { useStudio } from './studio/state'
import './studio/studio.css'

function StartScreen() {
  const { dispatch } = useStudio()

  const load = async (kind: 'new' | 'open') => {
    const res = kind === 'new' ? await window.studio!.newProject() : await window.studio!.openProject()
    if (res.error) alert(res.error)
    if (res.dir && res.project) dispatch({ type: 'PROJECT_LOADED', dir: res.dir, project: res.project })
  }

  return (
    <div className="start-screen">
      <h1>Interactive Article Studio</h1>
      <p>Turn an essay and its media into a scrolling, interactive web article — then export it as a folder that runs anywhere.</p>
      <div className="start-actions">
        <button className="btn primary" onClick={() => load('new')}>
          New project
        </button>
        <button className="btn" onClick={() => load('open')}>
          Open project
        </button>
      </div>
    </div>
  )
}

export default function App() {
  const { state } = useStudio()

  if (!window.studio) {
    return (
      <div className="start-screen">
        <h1>Interactive Article Studio</h1>
        <p>This page is the Electron renderer — start the app with <code>npm run dev</code> instead of opening it in a browser.</p>
      </div>
    )
  }

  if (!state.project) {
    return (
      <>
        <Toolbar />
        <StartScreen />
      </>
    )
  }

  return (
    <div className="app-shell">
      <Toolbar />
      {state.view === 'preview' ? (
        <Preview />
      ) : (
        <div className="panels">
          <aside className="panel left">
            <MediaLibrary />
          </aside>
          <main className="panel center">
            <div className="panel-title">Storyboard</div>
            <Storyboard />
          </main>
          <aside className="panel right">
            <Inspector />
          </aside>
        </div>
      )}
    </div>
  )
}
