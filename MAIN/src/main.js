const { app, BrowserWindow, ipcMain, dialog, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { parseFile } = require('music-metadata');

// Import AI services
const aiService = require('./services/aiService');
const sampleDatabase = require('./database/sampleDatabase');

let mainWindow;
let splashWindow;
let startupWindow;
let loginWindow;
let isAIInitialized = false;

// **TEST TOGGLE: Set to true to always show startup screen**
const ALWAYS_SHOW_STARTUP = true; // <-- Change this to false for production

// Development configuration loader
function getDevConfig() {
  try {
    const devConfigPath = path.join(__dirname, '..', 'dev-config.json');
    if (fs.existsSync(devConfigPath)) {
      const configData = fs.readFileSync(devConfigPath, 'utf8');
      return JSON.parse(configData);
    }
  } catch (error) {
    console.error('Error reading dev config:', error);
  }
  return {
    skipStartupScreens: false,
    showDevTools: false,
    defaultPage: "home"
  };
}

// Helper function to get the best available icon
function getAppIcon() {
  const iconPngPath = path.join(__dirname, '..', 'assets', 'juniper.png');
  const iconIcoPath = path.join(__dirname, '..', 'assets', 'icon.ico');
  
  if (fs.existsSync(iconPngPath)) {
    return iconPngPath;
  } else if (fs.existsSync(iconIcoPath)) {
    return iconIcoPath;
  }
  return null;
}

function createSplashWindow() {
  const iconPath = getAppIcon();
  let appIcon = iconPath ? nativeImage.createFromPath(iconPath) : null;
  console.log('Splash icon:', iconPath, 'loaded:', appIcon && !appIcon.isEmpty());
  
  splashWindow = new BrowserWindow({
    width: 500,
    height: 500,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    resizable: false,
    roundedCorners: true,
    icon: appIcon,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  splashWindow.loadFile('src/splash.html');
  
  // Show splash for minimum time to allow loading animation to complete
  setTimeout(() => {
    if (splashWindow && !splashWindow.isDestroyed()) {
      splashWindow.close();
      checkSetupAndLaunch();
    }
  }, 6800); // 6.8 seconds splash duration to match loading bar
}

function createLoginWindow() {
  loginWindow = new BrowserWindow({
    width: 1200,
    height: 750,
    frame: false,
    titleBarStyle: 'hidden',
    center: true,
    movable: false,
    resizable: false,
    icon: getAppIcon(),
    title: 'JUNIPER',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false,
    opacity: 0
  });

  loginWindow.loadFile('src/login.html');

  loginWindow.once('ready-to-show', () => {
    loginWindow.show();
    
    // Animate window appearance
    let opacity = 0;
    const fadeIn = setInterval(() => {
      opacity += 0.05;
      loginWindow.setOpacity(opacity);
      if (opacity >= 1) {
        clearInterval(fadeIn);
        loginWindow.setOpacity(1);
      }
    }, 16);
  });

  loginWindow.on('closed', () => {
    loginWindow = null;
  });
}

function createStartupWindow() {
  startupWindow = new BrowserWindow({
    width: 1200,
    height: 750,
    frame: false,
    titleBarStyle: 'hidden',
    center: true,
    movable: false,
    resizable: false,
    icon: getAppIcon(),
    title: 'JUNIPER',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false,
    opacity: 0
  });

  startupWindow.loadFile('src/startup.html');

  startupWindow.once('ready-to-show', () => {
    startupWindow.show();
    
    // Animate window appearance
    let opacity = 0;
    const fadeIn = setInterval(() => {
      opacity += 0.05;
      startupWindow.setOpacity(opacity);
      if (opacity >= 1) {
        clearInterval(fadeIn);
        startupWindow.setOpacity(1);
      }
    }, 16);
  });

  startupWindow.on('closed', () => {
    startupWindow = null;
  });
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    frame: false, // Remove title bar
    titleBarStyle: 'hidden',
    center: true,
    movable: true,
    resizable: true,
    icon: getAppIcon(),
    title: 'JUNIPER',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false, // Don't show until ready
    opacity: 0 // Start invisible for animation
  });

  mainWindow.loadFile('src/index.html');

  // Show window when ready with cool animation
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Animate window appearance
    let opacity = 0;
    const fadeIn = setInterval(() => {
      opacity += 0.05;
      mainWindow.setOpacity(opacity);
      if (opacity >= 1) {
        clearInterval(fadeIn);
        mainWindow.setOpacity(1);
      }
    }, 16); // ~60fps
    
    const devConfig = getDevConfig();
    if (process.argv.includes('--dev') || devConfig.showDevTools) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  await initializeServices();
  
  // Set app name
  app.setName('JUNIPER');
  console.log('App name set to:', app.getName());
  
  // Log icon status
  const iconPath = getAppIcon();
  console.log('App icon path:', iconPath);
  console.log('Icon file exists:', iconPath && fs.existsSync(iconPath));
  
  createSplashWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

async function initializeServices() {
  try {
    // Initialize database
    await sampleDatabase.initialize();
    console.log('Database initialized');

    // Initialize AI services (without API keys for now)
    await aiService.initialize();
    console.log('AI services initialized');
    
    isAIInitialized = true;
  } catch (error) {
    console.error('Service initialization error:', error);
  }
}

// Setup configuration management
function getConfigPath() {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'setup-config.json');
}

async function getSetupConfig() {
  try {
    const configPath = getConfigPath();
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(configData);
    }
  } catch (error) {
    console.error('Error reading setup config:', error);
  }
  return null;
}

