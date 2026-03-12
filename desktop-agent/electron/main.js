const electron = require('electron');
const { app, BrowserWindow, ipcMain, dialog } = electron;
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('Electron Main Process Starting...');
console.log('App path:', app ? 'Defined' : 'UNDEFINED');

if (!app) {
    console.error('ERROR: "app" is undefined. This script must be run with the "electron" binary, not "node".');
    process.exit(1);
}

let isDev = false;

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 900,
        minWidth: 800,
        minHeight: 600,
        titleBarStyle: 'hiddenInset',
        backgroundColor: '#ffffff',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true
        }
    });

    if (isDev) {
        win.loadURL('http://localhost:5174');
        // win.webContents.openDevTools();
    } else {
        win.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}

app.whenReady().then(() => {
    isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
    console.log('App ready. isDev:', isDev);
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// IPC Handlers
ipcMain.handle('get-version', () => app.getVersion());

ipcMain.handle('run-analysis', async (event, csvPath) => {
    const senderWindow = BrowserWindow.fromWebContents(event.sender);
    if (!senderWindow) return;

    let execPath;
    let args = [csvPath];

    if (isDev) {
        execPath = 'python3';
        const scriptPath = path.join(__dirname, '../python/worker.py');
        if (!fs.existsSync(scriptPath)) {
            senderWindow.webContents.send('analysis-update', { type: 'error', message: `Script missing: ${scriptPath}` });
            return;
        }
        args = [scriptPath, csvPath];
    } else {
        execPath = path.join(process.resourcesPath, 'backend-worker', 'backend-worker');
    }

    console.log(`[ANALYSIS] Starting: ${execPath} ${args.join(' ')}`);
    const pythonProcess = spawn(execPath, args);
    let outputBuffer = '';

    pythonProcess.stdout.on('data', (data) => {
        const text = data.toString();
        outputBuffer += text;
        const lines = outputBuffer.split('\n');
        outputBuffer = lines.pop(); // Keep residue

        for (const line of lines) {
            if (line.trim()) {
                try {
                    const parsed = JSON.parse(line);
                    if (!senderWindow.isDestroyed()) {
                        senderWindow.webContents.send('analysis-update', parsed);
                    }
                } catch (e) {
                    console.log('Backend log:', line.substring(0, 100));
                }
            }
        }
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Backend Error: ${data}`);
    });

    return new Promise((resolve) => {
        pythonProcess.on('close', (code) => {
            console.log(`Backend exited with code ${code}`);

            // Process final chunk if it's a valid JSON (the results)
            if (outputBuffer.trim()) {
                try {
                    const parsed = JSON.parse(outputBuffer);
                    if (!senderWindow.isDestroyed()) {
                        senderWindow.webContents.send('analysis-update', parsed);
                    }
                } catch (e) {
                    // Final chunk wasn't JSON
                }
            }

            if (code !== 0 && !senderWindow.isDestroyed()) {
                senderWindow.webContents.send('analysis-update', { type: 'error', message: `Analysis failed (code ${code})` });
            }
            resolve(code);
        });
    });
});

ipcMain.handle('save-report', async (event, { content, filename }) => {
    const { filePath } = await dialog.showSaveDialog({
        defaultPath: filename,
        filters: [{ name: 'CSV Files', extensions: ['csv'] }]
    });

    if (filePath) {
        fs.writeFileSync(filePath, content);
        return { success: true, filePath };
    }
    return { success: false };
});
