const OpenAI = require('openai');
const { BrowserWindow, ipcMain } = require('electron');
const { spawn } = require('child_process');
const { saveDebugAudio } = require('../audioUtils');
const { getSystemPrompt } = require('./prompts');
const { getCulturalSystemPrompt } = require('./culturalPrompts');
const { CulturalIntelligenceEngine } = require('./culturalIntelligence');
const { QlooMasterClient } = require('./qlooMasterClient');

// Conversation tracking variables
let currentSessionId = null;
let currentTranscription = '';
let conversationHistory = [];
let isInitializingSession = false;

// Cultural Intelligence Engine
let culturalEngine = new CulturalIntelligenceEngine();

// Qloo Master Client for direct API access
let qlooClient = new QlooMasterClient({
    apiKey: process.env.QLOO_API_KEY,
    maxRequestsPerSecond: 50,
    batchingEnabled: true,
    cacheStrategy: 'aggressive-but-fresh'
});

// Audio capture variables
let systemAudioProc = null;
let messageBuffer = '';

// Reconnection tracking variables
let reconnectionAttempts = 0;
let maxReconnectionAttempts = 3;
let reconnectionDelay = 2000; // 2 seconds between attempts
let lastSessionParams = null;

// OpenAI client
let openaiClient = null;
let currentStream = null;

function sendToRenderer(channel, data) {
    const windows = BrowserWindow.getAllWindows();
    if (windows.length > 0) {
        windows[0].webContents.send(channel, data);
    }
}

function initializeNewSession() {
    currentSessionId = Date.now().toString();
    currentTranscription = '';
    conversationHistory = [];
    console.log('New session initialized:', currentSessionId);
}

function saveConversationTurn(userInput, aiResponse) {
    if (!currentSessionId) return;

    const turn = {
        sessionId: currentSessionId,
        timestamp: Date.now(),
        userInput: userInput.trim(),
        aiResponse: aiResponse.trim(),
    };

    conversationHistory.push(turn);
    console.log('Conversation turn saved:', turn);
}

function getCurrentSessionData() {
    return {
        sessionId: currentSessionId,
        conversationHistory: conversationHistory,
        startTime: currentSessionId ? parseInt(currentSessionId) : null,
    };
}

async function sendReconnectionContext() {
    if (!currentSessionId || conversationHistory.length === 0) return;

    const contextMessage = `Previous conversation context:\n${conversationHistory.map(turn => 
        `User: ${turn.userInput}\nAI: ${turn.aiResponse}`
    ).join('\n\n')}`;

    try {
        if (openaiClient && currentStream) {
            await currentStream.finalize();
            currentStream = null;
        }
    } catch (error) {
        console.error('Error sending reconnection context:', error);
    }
}

async function getEnabledTools() {
    const tools = [];

    // Web search is disabled for this application
    console.log('Web Search tool disabled');

    return tools;
}

async function getStoredSetting(key, defaultValue) {
    try {
        const windows = BrowserWindow.getAllWindows();
        if (windows.length > 0) {
            // Wait a bit for the renderer to be ready
            await new Promise(resolve => setTimeout(resolve, 100));

            // Try to get setting from renderer process localStorage
            const value = await windows[0].webContents.executeJavaScript(`
                (function() {
                    try {
                        if (typeof localStorage === 'undefined') {
                            console.log('localStorage not available yet for ${key}');
                            return '${defaultValue}';
                        }
                        const stored = localStorage.getItem('${key}');
                        console.log('Retrieved setting ${key}:', stored);
                        return stored || '${defaultValue}';
                    } catch (e) {
                        console.error('Error accessing localStorage for ${key}:', e);
                        return '${defaultValue}';
                    }
                })()
            `);
            return value;
        }
    } catch (error) {
        console.error('Error getting stored setting for', key, ':', error.message);
    }
    console.log('Using default value for', key, ':', defaultValue);
    return defaultValue;
}

