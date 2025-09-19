// AI Sample Organizer - Enhanced Renderer with AI Integration
let samples = [];
let currentAudio = null;
let selectedSample = null;
let aiStatus = null;
let isProcessing = false;
let halftoneAnimationId = null;

const elements = {
    importBtn: document.getElementById('importBtn'),
    importLoading: document.getElementById('importLoading'),
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn'),
    searchLoading: document.getElementById('searchLoading'),
    sampleCount: document.getElementById('sampleCount'),
    sampleList: document.getElementById('sampleList'),
    playerBar: document.querySelector('.player-bar'),
    currentSample: document.getElementById('currentSample'),
    playBtn: document.getElementById('playBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    stopBtn: document.getElementById('stopBtn'),
    progressBar: document.getElementById('progressBar'),
    mainLoading: document.getElementById('mainLoading'),
    aiProcessingModal: document.getElementById('aiProcessingModal'),
    aiProcessingText: document.getElementById('aiProcessingText'),
    categoryFilters: document.getElementById('categoryFilters'),
    moodFilters: document.getElementById('moodFilters'),
    bpmFilter: document.getElementById('bpmFilter'),
    bpmValue: document.getElementById('bpmValue')
};

// Animation utility functions
function showElement(element, animationClass = 'fade-in') {
    element.style.display = '';
    element.classList.add(animationClass);
}

function hideElement(element) {
    element.style.display = 'none';
    element.classList.remove('fade-in', 'slide-in-left', 'slide-in-right');
}

function showLoading(loadingElement) {
    loadingElement.style.display = 'inline-block';
}

function hideLoading(loadingElement) {
    loadingElement.style.display = 'none';
}

function showAIProcessing(text = 'Processing with AI...') {
    elements.aiProcessingText.textContent = text;
    showElement(elements.aiProcessingModal);
}

function hideAIProcessing() {
    hideElement(elements.aiProcessingModal);
}

// Initialize the app
async function initializeApp() {
    try {
        // Check AI status
        aiStatus = await window.electronAPI.getAIStatus();
        console.log('AI Status:', aiStatus);
        
        // Load existing samples
        await loadExistingSamples();
        
        // Setup batch progress listener
        window.electronAPI.onBatchProgress((event, progress) => {
            showAIProcessing(`Processing ${progress.current}/${progress.total} (${progress.percentage}%)`);
        });
        
    } catch (error) {
        console.error('App initialization error:', error);
    }
}

async function loadExistingSamples() {
    try {
        showLoading(elements.mainLoading);
        samples = await window.electronAPI.getAllSamples().catch(error => {
            console.error('Error loading samples:', error);
            showNotification('Unable to load samples - window may be closing', 'error');
            return [];
        });
        updateSampleCount();
        renderSamples();
        enableSearch();
        buildFilterTags();
    } catch (error) {
        console.error('Error loading samples:', error);
    } finally {
        hideLoading(elements.mainLoading);
    }
}

elements.importBtn.addEventListener('click', async () => {
    if (isProcessing) return;
    
    try {
        isProcessing = true;
        showLoading(elements.importLoading);
        showAIProcessing('Analyzing samples with AI...');
        
        const newSamples = await window.electronAPI.selectAudioFiles().catch(error => {
            console.error('File selection error:', error);
            showNotification('Unable to select files - window may be closing', 'error');
            return [];
        });
        
        if (newSamples.length > 0) {
            samples = [...samples, ...newSamples];
            updateSampleCount();
            renderSamples();
            enableSearch();
            buildFilterTags();
            
            // Show success animation
            elements.importBtn.classList.add('success');
            setTimeout(() => elements.importBtn.classList.remove('success'), 2000);
        }
    } catch (error) {
        console.error('Error importing files:', error);
        showNotification('Error importing files', 'error');
    } finally {
        isProcessing = false;
        hideLoading(elements.importLoading);
        hideAIProcessing();
    }
});

// AI-powered search
elements.searchBtn.addEventListener('click', async () => {
    await performAISearch();
});

elements.searchInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        await performAISearch();
    }
});

