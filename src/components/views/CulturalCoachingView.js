import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';
import { QlooApiVisualization } from './QlooApiVisualization.js';

export class CulturalCoachingView extends LitElement {
    static styles = css`
        :host {
            display: block;
            height: 100%;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .coaching-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            gap: 12px;
            padding: 16px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }

        .split-layout {
            display: grid;
            grid-template-columns: 1fr 300px;
            gap: 16px;
            height: 100%;
        }

        .coaching-section {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .qloo-section {
            display: flex;
            flex-direction: column;
        }

        .coaching-header {
            text-align: center;
            margin-bottom: 16px;
        }

        .coaching-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 4px;
        }

        .coaching-subtitle {
            font-size: 12px;
            opacity: 0.8;
        }

        .coaching-cards {
            display: flex;
            flex-direction: column;
            gap: 12px;
            flex: 1;
            overflow-y: auto;
        }

        .coaching-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 12px;
            padding: 16px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
        }

        .coaching-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .card-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
        }

        .card-icon {
            font-size: 20px;
        }

        .card-title {
            font-size: 14px;
            font-weight: 600;
        }

        .card-content {
            font-size: 13px;
            line-height: 1.4;
            opacity: 0.9;
        }

        .context-card {
            border-left: 4px solid #4CAF50;
        }

        .response-card {
            border-left: 4px solid #2196F3;
        }

        .bridge-card {
            border-left: 4px solid #FF9800;
        }

        .warning-card {
            border-left: 4px solid #F44336;
        }

        .confidence-indicator {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 12px;
            padding: 8px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
        }

        .confidence-bar {
            flex: 1;
            height: 6px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 3px;
            overflow: hidden;
        }

        .confidence-fill {
            height: 100%;
            background: linear-gradient(90deg, #4CAF50, #8BC34A);
            transition: width 0.3s ease;
        }

        .confidence-text {
            font-size: 11px;
            opacity: 0.8;
        }

        .no-coaching {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            text-align: center;
            opacity: 0.7;
        }

        .no-coaching-icon {
            font-size: 48px;
            margin-bottom: 16px;
        }

        .no-coaching-text {
            font-size: 14px;
            margin-bottom: 8px;
        }

        .no-coaching-subtext {
            font-size: 12px;
            opacity: 0.6;
        }

        .transcription-display {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 16px;
            font-size: 12px;
            font-style: italic;
            opacity: 0.8;
        }

        .transcription-label {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
            opacity: 0.6;
        }

        .transcription-text {
            font-size: 11px;
            line-height: 1.3;
        }

        .quick-actions {
            display: flex;
            gap: 8px;
            margin-top: 12px;
        }

        .action-button {
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 6px;
            padding: 6px 12px;
            font-size: 11px;
            color: white;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .action-button:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-1px);
        }

        .action-button:active {
            transform: translateY(0);
        }

        @media (max-width: 768px) {
            .coaching-container {
                padding: 12px;
            }
            
            .coaching-card {
                padding: 12px;
            }
        }
    `;

    static properties = {
        culturalCoaching: { type: Object },
        currentTranscription: { type: String },
        confidence: { type: Number },
        isActive: { type: Boolean },
        qlooMetrics: { type: Object }
    };

    constructor() {
        super();
        this.culturalCoaching = null;
        this.currentTranscription = '';
        this.confidence = 0;
        this.isActive = false;
        this.qlooMetrics = {
            totalCalls: 0,
            entitiesDetected: 0,
            correlationsFound: 0,
            averageConfidence: 0
        };
    }

    updated(changedProperties) {
        super.updated(changedProperties);
        
        if (changedProperties.has('culturalCoaching') && this.culturalCoaching) {
            this.confidence = this.culturalCoaching.confidence || 0;
            this.qlooMetrics = this.culturalCoaching.qlooMetrics || this.qlooMetrics;
        }
    }

    handleCopyResponse() {
        if (this.culturalCoaching?.response) {
            navigator.clipboard.writeText(this.culturalCoaching.response);
            this.showToast('Response copied to clipboard');
        }
    }

    handleCopyBridge() {
        if (this.culturalCoaching?.bridge) {
            navigator.clipboard.writeText(this.culturalCoaching.bridge);
            this.showToast('Rapport suggestion copied');
        }
    }

    showToast(message) {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 1000;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 2000);
    }

    renderCoachingCards() {
        if (!this.culturalCoaching) {
            return html`
                <div class="no-coaching">
                    <div class="no-coaching-icon">🌍</div>
                    <div class="no-coaching-text">Waiting for conversation...</div>
                    <div class="no-coaching-subtext">Cultural coaching will appear here as you speak</div>
                </div>
            `;
        }

        const { context, response, bridge, warning } = this.culturalCoaching;

        return html`
            <div class="coaching-cards">
                ${this.currentTranscription ? html`
                    <div class="transcription-display">
                        <div class="transcription-label">Latest Speech</div>
                        <div class="transcription-text">"${this.currentTranscription}"</div>
                    </div>
                ` : ''}
                
                ${context ? html`
                    <div class="coaching-card context-card">
                        <div class="card-header">
                            <div class="card-icon">💡</div>
                            <div class="card-title">Cultural Context</div>
                        </div>
                        <div class="card-content">${context}</div>
                    </div>
                ` : ''}
                
                ${response ? html`
                    <div class="coaching-card response-card">
                        <div class="card-header">
                            <div class="card-icon">🎯</div>
                            <div class="card-title">Suggested Response</div>
                        </div>
                        <div class="card-content">${response}</div>
                        <div class="quick-actions">
                            <button class="action-button" @click=${this.handleCopyResponse}>
                                Copy Response
                            </button>
                        </div>
                    </div>
                ` : ''}
                
                ${bridge ? html`
                    <div class="coaching-card bridge-card">
                        <div class="card-header">
                            <div class="card-icon">🌸</div>
                            <div class="card-title">Rapport Building</div>
                        </div>
                        <div class="card-content">${bridge}</div>
                        <div class="quick-actions">
                            <button class="action-button" @click=${this.handleCopyBridge}>
                                Copy Suggestion
                            </button>
                        </div>
                    </div>
                ` : ''}
                
                ${warning ? html`
                    <div class="coaching-card warning-card">
                        <div class="card-header">
                            <div class="card-icon">⚠️</div>
                            <div class="card-title">Cultural Warning</div>
                        </div>
                        <div class="card-content">${warning}</div>
                    </div>
                ` : ''}
                
                <div class="confidence-indicator">
                    <div class="confidence-text">Confidence</div>
                    <div class="confidence-bar">
                        <div class="confidence-fill" style="width: ${this.confidence * 100}%"></div>
                    </div>
                    <div class="confidence-text">${Math.round(this.confidence * 100)}%</div>
                </div>
            </div>
        `;
    }

    render() {
        return html`
            <div class="coaching-container">
                <div class="split-layout">
                    <div class="coaching-section">
                                            <div class="coaching-header">
                        <div class="coaching-title">Harmonia</div>
                        <div class="coaching-subtitle">Real-time Cultural Intelligence</div>
                    </div>
                        
                        ${this.renderCoachingCards()}
                    </div>
                    
                    <div class="qloo-section">
                        <qloo-api-visualization
                            .qlooMetrics=${this.qlooMetrics}
                            .isActive=${this.isActive}
                            .confidence=${this.confidence}
                        ></qloo-api-visualization>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('cultural-coaching-view', CulturalCoachingView); 