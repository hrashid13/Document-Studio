const { contextBridge, ipcRenderer, webUtils } = require('electron')

contextBridge.exposeInMainWorld('studio', {
  newProject: () => ipcRenderer.invoke('project:new'),
  openProject: () => ipcRenderer.invoke('project:open'),
  saveProject: (project) => ipcRenderer.invoke('project:save', project),
  importEssay: () => ipcRenderer.invoke('essay:import'),
  importMedia: (startIndex) => ipcRenderer.invoke('media:import', startIndex),
  importMediaPaths: (paths, startIndex) => ipcRenderer.invoke('media:importPaths', paths, startIndex),
  exportArticle: (project) => ipcRenderer.invoke('export:article', project),
  getPathForFile: (file) => webUtils.getPathForFile(file),
})
