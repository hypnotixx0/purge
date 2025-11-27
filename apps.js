// Apps functionality with Games-style popups and tabs
class AppsManager {
    constructor() {
        this.currentApp = null;
        this.isFullscreen = false;
        this.history = [];
        this.currentHistoryIndex = -1;
        this.tabs = [];
        this.activeTabId = null;
        
        // APP CONFIGURATION - ADD NEW APPS HERE
        this.APP_URLS = {
            'terbium-os': {
                url: 'https://terbium.top/',
                name: 'Terbium OS',
                description: 'A lightweight operating system emulator',
                category: 'operating-system',
                icon: 'fas fa-desktop',
                external: true
            },
            'anura-os': {
                url: 'https://anura.pro/',
                name: 'Anura OS', 
                description: 'Web-based operating system environment',
                category: 'operating-system',
                icon: 'fas fa-laptop-code',
                external: true
            }
            // TO ADD MORE APPS:
            // 'app-id': {
            //     url: 'https://your-app-url.com/',
            //     name: 'App Name',
            //     description: 'App description',
            //     category: 'category',
            //     icon: 'fas fa-icon',
            //     external: true/false
            // }
        };
        
        this.init();
    }

    init() {
        console.log('📱 Apps manager initialized');
        console.log('📋 Available apps:', Object.keys(this.APP_URLS));
        this.setupEventListeners();
        this.setupSearch();
    }

    setupEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isAppOpen()) {
                this.closeApp();
            }
            
            if (e.key === 'F11' && this.isAppOpen()) {
                e.preventDefault();
                this.toggleFullscreen();
            }
        });

        // Fullscreen change event
        document.addEventListener('fullscreenchange', () => {
            this.isFullscreen = !this.isFullscreen;
            this.updateFullscreenButton();
        });

        // Handle embed load events
        const appFrame = document.getElementById('app-frame');
        if (appFrame) {
            appFrame.addEventListener('load', () => {
                console.log('✅ App loaded successfully');
                this.hideLoading();
            });

            appFrame.addEventListener('error', (e) => {
                console.error('❌ Failed to load app:', e);
                this.showError('Failed to load app. The external service might be unavailable.');
            });
        }

        // Close preview modal when clicking outside
        document.getElementById('app-preview-modal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('app-preview-modal')) {
                this.hidePreview();
            }
        });

        // Close preview modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('app-preview-modal').classList.contains('active')) {
                this.hidePreview();
            }
        });
    }

    setupSearch() {
        const searchInput = document.getElementById('app-search');
        const clearSearch = document.getElementById('clear-search');
        const categoryFilter = document.getElementById('category-filter');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterApps(e.target.value, categoryFilter.value);
                clearSearch.classList.toggle('show', e.target.value.length > 0);
            });

            clearSearch.addEventListener('click', () => {
                searchInput.value = '';
                this.filterApps('', categoryFilter.value);
                clearSearch.classList.remove('show');
                searchInput.focus();
            });
        }

        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.filterApps(searchInput.value, e.target.value);
            });
        }
    }

    filterApps(searchTerm, category) {
        const appsGrid = document.getElementById('apps-grid');
        const noResults = document.getElementById('no-results');
        const appCards = appsGrid.querySelectorAll('.app-card:not(.coming-soon)');
        
        let visibleCount = 0;
        const searchLower = searchTerm.toLowerCase();

        appCards.forEach(card => {
            const title = card.querySelector('.app-title').textContent.toLowerCase();
            const description = card.querySelector('.app-description').textContent.toLowerCase();
            const appCategory = card.dataset.category;
            
            const matchesSearch = !searchTerm || title.includes(searchLower) || description.includes(searchLower);
            const matchesCategory = category === 'all' || appCategory === category;
            
            if (matchesSearch && matchesCategory) {
                card.style.display = 'flex';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // Show/hide no results message
        if (visibleCount === 0 && (searchTerm || category !== 'all')) {
            noResults.style.display = 'block';
        } else {
            noResults.style.display = 'none';
        }
    }

    showAppPreview(appId) {
        console.log(`🔍 Showing preview for: ${appId}`);
        
        // Check if app exists
        if (!this.APP_URLS[appId]) {
            console.error('❌ Unknown app:', appId);
            return;
        }
        
        const appConfig = this.APP_URLS[appId];
        const previewModal = document.getElementById('app-preview-modal');
        const previewContent = document.getElementById('preview-content');
        
        // Create preview content
        previewContent.innerHTML = `
            <div class="preview-header">
                <div class="preview-icon">
                    <i class="${appConfig.icon}"></i>
                </div>
                <div class="preview-title">
                    <h3>${appConfig.name}</h3>
                    <p>${appConfig.description}</p>
                </div>
            </div>
            
            <div class="preview-details">
                <div class="preview-stat">
                    <i class="fas fa-globe"></i>
                    <span>External App</span>
                </div>
                <div class="preview-badge external">
                    <i class="fas fa-external-link-alt"></i>
                    <span>External</span>
                </div>
            </div>
            
            <div class="preview-tags">
                <div class="preview-tag">${this.getCategoryName(appConfig.category)}</div>
                <div class="preview-tag">Web App</div>
            </div>
            
            <div class="preview-actions">
                <button class="preview-btn secondary" onclick="appsManager.hidePreview()">
                    <i class="fas fa-times"></i>
                    Cancel
                </button>
                <button class="preview-btn primary" onclick="appsManager.openApp('${appId}')">
                    <i class="fas fa-play"></i>
                    Launch App
                </button>
            </div>
        `;
        
        // Show preview modal
        previewModal.classList.add('active');
        
        // Track preview view
        this.trackAppPreview(appId, appConfig);
    }

    hidePreview() {
        document.getElementById('app-preview-modal').classList.remove('active');
    }

    openApp(appId) {
        console.log(`🚀 Opening app: ${appId}`);
        
        // Hide preview first
        this.hidePreview();
        
        // Check if app exists
        if (!this.APP_URLS[appId]) {
            console.error('❌ Unknown app:', appId);
            this.showError(`App "${appId}" not found. Check the APP_URLS configuration.`);
            return;
        }
        
        const appConfig = this.APP_URLS[appId];
        this.currentApp = appId;
        
        // Create or activate tab
        this.createTab(appId, appConfig);
        
        // Show browser
        document.getElementById('app-browser').classList.add('active');
        
        // Track app launch
        this.trackAppLaunch(appId, appConfig);
    }

    createTab(appId, appConfig) {
        const tabId = `tab-${Date.now()}`;
        const tab = {
            id: tabId,
            appId: appId,
            title: appConfig.name,
            url: appConfig.url,
            icon: appConfig.icon,
            history: [appConfig.url],
            historyIndex: 0
        };
        
        this.tabs.push(tab);
        this.activeTabId = tabId;
        this.renderTabs();
        this.loadTabContent(tabId);
        
        return tabId;
    }

    renderTabs() {
        const tabsContainer = document.querySelector('.browser-tabs');
        tabsContainer.innerHTML = '';
        
        this.tabs.forEach(tab => {
            const isActive = tab.id === this.activeTabId;
            const tabElement = document.createElement('div');
            tabElement.className = `tab ${isActive ? 'active' : ''}`;
            tabElement.innerHTML = `
                <i class="tab-icon ${tab.icon}"></i>
                <span>${tab.title}</span>
                <button class="tab-close" onclick="appsManager.closeTab('${tab.id}')">
                    <i class="fas fa-times"></i>
                </button>
            `;
            tabElement.addEventListener('click', () => this.switchTab(tab.id));
            tabsContainer.appendChild(tabElement);
        });
    }

    loadTabContent(tabId) {
        const tab = this.tabs.find(t => t.id === tabId);
        if (!tab) return;
        
        const appFrame = document.getElementById('app-frame');
        const currentUrl = document.getElementById('current-url');
        
        // Show loading state
        this.showLoading();
        
        // Load app in embed
        appFrame.src = tab.url;
        currentUrl.textContent = tab.url;
        
        // Update navigation buttons
        this.updateNavigationButtons();
    }

    switchTab(tabId) {
        this.activeTabId = tabId;
        this.renderTabs();
        this.loadTabContent(tabId);
    }

    closeTab(tabId) {
        this.tabs = this.tabs.filter(tab => tab.id !== tabId);
        
        if (this.tabs.length === 0) {
            this.closeApp();
        } else {
            if (this.activeTabId === tabId) {
                this.activeTabId = this.tabs[this.tabs.length - 1].id;
            }
            this.renderTabs();
            this.loadTabContent(this.activeTabId);
        }
    }

    getActiveTab() {
        return this.tabs.find(tab => tab.id === this.activeTabId);
    }

    closeApp() {
        console.log('🔒 Closing app browser');
        
        // Hide browser
        document.getElementById('app-browser').classList.remove('active');
        document.getElementById('app-browser').classList.remove('fullscreen');
        
        // Clear tabs and state
        this.tabs = [];
        this.activeTabId = null;
        this.currentApp = null;
        this.isFullscreen = false;
        
        // Clear embed
        const appFrame = document.getElementById('app-frame');
        appFrame.src = '';
        
        // Exit fullscreen if active
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
        
        this.hideLoading();
        this.hideError();
    }

    // Browser navigation methods
    goBack() {
        const tab = this.getActiveTab();
        if (tab && tab.historyIndex > 0) {
            tab.historyIndex--;
            this.loadTabContent(tab.id);
        }
    }

    goForward() {
        const tab = this.getActiveTab();
        if (tab && tab.historyIndex < tab.history.length - 1) {
            tab.historyIndex++;
            this.loadTabContent(tab.id);
        }
    }

    refreshApp() {
        const appFrame = document.getElementById('app-frame');
        this.showLoading();
        appFrame.src = appFrame.src;
    }

    goHome() {
        const tab = this.getActiveTab();
        if (tab) {
            tab.historyIndex = 0;
            this.loadTabContent(tab.id);
        }
    }

    openInNewTab() {
        const tab = this.getActiveTab();
        if (tab) {
            window.open(tab.url, '_blank');
        }
    }

    toggleFullscreen() {
        const appBrowser = document.getElementById('app-browser');
        
        if (!this.isFullscreen) {
            // Enter fullscreen
            if (appBrowser.requestFullscreen) {
                appBrowser.requestFullscreen();
            } else if (appBrowser.webkitRequestFullscreen) {
                appBrowser.webkitRequestFullscreen();
            } else if (appBrowser.msRequestFullscreen) {
                appBrowser.msRequestFullscreen();
            }
            
            appBrowser.classList.add('fullscreen');
            this.isFullscreen = true;
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            
            appBrowser.classList.remove('fullscreen');
            this.isFullscreen = false;
        }
        
        this.updateFullscreenButton();
    }

    updateFullscreenButton() {
        const fullscreenBtn = document.querySelector('.toolbar-btn:nth-last-child(2)');
        if (fullscreenBtn) {
            if (this.isFullscreen) {
                fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
                fullscreenBtn.title = 'Exit Fullscreen';
            } else {
                fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
                fullscreenBtn.title = 'Fullscreen';
            }
        }
    }

    updateNavigationButtons() {
        const tab = this.getActiveTab();
        const backBtn = document.querySelector('.toolbar-btn:nth-child(1)');
        const forwardBtn = document.querySelector('.toolbar-btn:nth-child(2)');
        
        if (backBtn) {
            backBtn.disabled = !tab || tab.historyIndex <= 0;
        }
        if (forwardBtn) {
            forwardBtn.disabled = !tab || tab.historyIndex >= tab.history.length - 1;
        }
    }

    showLoading() {
        let loadingEl = document.getElementById('app-loading');
        if (!loadingEl) {
            loadingEl = document.createElement('div');
            loadingEl.id = 'app-loading';
            loadingEl.className = 'app-loading';
            loadingEl.innerHTML = `
                <div class="spinner"></div>
                Loading app...
            `;
            document.querySelector('.browser-content').appendChild(loadingEl);
        }
        loadingEl.style.display = 'flex';
    }

    hideLoading() {
        const loadingEl = document.getElementById('app-loading');
        if (loadingEl) {
            loadingEl.style.display = 'none';
        }
    }

    showError(message) {
        this.hideLoading();
        
        let errorEl = document.getElementById('app-error');
        if (!errorEl) {
            errorEl = document.createElement('div');
            errorEl.id = 'app-error';
            errorEl.className = 'app-loading';
            errorEl.style.color = '#ef4444';
            document.querySelector('.browser-content').appendChild(errorEl);
        }
        
        errorEl.innerHTML = `
            <i class="fas fa-exclamation-triangle" style="margin-right: 10px;"></i>
            ${message}
            <br><br>
            <button onclick="this.parentElement.style.display='none'" class="app-btn" style="padding: 0.5rem 1rem; font-size: 0.9rem;">
                Dismiss
            </button>
        `;
        errorEl.style.display = 'flex';
        errorEl.style.flexDirection = 'column';
    }

    hideError() {
        const errorEl = document.getElementById('app-error');
        if (errorEl) {
            errorEl.style.display = 'none';
        }
    }

    isAppOpen() {
        return this.currentApp !== null;
    }

    getCategoryName(category) {
        const categories = {
            'operating-system': 'Operating System',
            'productivity': 'Productivity',
            'development': 'Development',
            'entertainment': 'Entertainment'
        };
        return categories[category] || 'Other';
    }

    trackAppPreview(appId, appConfig) {
        console.log(`👀 App preview viewed: ${appId}`, appConfig);
    }

    trackAppLaunch(appId, appConfig) {
        console.log(`📊 App launched: ${appId}`, appConfig);
        
        // You can integrate with your analytics service here
        if (typeof gtag !== 'undefined') {
            gtag('event', 'app_launch', {
                'app_id': appId,
                'app_name': appConfig.name,
                'app_url': appConfig.url
            });
        }
    }

    // Method to add apps dynamically (for future use)
    addApp(appId, config) {
        if (this.APP_URLS[appId]) {
            console.warn(`⚠️ App "${appId}" already exists. Overwriting...`);
        }
        
        this.APP_URLS[appId] = config;
        console.log(`✅ Added app: ${appId}`, config);
        
        // Update the apps grid if we're on the apps page
        this.updateAppsGrid();
    }

    updateAppsGrid() {
        // This would dynamically update the apps grid when new apps are added
        console.log('🔄 Apps grid updated with new apps');
    }

    // Method to get all available apps
    getAvailableApps() {
        return Object.keys(this.APP_URLS);
    }
}

// Global functions for HTML onclick
function showAppPreview(appId) {
    if (appsManager) appsManager.showAppPreview(appId);
}

function openApp(appId) {
    if (appsManager) appsManager.openApp(appId);
}

function closeApp() {
    if (appsManager) appsManager.closeApp();
}

function refreshApp() {
    if (appsManager) appsManager.refreshApp();
}

function toggleFullscreen() {
    if (appsManager) appsManager.toggleFullscreen();
}

function goBack() {
    if (appsManager) appsManager.goBack();
}

function goForward() {
    if (appsManager) appsManager.goForward();
}

function goHome() {
    if (appsManager) appsManager.goHome();
}

function openInNewTab() {
    if (appsManager) appsManager.openInNewTab();
}

// DEVELOPMENT HELPER: Add this to console for easy app management
window.appsManagerHelper = {
    addApp: (id, url, name, description, category = 'other', icon = 'fas fa-cube') => {
        if (appsManager) {
            appsManager.addApp(id, { 
                url, 
                name, 
                description, 
                category,
                icon,
                external: true 
            });
        }
    },
    listApps: () => {
        if (appsManager) {
            return appsManager.getAvailableApps();
        }
    }
};

// Initialize apps manager
let appsManager;

document.addEventListener('DOMContentLoaded', function() {
    appsManager = new AppsManager();
    
    // Set data-category attributes for filtering
    document.querySelectorAll('.app-card').forEach(card => {
        const appId = card.onclick.toString().match(/'([^']+)'/)?.[1];
        if (appId && appsManager.APP_URLS[appId]) {
            card.dataset.category = appsManager.APP_URLS[appId].category;
        }
    });
    
    console.log('📱 Apps page ready!');
    console.log('💡 Development tip: Use appsManagerHelper in console to manage apps');
    console.log('   Example: appsManagerHelper.addApp("my-app", "https://example.com", "My App", "App description", "development", "fas fa-code")');
});