import { app, BrowserWindow, shell, Menu } from 'electron';
import * as path from 'path';
import isDev from 'electron-is-dev';

let mainWindow: BrowserWindow | null = null;

function createMenu() {
  const template = [
    {
      label: 'ZSW Chat',
      submenu: [
        {
          label: 'About ZSW Chat',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('show-about');
            }
          }
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template as any);
  Menu.setApplicationMenu(menu);
}

function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'ZSW Chat Interface',

    // 隐藏标题栏
    // titleBarStyle: 'hiddenInset',
    // trafficLightPosition: { x: 20, y: 20 },
    
    webPreferences: {
      preload: path.join(__dirname, 'electron-preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webSecurity: !isDev, // 在开发环境中禁用同源策略以便于调试
    },
  });

  // 加载应用内容
  if (isDev) {
    // 开发模式下加载 Next.js 开发服务器
    mainWindow.loadURL('http://localhost:3000').catch(err => {
      console.error('Failed to load development server:', err);
    });
    mainWindow.webContents.openDevTools(); // 自动打开开发者工具
  } else {
    // 生产模式下加载打包后的静态文件
    mainWindow.loadFile(path.join(__dirname, '../out/index.html')).catch(err => {
      console.error('Failed to load production files:', err);
    });
  }

  // 确保外部链接在系统默认浏览器中打开
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // 窗口关闭时清理引用
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 处理页面加载错误
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Page failed to load:', errorCode, errorDescription, validatedURL);
  });

  // 创建菜单
  createMenu();
}

// 当 Electron 初始化完成后创建窗口
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    // 在 macOS 上，通常在点击 Dock 图标且没有其他窗口打开时，重新创建应用窗口
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 当所有窗口关闭时退出应用
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 处理应用准备退出
app.on('before-quit', (event) => {
  if (mainWindow) {
    mainWindow.removeAllListeners('closed');
    mainWindow.close();
  }
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});