async function saveSetupConfig(config) {
  try {
    const configPath = getConfigPath();
    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    return { success: true };
  } catch (error) {
    console.error('Error saving setup config:', error);
    return { success: false, error: error.message };
  }
}

async function checkSetupAndLaunch() {
  const setupConfig = await getSetupConfig();
  const devConfig = getDevConfig();
  
  // Check if dev mode is enabled to skip startup screens
  if (devConfig.skipStartupScreens) {
    console.log('Dev mode: Skipping startup screens, launching main app directly');
    createMainWindow();
    return;
  }
  
  // Normal startup flow
  if (!ALWAYS_SHOW_STARTUP && setupConfig && setupConfig.setupCompleted) {
    // Setup completed, launch main app directly
    createMainWindow();
  } else {
    // Show login screen first
    createLoginWindow();
  }
}

// IPC Handlers for AI-powered sample management

ipcMain.handle('select-audio-files', async () => {
  if (!mainWindow || mainWindow.isDestroyed()) {
    throw new Error('Main window is not available');
  }
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Audio Files', extensions: ['mp3', 'wav', 'flac', 'aac', 'm4a', 'ogg'] }
    ]
  });
  
  if (!result.canceled) {
    const processedSamples = [];
    
    for (const filePath of result.filePaths) {
      try {
        if (isAIInitialized) {
          // Use AI service for comprehensive analysis
          const analysis = await aiService.processAudioFile(filePath);
          
          // Save to database
          const savedSample = await sampleDatabase.saveSample({
            ...analysis,
            name: path.basename(filePath)
          });
          
          processedSamples.push(savedSample);
        } else {
          // Fallback to basic metadata extraction
          const metadata = await parseFile(filePath);
          const stats = fs.statSync(filePath);
          
          const basicSample = {
            path: filePath,
            name: path.basename(filePath),
            size: stats.size,
            duration: metadata.format.duration,
            bitrate: metadata.format.bitrate,
            sampleRate: metadata.format.sampleRate,
            channels: metadata.format.numberOfChannels,
            category: 'unknown',
            tags: [],
            mood: 'neutral'
          };

          const savedSample = await sampleDatabase.saveSample(basicSample);
          processedSamples.push(savedSample);
        }
      } catch (error) {
        console.error('Error processing', filePath, error);
        processedSamples.push({
          path: filePath,
          name: path.basename(filePath),
          error: 'Could not process file'
        });
      }
    }
    
    return processedSamples;
  }
  
  return [];
});

// Get all samples from database
ipcMain.handle('get-all-samples', async () => {
  try {
    return await sampleDatabase.getAllSamples();
  } catch (error) {
    console.error('Error getting samples:', error);
    return [];
  }
});

// AI-powered search
ipcMain.handle('ai-search-samples', async (event, query) => {
  try {
    const allSamples = await sampleDatabase.getAllSamples();
    if (isAIInitialized) {
      return await aiService.searchSamples(query, allSamples);
    } else {
      // Fallback search
      return allSamples.filter(sample => 
        sample.name.toLowerCase().includes(query.toLowerCase())
      );
    }
  } catch (error) {
    console.error('Error in AI search:', error);
    return [];
  }
});

// Initialize AI with API keys
ipcMain.handle('initialize-ai', async (event, apiKeys) => {
  try {
    const result = await aiService.initialize(apiKeys);
    isAIInitialized = true;
    return result;
  } catch (error) {
    console.error('AI initialization error:', error);
    return { success: false, error: error.message };
  }
});

// Get AI service status
ipcMain.handle('get-ai-status', async () => {
  return aiService.getStatus();
});

// Process samples with AI (batch)
ipcMain.handle('process-samples-batch', async (event, filePaths) => {
  try {
    if (!isAIInitialized) {
      throw new Error('AI services not initialized');
    }

    const results = await aiService.processBatch(filePaths, (progress) => {
      // Send progress updates to renderer
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('batch-progress', progress);
      }
    });

    // Save all results to database
    for (const result of results) {
      if (!result.error) {
        await sampleDatabase.saveSample(result);
      }
    }

    return results;
  } catch (error) {
    console.error('Batch processing error:', error);
    throw error;
  }
});

