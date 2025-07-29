import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';
import { resizeLayout } from '../../utils/windowResize.js';

export class MainView extends LitElement {
    static styles = css`
        * {
            font-family: 'Inter', sans-serif;
            cursor: default;
            user-select: none;
        }

        .welcome {
            font-size: 24px;
            margin-bottom: 8px;
            font-weight: 600;
            margin-top: auto;
        }

        .input-group {
            display: flex;
            gap: 12px;
            margin-bottom: 20px;
        }

        .input-group input {
            flex: 1;
        }

        input {
            background: var(--input-background);
            color: var(--text-color);
            border: 1px solid var(--button-border);
            padding: 10px 14px;
            width: 100%;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.2s ease;
        }

        input:focus {
            outline: none;
            border-color: var(--focus-border-color);
            box-shadow: 0 0 0 3px var(--focus-box-shadow);
            background: var(--input-focus-background);
        }

        input::placeholder {
            color: var(--placeholder-color);
        }

        /* Red blink animation for empty API key */
        input.api-key-error {
            animation: blink-red 1s ease-in-out;
            border-color: #ff4444;
        }

        @keyframes blink-red {
            0%,
            100% {
                border-color: var(--button-border);
                background: var(--input-background);
            }
            25%,
            75% {
                border-color: #ff4444;
                background: rgba(255, 68, 68, 0.1);
            }
            50% {
                border-color: #ff6666;
                background: rgba(255, 68, 68, 0.15);
            }
        }

        .start-button {
            background: var(--start-button-background);
            color: var(--start-button-color);
            border: 1px solid var(--start-button-border);
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 500;
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .start-button:hover {
            background: var(--start-button-hover-background);
            border-color: var(--start-button-hover-border);
        }

        .start-button.initializing {
            opacity: 0.5;
        }

        .start-button.initializing:hover {
            background: var(--start-button-background);
            border-color: var(--start-button-border);
        }

        /* Demo Styles */
        .demo-section {
            margin-top: 30px;
            padding: 20px;
            background: rgba(0, 0, 0, 0.1);
            border-radius: 12px;
            border: 1px solid var(--border-color);
        }

        .demo-section h3 {
            margin: 0 0 10px 0;
            font-size: 18px;
            color: #4ecdc4;
        }

        .demo-description {
            margin: 0 0 20px 0;
            font-size: 14px;
            opacity: 0.8;
        }

        .demo-controls {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }

        .demo-button {
            background: linear-gradient(45deg, #ff6b6b, #ee5a24);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 14px;
        }

        .demo-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
        }

        .demo-button.secondary {
            background: linear-gradient(45deg, #4ecdc4, #44a08d);
        }

        .demo-button.secondary:hover {
            box-shadow: 0 8px 25px rgba(78, 205, 196, 0.3);
        }

        .demo-button.small {
            padding: 8px 16px;
            font-size: 12px;
        }

        .demo-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }

        .demo-interface {
            margin-top: 20px;
        }

        .demo-status {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 20px;
            padding: 15px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
        }

        .status-indicator {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #666;
        }

        .status-indicator.listening {
            background: #ff6b6b;
            animation: pulse 1.5s infinite;
        }

        .status-indicator.idle {
            background: #4ecdc4;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        .demo-instructions {
            background: rgba(255, 255, 255, 0.05);
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid #4ecdc4;
        }

        .demo-instructions h4 {
            margin: 0 0 10px 0;
            color: #4ecdc4;
        }

        .demo-instructions p {
            margin: 5px 0;
            font-size: 13px;
        }

        .demo-response {
            background: rgba(78, 205, 196, 0.1);
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #4ecdc4;
            margin-top: 20px;
        }

        .demo-response h4 {
            margin: 0 0 15px 0;
            color: #4ecdc4;
        }

        .response-text {
            background: rgba(0, 0, 0, 0.3);
            padding: 15px;
            border-radius: 6px;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 13px;
            line-height: 1.5;
            margin-bottom: 15px;
            white-space: pre-wrap;
        }

        .test-audio-button {
            background: var(--button-background);
            color: var(--button-color);
            border: 1px solid var(--button-border);
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 500;
            margin-top: 10px;
            cursor: pointer;
        }

        .test-audio-button:hover {
            background: var(--button-hover-background);
            border-color: var(--button-hover-border);
        }

        .shortcut-icons {
            display: flex;
            align-items: center;
            gap: 2px;
            margin-left: 4px;
        }

        .shortcut-icons svg {
            width: 14px;
            height: 14px;
        }

        .shortcut-icons svg path {
            stroke: currentColor;
        }

        .description {
            color: var(--description-color);
            font-size: 14px;
            margin-bottom: 24px;
            line-height: 1.5;
        }

        .link {
            color: var(--link-color);
            text-decoration: underline;
            cursor: pointer;
        }

        .shortcut-hint {
            color: var(--description-color);
            font-size: 11px;
            opacity: 0.8;
        }

        :host {
            height: 100%;
            display: flex;
            flex-direction: column;
            width: 100%;
            max-width: 500px;
        }
    `;

