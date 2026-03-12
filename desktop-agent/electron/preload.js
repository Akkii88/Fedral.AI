const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getVersion: () => ipcRenderer.invoke('get-version'),
    saveReport: (content, filename) => ipcRenderer.invoke('save-report', { content, filename }),
    runAnalysis: (csvPath, rowCount) => ipcRenderer.invoke('run-analysis', csvPath, rowCount),
    onAnalysisUpdate: (callback) => ipcRenderer.on('analysis-update', (event, value) => callback(value)),
    removeAnalysisListeners: () => ipcRenderer.removeAllListeners('analysis-update'),
});
