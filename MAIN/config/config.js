// Application configuration
const path = require('path');
const { app } = require('electron');

const config = {
    // Database settings
    database: {
        path: path.join(app ? app.getPath('userData') : '.', 'samples.db'),
        backup: true,
        backupInterval: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
    },

    // AI Service settings
    ai: {
        maxRetries: 3,
        timeout: 30000, // 30 seconds
        batchSize: 10, // Process 10 samples at a time
        categories: [
            'kick', 'snare', 'hihat', 'cymbal', 'percussion',
            'bass', 'lead', 'pad', 'chord', 'arp',
            'vocal', 'fx', 'loop', 'one-shot', 'melody'
        ],
        moods: [
            'aggressive', 'calm', 'dark', 'bright', 'energetic',
            'melancholic', 'uplifting', 'mysterious', 'playful', 'serious'
        ],
        styles: [
            'trap', 'house', 'techno', 'ambient', 'jazz',
            'rock', 'pop', 'classical', 'experimental', 'minimal'
        ]
    },

    // Audio analysis settings
    audio: {
        supportedFormats: ['mp3', 'wav', 'flac', 'aac', 'm4a', 'ogg'],
        maxFileSize: 100 * 1024 * 1024, // 100MB
        bpmRange: { min: 60, max: 200 },
        analysisTimeout: 60000 // 60 seconds
    },

    // UI settings
    ui: {
        theme: {
            primary: '#8B5CF6', // Purple
            secondary: '#A78BFA', // Light purple
            background: '#0F0F0F', // Off-black
            surface: '#1A1A1A', // Dark surface
            text: '#FFFFFF',
            textSecondary: '#A1A1AA',
            accent: '#C084FC',
            success: '#22C55E',
            warning: '#F59E0B',
            error: '#EF4444'
        },
        animations: {
            duration: 300, // Default animation duration in ms
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        },
        grid: {
            itemsPerPage: 50,
            minItemWidth: 250,
            gap: 16
        }
    },

    // Application settings
    app: {
        name: 'AI Sample Organizer',
        version: '1.0.0',
        autoSave: true,
        autoSaveInterval: 5 * 60 * 1000, // 5 minutes
        maxRecentSamples: 20
    }
};

module.exports = config;