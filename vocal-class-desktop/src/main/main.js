const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

let mainWindow = null;

const resolveRuntimePath = (...segments) => {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, ...segments);
  }
  return path.resolve(__dirname, '..', '..', ...segments);
};

const createMainWindow = async () => {
  mainWindow = new BrowserWindow({
    width: 430,
    height: 820,
    minWidth: 390,
    minHeight: 700,
    title: '声乐教学管理系统',
    backgroundColor: '#f7f8fa',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  const indexPath = path.join(resolveRuntimePath('renderer'), 'index.html');
  await mainWindow.loadFile(indexPath);
};

app.whenReady().then(async () => {
  await createMainWindow();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
