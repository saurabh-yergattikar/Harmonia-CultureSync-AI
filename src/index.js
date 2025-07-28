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
    
    // Show microphone permission request window
    setTimeout(() => {
        const permissionWindow = new BrowserWindow({
            width: 400,
            height: 300,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true
            },
            title: 'harmonia - Microphone Permission',
            resizable: false,
            minimizable: false,
            maximizable: false,
            alwaysOnTop: true,
            modal: true,
            parent: mainWindow
        });
        
        permissionWindow.loadFile('src/permission-request.html');
        
        // Close permission window after 5 seconds if not already closed
        setTimeout(() => {
            if (!permissionWindow.isDestroyed()) {
                permissionWindow.close();
            }
        }, 5000);
        
        console.log('Opened microphone permission request window');
    }, 2000);
    
    // Also set the process title for Activity Monitor
    process.title = 'harmonia';
    console.log('Process title set to: harmonia');
    
    // Force microphone permission request immediately after app startup
    setTimeout(async () => {
        try {
            console.log('Forcing microphone permission request...');
            
            // Set up permission handler
            const { session } = require('electron');
            session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
                console.log('Permission requested:', permission);
                if (permission === 'microphone') {
                    console.log('Granting microphone permission');
                    callback(true);
                } else {
                    callback(false);
                }
            });
            
            // Force getUserMedia call to trigger macOS permission dialog
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.executeJavaScript(`
                    console.log('Triggering microphone permission request...');
                    navigator.mediaDevices.getUserMedia({ audio: true })
                        .then(stream => {
                            console.log('✅ Microphone access granted successfully');
                            stream.getTracks().forEach(track => track.stop());
                        })
                        .catch(error => {
                            console.log('❌ Microphone access denied:', error.message);
                        });
                `);
            }
            
            // Also try desktopCapturer to trigger permission
            try {
                const { desktopCapturer } = require('electron');
                const sources = await desktopCapturer.getSources({ 
                    types: ['audio'],
                    thumbnailSize: { width: 0, height: 0 }
                });
                console.log('Audio sources found at startup:', sources.length);
            } catch (error) {
                console.log('DesktopCapturer error:', error.message);
            }
        } catch (error) {
            console.log('Error requesting microphone permission:', error.message);
        }
    }, 1000);
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
