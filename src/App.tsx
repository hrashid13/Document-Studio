import { useEffect, useState } from 'react'
import type { RecentProject } from './types/global'
import { Inspector } from './studio/Inspector'
import { MediaLibrary } from './studio/MediaLibrary'
import { Preview } from './studio/Preview'
import { Storyboard } from './studio/Storyboard'
import { Toolbar } from './studio/Toolbar'
import { useStudio } from './studio/state'
import './studio/studio.css'

function StartScreen() {
  const { dispatch } = useStudio()
  const [recent, setRecent] = useState<RecentProject[]>([])

  useEffect(() => {
    window.studio?.recentProjects().then(setRecent)
  }, [])

  const load = async (kind: 'new' | 'open') => {
    const res = kind === 'new' ? await window.studio!.newProject() : await window.studio!.openProject()
    if (res.error) await window.studio!.message(res.error)
    if (res.dir && res.project) dispatch({ type: 'PROJECT_LOADED', dir: res.dir, project: res.project })
  }

  const openRecent = async (dir: string) => {
    const res = await window.studio!.openProjectPath(dir)
    if (res.error) {
      await window.studio!.message(res.error)
      setRecent(await window.studio!.recentProjects())
      return
    }
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
      {recent.length > 0 && (
        <div className="recent-list">
          <div className="panel-title">Recent projects</div>
          {recent.map((r) => (
            <button key={r.dir} className="recent-item" onClick={() => openRecent(r.dir)} title={r.dir}>
              <span className="recent-name">{r.name}</span>
              <span className="recent-dir">{r.dir}</span>
              <span className="recent-date">{new Date(r.openedAt).toLocaleDateString()}</span>
            </button>
          ))}
        </div>
      )}
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
