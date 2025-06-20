import { app, BrowserWindow, nativeTheme, ipcMain } from 'electron';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { autoUpdater } = require('electron-updater');
import path from 'path';
import fs from 'fs';

// Force dark mode
nativeTheme.themeSource = 'dark';

app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  event.preventDefault();
  callback(true); // Trust all certificates
});

function createWindow () {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      //preload: "preload.js", // Path to your preload script
    },

  });
  win.setMenuBarVisibility(false); // Hide the menu bar
  win.setTitle('Bowy ' + app.getVersion());

  // Load the Vue app and open the #login route
  const indexPath = path.join(app.getAppPath(), 'dist', 'index.html');
  win.loadFile(indexPath, { hash: 'login' });

  win.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify().catch(err => {
      console.error('Error checking for updates:', err);
    });
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

autoUpdater.on('update-available', () => {
  BrowserWindow.getAllWindows().forEach(win => {
    win.webContents.send('update-status', 'available');
    // Optionally, you can show a notification or dialog to the user
    win.setProgressBar(-1); // Indeterminate progress bar

  });
});
autoUpdater.on('download-progress', (progressObj) => {
  BrowserWindow.getAllWindows().forEach(win => {
    win.webContents.send('update-status', 'downloading', progressObj);
    // use loading bar or progress indicator in your UI
    win.setProgressBar(progressObj.percent / 100);
  });
});
autoUpdater.on('update-downloaded', () => {
  BrowserWindow.getAllWindows().forEach(win => {
    win.webContents.send('update-status', 'downloaded');
    autoUpdater.quitAndInstall();
  });
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});


app.whenReady().then(createWindow);