async function performAISearch() {
    const query = elements.searchInput.value.trim();
    if (!query) {
        renderSamples(samples);
        return;
    }
    
    try {
        showLoading(elements.searchLoading);
        showAIProcessing('Searching with AI...');
        
        const results = await window.electronAPI.aiSearchSamples(query).catch(error => {
            console.error('Search error:', error);
            showNotification('Search failed - window may be closing', 'error');
            return [];
        });
        renderSamples(results);
        
        // Show search results count
        updateSampleCount(results.length, `Found ${results.length} matches for "${query}"`);
        
    } catch (error) {
        console.error('Search error:', error);
        showNotification('Search failed', 'error');
    } finally {
        hideLoading(elements.searchLoading);
        hideAIProcessing();
    }
}

// Player controls
elements.playBtn.addEventListener('click', () => {
    if (selectedSample && currentAudio) {
        currentAudio.play();
        elements.playBtn.style.transform = 'scale(0.95)';
        setTimeout(() => elements.playBtn.style.transform = '', 100);
    }
});

elements.pauseBtn.addEventListener('click', () => {
    if (currentAudio) {
        currentAudio.pause();
        elements.pauseBtn.style.transform = 'scale(0.95)';
        setTimeout(() => elements.pauseBtn.style.transform = '', 100);
    }
});

elements.stopBtn.addEventListener('click', () => {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        elements.progressBar.value = 0;
        elements.stopBtn.style.transform = 'scale(0.95)';
        setTimeout(() => elements.stopBtn.style.transform = '', 100);
    }
});

function updateSampleCount(count = null, customText = null) {
    const displayCount = count !== null ? count : samples.length;
    const text = customText || `${displayCount} sample${displayCount === 1 ? '' : 's'} loaded`;
    elements.sampleCount.textContent = text;
    
    // Add animation
    elements.sampleCount.style.transform = 'scale(1.1)';
    setTimeout(() => elements.sampleCount.style.transform = '', 200);
}

function enableSearch() {
    elements.searchInput.disabled = false;
    elements.searchBtn.disabled = false;
    elements.searchInput.placeholder = aiStatus?.initialized ? 
        "Describe what you're looking for with AI..." : 
        "Search samples...";
}

function buildFilterTags() {
    // Build category filter tags
    const categories = [...new Set(samples.map(s => s.category).filter(Boolean))];
    elements.categoryFilters.innerHTML = categories.map(category => 
        `<span class="tag category-${category}" draggable="true" data-tag="${category}" data-type="category">${category}</span>`
    ).join('');
    
    // Build mood filter tags
    const moods = [...new Set(samples.map(s => s.mood).filter(Boolean))];
    elements.moodFilters.innerHTML = moods.map(mood => 
        `<span class="tag mood-${mood}" draggable="true" data-tag="${mood}" data-type="mood">${mood}</span>`
    ).join('');
    
    // Add custom tags
    const customTags = getCustomTags();
    const customTagsContainer = document.getElementById('customTags');
    if (customTagsContainer) {
        customTagsContainer.innerHTML = customTags.map(tag => 
            `<span class="tag" draggable="true" data-tag="${tag.name}" data-type="custom" style="background: ${tag.color};">${tag.name}</span>`
        ).join('');
    }
    
    // Add drag event listeners to all tags
    setupTagDragListeners();
}

async function filterByCategory(category) {
    try {
        showLoading(elements.mainLoading);
        const results = await window.electronAPI.getSamplesByCategory(category);
        renderSamples(results);
        updateSampleCount(results.length, `${results.length} ${category} samples`);
    } catch (error) {
        console.error('Filter error:', error);
    } finally {
        hideLoading(elements.mainLoading);
    }
}

