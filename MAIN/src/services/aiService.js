// Unified AI Service that combines OpenAI, Anthropic, and Audio Analysis
const openaiService = require('./openaiService');
const anthropicService = require('./anthropicService');
const audioAnalysis = require('./audioAnalysis');
const sampleDatabase = require('../database/sampleDatabase');
const config = require('../../config/config');

class AIService {
    constructor() {
        this.isInitialized = false;
        this.useOpenAI = false;
        this.useAnthropic = false;
        this.processingQueue = [];
        this.isProcessing = false;
    }

    async initialize(apiKeys = {}) {
        try {
            // Initialize audio analysis first
            await audioAnalysis.initialize();
            
            // Initialize AI services if API keys are provided
            if (apiKeys.openai) {
                await openaiService.initialize(apiKeys.openai);
                this.useOpenAI = true;
                console.log('OpenAI service initialized');
            }
            
            if (apiKeys.anthropic) {
                await anthropicService.initialize(apiKeys.anthropic);
                this.useAnthropic = true;
                console.log('Anthropic service initialized');
            }

            this.isInitialized = true;
            console.log('AI Service initialized successfully');
            
            return {
                success: true,
                openai: this.useOpenAI,
                anthropic: this.useAnthropic,
                audioAnalysis: true
            };
        } catch (error) {
            console.error('AI Service initialization error:', error);
            throw error;
        }
    }

    async processAudioFile(filePath) {
        if (!this.isInitialized) {
            throw new Error('AI Service not initialized');
        }

        try {
            console.log(`Processing audio file: ${filePath}`);
            
            // Step 1: Audio analysis (always available)
            const audioInfo = await audioAnalysis.getAudioInfo(filePath);
            
            // Step 2: AI categorization (if available)
            let aiAnalysis = {
                category: 'unknown',
                subcategory: null,
                confidence: 0,
                tags: [],
                mood: 'neutral',
                energy: 'medium',
                style: 'unknown',
                description: null
            };

            if (this.useOpenAI || this.useAnthropic) {
                aiAnalysis = await this.getAIAnalysis(audioInfo.metadata, audioInfo.bpm);
            }

            // Combine all results
            const completeAnalysis = {
                ...audioInfo.metadata,
                bpm: audioInfo.bpm,
                bpmConfidence: audioInfo.bpmConfidence,
                features: audioInfo.features,
                
                // AI analysis results
                category: aiAnalysis.category,
                subcategory: aiAnalysis.subcategory,
                confidence: aiAnalysis.confidence,
                tags: aiAnalysis.tags,
                mood: aiAnalysis.mood,
                energy: aiAnalysis.energy,
                style: aiAnalysis.style,
                description: aiAnalysis.description,
                characteristics: aiAnalysis.characteristics || [],
                
                // Processing metadata
                processedAt: new Date().toISOString(),
                aiProvider: this.getUsedProvider(),
                path: filePath
            };

            return completeAnalysis;
        } catch (error) {
            console.error('Audio file processing error:', error);
            throw error;
        }
    }

    async getAIAnalysis(metadata, bpm = null) {
        try {
            let primaryResult = null;
            let secondaryResult = null;

            // Use both AI services if available for better accuracy
            if (this.useAnthropic) {
                primaryResult = await this.getAnthropicAnalysis(metadata, bpm);
            }
            
            if (this.useOpenAI) {
                secondaryResult = await this.getOpenAIAnalysis(metadata, bpm);
            }

            // Combine results from both services
            return this.combineAIResults(primaryResult, secondaryResult);
        } catch (error) {
            console.error('AI analysis error:', error);
            // Return fallback analysis
            return this.getFallbackAnalysis(metadata, bpm);
        }
    }

    async getAnthropicAnalysis(metadata, bpm) {
        try {
            const [categorization, tagging] = await Promise.all([
                anthropicService.categorizeSample(metadata),
                anthropicService.generateTags(metadata)
            ]);

            return {
                category: categorization.category,
                subcategory: categorization.subcategory,
                confidence: categorization.confidence,
                tags: tagging.tags,
                mood: tagging.mood,
                energy: tagging.energy,
                style: tagging.style,
                characteristics: tagging.characteristics,
                useCase: tagging.useCase,
                provider: 'anthropic'
            };
        } catch (error) {
            console.error('Anthropic analysis error:', error);
            return null;
        }
    }

    async getOpenAIAnalysis(metadata, bpm) {
        try {
            const [categorization, tagging] = await Promise.all([
                openaiService.categorizeSample(metadata),
                openaiService.generateTags(metadata)
            ]);

            return {
                category: categorization.category,
                subcategory: categorization.subcategory,
                confidence: categorization.confidence,
                tags: tagging.tags,
                mood: tagging.mood,
                energy: tagging.energy,
                style: tagging.style,
                characteristics: tagging.characteristics,
                provider: 'openai'
            };
        } catch (error) {
            console.error('OpenAI analysis error:', error);
            return null;
        }
    }

