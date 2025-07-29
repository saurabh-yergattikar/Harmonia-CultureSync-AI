if (require('electron-squirrel-startup')) {
    process.exit(0);
}

const { app, BrowserWindow, shell, ipcMain } = require('electron');
const { createWindow, updateGlobalShortcuts } = require('./utils/window');
const { setupOpenAIIpcHandlers, stopMacOSAudioCapture, sendToRenderer } = require('./utils/openai');
const { initializeRandomProcessNames } = require('./utils/processRandomizer');
const { applyAntiAnalysisMeasures } = require('./utils/stealthFeatures');

const openaiSessionRef = { current: null };
let mainWindow = null;

// DISABLED: Initialize random process names for stealth - keeping Harmonia + Qloo for permissions
// const randomNames = initializeRandomProcessNames();
const randomNames = null; // Disable random names for macOS permissions

function createMainWindow() {
    mainWindow = createWindow(sendToRenderer, openaiSessionRef, randomNames);
    return mainWindow;
}

app.whenReady().then(async () => {
    // Apply anti-analysis measures with random delay
    await applyAntiAnalysisMeasures();

    // Request microphone permissions at app startup
    const { session } = require('electron');
    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
        console.log('🔐 Permission requested:', permission);
        if (permission === 'microphone') {
            console.log('✅ Granting microphone permission');
            callback(true); // Grant permission
        } else if (permission === 'media') {
            console.log('✅ Granting media permission');
            callback(true); // Grant permission
        } else {
            console.log('❌ Denying permission:', permission);
            callback(false); // Deny other permissions
        }
    });
    
    // Force microphone permission request by accessing audio sources
    try {
        const { desktopCapturer } = require('electron');
        const sources = await desktopCapturer.getSources({ types: ['audio'] });
        console.log('Audio sources found at startup:', sources.length);
    } catch (error) {
        console.log('Audio source access attempt at startup:', error.message);
    }

    // Set up IPC handlers first
    setupOpenAIIpcHandlers(openaiSessionRef);
    setupGeneralIpcHandlers();
    
    // Then create the window
    createMainWindow();
    
    // Ensure app name is set correctly for macOS permissions
    app.setName('harmonia');
    console.log('App name set to: harmonia');
    
    // Microphone permission popup removed as requested
    
    // Also set the process title for Activity Monitor
    process.title = 'harmonia';
    console.log('Process title set to: harmonia');
    
    // Forced microphone permission request removed as requested
});

app.on('window-all-closed', () => {
    stopMacOSAudioCapture();
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {
    stopMacOSAudioCapture();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
    }
});

function setupGeneralIpcHandlers() {
    // Handle demo debug messages
    ipcMain.on('demo-debug', (event, message) => {
        console.log(message);
    });

    ipcMain.handle('quit-application', async event => {
        try {
            stopMacOSAudioCapture();
            app.quit();
            return { success: true };
        } catch (error) {
            console.error('Error quitting application:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('open-external', async (event, url) => {
        try {
            await shell.openExternal(url);
            return { success: true };
        } catch (error) {
            console.error('Error opening external URL:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.on('update-keybinds', (event, newKeybinds) => {
        if (mainWindow) {
            updateGlobalShortcuts(newKeybinds, mainWindow, sendToRenderer, openaiSessionRef);
        }
    });

    ipcMain.handle('update-content-protection', async (event, contentProtection) => {
        try {
            if (mainWindow) {

                // Get content protection setting from localStorage via cheddar
                const contentProtection = await mainWindow.webContents.executeJavaScript('cheddar.getContentProtection()');
                mainWindow.setContentProtection(contentProtection);
                console.log('Content protection updated:', contentProtection);
            }
            return { success: true };
        } catch (error) {
            console.error('Error updating content protection:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('get-random-display-name', async event => {
        try {
            return randomNames ? randomNames.displayName : 'System Monitor';
        } catch (error) {
            console.error('Error getting random display name:', error);
            return 'System Monitor';
        }
    });
}