async function filterByMood(mood) {
    const results = samples.filter(s => s.mood === mood);
    renderSamples(results);
    updateSampleCount(results.length, `${results.length} ${mood} samples`);
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    
    // Add notification styles if not exist
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                background: var(--surface-dark);
                border: 1px solid var(--primary-purple);
                border-radius: 8px;
                color: var(--text-primary);
                z-index: 1001;
                animation: slideInNotification 0.3s ease-out;
                max-width: 300px;
            }
            .notification.error { border-color: var(--error); }
            .notification.success { border-color: var(--success); }
            .notification.warning { border-color: var(--warning); }
            @keyframes slideInNotification {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => notification.remove(), 5000);
}

function renderSamples(samplesToRender = samples) {
    if (samplesToRender.length === 0) {
        elements.sampleList.innerHTML = `
            <div class="empty-message fade-in">
                <h3>No samples found</h3>
                <p>Click "Import Samples" to get started with AI-powered organization</p>
            </div>
        `;
        return;
    }

    elements.sampleList.innerHTML = samplesToRender.map((sample, index) => `
        <div class="sample-item" data-index="${index}" data-id="${sample.id}">
            <div class="sample-name">${sample.name}</div>
            <div class="sample-info">
                ${sample.duration ? `<span>Duration: ${formatDuration(sample.duration)}</span>` : ''}
                ${sample.bpm ? `<span>BPM: ${sample.bpm}</span>` : ''}
                ${sample.category && sample.category !== 'unknown' ? `<span>Category: ${sample.category}</span>` : ''}
                ${sample.mood && sample.mood !== 'neutral' ? `<span>Mood: ${sample.mood}</span>` : ''}
                ${sample.energy && sample.energy !== 'medium' ? `<span>Energy: ${sample.energy}</span>` : ''}
                ${sample.bitrate ? `<span>Bitrate: ${sample.bitrate} kbps</span>` : ''}
                ${sample.error ? `<span style="color: var(--error);">${sample.error}</span>` : ''}
            </div>
            ${sample.tags && sample.tags.length > 0 ? `
                <div class="sample-tags">
                    ${sample.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            ` : ''}
            ${sample.description ? `
                <div class="sample-description">${sample.description}</div>
            ` : ''}
        </div>
    `).join('');

    // Add click listeners with smooth animations
    document.querySelectorAll('.sample-item').forEach((item, index) => {
        item.addEventListener('click', () => {
            selectSample(index, samplesToRender);
        });
        
        // Add hover sound preview (optional)
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateY(-2px) scale(1.01)';
        });
        
        item.addEventListener('mouseleave', () => {
            if (!item.classList.contains('selected')) {
                item.style.transform = '';
            }
        });
    });
    
    // Setup drag and drop listeners for sample items
    setupSampleDropListeners();
}

function selectSample(index, sampleArray = samples) {
    selectedSample = sampleArray[index];
    
    // Update UI with smooth animations
    document.querySelectorAll('.sample-item').forEach(item => {
        item.classList.remove('selected');
        item.style.transform = '';
    });
    
    const selectedElement = document.querySelector(`[data-index="${index}"]`);
    selectedElement.classList.add('selected');
    selectedElement.style.transform = 'scale(1.02)';
    
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    
    try {
        currentAudio = new Audio(`file://${selectedSample.path}`);
        
        currentAudio.addEventListener('loadedmetadata', () => {
            elements.progressBar.max = currentAudio.duration;
            elements.progressBar.disabled = false;
        });
        
        currentAudio.addEventListener('timeupdate', () => {
            elements.progressBar.value = currentAudio.currentTime;
        });
        
        currentAudio.addEventListener('ended', () => {
            elements.progressBar.value = 0;
        });
        
        // Enhanced player info
        const sampleInfo = `${selectedSample.name}${selectedSample.bpm ? ` • ${selectedSample.bpm} BPM` : ''}${selectedSample.category && selectedSample.category !== 'unknown' ? ` • ${selectedSample.category}` : ''}`;
        elements.currentSample.textContent = sampleInfo;
        
        // Show player bar with animation
        showElement(elements.playerBar, 'slide-up');
        
    } catch (error) {
        console.error('Error loading audio:', error);
        showNotification('Error loading audio file', 'error');
    }
}

