const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // Window controls
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),

  // Password operations
  getPasswords: () => ipcRenderer.invoke('get-passwords'),
  savePassword: (data) => ipcRenderer.invoke('save-password', data),
  updatePassword: (id, updates) => ipcRenderer.invoke('update-password', { id, updates }),
  deletePassword: (id) => ipcRenderer.invoke('delete-password', id),
  updatePasswords: (passwords) => ipcRenderer.invoke('update-passwords', passwords),
  
  // New features
  checkDuplicate: (site, username) => ipcRenderer.invoke('check-duplicate', { site, username }),
  exportPasswords: () => ipcRenderer.invoke('export-passwords'),
  importPasswords: () => ipcRenderer.invoke('import-passwords'),
  getStats: () => ipcRenderer.invoke('get-stats'),
});