    static properties = {
        onStart: { type: Function },
        onAPIKeyHelp: { type: Function },
        isInitializing: { type: Boolean },
        onLayoutModeChange: { type: Function },
        showApiKeyError: { type: Boolean },
    };

    constructor() {
        super();
        this.onStart = () => {};
        this.onAPIKeyHelp = () => {};
        this.isInitializing = false;
        this.onLayoutModeChange = () => {};
        this.showApiKeyError = false;
        this.boundKeydownHandler = this.handleKeydown.bind(this);
    }

    connectedCallback() {
        super.connectedCallback();
        window.electron?.ipcRenderer?.on('session-initializing', (event, isInitializing) => {
            this.isInitializing = isInitializing;
        });

        // Add keyboard event listener for Ctrl+Enter (or Cmd+Enter on Mac)
        document.addEventListener('keydown', this.boundKeydownHandler);

        // Load and apply layout mode on startup
        this.loadLayoutMode();
        // Resize window for this view
        resizeLayout();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        window.electron?.ipcRenderer?.removeAllListeners('session-initializing');
        // Remove keyboard event listener
        document.removeEventListener('keydown', this.boundKeydownHandler);
    }

    handleKeydown(e) {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const isStartShortcut = isMac ? e.metaKey && e.key === 'Enter' : e.ctrlKey && e.key === 'Enter';

        if (isStartShortcut) {
            e.preventDefault();
            this.handleStartClick();
        }
    }

    handleInput(e) {
        localStorage.setItem('apiKey', e.target.value);
        // Clear error state when user starts typing
        if (this.showApiKeyError) {
            this.showApiKeyError = false;
        }
    }

    handleStartClick() {
        if (this.isInitializing) {
            return;
        }
        this.onStart();
    }

    handleAPIKeyHelpClick() {
        this.onAPIKeyHelp();
    }

    handleResetOnboarding() {
        localStorage.removeItem('onboardingCompleted');
        // Refresh the page to trigger onboarding
        window.location.reload();
    }

    async handleTestAudio() {
        try {
            console.log('🎤 Testing audio capture...');
            console.log('🔍 Checking navigator.mediaDevices:', !!navigator.mediaDevices);
            console.log('🔍 Checking getUserMedia:', !!navigator.mediaDevices?.getUserMedia);
            
            // Check if we have permission first
            try {
                const permissions = await navigator.permissions.query({ name: 'microphone' });
                console.log('🔍 Microphone permission state:', permissions.state);
            } catch (permError) {
                console.log('🔍 Could not check permissions:', permError.message);
            }
            
            // Try multiple methods to trigger permission dialog
            console.log('🔐 Requesting microphone access...');
            
            // Method 1: Simple getUserMedia
            let stream;
            try {
                stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                console.log('✅ Method 1 succeeded: Simple getUserMedia');
            } catch (error1) {
                console.log('❌ Method 1 failed:', error1.message);
                
                // Method 2: Try with specific constraints
                try {
                    stream = await navigator.mediaDevices.getUserMedia({
                        audio: {
                            echoCancellation: false,
                            noiseSuppression: false,
                            autoGainControl: false
                        }
                    });
                    console.log('✅ Method 2 succeeded: Specific constraints');
                } catch (error2) {
                    console.log('❌ Method 2 failed:', error2.message);
                    
                    // Method 3: Try with video permission (sometimes helps)
                    try {
                        stream = await navigator.mediaDevices.getUserMedia({ 
                            audio: true, 
                            video: false 
                        });
                        console.log('✅ Method 3 succeeded: Audio + video permission');
                    } catch (error3) {
                        console.log('❌ Method 3 failed:', error3.message);
                        throw error3; // Re-throw the last error
                    }
                }
            }
            
            console.log('✅ Microphone access granted for test');
            
            // Create a simple audio context to test
            const audioContext = new AudioContext({ sampleRate: 24000 });
            const source = audioContext.createMediaStreamSource(stream);
            const processor = audioContext.createScriptProcessor(4096, 1, 1);
            
            let testChunks = [];
            let testStartTime = Date.now();
            
            let isTestComplete = false;
            
            processor.onaudioprocess = async (event) => {
                if (isTestComplete) return;
                
                const inputBuffer = event.inputBuffer;
                const inputData = inputBuffer.getChannelData(0);
                
                // Convert to Int16
                const int16Array = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                    int16Array[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
                }
                
                testChunks.push(int16Array);
                
                // Stop after 3 seconds
                if (Date.now() - testStartTime > 3000) {
                    isTestComplete = true;
                    source.disconnect();
                    processor.disconnect();
                    stream.getTracks().forEach(track => track.stop());
                    audioContext.close();
                    
                    console.log('🎵 Audio test completed - captured', testChunks.length, 'chunks');
                    alert('🎤 Audio test successful! Microphone is working.');
                }
            };
            
            source.connect(processor);
            processor.connect(audioContext.destination);
            
            alert('🎤 Starting audio test - speak for 3 seconds...');
            
        } catch (error) {
            console.error('❌ Audio test failed:', error);
            console.error('❌ Error name:', error.name);
            console.error('❌ Error message:', error.message);
            console.error('❌ Error stack:', error.stack);
            
            // Check if it's a permission error
            if (error.name === 'NotAllowedError') {
                console.error('🔒 This is a permission error - macOS is blocking microphone access');
                console.error('🔒 Possible causes:');
                console.error('🔒 1. App not code signed');
                console.error('🔒 2. Microphone permission not granted in System Preferences');
                console.error('🔒 3. App not in microphone permissions list');
            }
            
            alert(`❌ Audio test failed: ${error.message}\n\nThis is likely due to macOS security restrictions. Check System Preferences > Security & Privacy > Privacy > Microphone.`);
        }
    }