async function attemptReconnection() {
    if (!lastSessionParams || reconnectionAttempts >= maxReconnectionAttempts) {
        console.log('Max reconnection attempts reached or no session params stored');
        sendToRenderer('update-status', 'Session closed');
        return false;
    }

    reconnectionAttempts++;
    console.log(`Attempting reconnection ${reconnectionAttempts}/${maxReconnectionAttempts}...`);

    // Wait before attempting reconnection
    await new Promise(resolve => setTimeout(resolve, reconnectionDelay));

    try {
        const session = await initializeOpenAISession(
            lastSessionParams.apiKey,
            lastSessionParams.customPrompt,
            lastSessionParams.profile,
            lastSessionParams.language,
            true // isReconnection flag
        );

        if (session) {
            reconnectionAttempts = 0; // Reset counter on successful reconnection
            console.log('Live session reconnected');

            // Send context message with previous transcriptions
            await sendReconnectionContext();

            return true;
        }
    } catch (error) {
        console.error(`Reconnection attempt ${reconnectionAttempts} failed:`, error);
    }

    // If this attempt failed, try again
    if (reconnectionAttempts < maxReconnectionAttempts) {
        return attemptReconnection();
    } else {
        console.log('All reconnection attempts failed');
        sendToRenderer('update-status', 'Session closed');
        return false;
    }
}

async function initializeOpenAISession(apiKey, customPrompt = '', profile = 'sales', language = 'en-US', isReconnection = false) {
    if (isInitializingSession) {
        console.log('Session initialization already in progress');
        return false;
    }

    isInitializingSession = true;
    sendToRenderer('session-initializing', true);

    // Store session parameters for reconnection (only if not already reconnecting)
    if (!isReconnection) {
        lastSessionParams = {
            apiKey,
            customPrompt,
            profile,
            language,
        };
        reconnectionAttempts = 0; // Reset counter for new session
    }

    // Initialize cultural intelligence engine
    const qlooApiKey = process.env.QLOO_API_KEY || null;
    await culturalEngine.initialize(qlooApiKey);

    // Initialize OpenAI client
    openaiClient = new OpenAI({
        apiKey: apiKey,
    });

    // Get enabled tools first to determine Web Search status
    const enabledTools = await getEnabledTools();
    const webSearchEnabled = enabledTools.some(tool => tool.type === 'web_search');

    // Use cultural prompts for cultural profiles, regular prompts for others
    const isCulturalProfile = ['business_negotiation', 'multicultural_team', 'international_sales', 'client_relationship'].includes(profile);
    const systemPrompt = isCulturalProfile 
        ? getCulturalSystemPrompt(profile, customPrompt, webSearchEnabled)
        : getSystemPrompt(profile, customPrompt, webSearchEnabled);

    // Initialize new conversation session (only if not reconnecting)
    if (!isReconnection) {
        initializeNewSession();
    }

    try {
        sendToRenderer('update-status', 'Live session connected');
        
        isInitializingSession = false;
        sendToRenderer('session-initializing', false);
        return true;
    } catch (error) {
        console.error('Failed to initialize OpenAI session:', error);
        isInitializingSession = false;
        sendToRenderer('session-initializing', false);
        return null;
    }
}

async function sendTextToOpenAI(text) {
    if (!openaiClient) {
        console.error('OpenAI client not initialized');
        return;
    }

    try {
        messageBuffer = '';
        sendToRenderer('update-status', 'Processing...');

        const messages = [
            {
                role: 'system',
                content: getSystemPrompt(lastSessionParams?.profile || 'sales', lastSessionParams?.customPrompt || '', false)
            },
            ...conversationHistory.map(turn => [
                { role: 'user', content: turn.userInput },
                { role: 'assistant', content: turn.aiResponse }
            ]).flat(),
            { role: 'user', content: text }
        ];

        const stream = await openaiClient.chat.completions.create({
            model: 'gpt-4o',
            messages: messages,
            stream: true,
            temperature: 0.7,
            max_tokens: 1000,
        });

        currentStream = stream;

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
                messageBuffer += content;
                sendToRenderer('update-response', messageBuffer);
            }
        }

        // Save conversation turn
        if (text && messageBuffer) {
            saveConversationTurn(text, messageBuffer);
        }

        sendToRenderer('update-status', 'Listening...');
        messageBuffer = '';

    } catch (error) {
        console.error('Error sending text to OpenAI:', error);
        
        // Check if the error is related to invalid API key
        const isApiKeyError = error.message && (
            error.message.includes('API k stronglid') ||
            error.message.includes('invalid API key') ||
            error.message.includes('authentication failed') ||
            error.message.includes('unauthorized') ||
            error.message.includes('invalid_api_key')
        );

        if (isApiKeyError) {
            console.log('Error due to invalid API key - stopping reconnection attempts');
            lastSessionParams = null; // Clear session params to prevent reconnection
            reconnectionAttempts = maxReconnectionAttempts; // Stop further attempts
            sendToRenderer('update-status', 'Error: Invalid API key');
            return;
        }

        sendToRenderer('update-status', 'Error: ' + error.message);
    }
}

