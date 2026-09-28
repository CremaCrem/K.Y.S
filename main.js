const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

let mainWindow;

// Use userData directory for storing passwords (persists across updates)
const getPasswordsFilePath = () => path.join(app.getPath('userData'), 'passwords.json');

// Old file path (for migration from old versions)
const getOldPasswordsFilePath = () => path.join(__dirname, 'passwords.json');

// Migrate passwords from old location to new location
async function migrateOldPasswords() {
  const oldPath = getOldPasswordsFilePath();
  const newPath = getPasswordsFilePath();
  
  try {
    await fs.access(oldPath);
    try {
      await fs.access(newPath);
      console.log('Migration skipped: new passwords file already exists');
    } catch {
      const data = await fs.readFile(oldPath, 'utf-8');
      await fs.writeFile(newPath, data);
      console.log('Successfully migrated passwords to:', newPath);
    }
  } catch {
    // Old file doesn't exist, nothing to migrate
  }
}

function createWindow() {
  // In development we load the icon directly from the project,
  // in production from the packaged resources folder.
  const isDev = !app.isPackaged;
  const iconPath = isDev
    ? path.join(__dirname, 'assets', 'KYS.ico')
    : path.join(process.resourcesPath, 'assets', 'KYS.ico');

  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    minWidth: 1024,
    minHeight: 768,
    frame: false,
    autoHideMenuBar: true,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // In development we load the React dev server (ELECTRON_START_URL),
  // in production we load the built React files from /build
  const startUrl = isDev && process.env.ELECTRON_START_URL
    ? process.env.ELECTRON_START_URL
    : `file://${path.join(__dirname, 'build', 'index.html')}`;
  
  console.log('Loading URL:', startUrl);

  mainWindow.loadURL(startUrl).catch(err => {
    console.error('Failed to load URL:', err);
  });

  mainWindow.on('closed', () => (mainWindow = null));
  
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

app.on('ready', async () => {
  await migrateOldPasswords();
  createWindow();
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Window control handlers
ipcMain.on('minimize-window', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('maximize-window', () => {
  if (mainWindow) {
    mainWindow.isMaximized() ? mainWindow.restore() : mainWindow.maximize();
  }
});

ipcMain.on('close-window', () => {
  if (mainWindow) mainWindow.close();
});

// Helper to read passwords file
async function readPasswords() {
  const filePath = getPasswordsFilePath();
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    let passwords = JSON.parse(data);
    
    let needsMigration = false;
    passwords = passwords.map(entry => {
      if (!entry.id) {
        needsMigration = true;
        return { ...entry, id: generateId() };
      }
      return entry;
    });
    
    if (needsMigration) {
      await writePasswords(passwords);
    }
    
    return passwords;
  } catch (err) {
    if (err.code === 'ENOENT') {
      return [];
    }
    console.error('Error reading passwords:', err);
    return [];
  }
}

// Helper to write passwords file
async function writePasswords(passwords) {
  const filePath = getPasswordsFilePath();
  await fs.writeFile(filePath, JSON.stringify(passwords, null, 2));
}

// Generate unique ID for entries
function generateId() {
  return crypto.randomUUID();
}

// Get all passwords
ipcMain.handle('get-passwords', async () => {
  return await readPasswords();
});

// Check for duplicates
ipcMain.handle('check-duplicate', async (event, { site, username }) => {
  const passwords = await readPasswords();
  const duplicate = passwords.find(p => 
    p.site?.toLowerCase() === site?.toLowerCase() && 
    p.username?.toLowerCase() === username?.toLowerCase()
  );
  return { isDuplicate: !!duplicate, existing: duplicate };
});

// Save a new password
ipcMain.handle('save-password', async (event, data) => {
  const { site, username, password, category, notes } = data;

  if (!site || !username || !password) {
    throw new Error('Site, username, and password are required!');
  }

  const passwords = await readPasswords();
  
  const newEntry = {
    id: generateId(),
    site,
    username,
    password,
    createdAt: new Date().toISOString()
  };
  
  if (category) newEntry.category = category;
  if (notes) newEntry.notes = notes;
  
  passwords.push(newEntry);
  await writePasswords(passwords);
  
  return { success: true, message: 'Password saved successfully!' };
});

// Update a single password by ID
ipcMain.handle('update-password', async (event, { id, updates }) => {
  const passwords = await readPasswords();
  const index = passwords.findIndex(p => p.id === id);
  
  if (index === -1) {
    throw new Error('Password entry not found');
  }
  
  passwords[index] = { ...passwords[index], ...updates, updatedAt: new Date().toISOString() };
  await writePasswords(passwords);
  
  return { success: true, message: 'Password updated successfully!' };
});

// Delete a password by ID
ipcMain.handle('delete-password', async (event, id) => {
  const passwords = await readPasswords();
  const filtered = passwords.filter(p => p.id !== id);
  
  if (filtered.length === passwords.length) {
    throw new Error('Password entry not found');
  }
  
  await writePasswords(filtered);
  return { success: true, message: 'Password deleted successfully!' };
});

// Export passwords to JSON file
ipcMain.handle('export-passwords', async () => {
  const passwords = await readPasswords();
  
  const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
    title: 'Export Passwords',
    defaultPath: `kys-backup-${new Date().toISOString().split('T')[0]}.json`,
    filters: [
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  
  if (canceled || !filePath) {
    return { success: false, message: 'Export cancelled' };
  }
  
  // Export without IDs for cleaner file
  const exportData = passwords.map(({ id, ...rest }) => rest);
  await fs.writeFile(filePath, JSON.stringify(exportData, null, 2));
  
  return { success: true, message: `Exported ${passwords.length} passwords`, path: filePath };
});

// Import passwords from JSON file
ipcMain.handle('import-passwords', async () => {
  const { filePaths, canceled } = await dialog.showOpenDialog(mainWindow, {
    title: 'Import Passwords',
    filters: [
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] }
    ],
    properties: ['openFile']
  });
  
  if (canceled || !filePaths.length) {
    return { success: false, message: 'Import cancelled' };
  }
  
  try {
    const data = await fs.readFile(filePaths[0], 'utf-8');
    const importedPasswords = JSON.parse(data);
    
    if (!Array.isArray(importedPasswords)) {
      throw new Error('Invalid format: expected an array of passwords');
    }
    
    const existingPasswords = await readPasswords();
    
    // Add IDs to imported entries and merge
    let imported = 0;
    let skipped = 0;
    
    for (const entry of importedPasswords) {
      // Check for duplicates
      const isDuplicate = existingPasswords.some(p => 
        p.site?.toLowerCase() === entry.site?.toLowerCase() && 
        p.username?.toLowerCase() === entry.username?.toLowerCase()
      );
      
      if (!isDuplicate && entry.site && entry.username && entry.password) {
        existingPasswords.push({
          ...entry,
          id: generateId(),
          importedAt: new Date().toISOString()
        });
        imported++;
      } else {
        skipped++;
      }
    }
    
    await writePasswords(existingPasswords);
    
    return { 
      success: true, 
      message: `Imported ${imported} passwords${skipped > 0 ? `, skipped ${skipped} duplicates` : ''}`,
      imported,
      skipped
    };
  } catch (err) {
    return { success: false, message: `Import failed: ${err.message}` };
  }
});

// Get password statistics
ipcMain.handle('get-stats', async () => {
  const passwords = await readPasswords();
  
  const stats = {
    total: passwords.length,
    byCategory: {},
    reusedPasswords: 0,
    oldPasswords: 0
  };
  
  // Count by category
  passwords.forEach(p => {
    const cat = p.category || 'Uncategorized';
    stats.byCategory[cat] = (stats.byCategory[cat] || 0) + 1;
  });
  
  // Check for reused passwords
  const passwordCounts = {};
  passwords.forEach(p => {
    passwordCounts[p.password] = (passwordCounts[p.password] || 0) + 1;
  });
  stats.reusedPasswords = Object.values(passwordCounts).filter(c => c > 1).length;
  
  // Check for old passwords (> 90 days)
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  stats.oldPasswords = passwords.filter(p => {
    const date = new Date(p.updatedAt || p.createdAt);
    return date < ninetyDaysAgo;
  }).length;
  
  return stats;
});
