// Anthropic API Service for Claude integration
const Anthropic = require('@anthropic-ai/sdk');
const config = require('../../config/config');

class AnthropicService {
    constructor() {
        this.client = null;
        this.isInitialized = false;
    }

    async initialize(apiKey) {
        if (!apiKey) {
            throw new Error('Anthropic API key is required');
        }

        this.client = new Anthropic({
            apiKey: apiKey
        });

        this.isInitialized = true;
    }

    async categorizeSample(audioMetadata) {
        if (!this.isInitialized) {
            throw new Error('Anthropic service not initialized');
        }

        const prompt = this.buildCategorizationPrompt(audioMetadata);

        try {
            const message = await this.client.messages.create({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 300,
                temperature: 0.3,
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            });

            const response = message.content[0].text;
            return this.parseCategorizationResponse(response);

        } catch (error) {
            console.error('Anthropic categorization error:', error);
            return {
                category: 'unknown',
                subcategory: null,
                confidence: 0,
                error: error.message
            };
        }
    }

    async generateTags(audioMetadata, category = null) {
        if (!this.isInitialized) {
            throw new Error('Anthropic service not initialized');
        }

        const prompt = this.buildTaggingPrompt(audioMetadata, category);

        try {
            const message = await this.client.messages.create({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 400,
                temperature: 0.5,
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            });

            const response = message.content[0].text;
            return this.parseTaggingResponse(response);

        } catch (error) {
            console.error('Anthropic tagging error:', error);
            return {
                tags: [],
                mood: 'neutral',
                energy: 'medium',
                style: 'unknown',
                error: error.message
            };
        }
    }

    async searchSamples(query, samples) {
        if (!this.isInitialized) {
            throw new Error('Anthropic service not initialized');
        }

        const prompt = this.buildSearchPrompt(query, samples);

        try {
            const message = await this.client.messages.create({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 500,
                temperature: 0.3,
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            });

            const response = message.content[0].text;
            return this.parseSearchResponse(response, samples);

        } catch (error) {
            console.error('Anthropic search error:', error);
            return [];
        }
    }

    async generateDescription(audioMetadata, analysis) {
        if (!this.isInitialized) {
            throw new Error('Anthropic service not initialized');
        }

        const prompt = `
As a music expert, create a detailed description for this audio sample:

File: ${audioMetadata.name}
Duration: ${audioMetadata.duration ? `${audioMetadata.duration.toFixed(2)}s` : 'unknown'}
Category: ${analysis.category || 'unknown'}
BPM: ${analysis.bpm || 'unknown'}
Tags: ${(analysis.tags || []).join(', ')}
Mood: ${analysis.mood || 'unknown'}
Energy: ${analysis.energy || 'unknown'}

Write a concise but descriptive paragraph that captures the essence of this sample. Focus on its musical characteristics, potential use cases, and distinctive qualities. Keep it under 100 words.`;

        try {
            const message = await this.client.messages.create({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 150,
                temperature: 0.6,
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            });

            return message.content[0].text.trim();

        } catch (error) {
            console.error('Anthropic description error:', error);
            return 'No description available.';
        }
    }

    buildCategorizationPrompt(metadata) {
        return `
You are an expert audio engineer and music producer. Analyze this audio sample metadata and categorize it precisely.

Audio Sample Details:
- File: ${metadata.name}
- Duration: ${metadata.duration ? `${metadata.duration.toFixed(2)} seconds` : 'unknown'}
- Bitrate: ${metadata.bitrate || 'unknown'} kbps
- Sample Rate: ${metadata.sampleRate || 'unknown'} Hz
- Channels: ${metadata.channels || 'unknown'}

Available categories: ${config.ai.categories.join(', ')}

Based on the filename, duration, and technical specs, determine the most likely category. Consider:
- Short samples (< 2s) are likely one-shots (kicks, snares, FX)
- Longer samples (> 8s) are likely loops or melodic content
- Filename patterns and common naming conventions

Respond with valid JSON only:
{
  "category": "primary_category",
  "subcategory": "specific_type_if_applicable", 
  "confidence": 0.85,
  "reasoning": "brief explanation of decision"
}`;
    }

