// Cultural Intelligence Engine for Harmonia
// QLOO IS THE CENTRAL NERVOUS SYSTEM - EVERYTHING IS QLOO-POWERED

const { QlooMasterClient } = require('./qlooMasterClient');

class CulturalIntelligenceEngine {
    constructor() {
        // 🔥 QLOO MASTER CLIENT IS THE CORE
        this.qlooClient = new QlooMasterClient({
            apiKey: process.env.QLOO_API_KEY,
            maxRequestsPerSecond: 50,
            batchingEnabled: true,
            cacheStrategy: 'aggressive-but-fresh'
        });
        
        this.currentConversation = [];
        this.culturalContexts = new Map();
        this.coachingHistory = [];
        
        console.log('🔥 CULTURAL INTELLIGENCE ENGINE: Qloo-powered and ready!');
    }

    async initialize(qlooApiKey) {
        // Initialize Qloo Master Client with API key
        this.qlooClient = new QlooMasterClient({
            apiKey: qlooApiKey,
            maxRequestsPerSecond: 50,
            batchingEnabled: true,
            cacheStrategy: 'aggressive-but-fresh'
        });
        
        console.log('🔥 QLOO MASTER CLIENT: Initialized and ready to extract cultural intelligence!');
    }

    // 🔥 QLOO-POWERED CONVERSATION ANALYSIS
    async analyzeConversation(transcription, speakerId = null) {
        if (!this.qlooClient) {
            return this.generateBasicCoaching(transcription);
        }

        try {
            console.log(`🔥 QLOO ANALYSIS STARTING: "${transcription}"`);
            
            // Add to conversation history
            this.currentConversation.push({
                text: transcription,
                speaker: speakerId,
                timestamp: Date.now()
            });

            // 🔥 STEP 1: QLOO ENTITY EXTRACTION OVERDRIVE
            const entities = await this.qlooClient.batchEntityExtraction(transcription);
            console.log(`✅ QLOO: Extracted ${entities.length} cultural entities`);

            // 🔥 STEP 2: QLOO MULTI-DOMAIN ANALYSIS
            const analysis = await this.qlooClient.multiDomainAnalysis(entities);
            console.log(`✅ QLOO: Multi-domain analysis complete`);

            // 🔥 STEP 3: QLOO DEEP CORRELATION ENGINE
            const correlations = await this.qlooClient.findDeepCorrelations(entities);
            console.log(`✅ QLOO: Found ${correlations.length} deep correlations`);

            // 🔥 STEP 4: QLOO CULTURAL BRIDGE GENERATION
            const bridges = await this.qlooClient.generateCulturalBridges(correlations);
            console.log(`✅ QLOO: Generated ${bridges.length} cultural bridges`);

            // 🔥 STEP 5: QLOO INTELLIGENCE SYNTHESIS
            const qlooIntelligence = await this.qlooClient.synthesizeCulturalIntelligence(
                entities, analysis, correlations, bridges
            );
            console.log(`✅ QLOO: Intelligence synthesis complete`);

            // 🔥 STEP 6: FORMAT QLOO INSIGHTS INTO COACHING
            const coaching = await this.formatQlooInsights(qlooIntelligence, transcription);
            
            return coaching;
        } catch (error) {
            console.error('🔥 QLOO ANALYSIS ERROR:', error);
            return this.generateBasicCoaching(transcription);
        }
    }

    async extractCulturalEntities(text) {
        // Extract potential cultural references, names, locations, etc.
        const entities = [];
        
        // Common cultural patterns
        const patterns = {
            greetings: /\b(hello|hi|good morning|good afternoon|good evening|hey|yo)\b/gi,
            formalities: /\b(please|thank you|thanks|excuse me|sorry|pardon)\b/gi,
            timeReferences: /\b(tomorrow|yesterday|next week|last week|soon|later)\b/gi,
            locations: /\b(office|meeting|conference|restaurant|hotel|airport)\b/gi,
            businessTerms: /\b(deal|contract|agreement|partnership|collaboration|negotiation)\b/gi,
            familyTerms: /\b(family|children|kids|parents|spouse|partner)\b/gi,
            foodTerms: /\b(dinner|lunch|breakfast|coffee|tea|restaurant)\b/gi
        };

        for (const [category, pattern] of Object.entries(patterns)) {
            const matches = text.match(pattern);
            if (matches) {
                entities.push({
                    category,
                    terms: matches,
                    context: text
                });
            }
        }

        return entities;
    }

