# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Electron-based desktop application called "Sample Organizer" designed for managing and organizing audio samples. The app aims to help music producers browse, preview, and search through their sample libraries with plans for AI-powered search functionality.

## Development Commands

### Running the Application
```bash
# Start the application in production mode
npm start

# Start the application in development mode (with DevTools)
npm run dev
```

### Package Management
```bash
# Install dependencies
npm install
```

Note: This project currently has no testing framework, build process, or linting configured.

## Architecture

### Electron Process Structure
- **Main Process** (`src/main.js`): Controls application lifecycle, window management, and file system operations
- **Renderer Process** (`src/renderer.js`): Handles UI interactions and audio playback in the browser context
- **Preload Script** (`src/preload.js`): Provides secure IPC bridge between main and renderer processes

### Key Components

#### Audio File Handling
- Uses `music-metadata` library for extracting audio file metadata (duration, bitrate, sample rate, channels)
- Supports common audio formats: mp3, wav, flac, aac, m4a, ogg
- File selection handled through Electron's native dialog system

#### Data Flow
1. User imports audio files via `select-audio-files` IPC channel
2. Main process reads file metadata and returns structured data
3. Renderer process stores samples in memory and renders UI
4. Audio playback uses HTML5 Audio API with file:// protocol

#### UI Structure
- **Toolbar**: Import button and search interface (search not yet implemented)
- **Sidebar**: Sample count display and placeholder filters
- **Main Grid**: Sample list with metadata display
- **Player Bar**: Audio controls with progress bar (shows when sample selected)

### Security Configuration
- Context isolation enabled
- Node integration disabled in renderer
- Remote module disabled
- Secure IPC communication via contextBridge

## File Structure
```
MAIN/
├── src/
│   ├── main.js          # Electron main process
│   ├── renderer.js      # Frontend logic and UI interactions
│   ├── preload.js       # IPC bridge
│   ├── index.html       # Main UI structure
│   └── styles.css       # Application styling
├── package.json         # Dependencies and scripts
└── node_modules/        # Dependencies
```

## Current Limitations & Future Development Areas

1. **Search Functionality**: UI placeholder exists but no implementation
2. **Data Persistence**: Samples stored only in memory (lost on restart)
3. **AI Integration**: Mentioned in TO-DO.txt but not implemented
4. **Testing**: No test framework configured
5. **Build Process**: No production build or packaging setup
6. **Filters**: UI exists but not functional

## Development Notes

- The application uses a dark theme with CSS custom properties
- Audio files are loaded using the file:// protocol for local playback
- Sample selection updates the player bar and enables audio controls
- Error handling is basic - failed metadata reads still show files with error messages