const { contextBridge, ipcRenderer } = require('electron');


contextBridge.exposeInMainWorld('electronAPI', {
  onUpdateStatus: (callback) => ipcRenderer.on('update-status', callback),
  checkForUpdates: () => ipcRenderer.send('check-for-updates'),
  saveToken: (token) => ipcRenderer.send('save-token', token),
  getToken: () => ipcRenderer.invoke('get-token'),

});

console.log('Preload script loaded successfully');