    combineAIResults(primary, secondary) {
        if (!primary && !secondary) {
            return this.getFallbackAnalysis();
        }

        if (!secondary) return primary;
        if (!primary) return secondary;

        // Combine results, preferring primary but enhancing with secondary
        return {
            category: primary.category || secondary.category,
            subcategory: primary.subcategory || secondary.subcategory,
            confidence: Math.max(primary.confidence || 0, secondary.confidence || 0),
            tags: [...(primary.tags || []), ...(secondary.tags || [])].filter((tag, index, arr) => arr.indexOf(tag) === index),
            mood: primary.mood || secondary.mood,
            energy: primary.energy || secondary.energy,
            style: primary.style || secondary.style,
            characteristics: [...(primary.characteristics || []), ...(secondary.characteristics || [])],
            providers: [primary.provider, secondary.provider].filter(Boolean)
        };
    }

    getFallbackAnalysis(metadata = {}, bpm = null) {
        // Provide basic analysis based on filename and metadata
        const filename = metadata.name || '';
        
        let category = 'unknown';
        let mood = 'neutral';
        let energy = 'medium';

        // Basic pattern matching
        if (filename.includes('kick')) category = 'kick';
        else if (filename.includes('snare')) category = 'snare';
        else if (filename.includes('hat') || filename.includes('hihat')) category = 'hihat';
        else if (filename.includes('bass')) category = 'bass';
        else if (filename.includes('lead')) category = 'lead';
        else if (filename.includes('pad')) category = 'pad';
        else if (filename.includes('vocal')) category = 'vocal';

        // Energy estimation
        if (bpm) {
            if (bpm > 140) energy = 'high';
            else if (bpm < 100) energy = 'low';
        }

        return {
            category,
            subcategory: null,
            confidence: 0.3,
            tags: [category].filter(Boolean),
            mood,
            energy,
            style: 'unknown',
            characteristics: [],
            provider: 'fallback'
        };
    }

    async processBatch(filePaths, onProgress = null) {
        const results = [];
        const total = filePaths.length;

        for (let i = 0; i < filePaths.length; i++) {
            try {
                const result = await this.processAudioFile(filePaths[i]);
                results.push(result);
                
                if (onProgress) {
                    onProgress({
                        current: i + 1,
                        total,
                        percentage: Math.round(((i + 1) / total) * 100),
                        currentFile: filePaths[i],
                        result
                    });
                }
            } catch (error) {
                console.error(`Error processing ${filePaths[i]}:`, error);
                results.push({
                    path: filePaths[i],
                    error: error.message,
                    processedAt: new Date().toISOString()
                });
            }
        }

        return results;
    }

    async searchSamples(query, samples = []) {
        if (!query || query.trim() === '') {
            return samples;
        }

        try {
            // If AI services are available, use them for semantic search
            if (this.useOpenAI) {
                const aiResults = await openaiService.searchSamples(query, samples);
                if (aiResults && aiResults.length > 0) {
                    return aiResults;
                }
            }

            if (this.useAnthropic) {
                const aiResults = await anthropicService.searchSamples(query, samples);
                if (aiResults && aiResults.length > 0) {
                    return aiResults.map(result => result.sample || result);
                }
            }

            // Fallback to basic text search
            return this.basicTextSearch(query, samples);
        } catch (error) {
            console.error('AI search error:', error);
            return this.basicTextSearch(query, samples);
        }
    }

    basicTextSearch(query, samples) {
        const searchTerms = query.toLowerCase().split(' ');
        
        return samples.filter(sample => {
            const searchText = `${sample.name} ${sample.category} ${(sample.tags || []).join(' ')} ${sample.mood} ${sample.style}`.toLowerCase();
            return searchTerms.some(term => searchText.includes(term));
        }).sort((a, b) => {
            // Sort by relevance (number of matching terms)
            const aMatches = searchTerms.filter(term => 
                `${a.name} ${a.category}`.toLowerCase().includes(term)
            ).length;
            const bMatches = searchTerms.filter(term => 
                `${b.name} ${b.category}`.toLowerCase().includes(term)
            ).length;
            return bMatches - aMatches;
        });
    }

    getUsedProvider() {
        const providers = [];
        if (this.useOpenAI) providers.push('openai');
        if (this.useAnthropic) providers.push('anthropic');
        return providers.join(', ') || 'none';
    }

    getStatus() {
        return {
            initialized: this.isInitialized,
            openai: this.useOpenAI,
            anthropic: this.useAnthropic,
            audioAnalysis: true,
            processing: this.isProcessing,
            queueSize: this.processingQueue.length
        };
    }
}

module.exports = new AIService();