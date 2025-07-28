import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';

export class QlooApiVisualization extends LitElement {
    static styles = css`
        :host {
            display: block;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .qloo-dashboard {
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border-radius: 12px;
            padding: 16px;
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .dashboard-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 16px;
        }

        .qloo-logo {
            font-size: 20px;
            animation: pulse 2s infinite;
        }

        .dashboard-title {
            font-size: 14px;
            font-weight: 600;
            color: #00ff88;
        }

        .metrics-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 16px;
        }

        .metric-card {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            padding: 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .metric-value {
            font-size: 18px;
            font-weight: 700;
            color: #00ff88;
            margin-bottom: 4px;
        }

        .metric-label {
            font-size: 10px;
            opacity: 0.7;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .api-calls-container {
            margin-bottom: 16px;
        }

        .api-calls-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }

        .api-calls-title {
            font-size: 12px;
            font-weight: 600;
            color: #ff6b6b;
        }

        .api-calls-count {
            font-size: 12px;
            color: #ff6b6b;
            font-weight: 600;
        }

        .api-calls-list {
            max-height: 120px;
            overflow-y: auto;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 6px;
            padding: 8px;
        }

        .api-call-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 4px 8px;
            margin-bottom: 4px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 4px;
            font-size: 10px;
            animation: slideIn 0.3s ease-out;
        }

        .api-call-icon {
            font-size: 12px;
            color: #00ff88;
        }

        .api-call-text {
            flex: 1;
            opacity: 0.9;
        }

        .api-call-time {
            font-size: 8px;
            opacity: 0.6;
        }

        .entities-container {
            margin-bottom: 16px;
        }

        .entities-header {
            font-size: 12px;
            font-weight: 600;
            color: #4ecdc4;
            margin-bottom: 8px;
        }

        .entities-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
            gap: 6px;
        }

        .entity-tag {
            background: rgba(78, 205, 196, 0.2);
            border: 1px solid rgba(78, 205, 196, 0.3);
            border-radius: 4px;
            padding: 4px 8px;
            font-size: 10px;
            text-align: center;
            animation: fadeIn 0.5s ease-out;
        }

        .correlations-container {
            margin-bottom: 16px;
        }

        .correlations-header {
            font-size: 12px;
            font-weight: 600;
            color: #ffd93d;
            margin-bottom: 8px;
        }

        .correlation-item {
            background: rgba(255, 217, 61, 0.1);
            border: 1px solid rgba(255, 217, 61, 0.2);
            border-radius: 4px;
            padding: 6px 8px;
            margin-bottom: 4px;
            font-size: 10px;
            animation: slideIn 0.3s ease-out;
        }

        .confidence-container {
            text-align: center;
        }

        .confidence-header {
            font-size: 12px;
            font-weight: 600;
            color: #ff6b9d;
            margin-bottom: 8px;
        }

        .confidence-bar {
            width: 100%;
            height: 8px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 8px;
        }

        .confidence-fill {
            height: 100%;
            background: linear-gradient(90deg, #ff6b9d, #ff8e53);
            transition: width 0.5s ease;
        }

        .confidence-text {
            font-size: 12px;
            color: #ff6b9d;
            font-weight: 600;
        }

        .status-indicator {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 12px;
        }

        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            animation: pulse 1s infinite;
        }

        .status-dot.active {
            background: #00ff88;
        }

        .status-dot.inactive {
            background: #ff6b6b;
        }

        .status-text {
            font-size: 10px;
            opacity: 0.8;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(-10px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        .qloo-powered-badge {
            background: linear-gradient(45deg, #00ff88, #00d4ff);
            color: #1a1a2e;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 8px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 8px;
            text-align: center;
        }
    `;

    static properties = {
        qlooMetrics: { type: Object },
        apiCalls: { type: Array },
        entities: { type: Array },
        correlations: { type: Array },
        isActive: { type: Boolean },
        confidence: { type: Number }
    };

    constructor() {
        super();
        this.qlooMetrics = {
            totalCalls: 0,
            entitiesDetected: 0,
            correlationsFound: 0,
            averageConfidence: 0
        };
        this.apiCalls = [];
        this.entities = [];
        this.correlations = [];
        this.isActive = false;
        this.confidence = 0;
    }

