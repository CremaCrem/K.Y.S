const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // Window controls
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),

  // Master password and recovery kit
  getVaultStatus: () => ipcRenderer.invoke('vault-status'),
  setupVault: (password) => ipcRenderer.invoke('setup-vault', password),
  unlock: (password) => ipcRenderer.invoke('unlock', password),
  recover: (recoveryCode, newPassword) => ipcRenderer.invoke('recover', { recoveryCode, newPassword }),
  lock: () => ipcRenderer.invoke('lock'),
  changePassword: (currentPassword, newPassword) => ipcRenderer.invoke('change-password', { currentPassword, newPassword }),
  newRecoveryCode: () => ipcRenderer.invoke('new-recovery-code'),
  onVaultLocked: (callback) => {
    const listener = () => callback();
    ipcRenderer.on('vault-locked', listener);
    return () => ipcRenderer.removeListener('vault-locked', listener);
  },

  // Password operations
  getPasswords: () => ipcRenderer.invoke('get-passwords'),
  savePassword: (data) => ipcRenderer.invoke('save-password', data),
  updatePassword: (id, updates) => ipcRenderer.invoke('update-password', { id, updates }),
  deletePassword: (id) => ipcRenderer.invoke('delete-password', id),
  
  // New features
  checkDuplicate: (site, username) => ipcRenderer.invoke('check-duplicate', { site, username }),
  exportPasswords: () => ipcRenderer.invoke('export-passwords'),
  importPasswords: () => ipcRenderer.invoke('import-passwords'),
  getStats: () => ipcRenderer.invoke('get-stats'),
});