async function sendAudioToOpenAI(base64Data) {
    if (!openaiClient) {
        console.error('❌ OpenAI client not initialized');
        return;
    }

    try {
        // Convert base64 to buffer
        const audioBuffer = Buffer.from(base64Data, 'base64');
        
        // Check if audio buffer is too small (likely silence)
        if (audioBuffer.length < 1000) {
            console.log('🔇 Audio buffer too small, skipping...');
            return;
        }
        
        console.log('🎵 Processing audio chunk:', audioBuffer.length, 'bytes');
        
        // Send audio to OpenAI for transcription
        const transcription = await openaiClient.audio.transcriptions.create({
            file: audioBuffer,
            model: 'whisper-1',
            response_format: 'text'
        });

        if (transcription) {
            console.log('🎤 Transcribed:', transcription);
            currentTranscription += transcription;
            
            // Send status update to show transcription is working
            sendToRenderer('update-status', `🎤 Heard: "${transcription}"`);
            
            // 🔥 QLOO-POWERED CULTURAL ANALYSIS
            const isCulturalProfile = ['business_negotiation', 'multicultural_team', 'international_sales', 'client_relationship'].includes(lastSessionParams?.profile);
            if (isCulturalProfile && culturalEngine) {
                console.log(`🔥 QLOO ANALYSIS: Processing "${transcription}"`);
                
                culturalEngine.analyzeConversation(transcription).then(culturalAnalysis => {
                    // Send cultural coaching to renderer with Qloo metrics
                    sendToRenderer('cultural-coaching', culturalAnalysis);
                    
                    // Log Qloo metrics for demo
                    if (culturalAnalysis.qlooMetrics) {
                        console.log(`🔥 QLOO METRICS: ${culturalAnalysis.qlooMetrics.apiCallsMade} API calls, ${culturalAnalysis.qlooMetrics.entitiesAnalyzed} entities, ${culturalAnalysis.qlooMetrics.correlationsFound} correlations`);
                    }
                }).catch(error => {
                    console.error('🔥 QLOO ANALYSIS ERROR:', error);
                });
            }

            // Send transcribed text to OpenAI for response
            await sendTextToOpenAI(transcription);
        }

    } catch (error) {
        console.error('Error sending audio to OpenAI:', error);
    }
}

async function killExistingSystemAudioDump() {
    if (systemAudioProc) {
        try {
            systemAudioProc.kill('SIGTERM');
            console.log('Killed existing SystemAudioDump process');
        } catch (error) {
            console.error('Error killing SystemAudioDump:', error);
        }
        systemAudioProc = null;
    }

    // Also try to kill any existing SystemAudioDump processes
    try {
        const { exec } = require('child_process');
        if (process.platform === 'darwin') {
            exec('pkill -f SystemAudioDump', (error) => {
                if (!error) {
                    console.log('Killed existing SystemAudioDump processes');
                }
            });
        }
    } catch (error) {
        console.error('Error killing SystemAudioDump processes:', error);
    }
}

