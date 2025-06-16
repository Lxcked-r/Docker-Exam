import { app, BrowserWindow, nativeTheme } from 'electron';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);


const { autoUpdater } = require('electron-updater');
import path from 'path';

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
      webSecurity: false, // Disable web security for local development
      
    }
  });

  // Load the Vue app and open the #login route
  const indexPath = path.join(app.getAppPath(), 'dist', 'index.html');
  win.loadFile(indexPath, { hash: 'login' });

  win.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify().catch(err => {
      console.error('Error checking for updates:', err);
    });
  });
}


app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

autoUpdater.on('update-available', () => {
  console.log('Update available');
});
autoUpdater.on('update-downloaded', () => {
  console.log('Update downloaded');
  autoUpdater.quitAndInstall();
});
autoUpdater.on('error', (error) => {
  console.error('Update error:', error);
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
