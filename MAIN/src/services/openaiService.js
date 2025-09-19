// OpenAI API Service for ChatGPT integration
const OpenAI = require('openai');
const config = require('../../config/config');

class OpenAIService {
    constructor() {
        this.client = null;
        this.isInitialized = false;
    }

    async initialize(apiKey) {
        if (!apiKey) {
            throw new Error('OpenAI API key is required');
        }

        this.client = new OpenAI({
            apiKey: apiKey
        });

        this.isInitialized = true;
    }

    async categorizeSample(audioMetadata) {
        if (!this.isInitialized) {
            throw new Error('OpenAI service not initialized');
        }

        const prompt = this.buildCategorizationPrompt(audioMetadata);

        try {
            const completion = await this.client.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert audio engineer and music producer. Analyze audio sample metadata and categorize samples into specific types. Respond only with valid JSON."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 300,
                temperature: 0.3
            });

            const response = completion.choices[0].message.content;
            return this.parseCategorizationResponse(response);

        } catch (error) {
            console.error('OpenAI categorization error:', error);
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
            throw new Error('OpenAI service not initialized');
        }

        const prompt = this.buildTaggingPrompt(audioMetadata, category);

        try {
            const completion = await this.client.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert music producer. Generate descriptive tags for audio samples based on their characteristics. Focus on mood, energy, style, and sonic qualities. Respond only with valid JSON."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 400,
                temperature: 0.5
            });

            const response = completion.choices[0].message.content;
            return this.parseTaggingResponse(response);

        } catch (error) {
            console.error('OpenAI tagging error:', error);
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
            throw new Error('OpenAI service not initialized');
        }

        const prompt = this.buildSearchPrompt(query, samples);

        try {
            const completion = await this.client.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: "You are an AI assistant helping users find audio samples. Analyze the user's query and match it with the most relevant samples from the provided list. Consider musical characteristics, mood, and semantic meaning."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 500,
                temperature: 0.3
            });

            const response = completion.choices[0].message.content;
            return this.parseSearchResponse(response, samples);

        } catch (error) {
            console.error('OpenAI search error:', error);
            return [];
        }
    }

    buildCategorizationPrompt(metadata) {
        return `
Analyze this audio sample metadata and categorize it:

File: ${metadata.name}
Duration: ${metadata.duration ? `${metadata.duration.toFixed(2)}s` : 'unknown'}
Bitrate: ${metadata.bitrate || 'unknown'} kbps
Sample Rate: ${metadata.sampleRate || 'unknown'} Hz
Channels: ${metadata.channels || 'unknown'}

Available categories: ${config.ai.categories.join(', ')}

Respond with JSON in this format:
{
  "category": "primary_category",
  "subcategory": "specific_type_if_applicable",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}`;
    }

    buildTaggingPrompt(metadata, category) {
        return `
Generate descriptive tags for this audio sample:

File: ${metadata.name}
Duration: ${metadata.duration ? `${metadata.duration.toFixed(2)}s` : 'unknown'}
Category: ${category || 'unknown'}
${metadata.bpm ? `BPM: ${metadata.bpm}` : ''}

Consider these aspects:
- Mood: ${config.ai.moods.join(', ')}
- Style: ${config.ai.styles.join(', ')}
- Energy level (low, medium, high)
- Sonic qualities (warm, bright, dark, punchy, smooth, etc.)

Respond with JSON in this format:
{
  "tags": ["tag1", "tag2", "tag3"],
  "mood": "primary_mood",
  "energy": "energy_level",
  "style": "musical_style",
  "characteristics": ["sonic", "qualities"]
}`;
    }

    buildSearchPrompt(query, samples) {
        const sampleList = samples.slice(0, 20).map((sample, index) => 
            `${index}: ${sample.name} - ${sample.category || 'unknown'} - ${(sample.tags || []).join(', ')}`
        ).join('\n');

        return `
User query: "${query}"

Available samples:
${sampleList}

Find the most relevant samples for this query. Consider:
- Direct keyword matches
- Semantic similarity
- Musical characteristics
- Mood and style

Respond with JSON array of sample indices:
{
  "matches": [0, 5, 12],
  "reasoning": "explanation of matches"
}`;
    }

    parseCategorizationResponse(response) {
        try {
            const parsed = JSON.parse(response);
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
            const parsed = JSON.parse(response);
            return {
                tags: Array.isArray(parsed.tags) ? parsed.tags : [],
                mood: parsed.mood || 'neutral',
                energy: parsed.energy || 'medium',
                style: parsed.style || 'unknown',
                characteristics: Array.isArray(parsed.characteristics) ? parsed.characteristics : []
            };
        } catch (error) {
            console.error('Failed to parse tagging response:', error);
            return {
                tags: [],
                mood: 'neutral',
                energy: 'medium',
                style: 'unknown',
                characteristics: []
            };
        }
    }

    parseSearchResponse(response, samples) {
        try {
            const parsed = JSON.parse(response);
            const matches = parsed.matches || [];
            return matches
                .filter(index => index >= 0 && index < samples.length)
                .map(index => samples[index]);
        } catch (error) {
            console.error('Failed to parse search response:', error);
            return [];
        }
    }
}

module.exports = new OpenAIService();