    updated(changedProperties) {
        super.updated(changedProperties);
        
        if (changedProperties.has('qlooMetrics')) {
            this.updateMetrics();
        }
    }

    updateMetrics() {
        // Update confidence based on metrics
        if (this.qlooMetrics.totalCalls > 0) {
            this.confidence = Math.min(this.qlooMetrics.averageConfidence || 0.5, 1.0);
        }
    }

    addApiCall(callType, details) {
        const call = {
            type: callType,
            details: details,
            timestamp: new Date().toLocaleTimeString(),
            id: Date.now()
        };
        
        this.apiCalls = [call, ...this.apiCalls.slice(0, 9)]; // Keep last 10 calls
        this.requestUpdate();
    }

    addEntity(entity) {
        this.entities = [...this.entities, entity];
        this.requestUpdate();
    }

    addCorrelation(correlation) {
        this.correlations = [...this.correlations, correlation];
        this.requestUpdate();
    }

    renderMetrics() {
        return html`
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-value">${this.qlooMetrics.totalCalls}</div>
                    <div class="metric-label">API Calls</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${this.qlooMetrics.entitiesDetected}</div>
                    <div class="metric-label">Entities</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${this.qlooMetrics.correlationsFound}</div>
                    <div class="metric-label">Correlations</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${Math.round(this.confidence * 100)}%</div>
                    <div class="metric-label">Confidence</div>
                </div>
            </div>
        `;
    }

    renderApiCalls() {
        return html`
            <div class="api-calls-container">
                <div class="api-calls-header">
                    <div class="api-calls-title">🔥 QLOO API ACTIVITY</div>
                    <div class="api-calls-count">${this.apiCalls.length} calls</div>
                </div>
                <div class="api-calls-list">
                    ${this.apiCalls.map(call => html`
                        <div class="api-call-item">
                            <div class="api-call-icon">🔍</div>
                            <div class="api-call-text">${call.type}</div>
                            <div class="api-call-time">${call.timestamp}</div>
                        </div>
                    `)}
                </div>
            </div>
        `;
    }

    renderEntities() {
        return html`
            <div class="entities-container">
                <div class="entities-header">🌍 CULTURAL ENTITIES</div>
                <div class="entities-grid">
                    ${this.entities.slice(-8).map(entity => html`
                        <div class="entity-tag">${entity.name}</div>
                    `)}
                </div>
            </div>
        `;
    }

    renderCorrelations() {
        return html`
            <div class="correlations-container">
                <div class="correlations-header">🔗 CULTURAL CORRELATIONS</div>
                ${this.correlations.slice(-3).map(correlation => html`
                    <div class="correlation-item">
                        ${correlation.entity1} ↔ ${correlation.entity2}
                    </div>
                `)}
            </div>
        `;
    }

    renderConfidence() {
        return html`
            <div class="confidence-container">
                <div class="confidence-header">🎯 QLOO CONFIDENCE</div>
                <div class="confidence-bar">
                    <div class="confidence-fill" style="width: ${this.confidence * 100}%"></div>
                </div>
                <div class="confidence-text">${Math.round(this.confidence * 100)}%</div>
            </div>
        `;
    }

    render() {
        return html`
            <div class="qloo-dashboard">
                <div class="dashboard-header">
                    <div class="qloo-logo">🔥</div>
                    <div class="dashboard-title">QLOO INTELLIGENCE</div>
                </div>
                
                <div class="status-indicator">
                    <div class="status-dot ${this.isActive ? 'active' : 'inactive'}"></div>
                    <div class="status-text">
                        ${this.isActive ? 'Analyzing conversation...' : 'Waiting for input...'}
                    </div>
                </div>
                
                ${this.renderMetrics()}
                ${this.renderApiCalls()}
                ${this.renderEntities()}
                ${this.renderCorrelations()}
                ${this.renderConfidence()}
                
                <div class="qloo-powered-badge">
                    Powered by Qloo's 575M Cultural Entities
                </div>
            </div>
        `;
    }
}

customElements.define('qloo-api-visualization', QlooApiVisualization); 