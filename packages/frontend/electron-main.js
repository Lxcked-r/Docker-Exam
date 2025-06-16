import { app, BrowserWindow } from 'electron';
import path from 'path';

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
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});