// BPM filter functionality
if (elements.bpmFilter) {
    elements.bpmFilter.addEventListener('input', (e) => {
        const bpm = parseInt(e.target.value);
        elements.bpmValue.textContent = `${bpm}-200`;
        
        const filtered = samples.filter(sample => 
            !sample.bpm || sample.bpm >= bpm
        );
        renderSamples(filtered);
        updateSampleCount(filtered.length, `${filtered.length} samples (BPM >= ${bpm})`);
    });
}

function formatDuration(seconds) {
    if (!seconds) return 'Unknown';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

elements.progressBar.addEventListener('input', () => {
    if (currentAudio) {
        currentAudio.currentTime = elements.progressBar.value;
    }
});

// Add some global functions for filter tags
window.filterByCategory = filterByCategory;
window.filterByMood = filterByMood;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    
    // Add some extra polish
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 500);
});

// Add some smooth transitions between app states
function createTransition(fromElement, toElement, duration = 300) {
    return new Promise(resolve => {
        fromElement.style.transition = `opacity ${duration}ms ease-out`;
        fromElement.style.opacity = '0';
        
        setTimeout(() => {
            fromElement.style.display = 'none';
            toElement.style.display = '';
            toElement.style.opacity = '0';
            toElement.style.transition = `opacity ${duration}ms ease-in`;
            
            setTimeout(() => {
                toElement.style.opacity = '1';
                resolve();
            }, 50);
        }, duration);
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return; // Don't interfere with input fields
    
    switch(e.key) {
        case ' ': // Spacebar - play/pause
            e.preventDefault();
            if (currentAudio) {
                if (currentAudio.paused) {
                    elements.playBtn.click();
                } else {
                    elements.pauseBtn.click();
                }
            }
            break;
        case 'Escape': // Clear search
            elements.searchInput.value = '';
            renderSamples(samples);
            updateSampleCount();
            break;
        case '/': // Focus search
            e.preventDefault();
            elements.searchInput.focus();
            break;
    }
});

// Add some success styles
const successStyles = document.createElement('style');
successStyles.textContent = `
    .btn.success {
        background: var(--success) !important;
        box-shadow: 0 0 20px rgba(34, 197, 94, 0.5) !important;
        animation: successPulse 0.5s ease-out;
    }
    
    @keyframes successPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    .sample-tags {
        margin-top: 8px;
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
    }
    
    .sample-description {
        margin-top: 8px;
        font-size: 12px;
        color: var(--text-muted);
        font-style: italic;
        padding: 6px;
        background: var(--background-primary);
        border-radius: 4px;
        border-left: 2px solid var(--primary-purple);
    }
    
    .slide-up {
        animation: slideUp 0.5s ease-out;
    }
    
    .loaded .particle {
        animation-play-state: running;
    }
`;
document.head.appendChild(successStyles);

// Drag and Drop Tagging System
let draggedTag = null;

function setupTagDragListeners() {
    const tags = document.querySelectorAll('.tag[draggable="true"]');
    
    tags.forEach(tag => {
        // Remove old listeners to prevent duplicates
        tag.removeEventListener('dragstart', onTagDragStart);
        tag.removeEventListener('dragend', onTagDragEnd);
        tag.removeEventListener('click', onTagClick);
        
        // Add new listeners
        tag.addEventListener('dragstart', onTagDragStart);
        tag.addEventListener('dragend', onTagDragEnd);
        tag.addEventListener('click', onTagClick);
    });
}

function onTagDragStart(e) {
    draggedTag = {
        name: e.target.dataset.tag,
        type: e.target.dataset.type,
        color: e.target.style.background || ''
    };
    
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', draggedTag.name);
    
    // Add visual feedback to sample items
    document.querySelectorAll('.sample-item').forEach(item => {
        item.classList.add('drop-target-ready');
    });
}

function onTagDragEnd(e) {
    e.target.classList.remove('dragging');
    draggedTag = null;
    
    // Remove visual feedback
    document.querySelectorAll('.sample-item').forEach(item => {
        item.classList.remove('drop-target-ready', 'drop-target');
    });
}

function onTagClick(e) {
    const tag = e.target.dataset.tag;
    const type = e.target.dataset.type;
    
    // Filter by tag if not in drag mode
    if (!e.target.classList.contains('dragging')) {
        if (type === 'category') {
            filterByCategory(tag);
        } else if (type === 'mood') {
            filterByMood(tag);
        } else {
            filterByCustomTag(tag);
        }
    }
}

function setupSampleDropListeners() {
    const sampleItems = document.querySelectorAll('.sample-item');
    
    sampleItems.forEach(item => {
        item.addEventListener('dragover', onSampleDragOver);
        item.addEventListener('drop', onSampleDrop);
        item.addEventListener('dragenter', onSampleDragEnter);
        item.addEventListener('dragleave', onSampleDragLeave);
    });
}

function onSampleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
}

