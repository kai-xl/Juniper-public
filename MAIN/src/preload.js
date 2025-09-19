const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  selectAudioFiles: () => ipcRenderer.invoke('select-audio-files'),
  
  // Sample management
  getAllSamples: () => ipcRenderer.invoke('get-all-samples'),
  updateSample: (id, updates) => ipcRenderer.invoke('update-sample', id, updates),
  deleteSample: (id) => ipcRenderer.invoke('delete-sample', id),
  
  // AI operations
  aiSearchSamples: (query) => ipcRenderer.invoke('ai-search-samples', query),
  initializeAI: (apiKeys) => ipcRenderer.invoke('initialize-ai', apiKeys),
  getAIStatus: () => ipcRenderer.invoke('get-ai-status'),
  processSamplesBatch: (filePaths) => ipcRenderer.invoke('process-samples-batch', filePaths),
  
  // Filtering
  getSamplesByCategory: (category) => ipcRenderer.invoke('get-samples-by-category', category),
  getSamplesByTag: (tag) => ipcRenderer.invoke('get-samples-by-tag', tag),
  
  // Event listeners
  onBatchProgress: (callback) => ipcRenderer.on('batch-progress', callback),
  removeBatchProgressListener: () => ipcRenderer.removeAllListeners('batch-progress'),
  
  // Window controls
  windowMinimize: () => ipcRenderer.invoke('window-minimize'),
  windowMaximize: () => ipcRenderer.invoke('window-maximize'),
  windowClose: () => ipcRenderer.invoke('window-close'),
  closeSplash: () => ipcRenderer.invoke('close-splash'),
  loadMainApp: () => ipcRenderer.invoke('load-main-app'),
  
  // Setup/Onboarding operations
  selectSampleFolder: () => ipcRenderer.invoke('select-sample-folder'),
  saveSetupConfig: (config) => ipcRenderer.invoke('save-setup-config', config),
  getSetupConfig: () => ipcRenderer.invoke('get-setup-config'),
  launchMainApp: () => ipcRenderer.invoke('launch-main-app'),
  
  // Login operations
  loginSuccess: () => ipcRenderer.invoke('login-success'),
  saveAuthData: (userData) => ipcRenderer.invoke('save-auth-data', userData)
});