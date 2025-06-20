import { ipcRenderer, contextBridge } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  onUpdateStatus: (callback) => ipcRenderer.on('update-status', callback)
});