function onSampleDragEnter(e) {
    if (draggedTag) {
        e.target.closest('.sample-item').classList.add('drop-target');
    }
}

function onSampleDragLeave(e) {
    if (!e.target.closest('.sample-item').contains(e.relatedTarget)) {
        e.target.closest('.sample-item').classList.remove('drop-target');
    }
}

async function onSampleDrop(e) {
    e.preventDefault();
    const sampleElement = e.target.closest('.sample-item');
    sampleElement.classList.remove('drop-target');
    
    if (!draggedTag) return;
    
    const sampleId = sampleElement.dataset.id;
    const sample = samples.find(s => s.id == sampleId);
    
    if (!sample) return;
    
    try {
        // Add tag to sample
        let updatedTags = sample.tags || [];
        
        if (!updatedTags.includes(draggedTag.name)) {
            updatedTags.push(draggedTag.name);
            
            // Update sample in database
            await window.electronAPI.updateSample(sampleId, { tags: updatedTags });
            
            // Update local sample data
            sample.tags = updatedTags;
            
            // Re-render the specific sample item
            renderSampleItem(sampleElement, sample);
            
            // Show success feedback
            showTagAddedFeedback(sampleElement, draggedTag.name);
            
            showNotification(`Added "${draggedTag.name}" tag to "${sample.name}"`, 'success');
        } else {
            showNotification(`"${sample.name}" already has the "${draggedTag.name}" tag`, 'warning');
        }
    } catch (error) {
        console.error('Error adding tag to sample:', error);
        showNotification('Error adding tag to sample', 'error');
    }
}

function renderSampleItem(element, sample) {
    const tagsHtml = sample.tags && sample.tags.length > 0 ? `
        <div class="sample-tags">
            ${sample.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
    ` : '';
    
    element.innerHTML = `
        <div class="sample-name">${sample.name}</div>
        <div class="sample-info">
            ${sample.duration ? `<span>Duration: ${formatDuration(sample.duration)}</span>` : ''}
            ${sample.bpm ? `<span>BPM: ${sample.bpm}</span>` : ''}
            ${sample.category && sample.category !== 'unknown' ? `<span>Category: ${sample.category}</span>` : ''}
            ${sample.mood && sample.mood !== 'neutral' ? `<span>Mood: ${sample.mood}</span>` : ''}
            ${sample.energy && sample.energy !== 'medium' ? `<span>Energy: ${sample.energy}</span>` : ''}
            ${sample.bitrate ? `<span>Bitrate: ${sample.bitrate} kbps</span>` : ''}
            ${sample.error ? `<span style="color: var(--error);">${sample.error}</span>` : ''}
        </div>
        ${tagsHtml}
        ${sample.description ? `
            <div class="sample-description">${sample.description}</div>
        ` : ''}
    `;
}

