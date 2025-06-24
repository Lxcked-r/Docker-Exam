const { contextBridge, ipcRenderer } = require('electron');


contextBridge.exposeInMainWorld('electronAPI', {
  onUpdateStatus: (callback) => ipcRenderer.on('update-status', callback),
  checkForUpdates: () => ipcRenderer.send('check-for-updates')
});

console.log('Preload script loaded successfully');