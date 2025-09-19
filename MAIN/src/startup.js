// Startup/Onboarding Script
let currentStep = 1;
let selectedFolder = null;
let selectedTheme = 'neon';

const elements = {
    progressFill: document.getElementById('progressFill'),
    stepContents: document.querySelectorAll('.step-content'),
    
    // Step 1 elements
    username: document.getElementById('username'),
    password: document.getElementById('password'),
    loginBtn: document.getElementById('loginBtn'),
    loginError: document.getElementById('loginError'),
    
    // Step 2 elements
    folderDisplay: document.getElementById('folderDisplay'),
    selectFolderBtn: document.getElementById('selectFolderBtn'),
    backToStep1: document.getElementById('backToStep1'),
    continueToStep3: document.getElementById('continueToStep3'),
    
    // Step 3 elements
    themeOptions: document.querySelectorAll('.theme-option'),
    backToStep2: document.getElementById('backToStep2'),
    finishSetup: document.getElementById('finishSetup'),
    
    // Loading overlay
    loadingOverlay: document.getElementById('loadingOverlay'),
    loadingText: document.getElementById('loadingText')
};

// Initialize the startup process
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    showStep(1);
    
    // Add some entrance animation
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});

function setupEventListeners() {
    // Window controls
    const minimizeBtn = document.getElementById('minimizeBtn');
    const closeBtn = document.getElementById('closeBtn');
    
    minimizeBtn.addEventListener('click', async () => {
        await window.electronAPI.windowMinimize();
    });
    
    closeBtn.addEventListener('click', async () => {
        await window.electronAPI.windowClose();
    });
    
    // Step 1: Login
    elements.loginBtn.addEventListener('click', handleLogin);
    elements.username.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
    elements.password.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
    
    // Step 2: Folder selection
    elements.selectFolderBtn.addEventListener('click', selectSampleFolder);
    elements.backToStep1.addEventListener('click', () => showStep(1, 'backward'));
    elements.continueToStep3.addEventListener('click', () => showStep(3, 'forward'));
    
    // Step 3: Theme selection
    elements.themeOptions.forEach(option => {
        option.addEventListener('click', () => selectTheme(option.dataset.theme));
    });
    elements.backToStep2.addEventListener('click', () => showStep(2, 'backward'));
    elements.finishSetup.addEventListener('click', finishSetup);
}

function showStep(step, direction = 'forward') {
    currentStep = step;
    
    // Update progress bar with animation
    const progress = (step / 3) * 100;
    elements.progressFill.style.width = `${progress}%`;
    
    // Animate step content transition
    const currentContent = document.querySelector('.step-content.active');
    const targetContent = document.getElementById(`step${step}`);
    
    if (currentContent && currentContent !== targetContent) {
        // Fade out current content
        currentContent.style.opacity = '0';
        currentContent.style.transform = direction === 'forward' ? 'translateX(-20px)' : 'translateX(20px)';
        
        setTimeout(() => {
            currentContent.classList.remove('active');
            targetContent.classList.add('active');
            
            // Animate in new content
            targetContent.style.opacity = '0';
            targetContent.style.transform = direction === 'forward' ? 'translateX(20px)' : 'translateX(-20px)';
            
            setTimeout(() => {
                targetContent.style.opacity = '1';
                targetContent.style.transform = 'translateX(0)';
            }, 50);
        }, 150);
    } else if (targetContent) {
        targetContent.classList.add('active');
        targetContent.style.opacity = '1';
        targetContent.style.transform = 'translateX(0)';
    }
    
    // Focus appropriate input with delay
    if (step === 1) {
        setTimeout(() => {
            if (elements.username) elements.username.focus();
        }, 300);
    }
}

async function handleLogin() {
    const username = elements.username.value.trim();
    const password = elements.password.value.trim();
    
    // Hide previous error
    elements.loginError.style.display = 'none';
    
    if (!username || !password) {
        showLoginError('Please enter both username and password');
        return;
    }
    
    // Check credentials (username: 1, password: 1 for testing)
    if (username === '1' && password === '1') {
        // Success - animate to next step
        elements.loginBtn.textContent = 'Success!';
        elements.loginBtn.style.background = 'var(--success)';
        
        setTimeout(() => {
            showStep(2);
            // Reset button
            elements.loginBtn.textContent = 'Continue';
            elements.loginBtn.style.background = '';
        }, 1000);
    } else {
        showLoginError('Invalid credentials. Please try again.');
        // Shake animation for inputs
        [elements.username, elements.password].forEach(input => {
            input.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => input.style.animation = '', 500);
        });
    }
}

function showLoginError(message) {
    elements.loginError.textContent = message;
    elements.loginError.style.display = 'block';
}

async function selectSampleFolder() {
    try {
        elements.selectFolderBtn.disabled = true;
        elements.selectFolderBtn.textContent = 'Opening...';
        
        const result = await window.electronAPI.selectSampleFolder();
        
        if (result && result.path) {
            selectedFolder = result.path;
            showSelectedFolder(result.path);
            elements.continueToStep3.disabled = false;
        }
    } catch (error) {
        console.error('Error selecting folder:', error);
        showNotification('Failed to select folder', 'error');
    } finally {
        elements.selectFolderBtn.disabled = false;
        elements.selectFolderBtn.textContent = 'Browse Folders';
    }
}

function showSelectedFolder(path) {
    elements.folderDisplay.innerHTML = `
        <div class="folder-path">
            <i class="folder-icon">✅</i>
            <div>
                <strong>Selected Folder:</strong><br>
                ${path}
            </div>
        </div>
    `;
    elements.folderDisplay.classList.add('has-folder');
    
    // Add success animation
    elements.folderDisplay.style.transform = 'scale(1.02)';
    setTimeout(() => {
        elements.folderDisplay.style.transform = '';
    }, 300);
}

function selectTheme(theme) {
    selectedTheme = theme;
    
    // Update UI
    elements.themeOptions.forEach(option => {
        option.classList.remove('active');
    });
    
    document.querySelector(`[data-theme="${theme}"]`).classList.add('active');
}

async function finishSetup() {
    elements.loadingOverlay.style.display = 'flex';
    elements.loadingText.textContent = 'Setting up your workspace...';
    
    try {
        // Save setup configuration
        const config = {
            samplesPath: selectedFolder,
            theme: selectedTheme,
            setupCompleted: true,
            setupDate: new Date().toISOString()
        };
        
        await window.electronAPI.saveSetupConfig(config);
        
        // Simulate setup time
        elements.loadingText.textContent = 'Scanning sample folders...';
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        elements.loadingText.textContent = 'Initializing AI services...';
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        elements.loadingText.textContent = 'Almost done...';
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Launch main app
        await window.electronAPI.launchMainApp();
        
    } catch (error) {
        console.error('Setup error:', error);
        elements.loadingOverlay.style.display = 'none';
        showNotification('Setup failed. Please try again.', 'error');
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" style="background:none;border:none;color:inherit;cursor:pointer;margin-left:10px;">×</button>
    `;
    
    // Add notification styles
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
                border: 1px solid var(--primary-color);
                border-radius: 8px;
                color: var(--text-primary);
                z-index: 1001;
                animation: slideInNotification 0.3s ease-out;
                max-width: 300px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            }
            .notification.error { border-color: var(--error); }
            .notification.success { border-color: var(--success); }
            .notification.warning { border-color: var(--warning); }
            @keyframes slideInNotification {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => notification.remove(), 5000);
}

// Add some keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && elements.loadingOverlay.style.display !== 'flex') {
        // Go back one step (if not on first step)
        if (currentStep > 1) {
            showStep(currentStep - 1);
        }
    }
});