function showTagAddedFeedback(element, tagName) {
    const feedback = document.createElement('div');
    feedback.className = 'tag-added-feedback';
    feedback.textContent = `+${tagName}`;
    feedback.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        background: var(--success);
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 10px;
        font-weight: bold;
        z-index: 10;
        animation: tagAddedPulse 1s ease-out forwards;
    `;
    
    element.style.position = 'relative';
    element.appendChild(feedback);
    
    setTimeout(() => feedback.remove(), 1000);
}

// Custom Tag Management
function getCustomTags() {
    const stored = localStorage.getItem('customTags');
    return stored ? JSON.parse(stored) : [];
}

function saveCustomTags(tags) {
    localStorage.setItem('customTags', JSON.stringify(tags));
}

function createCustomTag() {
    const tagName = document.getElementById('tagName').value.trim();
    const selectedColor = document.querySelector('.color-option.selected');
    
    if (!tagName) {
        showNotification('Please enter a tag name', 'warning');
        return;
    }
    
    if (!selectedColor) {
        showNotification('Please select a color', 'warning');
        return;
    }
    
    const customTags = getCustomTags();
    const color = selectedColor.dataset.color;
    
    // Check if tag already exists
    if (customTags.find(tag => tag.name.toLowerCase() === tagName.toLowerCase())) {
        showNotification('Tag already exists', 'warning');
        return;
    }
    
    // Add new tag
    customTags.push({ name: tagName, color: color });
    saveCustomTags(customTags);
    
    // Rebuild filter tags
    buildFilterTags();
    
    // Close modal
    closeTagModal();
    
    showNotification(`Created custom tag "${tagName}"`, 'success');
}

function closeTagModal() {
    document.getElementById('tagModal').style.display = 'none';
    document.getElementById('tagName').value = '';
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('selected');
    });
}

function filterByCustomTag(tagName) {
    const results = samples.filter(sample => 
        sample.tags && sample.tags.includes(tagName)
    );
    renderSamples(results);
    updateSampleCount(results.length, `${results.length} samples with "${tagName}" tag`);
}

// Set up color picker
document.addEventListener('DOMContentLoaded', () => {
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            colorOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
        });
    });
    
    // Create Tag button event listener
    const createTagBtn = document.getElementById('createTagBtn');
    if (createTagBtn) {
        createTagBtn.addEventListener('click', () => {
            document.getElementById('tagModal').style.display = 'flex';
        });
    }
});

// Add CSS for tag added animation
const tagFeedbackStyles = document.createElement('style');
tagFeedbackStyles.textContent = `
    @keyframes tagAddedPulse {
        0% { opacity: 0; transform: scale(0.5) translateY(10px); }
        30% { opacity: 1; transform: scale(1.2) translateY(0); }
        60% { transform: scale(1) translateY(0); }
        100% { opacity: 0; transform: scale(1) translateY(-10px); }
    }
    
    .drop-target-ready {
        border-color: var(--success) !important;
        box-shadow: 0 0 10px rgba(34, 197, 94, 0.3) !important;
    }
    
    .tag.dragging {
        opacity: 0.5;
        transform: rotate(5deg) scale(1.1);
    }
`;
document.head.appendChild(tagFeedbackStyles);

// Global functions for modal
window.createCustomTag = createCustomTag;
window.closeTagModal = closeTagModal;

// Window Control Functions
async function minimizeWindow() {
    console.log('Minimize button clicked!');
    try {
        if (window.electronAPI?.windowMinimize) {
            console.log('Calling windowMinimize...');
            await window.electronAPI.windowMinimize();
        } else {
            console.error('windowMinimize API not available');
        }
    } catch (error) {
        console.error('Error minimizing window:', error);
    }
}

async function maximizeWindow() {
    console.log('Maximize button clicked!');
    try {
        if (window.electronAPI?.windowMaximize) {
            console.log('Calling windowMaximize...');
            await window.electronAPI.windowMaximize();
        } else {
            console.error('windowMaximize API not available');
        }
    } catch (error) {
        console.error('Error maximizing window:', error);
    }
}

async function closeWindow() {
    console.log('Close button clicked!');
    try {
        if (window.electronAPI?.windowClose) {
            console.log('Calling windowClose...');
            await window.electronAPI.windowClose();
        } else {
            console.error('windowClose API not available');
        }
    } catch (error) {
        console.error('Error closing window:', error);
    }
}

// Make window control functions global
window.minimizeWindow = minimizeWindow;
window.maximizeWindow = maximizeWindow;
window.closeWindow = closeWindow;

// Halftone Waves Animation (converted from React)
function initializeHalftoneAnimation() {
    console.log('Initializing halftone animation...');
    const canvas = document.getElementById('halftoneCanvas');
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Canvas context not found!');
        return;
    }
    
    let time = 0;
    
    function resizeCanvas() {
        // Get the sample container size
        const container = document.querySelector('.sample-container');
        if (container) {
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
            console.log('Canvas resized to:', canvas.width, 'x', canvas.height);
        } else {
            // Fallback to window size
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    }
    
    function drawHalftoneWave() {
        const gridSize = 30;
        const rows = Math.ceil(canvas.height / gridSize);
        const cols = Math.ceil(canvas.width / gridSize);
        
        const circleRadius = Math.min(canvas.width, canvas.height) * 0.5;
        
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const centerX = x * gridSize;
                const centerY = y * gridSize;
                const distanceFromCenter = Math.sqrt(
                    Math.pow(centerX - canvas.width / 2, 2) + Math.pow(centerY - canvas.height / 2, 2)
                );
                
                if (distanceFromCenter > circleRadius) continue;
                
                const maxDistance = circleRadius;
                const normalizedDistance = distanceFromCenter / maxDistance;
                
                const waveOffset = Math.sin(normalizedDistance * 8 - time) * 0.3 + 0.5;
                const size = gridSize * waveOffset * 0.5;
                
                const purpleAmount = normalizedDistance * 1.0;
                const baseWhite = 250;
                const red = Math.floor(baseWhite * (1 - purpleAmount) + 160 * purpleAmount);
                const green = Math.floor(baseWhite * (1 - purpleAmount) + 40 * purpleAmount);
                const blue = Math.floor(baseWhite * (1 - purpleAmount) + 180 * purpleAmount);
                
                const edgeFade = 1 - (distanceFromCenter / circleRadius) * 0.3;
                const opacity = waveOffset * 0.06 * edgeFade;
                
                ctx.beginPath();
                ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${opacity})`;
                ctx.fill();
            }
        }
    }
    
    function animate() {
        ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        drawHalftoneWave();
        
        time += 0.03;
        halftoneAnimationId = requestAnimationFrame(animate);
    }
    
    function handleResize() {
        resizeCanvas();
    }
    
    // Initialize
    resizeCanvas();
    window.addEventListener('resize', handleResize);
    animate();
    
    // Clean up function
    return () => {
        if (halftoneAnimationId) {
            cancelAnimationFrame(halftoneAnimationId);
        }
        window.removeEventListener('resize', handleResize);
    };
}

// Initialize halftone animation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add a small delay to ensure all elements are rendered
    setTimeout(() => {
        console.log('DOM loaded, initializing halftone animation...');
        initializeHalftoneAnimation();
    }, 100);
});

// Clean up animation on page unload
window.addEventListener('beforeunload', () => {
    if (halftoneAnimationId) {
        cancelAnimationFrame(halftoneAnimationId);
    }
});