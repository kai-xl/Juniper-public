// Sample Database Service using SQLite
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { app } = require('electron');
const fs = require('fs');

class SampleDatabase {
    constructor() {
        this.db = null;
        this.isInitialized = false;
        this.dbPath = null;
    }

    async initialize() {
        try {
            // Create database directory if it doesn't exist
            const userDataPath = app ? app.getPath('userData') : path.join(__dirname, '../../data');
            if (!fs.existsSync(userDataPath)) {
                fs.mkdirSync(userDataPath, { recursive: true });
            }

            this.dbPath = path.join(userDataPath, 'samples.db');
            
            // Initialize SQLite database
            this.db = new sqlite3.Database(this.dbPath);
            
            // Create tables
            await this.createTables();
            
            this.isInitialized = true;
            console.log('Database initialized at:', this.dbPath);
        } catch (error) {
            console.error('Failed to initialize database:', error);
            // Fallback to in-memory storage
            this.samples = new Map();
            this.categories = new Map();
            this.tags = new Map();
            this.isInitialized = true;
        }
    }

    async createTables() {
        return new Promise((resolve, reject) => {
            const createSamplesTable = `
                CREATE TABLE IF NOT EXISTS samples (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    path TEXT NOT NULL UNIQUE,
                    size INTEGER,
                    duration REAL,
                    bitrate INTEGER,
                    sampleRate INTEGER,
                    channels INTEGER,
                    category TEXT,
                    subcategory TEXT,
                    mood TEXT,
                    energy TEXT,
                    style TEXT,
                    bpm REAL,
                    key TEXT,
                    confidence REAL,
                    description TEXT,
                    tags TEXT, -- JSON array of tags
                    characteristics TEXT, -- JSON array of characteristics
                    analysis TEXT, -- JSON object of full analysis
                    createdAt TEXT,
                    updatedAt TEXT,
                    lastPlayed TEXT,
                    playCount INTEGER DEFAULT 0,
                    favorite BOOLEAN DEFAULT FALSE
                )
            `;

            const createTagsTable = `
                CREATE TABLE IF NOT EXISTS tags (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT UNIQUE NOT NULL,
                    color TEXT,
                    usageCount INTEGER DEFAULT 0,
                    createdAt TEXT
                )
            `;

            const createCategoriesTable = `
                CREATE TABLE IF NOT EXISTS categories (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT UNIQUE NOT NULL,
                    color TEXT,
                    sampleCount INTEGER DEFAULT 0,
                    createdAt TEXT
                )
            `;

            const createSearchIndexTable = `
                CREATE VIRTUAL TABLE IF NOT EXISTS samples_search USING fts5(
                    name, 
                    category, 
                    tags, 
                    mood, 
                    style, 
                    description,
                    content='samples',
                    content_rowid='rowid'
                )
            `;

            this.db.serialize(() => {
                this.db.run(createSamplesTable)
                    .run(createTagsTable)
                    .run(createCategoriesTable)
                    .run(createSearchIndexTable, (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
            });
        });
    }

    async saveSample(sample) {
        if (!this.isInitialized) {
            throw new Error('Database not initialized');
        }

        // If using SQLite
        if (this.db) {
            return new Promise((resolve, reject) => {
                const uuid = require('uuid').v4();
                const now = new Date().toISOString();
                
                const stmt = this.db.prepare(`
                    INSERT OR REPLACE INTO samples (
                        id, name, path, size, duration, bitrate, sampleRate, channels,
                        category, subcategory, mood, energy, style, bpm, key, confidence,
                        description, tags, characteristics, analysis, createdAt, updatedAt
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `);

                const sampleData = {
                    id: sample.id || uuid,
                    name: sample.name,
                    path: sample.path,
                    size: sample.size,
                    duration: sample.duration,
                    bitrate: sample.bitrate,
                    sampleRate: sample.sampleRate,
                    channels: sample.channels,
                    category: sample.category,
                    subcategory: sample.subcategory,
                    mood: sample.mood,
                    energy: sample.energy,
                    style: sample.style,
                    bpm: sample.bpm,
                    key: sample.key,
                    confidence: sample.confidence,
                    description: sample.description,
                    tags: JSON.stringify(sample.tags || []),
                    characteristics: JSON.stringify(sample.characteristics || []),
                    analysis: JSON.stringify(sample.analysis || {}),
                    createdAt: sample.createdAt || now,
                    updatedAt: now
                };

                stmt.run([
                    sampleData.id, sampleData.name, sampleData.path, sampleData.size,
                    sampleData.duration, sampleData.bitrate, sampleData.sampleRate, sampleData.channels,
                    sampleData.category, sampleData.subcategory, sampleData.mood, sampleData.energy,
                    sampleData.style, sampleData.bpm, sampleData.key, sampleData.confidence,
                    sampleData.description, sampleData.tags, sampleData.characteristics, sampleData.analysis,
                    sampleData.createdAt, sampleData.updatedAt
                ], function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({...sampleData, tags: sample.tags, characteristics: sample.characteristics, analysis: sample.analysis});
                    }
                });
            });
        } else {
            // Fallback to in-memory storage
            const sampleWithId = {
                id: sample.id || Date.now().toString(),
                ...sample,
                createdAt: sample.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            this.samples.set(sampleWithId.id, sampleWithId);
            return sampleWithId;
        }
    }

    async getSample(id) {
        if (!this.isInitialized) {
            throw new Error('Database not initialized');
        }

        if (this.db) {
            return new Promise((resolve, reject) => {
                this.db.get('SELECT * FROM samples WHERE id = ?', [id], (err, row) => {
                    if (err) {
                        reject(err);
                    } else if (row) {
                        resolve(this.parseDbRow(row));
                    } else {
                        resolve(null);
                    }
                });
            });
        } else {
            return this.samples.get(id) || null;
        }
    }

    async getAllSamples() {
        if (!this.isInitialized) {
            throw new Error('Database not initialized');
        }

        if (this.db) {
            return new Promise((resolve, reject) => {
                this.db.all('SELECT * FROM samples ORDER BY createdAt DESC', (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows.map(row => this.parseDbRow(row)));
                    }
                });
            });
        } else {
            return Array.from(this.samples.values());
        }
    }

    async updateSample(id, updates) {
        if (!this.isInitialized) {
            throw new Error('Database not initialized');
        }

        if (this.db) {
            return new Promise((resolve, reject) => {
                const fields = Object.keys(updates).filter(key => key !== 'id');
                const setClause = fields.map(field => `${field} = ?`).join(', ');
                const values = fields.map(field => {
                    if (typeof updates[field] === 'object') {
                        return JSON.stringify(updates[field]);
                    }
                    return updates[field];
                });
                values.push(new Date().toISOString()); // updatedAt
                values.push(id);

                const sql = `UPDATE samples SET ${setClause}, updatedAt = ? WHERE id = ?`;
                
                this.db.run(sql, values, function(err) {
                    if (err) {
                        reject(err);
                    } else if (this.changes === 0) {
                        reject(new Error('Sample not found'));
                    } else {
                        resolve({id, ...updates, updatedAt: new Date().toISOString()});
                    }
                });
            });
        } else {
            const existing = this.samples.get(id);
            if (!existing) {
                throw new Error('Sample not found');
            }

            const updated = {
                ...existing,
                ...updates,
                updatedAt: new Date().toISOString()
            };

            this.samples.set(id, updated);
            return updated;
        }
    }

    async deleteSample(id) {
        if (!this.isInitialized) {
            throw new Error('Database not initialized');
        }

        if (this.db) {
            return new Promise((resolve, reject) => {
                this.db.run('DELETE FROM samples WHERE id = ?', [id], function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.changes > 0);
                    }
                });
            });
        } else {
            return this.samples.delete(id);
        }
    }

    async searchSamples(query) {
        if (!this.isInitialized) {
            throw new Error('Database not initialized');
        }

        if (this.db) {
            return new Promise((resolve, reject) => {
                // Use FTS search if available, otherwise fallback to LIKE
                const sql = `
                    SELECT * FROM samples 
                    WHERE name LIKE ? OR category LIKE ? OR tags LIKE ? OR description LIKE ?
                    ORDER BY 
                        CASE 
                            WHEN name LIKE ? THEN 1
                            WHEN category LIKE ? THEN 2
                            WHEN tags LIKE ? THEN 3
                            ELSE 4
                        END
                `;
                const searchTerm = `%${query}%`;
                const params = [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm];

                this.db.all(sql, params, (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows.map(row => this.parseDbRow(row)));
                    }
                });
            });
        } else {
            const samples = Array.from(this.samples.values());
            return samples.filter(sample => {
                const searchText = `${sample.name} ${sample.category || ''} ${(sample.tags || []).join(' ')}`.toLowerCase();
                return searchText.includes(query.toLowerCase());
            });
        }
    }

    async getSamplesByCategory(category) {
        if (!this.isInitialized) {
            throw new Error('Database not initialized');
        }

        if (this.db) {
            return new Promise((resolve, reject) => {
                this.db.all('SELECT * FROM samples WHERE category = ?', [category], (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows.map(row => this.parseDbRow(row)));
                    }
                });
            });
        } else {
            const samples = Array.from(this.samples.values());
            return samples.filter(sample => sample.category === category);
        }
    }

    async getSamplesByTag(tag) {
        if (!this.isInitialized) {
            throw new Error('Database not initialized');
        }

        if (this.db) {
            return new Promise((resolve, reject) => {
                this.db.all('SELECT * FROM samples WHERE tags LIKE ?', [`%"${tag}"%`], (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows.map(row => this.parseDbRow(row)));
                    }
                });
            });
        } else {
            const samples = Array.from(this.samples.values());
            return samples.filter(sample => (sample.tags || []).includes(tag));
        }
    }

    parseDbRow(row) {
        return {
            ...row,
            tags: row.tags ? JSON.parse(row.tags) : [],
            characteristics: row.characteristics ? JSON.parse(row.characteristics) : [],
            analysis: row.analysis ? JSON.parse(row.analysis) : {}
        };
    }

    async close() {
        if (this.db) {
            return new Promise((resolve) => {
                this.db.close((err) => {
                    if (err) {
                        console.error('Error closing database:', err);
                    }
                    resolve();
                });
            });
        }
    }
}

module.exports = new SampleDatabase();