    async analyzeCulturalContext(entities, transcription) {
        const analysis = {
            detectedCultures: [],
            culturalSignals: [],
            potentialMisunderstandings: [],
            rapportOpportunities: []
        };

        // Analyze for cultural communication patterns
        const communicationPatterns = this.analyzeCommunicationPatterns(transcription);
        analysis.culturalSignals.push(...communicationPatterns);

        // Detect potential cultural contexts based on entities
        for (const entity of entities) {
            const culturalContext = await this.getCulturalContext(entity);
            if (culturalContext) {
                analysis.detectedCultures.push(culturalContext);
            }
        }

        // Identify potential misunderstandings
        const misunderstandings = this.identifyPotentialMisunderstandings(transcription, analysis);
        analysis.potentialMisunderstandings.push(...misunderstandings);

        // Find rapport building opportunities
        const rapportOpportunities = this.findRapportOpportunities(entities, analysis);
        analysis.rapportOpportunities.push(...rapportOpportunities);

        return analysis;
    }

    analyzeCommunicationPatterns(text) {
        const patterns = [];

        // Direct vs indirect communication
        if (text.includes('must') || text.includes('should') || text.includes('need to')) {
            patterns.push({
                type: 'direct_communication',
                confidence: 0.8,
                description: 'Direct communication style detected'
            });
        }

        if (text.includes('maybe') || text.includes('perhaps') || text.includes('might')) {
            patterns.push({
                type: 'indirect_communication',
                confidence: 0.7,
                description: 'Indirect communication style detected'
            });
        }

        // Formality level
        if (text.includes('sir') || text.includes('madam') || text.includes('Mr.') || text.includes('Ms.')) {
            patterns.push({
                type: 'formal_communication',
                confidence: 0.9,
                description: 'Formal communication style detected'
            });
        }

        // Time orientation
        if (text.includes('schedule') || text.includes('deadline') || text.includes('timeline')) {
            patterns.push({
                type: 'time_focused',
                confidence: 0.8,
                description: 'Time-focused communication detected'
            });
        }

        return patterns;
    }

    async getCulturalContext(entity) {
        // This would integrate with Qloo API to get cultural context
        // For now, return mock data based on entity categories
        const culturalMappings = {
            greetings: {
                japanese: { formality: 'high', indirectness: 'high' },
                american: { formality: 'low', indirectness: 'low' },
                british: { formality: 'medium', indirectness: 'medium' }
            },
            businessTerms: {
                german: { directness: 'high', efficiency: 'high' },
                american: { directness: 'medium', efficiency: 'high' },
                japanese: { directness: 'low', efficiency: 'high' }
            },
            familyTerms: {
                latin_american: { family_importance: 'high', personal_connection: 'high' },
                asian: { family_importance: 'high', hierarchy: 'high' },
                western: { family_importance: 'medium', individualism: 'high' }
            }
        };

        return culturalMappings[entity.category] || null;
    }

    identifyPotentialMisunderstandings(text, analysis) {
        const misunderstandings = [];

        // Check for direct vs indirect communication mismatches
        const hasDirectPatterns = analysis.culturalSignals.some(signal => 
            signal.type === 'direct_communication'
        );
        const hasIndirectPatterns = analysis.culturalSignals.some(signal => 
            signal.type === 'indirect_communication'
        );

        if (hasDirectPatterns && hasIndirectPatterns) {
            misunderstandings.push({
                type: 'communication_style_mismatch',
                severity: 'medium',
                description: 'Mixed direct and indirect communication styles detected'
            });
        }

        // Check for time-related potential issues
        if (text.includes('urgent') || text.includes('immediately')) {
            misunderstandings.push({
                type: 'time_pressure',
                severity: 'high',
                description: 'Time pressure detected - may cause stress in some cultures'
            });
        }

        return misunderstandings;
    }

    findRapportOpportunities(entities, analysis) {
        const opportunities = [];

        // Food-related rapport opportunities
        const foodEntities = entities.filter(e => e.category === 'foodTerms');
        if (foodEntities.length > 0) {
            opportunities.push({
                type: 'food_rapport',
                description: 'Food-related conversation detected - good rapport building opportunity',
                suggestions: ['Ask about local cuisine preferences', 'Share food experiences', 'Suggest business meals']
            });
        }

        // Family-related rapport opportunities
        const familyEntities = entities.filter(e => e.category === 'familyTerms');
        if (familyEntities.length > 0) {
            opportunities.push({
                type: 'family_rapport',
                description: 'Family mentioned - personal connection opportunity',
                suggestions: ['Show interest in family', 'Share family experiences appropriately', 'Respect cultural family dynamics']
            });
        }

        return opportunities;
    }