async function startMacOSAudioCapture(openaiSessionRef) {
    if (process.platform !== 'darwin') return false;

    // Kill any existing SystemAudioDump processes first
    await killExistingSystemAudioDump();

    console.log('Starting macOS audio capture with SystemAudioDump...');
    
    // Enable audio capture for full functionality
    const skipAudioForDemo = false; // Set to true to disable audio capture
    
    if (skipAudioForDemo) {
        console.log('Audio capture skipped for demo - using text input only');
        sendToRenderer('update-status', 'Demo mode: Text input available');
        return false; // Return false but don't treat as error
    }

    // Try SystemAudioDump first, fallback to browser audio if it fails
    const useSystemAudioDump = true; // Set to false to use browser audio only

    const { app } = require('electron');
    const path = require('path');

    let systemAudioPath;
    if (app.isPackaged) {
        systemAudioPath = path.join(process.resourcesPath, 'SystemAudioDump');
    } else {
        systemAudioPath = path.join(__dirname, '../assets', 'SystemAudioDump');
    }

    console.log('SystemAudioDump path:', systemAudioPath);

    // Check if the binary exists and has proper permissions
    const fs = require('fs');
    if (!fs.existsSync(systemAudioPath)) {
        console.error('SystemAudioDump binary not found at:', systemAudioPath);
        return false;
    }

    // Make sure the binary is executable
    try {
        fs.chmodSync(systemAudioPath, '755');
        console.log('Set executable permissions on SystemAudioDump');
        
        // Check if the binary is actually executable
        const { exec } = require('child_process');
        exec(`file "${systemAudioPath}"`, (error, stdout) => {
            if (error) {
                console.error('Error checking SystemAudioDump binary:', error);
            } else {
                console.log('SystemAudioDump binary info:', stdout.trim());
            }
        });
    } catch (error) {
        console.error('Error setting permissions on SystemAudioDump:', error);
    }

    // Request microphone permissions at runtime - this is crucial for macOS to recognize our app
    const { exec } = require('child_process');
    exec('osascript -e "tell application \\"System Events\\" to authorize"', (error) => {
        if (error) {
            console.log('Microphone permission request sent');
        }
    });
    
    // Also try to access microphone through Electron's permissions API
    const { session } = require('electron');
    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
        if (permission === 'microphone') {
            console.log('Requesting microphone permission through Electron');
            callback(true); // Grant permission
        } else {
            callback(false); // Deny other permissions
        }
    });
    
    // Force a microphone permission request by trying to access it
    try {
        const { desktopCapturer } = require('electron');
        const sources = await desktopCapturer.getSources({ types: ['audio'] });
        console.log('Audio sources found:', sources.length);
    } catch (error) {
        console.log('Audio source access attempt:', error.message);
    }

    // Spawn SystemAudioDump with stealth options
    const spawnOptions = {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: {
            ...process.env,
            // Set environment variables that might help with stealth
            PROCESS_NAME: 'AudioService',
            APP_NAME: 'System Audio Service',
        },
    };

    // On macOS, apply additional stealth measures
    if (process.platform === 'darwin') {
        spawnOptions.detached = false;
        spawnOptions.windowsHide = false;
    }

    systemAudioProc = spawn(systemAudioPath, [], spawnOptions);

    // Wait a moment for the process to start
    await new Promise(resolve => setTimeout(resolve, 200));

    if (!systemAudioProc.pid) {
        console.error('Failed to start SystemAudioDump');
        return false;
    }

    console.log('SystemAudioDump started with PID:', systemAudioProc.pid);
    
    // Check if process is still running after a short delay
    setTimeout(async () => {
        if (systemAudioProc && systemAudioProc.killed) {
            console.error('SystemAudioDump was killed immediately - switching to browser audio');
            sendToRenderer('update-status', 'System audio blocked - switching to microphone');
            
            // Switch to browser audio capture immediately
            await startBrowserAudioCapture(openaiSessionRef);
        }
    }, 2000);

    // Return true if the process started successfully
    // The fallback will be handled by the timeout above if needed
    return true;

    const CHUNK_DURATION = 0.1;
    const SAMPLE_RATE = 24000;
    const BYTES_PER_SAMPLE = 2;
    const CHANNELS = 2;
    const CHUNK_SIZE = SAMPLE_RATE * BYTES_PER_SAMPLE * CHANNELS * CHUNK_DURATION;

    let audioBuffer = Buffer.alloc(0);

    systemAudioProc.stdout.on('data', async (data) => {
        audioBuffer = Buffer.concat([audioBuffer, data]);

        while (audioBuffer.length >= CHUNK_SIZE) {
            const chunk = audioBuffer.slice(0, CHUNK_SIZE);
            audioBuffer = audioBuffer.slice(CHUNK_SIZE);

            // Convert stereo to mono
            const monoChunk = convertStereoToMono(chunk);

            // Convert to base64
            const base64Data = monoChunk.toString('base64');

            // Send to OpenAI
            await sendAudioToOpenAI(base64Data);
        }
    });

    systemAudioProc.stderr.on('data', (data) => {
        const errorMsg = data.toString();
        console.error('SystemAudioDump stderr:', errorMsg);
        
        // Check for permission or compatibility issues
        if (errorMsg.includes('Failed to get sources') || errorMsg.includes('permission')) {
            console.error('Audio capture permission issue detected');
            sendToRenderer('update-status', 'Please grant microphone permissions in System Preferences');
            
            // Try to request permissions automatically
            const { exec } = require('child_process');
            exec('osascript -e "tell application \\"System Events\\" to authorize"', (error) => {
                if (!error) {
                    console.log('Permission request sent to macOS');
                }
            });
        }
    });

    systemAudioProc.on('close', (code) => {
        console.log('SystemAudioDump process closed with code:', code);
        systemAudioProc = null;
        
        if (code !== 0) {
            console.error('SystemAudioDump exited with error code:', code);
            
            // Different messages based on the error code
            if (code === null) {
                console.log('SystemAudioDump blocked by macOS security - switching to browser audio capture');
                sendToRenderer('update-status', 'System audio blocked - using microphone capture');
                
                // Switch to browser audio capture as fallback
                setTimeout(async () => {
                    await startBrowserAudioCapture(openaiSessionRef);
                }, 1000);
            } else {
                sendToRenderer('update-status', 'Audio capture failed - check permissions');
                
                // Only retry SystemAudioDump if it's not a security block
                if (code !== null) {
                    setTimeout(async () => {
                        console.log('Retrying SystemAudioDump...');
                        await startMacOSAudioCapture(openaiSessionRef);
                    }, 2000);
                }
            }
        }
    });

    systemAudioProc.on('error', (error) => {
        console.error('SystemAudioDump process error:', error);
        systemAudioProc = null;
        sendToRenderer('update-status', 'Audio capture error');
    });
}