    loadLayoutMode() {
        const savedLayoutMode = localStorage.getItem('layoutMode');
        if (savedLayoutMode && savedLayoutMode !== 'normal') {
            // Notify parent component to apply the saved layout mode
            this.onLayoutModeChange(savedLayoutMode);
        }
    }

    // Method to trigger the red blink animation
    triggerApiKeyError() {
        this.showApiKeyError = true;
        // Remove the error class after 1 second
        setTimeout(() => {
            this.showApiKeyError = false;
        }, 1000);
    }

    getStartButtonText() {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

        const cmdIcon = html`<svg width="14px" height="14px" viewBox="0 0 24 24" stroke-width="2" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 6V18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M15 6V18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            <path
                d="M9 6C9 4.34315 7.65685 3 6 3C4.34315 3 3 4.34315 3 6C3 7.65685 4.34315 9 6 9H18C19.6569 9 21 7.65685 21 6C21 4.34315 19.6569 3 18 3C16.3431 3 15 4.34315 15 6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            ></path>
            <path
                d="M9 18C9 19.6569 7.65685 21 6 21C4.34315 21 3 19.6569 3 18C3 16.3431 4.34315 15 6 15H18C19.6569 15 21 16.3431 21 18C21 19.6569 19.6569 21 18 21C16.3431 21 15 19.6569 15 18"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            ></path>
        </svg>`;

        const enterIcon = html`<svg width="14px" height="14px" stroke-width="2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M10.25 19.25L6.75 15.75L10.25 12.25"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            ></path>
            <path
                d="M6.75 15.75H12.75C14.9591 15.75 16.75 13.9591 16.75 11.75V4.75"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            ></path>
        </svg>`;

        if (isMac) {
            return html`Start Session <span class="shortcut-icons">${cmdIcon}${enterIcon}</span>`;
        } else {
            return html`Start Session <span class="shortcut-icons">Ctrl${enterIcon}</span>`;
        }
    }

    render() {
        return html`
            <div class="welcome">Welcome</div>

            <div class="input-group">
                <input
                    type="password"
                    placeholder="Enter your OpenAI API Key"
                    .value=${localStorage.getItem('apiKey') || ''}
                    @input=${this.handleInput}
                    class="${this.showApiKeyError ? 'api-key-error' : ''}"
                />
                <button @click=${this.handleStartClick} class="start-button ${this.isInitializing ? 'initializing' : ''}">
                    ${this.getStartButtonText()}
                </button>
            </div>
            <p class="description">
                dont have an api key?
                <span @click=${this.handleAPIKeyHelpClick} class="link">get one here</span>
            </p>
            <button @click=${this.handleTestAudio} class="test-audio-button">
                🎤 Test Microphone
            </button>
        `;
    }
}

customElements.define('main-view', MainView);
