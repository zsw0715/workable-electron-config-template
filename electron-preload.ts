const { contextBridge, ipcRenderer } = require('electron');

// 暴露 Electron API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 发送消息到主进程
  send: (channel, data) => {
    const validChannels = ['app:quit', 'app:minimize', 'app:maximize'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  // 从主进程接收消息
  receive: (channel, func) => {
    const validChannels = ['app:update-available'];
    if (validChannels.includes(channel)) {
      // 安全地接收消息
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
});