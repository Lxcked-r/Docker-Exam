import { app, BrowserWindow, nativeTheme, ipcMain, Notification } from 'electron';
import { fileURLToPath } from 'url';


import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { autoUpdater } = require('electron-updater');
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const preloadPath = path.join(__dirname, 'preload.js');
console.log('Preload script path:', preloadPath);

// Force dark mode
nativeTheme.themeSource = 'dark';

app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  event.preventDefault();
  callback(true); // Trust all certificates
});

// ################# HANDLERS #################
ipcMain.on('check-for-updates', (event) => {
  autoUpdater.checkForUpdates().then(() => {
    event.sender.send('update-status', 'checking');
  }).catch(err => {
    console.error('Error checking for updates:', err);
    event.sender.send('update-status', 'error', err.message);
  });
});

function createWindow () {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath, // Use the preload script

      openDevTools: true, // Uncomment to open DevTools by default

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
    const notification = {
      title: 'Update Available',
      body: 'A new version of Bowy is available. Downloading now...',
    };
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

autoUpdater.on('update-not-available', () => {
  BrowserWindow.getAllWindows().forEach(win => {
    win.webContents.send('update-status', 'not-available');
    console.log('No updates available');
    // Optionally, you can show a notification or dialog to the user
    const notification = {
      title: 'No Update Available',
      body: 'You are using the latest version of Bowy.',
    };
    new Notification(notification).show();
  }
  );
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});


app.whenReady().then(createWindow).then(() => {
  new Notification({
    title: 'Bowy',
    body: 'Bowy is ready to use!',
  }).show()
  }).catch(err => {
    console.error('Error during app initialization:', err)
  });