    async generateCulturalCoaching(analysis, transcription) {
        const coaching = {
            context: '',
            response: '',
            bridge: '',
            warning: '',
            confidence: 0.0
        };

        // Generate context explanation
        if (analysis.detectedCultures.length > 0) {
            coaching.context = this.generateContextExplanation(analysis);
        }

        // Generate response suggestions
        coaching.response = this.generateResponseSuggestions(analysis, transcription);

        // Generate rapport building suggestions
        if (analysis.rapportOpportunities.length > 0) {
            coaching.bridge = this.generateRapportSuggestions(analysis.rapportOpportunities);
        }

        // Generate warnings
        if (analysis.potentialMisunderstandings.length > 0) {
            coaching.warning = this.generateWarnings(analysis.potentialMisunderstandings);
        }

        // Calculate confidence score
        coaching.confidence = this.calculateConfidence(analysis);

        return coaching;
    }

    generateContextExplanation(analysis) {
        const explanations = [];

        for (const signal of analysis.culturalSignals) {
            switch (signal.type) {
                case 'direct_communication':
                    explanations.push('Direct communication style detected - common in German, Dutch, and American business cultures');
                    break;
                case 'indirect_communication':
                    explanations.push('Indirect communication style detected - common in Japanese, Korean, and some Asian cultures');
                    break;
                case 'formal_communication':
                    explanations.push('Formal communication style detected - shows respect and professionalism');
                    break;
                case 'time_focused':
                    explanations.push('Time-focused communication detected - emphasizes efficiency and deadlines');
                    break;
            }
        }

        return explanations.join('. ');
    }

    generateResponseSuggestions(analysis, transcription) {
        const suggestions = [];

        // Generate context-appropriate responses
        if (analysis.culturalSignals.some(s => s.type === 'indirect_communication')) {
            suggestions.push('Consider using more indirect language: "Perhaps we could consider..." instead of "We should..."');
        }

        if (analysis.culturalSignals.some(s => s.type === 'formal_communication')) {
            suggestions.push('Maintain formal tone and use appropriate titles (Mr., Ms., Dr.)');
        }

        if (analysis.potentialMisunderstandings.some(m => m.type === 'time_pressure')) {
            suggestions.push('Consider cultural attitudes toward time - some cultures prefer relationship building over urgency');
        }

        return suggestions.join('. ');
    }

    generateRapportSuggestions(opportunities) {
        const suggestions = [];

        for (const opportunity of opportunities) {
            suggestions.push(...opportunity.suggestions);
        }

        return suggestions.join('. ');
    }

    generateWarnings(misunderstandings) {
        const warnings = [];

        for (const misunderstanding of misunderstandings) {
            switch (misunderstanding.type) {
                case 'communication_style_mismatch':
                    warnings.push('Mixed communication styles may cause confusion - consider adapting your style');
                    break;
                case 'time_pressure':
                    warnings.push('Time pressure may be perceived as rude in relationship-oriented cultures');
                    break;
            }
        }

        return warnings.join('. ');
    }

    calculateConfidence(analysis) {
        let confidence = 0.5; // Base confidence

        // Increase confidence based on detected signals
        confidence += analysis.culturalSignals.length * 0.1;
        confidence += analysis.detectedCultures.length * 0.15;
        confidence += analysis.rapportOpportunities.length * 0.05;

        // Decrease confidence for potential misunderstandings
        confidence -= analysis.potentialMisunderstandings.length * 0.1;

        return Math.min(Math.max(confidence, 0.0), 1.0);
    }

    // 🔥 FORMAT QLOO INSIGHTS INTO COACHING CARDS
    async formatQlooInsights(qlooIntelligence, transcription) {
        const { context, responses, warnings, bridges, confidence, qlooMetrics } = qlooIntelligence;
        
        console.log(`🔥 FORMATTING QLOO INSIGHTS: ${qlooMetrics.apiCallsMade} API calls made`);
        
        return {
            context: context || 'Qloo cultural analysis in progress...',
            response: responses || 'Consider cultural context in your response',
            bridge: bridges.length > 0 ? bridges[0].strategy : 'Build rapport through shared values',
            warning: warnings || 'Be mindful of cultural differences',
            confidence: confidence || 0.5,
            qlooMetrics: qlooMetrics
        };
    }

    generateBasicCoaching(transcription) {
        // Fallback coaching when Qloo API is not available
        return {
            context: 'Qloo cultural analysis not available - using basic communication coaching',
            response: 'Focus on clear, respectful communication. Listen actively and show interest in the other person\'s perspective.',
            bridge: 'Build rapport by finding common ground and showing genuine interest.',
            warning: 'Be mindful of cultural differences in communication styles and time orientation.',
            confidence: 0.3,
            qlooMetrics: {
                entitiesAnalyzed: 0,
                apiCallsMade: 0,
                correlationsFound: 0,
                domainsAnalyzed: 0
            }
        };
    }

    // Get coaching history for the current session
    getCoachingHistory() {
        return this.coachingHistory;
    }

    // Clear conversation history
    clearConversation() {
        this.currentConversation = [];
        this.coachingHistory = [];
    }
}

module.exports = {
    CulturalIntelligenceEngine
}; 