// Update sample in database
ipcMain.handle('update-sample', async (event, id, updates) => {
  try {
    return await sampleDatabase.updateSample(id, updates);
  } catch (error) {
    console.error('Error updating sample:', error);
    throw error;
  }
});

// Delete sample
ipcMain.handle('delete-sample', async (event, id) => {
  try {
    return await sampleDatabase.deleteSample(id);
  } catch (error) {
    console.error('Error deleting sample:', error);
    throw error;
  }
});

// Get samples by category
ipcMain.handle('get-samples-by-category', async (event, category) => {
  try {
    return await sampleDatabase.getSamplesByCategory(category);
  } catch (error) {
    console.error('Error getting samples by category:', error);
    return [];
  }
});

// Get samples by tag
ipcMain.handle('get-samples-by-tag', async (event, tag) => {
  try {
    return await sampleDatabase.getSamplesByTag(tag);
  } catch (error) {
    console.error('Error getting samples by tag:', error);
    return [];
  }
});

// Window controls for frameless window
ipcMain.handle('window-minimize', () => {
  const activeWindow = loginWindow || startupWindow || mainWindow;
  if (activeWindow && !activeWindow.isDestroyed()) {
    activeWindow.minimize();
  }
});

ipcMain.handle('window-maximize', () => {
  const activeWindow = loginWindow || startupWindow || mainWindow;
  if (activeWindow && !activeWindow.isDestroyed()) {
    if (activeWindow.isMaximized()) {
      activeWindow.unmaximize();
    } else {
      activeWindow.maximize();
    }
  }
});

ipcMain.handle('window-close', () => {
  const activeWindow = loginWindow || startupWindow || mainWindow;
  if (activeWindow && !activeWindow.isDestroyed()) {
    activeWindow.close();
  }
});

// Add window control aliases for the React components
ipcMain.handle('windowMinimize', () => {
  const activeWindow = loginWindow || startupWindow || mainWindow;
  if (activeWindow && !activeWindow.isDestroyed()) {
    activeWindow.minimize();
  }
});

ipcMain.handle('windowMaximize', () => {
  const activeWindow = loginWindow || startupWindow || mainWindow;
  if (activeWindow && !activeWindow.isDestroyed()) {
    if (activeWindow.isMaximized()) {
      activeWindow.unmaximize();
    } else {
      activeWindow.maximize();
    }
  }
});

ipcMain.handle('windowClose', () => {
  const activeWindow = loginWindow || startupWindow || mainWindow;
  if (activeWindow && !activeWindow.isDestroyed()) {
    activeWindow.close();
  }
});

// Close splash screen
ipcMain.handle('close-splash', () => {
  if (splashWindow && !splashWindow.isDestroyed()) {
    splashWindow.close();
    checkSetupAndLaunch();
  }
});

// Load main app from menu
ipcMain.handle('load-main-app', () => {
  if (startupWindow && !startupWindow.isDestroyed()) {
    startupWindow.close();
    createMainWindow();
  }
});

// Setup/Onboarding IPC Handlers
ipcMain.handle('select-sample-folder', async () => {
  try {
    const result = await dialog.showOpenDialog(startupWindow || mainWindow, {
      properties: ['openDirectory'],
      title: 'Select Sample Folder',
      defaultPath: os.homedir()
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
      return { path: result.filePaths[0] };
    }
    return null;
  } catch (error) {
    console.error('Error selecting sample folder:', error);
    throw error;
  }
});

ipcMain.handle('save-setup-config', async (event, config) => {
  return await saveSetupConfig(config);
});

ipcMain.handle('get-setup-config', async () => {
  return await getSetupConfig();
});

ipcMain.handle('launch-main-app', () => {
  console.log('Launch main app called from IPC');
  
  // Close any open setup windows
  if (startupWindow && !startupWindow.isDestroyed()) {
    console.log('Closing startup window');
    startupWindow.close();
  }
  
  if (loginWindow && !loginWindow.isDestroyed()) {
    console.log('Closing login window');
    loginWindow.close();
  }
  
  // Create and show main window
  console.log('Creating main window');
  createMainWindow();
});

// Login to startup transition
ipcMain.handle('login-success', () => {
  if (loginWindow && !loginWindow.isDestroyed()) {
    loginWindow.close();
    createStartupWindow();
  }
});

// Save auth data
ipcMain.handle('save-auth-data', async (event, userData) => {
  try {
    // Save user authentication data to config
    const configPath = getConfigPath();
    const config = await getSetupConfig() || {};
    config.user = userData;
    config.loginDate = new Date().toISOString();
    
    await saveSetupConfig(config);
    return { success: true };
  } catch (error) {
    console.error('Error saving auth data:', error);
    return { success: false, error: error.message };
  }
});