    buildTaggingPrompt(metadata, category) {
        return `
You are a music producer creating descriptive tags for an audio sample library. Generate relevant tags that help users find samples.

Sample Information:
- File: ${metadata.name}
- Duration: ${metadata.duration ? `${metadata.duration.toFixed(2)} seconds` : 'unknown'}
- Category: ${category || 'unknown'}
${metadata.bpm ? `- BPM: ${metadata.bpm}` : ''}

Generate tags considering:
1. Mood options: ${config.ai.moods.join(', ')}
2. Style options: ${config.ai.styles.join(', ')}
3. Energy levels: low, medium, high
4. Sonic characteristics: warm, bright, dark, punchy, smooth, crisp, distorted, clean, etc.
5. Use cases: intro, breakdown, drop, ambient, transition, etc.

Respond with valid JSON only:
{
  "tags": ["descriptive", "tags", "here"],
  "mood": "primary_mood",
  "energy": "energy_level",
  "style": "musical_style",
  "characteristics": ["sonic", "qualities"],
  "useCase": "suggested_use"
}`;
    }

    buildSearchPrompt(query, samples) {
        const sampleList = samples.slice(0, 25).map((sample, index) => 
            `${index}: "${sample.name}" | ${sample.category || 'unknown'} | ${(sample.tags || []).join(', ')} | ${sample.mood || ''}`
        ).join('\n');

        return `
Help a user find relevant audio samples from their library.

User's search query: "${query}"

Available samples (index: name | category | tags | mood):
${sampleList}

Find samples that match the user's intent. Consider:
- Direct keyword matches in names and tags
- Semantic similarity (e.g., "energetic" matches "high energy", "uplifting")
- Musical context (e.g., "bassline" could match "bass" category)
- Mood and style associations
- Common music production terminology

Respond with valid JSON only:
{
  "matches": [0, 5, 12],
  "reasoning": "explanation of why these samples match the query"
}`;
    }

    parseCategorizationResponse(response) {
        try {
            // Extract JSON from response if there's additional text
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? jsonMatch[0] : response;
            const parsed = JSON.parse(jsonStr);
            
            return {
                category: parsed.category || 'unknown',
                subcategory: parsed.subcategory || null,
                confidence: Math.max(0, Math.min(1, parsed.confidence || 0)),
                reasoning: parsed.reasoning || ''
            };
        } catch (error) {
            console.error('Failed to parse categorization response:', error);
            return {
                category: 'unknown',
                subcategory: null,
                confidence: 0,
                error: 'Failed to parse response'
            };
        }
    }

    parseTaggingResponse(response) {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? jsonMatch[0] : response;
            const parsed = JSON.parse(jsonStr);
            
            return {
                tags: Array.isArray(parsed.tags) ? parsed.tags : [],
                mood: parsed.mood || 'neutral',
                energy: parsed.energy || 'medium',
                style: parsed.style || 'unknown',
                characteristics: Array.isArray(parsed.characteristics) ? parsed.characteristics : [],
                useCase: parsed.useCase || null
            };
        } catch (error) {
            console.error('Failed to parse tagging response:', error);
            return {
                tags: [],
                mood: 'neutral',
                energy: 'medium',
                style: 'unknown',
                characteristics: [],
                useCase: null
            };
        }
    }

    parseSearchResponse(response, samples) {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? jsonMatch[0] : response;
            const parsed = JSON.parse(jsonStr);
            const matches = parsed.matches || [];
            
            return matches
                .filter(index => index >= 0 && index < samples.length)
                .map(index => ({
                    sample: samples[index],
                    reasoning: parsed.reasoning || ''
                }));
        } catch (error) {
            console.error('Failed to parse search response:', error);
            return [];
        }
    }
}

module.exports = new AnthropicService();