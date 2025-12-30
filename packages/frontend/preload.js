const { contextBridge, ipcRenderer } = require('electron');


contextBridge.exposeInMainWorld('electronAPI', {
  onUpdateStatus: (callback) => ipcRenderer.on('update-status', callback),
  checkForUpdates: () => ipcRenderer.send('check-for-updates'),
  saveToken: (token) => ipcRenderer.send('save-token', token),
  getToken: () => ipcRenderer.invoke('get-token'),
  getIdleData: () => ipcRenderer.invoke('get-idle-data'),
  saveIdleData: (data) => ipcRenderer.invoke('save-idle-data', data),
  getFriends: () => ipcRenderer.invoke('get-friends'),

});

console.log('Preload script loaded successfully');