async function startBrowserAudioCapture(openaiSessionRef) {
    console.log('Starting browser audio capture as fallback...');
    sendToRenderer('update-status', 'Using microphone capture');
    
    try {
        // Send a message to the renderer to start browser audio capture
        sendToRenderer('start-browser-audio', {});
        console.log('Browser audio capture initiated');
        
        // Wait a moment to see if the renderer responds
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return true;
    } catch (error) {
        console.error('Failed to start browser audio capture:', error);
        sendToRenderer('update-status', 'Browser audio capture failed');
        return false;
    }
}

function convertStereoToMono(stereoBuffer) {
    const monoBuffer = Buffer.alloc(stereoBuffer.length / 2);
    for (let i = 0; i < stereoBuffer.length; i += 4) {
        const left = stereoBuffer.readInt16LE(i);
        const right = stereoBuffer.readInt16LE(i + 2);
        const mono = Math.round((left + right) / 2);
        monoBuffer.writeInt16LE(mono, i / 2);
    }
    return monoBuffer;
}

function stopMacOSAudioCapture() {
    if (systemAudioProc) {
        try {
            systemAudioProc.kill('SIGTERM');
            console.log('Stopped SystemAudioDump process');
        } catch (error) {
            console.error('Error stopping SystemAudioDump:', error);
        }
        systemAudioProc = null;
    }
}

