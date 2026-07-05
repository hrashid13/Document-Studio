const { app, BrowserWindow, ipcMain, dialog, protocol, shell, net } = require('electron')
const path = require('node:path')
const fsp = require('node:fs/promises')
const fs = require('node:fs')
const { pathToFileURL } = require('node:url')
const { writeExport } = require('./exporter.cjs')

// studio:// serves files out of the currently open project folder so the
// renderer can display imported assets without absolute filesystem paths.
protocol.registerSchemesAsPrivileged([
  { scheme: 'studio', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } },
])

let mainWindow = null
let currentProjectDir = null

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1480,
    height: 940,
    minWidth: 1024,
    minHeight: 640,
    backgroundColor: '#16161d',
    title: 'Interactive Article Studio',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
    },
  })
  mainWindow.setMenuBarVisibility(false)

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }
}

function projectFile(dir) {
  return path.join(dir, 'project.json')
}

async function readProject(dir) {
  const raw = await fsp.readFile(projectFile(dir), 'utf-8')
  return JSON.parse(raw)
}

async function copyMediaFiles(sourcePaths, startIndex) {
  const items = []
  let i = startIndex
  await fsp.mkdir(path.join(currentProjectDir, 'assets'), { recursive: true })
  for (const src of sourcePaths) {
    const ext = path.extname(src).toLowerCase()
    const id = `media_${String(i).padStart(4, '0')}`
    const storedPath = `assets/${id}${ext}`
    await fsp.copyFile(src, path.join(currentProjectDir, storedPath))
    items.push({
      id,
      type: IMAGE_EXTENSIONS.includes(ext) ? 'image' : 'file',
      originalFilename: path.basename(src),
      storedPath,
      tags: [],
    })
    i++
  }
  return items
}

function registerIpc() {
  ipcMain.handle('project:new', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Choose (or create) an empty folder for the new project',
      properties: ['openDirectory', 'createDirectory'],
    })
    if (result.canceled || result.filePaths.length === 0) return { canceled: true }
    const dir = result.filePaths[0]

    if (fs.existsSync(projectFile(dir))) {
      // Folder already holds a project — just open it.
      const project = await readProject(dir)
      currentProjectDir = dir
      return { dir, project }
    }

    const now = new Date().toISOString()
    const project = {
      projectName: path.basename(dir),
      createdAt: now,
      updatedAt: now,
      media: [],
      blocks: [],
    }
    await fsp.mkdir(path.join(dir, 'assets'), { recursive: true })
    await fsp.writeFile(projectFile(dir), JSON.stringify(project, null, 2), 'utf-8')
    currentProjectDir = dir
    return { dir, project }
  })

  ipcMain.handle('project:open', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Open a project folder (must contain project.json)',
      properties: ['openDirectory'],
    })
    if (result.canceled || result.filePaths.length === 0) return { canceled: true }
    const dir = result.filePaths[0]
    if (!fs.existsSync(projectFile(dir))) {
      return { error: 'That folder does not contain a project.json file.' }
    }
    try {
      const project = await readProject(dir)
      currentProjectDir = dir
      return { dir, project }
    } catch (err) {
      return { error: `Could not read project.json: ${err.message}` }
    }
  })

  ipcMain.handle('project:save', async (_event, project) => {
    if (!currentProjectDir) return { error: 'No project open.' }
    await fsp.writeFile(projectFile(currentProjectDir), JSON.stringify(project, null, 2), 'utf-8')
    return { ok: true }
  })

  ipcMain.handle('essay:import', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Import an essay',
      properties: ['openFile'],
      filters: [{ name: 'Essays', extensions: ['txt', 'md', 'docx'] }],
    })
    if (result.canceled || result.filePaths.length === 0) return { canceled: true }
    const file = result.filePaths[0]
    const name = path.basename(file)
    if (path.extname(file).toLowerCase() === '.docx') {
      const data = await fsp.readFile(file)
      return { name, kind: 'docx', data }
    }
    const text = await fsp.readFile(file, 'utf-8')
    return { name, kind: 'text', text }
  })

  ipcMain.handle('media:import', async (_event, startIndex) => {
    if (!currentProjectDir) return { error: 'No project open.' }
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Import media',
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'] },
        { name: 'All files', extensions: ['*'] },
      ],
    })
    if (result.canceled || result.filePaths.length === 0) return { canceled: true }
    const items = await copyMediaFiles(result.filePaths, startIndex)
    return { items }
  })

  ipcMain.handle('media:importPaths', async (_event, paths, startIndex) => {
    if (!currentProjectDir) return { error: 'No project open.' }
    const items = await copyMediaFiles(paths, startIndex)
    return { items }
  })

  ipcMain.handle('export:article', async (_event, project) => {
    if (!currentProjectDir) return { error: 'No project open.' }
    // Packaged builds ship viewer-dist as an extraResource next to the app;
    // in development it lives at the repo root.
    const viewerDist = app.isPackaged
      ? path.join(process.resourcesPath, 'viewer-dist')
      : path.join(__dirname, '..', 'viewer-dist')
    if (!fs.existsSync(path.join(viewerDist, 'viewer.js'))) {
      return { error: 'Viewer bundle not built yet. Run "npm run build:viewer" first.' }
    }
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Choose a destination folder for the exported article',
      properties: ['openDirectory', 'createDirectory'],
    })
    if (result.canceled || result.filePaths.length === 0) return { canceled: true }
    try {
      const dest = await writeExport(project, currentProjectDir, result.filePaths[0], viewerDist)
      shell.showItemInFolder(path.join(dest, 'index.html'))
      return { dest }
    } catch (err) {
      return { error: `Export failed: ${err.message}` }
    }
  })
}

app.whenReady().then(() => {
  protocol.handle('studio', async (request) => {
    if (!currentProjectDir) return new Response('No project open', { status: 404 })
    const url = new URL(request.url)
    const rel = decodeURIComponent(url.pathname).replace(/^\/+/, '')
    const filePath = path.normalize(path.join(currentProjectDir, rel))
    const root = path.normalize(currentProjectDir + path.sep)
    if (!filePath.startsWith(root)) return new Response('Forbidden', { status: 403 })
    return net.fetch(pathToFileURL(filePath).toString())
  })

  registerIpc()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