function setupOpenAIIpcHandlers(openaiSessionRef) {
    // Store the openaiSessionRef globally for reconnection access
    global.openaiSessionRef = openaiSessionRef;

    ipcMain.handle('initialize-openai', async (event, apiKey, customPrompt, profile = 'interview', language = 'en-US') => {
        const session = await initializeOpenAISession(apiKey, customPrompt, profile, language);
        if (session) {
            openaiSessionRef.current = session;
            return true;
        }
        return false;
    });

    ipcMain.handle('send-audio-content', async (event, { data, mimeType }) => {
        if (!openaiClient) return { success: false, error: 'No active OpenAI session' };
        try {
            process.stdout.write('.');
            await sendAudioToOpenAI(data);
            return { success: true };
        } catch (error) {
            console.error('Error sending audio:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('send-image-content', async (event, { data, debug }) => {
        if (!openaiClient) return { success: false, error: 'No active OpenAI session' };

        try {
            if (!data || typeof data !== 'string') {
                console.error('Invalid image data received');
                return { success: false, error: 'Invalid image data' };
            }

            const buffer = Buffer.from(data, 'base64');

            if (buffer.length < 1000) {
                console.error(`Image buffer too small: ${buffer.length} bytes`);
                return { success: false, error: 'Image buffer too small' };
            }

            process.stdout.write('!');
            
            // For OpenAI, we'll need to handle images differently
            // For now, we'll just log that an image was received
            console.log('Image received, processing with OpenAI...');
            
            return { success: true };
        } catch (error) {
            console.error('Error sending image:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('send-text-message', async (event, text) => {
        if (!openaiClient) return { success: false, error: 'No active OpenAI session' };

        try {
            if (!text || typeof text !== 'string' || text.trim().length === 0) {
                return { success: false, error: 'Invalid text message' };
            }

            console.log('Sending text message:', text);
            await sendTextToOpenAI(text.trim());
            return { success: true };
        } catch (error) {
            console.error('Error sending text:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('send-audio-to-openai', async (event, base64Data) => {
        try {
            console.log('📤 Received audio data from renderer:', base64Data.length, 'chars');
            await sendAudioToOpenAI(base64Data);
            return { success: true };
        } catch (error) {
            console.error('❌ Error sending audio to OpenAI:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('start-macos-audio', async event => {
        if (process.platform !== 'darwin') {
            return {
                success: false,
                error: 'macOS audio capture only available on macOS',
            };
        }

        try {
            // Try SystemAudioDump first
            const success = await startMacOSAudioCapture(openaiSessionRef);
            
            // Always try browser audio capture as well for better reliability
            console.log('Starting browser audio capture as primary method...');
            const browserResult = await startBrowserAudioCapture(openaiSessionRef);
            
            if (browserResult) {
                console.log('Browser audio capture started successfully');
                return { success: true, fallback: 'browser' };
            } else if (success) {
                return { success: true };
            } else {
                console.log('All audio capture methods failed - text input available');
                return { 
                    success: false, 
                    error: 'Audio capture failed - use text input',
                    fallbackAvailable: true
                };
            }
        } catch (error) {
            console.error('Error starting macOS audio capture:', error);
            return { 
                success: false, 
                error: 'Audio capture error - text input available',
                fallbackAvailable: true
            };
        }
    });

    ipcMain.handle('stop-macos-audio', async event => {
        try {
            stopMacOSAudioCapture();
            return { success: true };
        } catch (error) {
            console.error('Error stopping macOS audio capture:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('close-session', async event => {
        try {
            stopMacOSAudioCapture();

            // Clear session params to prevent reconnection when user closes session
            lastSessionParams = null;

            // Cleanup any pending resources and stop audio/video capture
            if (currentStream) {
                await currentStream.finalize();
                currentStream = null;
            }
            openaiClient = null;

            return { success: true };
        } catch (error) {
            console.error('Error closing session:', error);
            return { success: false, error: error.message };
        }
    });

    // Conversation history IPC handlers
    ipcMain.handle('get-current-session', async event => {
        try {
            return { success: true, data: getCurrentSessionData() };
        } catch (error) {
            console.error('Error getting current session:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('start-new-session', async event => {
        try {
            initializeNewSession();
            return { success: true, sessionId: currentSessionId };
        } catch (error) {
            console.error('Error starting new session:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('update-google-search-setting', async (event, enabled) => {
        try {
            console.log('Web Search setting updated to:', enabled);
            // The setting is already saved in localStorage by the renderer
            // This is just for logging/confirmation
            return { success: true };
        } catch (error) {
            console.error('Error updating Web Search setting:', error);
            return { success: false, error: error.message };
        }
    });

}

module.exports = {
    initializeOpenAISession,
    getEnabledTools,
    getStoredSetting,
    sendToRenderer,
    initializeNewSession,
    saveConversationTurn,
    getCurrentSessionData,
    sendReconnectionContext,
    killExistingSystemAudioDump,
    startMacOSAudioCapture,
    convertStereoToMono,
    stopMacOSAudioCapture,
    sendAudioToOpenAI,
    setupOpenAIIpcHandlers,
    attemptReconnection,
}; 