// Apps functionality with Games-style popups and tabs
class AppsManager {
    constructor() {
        this.currentApp = null;
        this.isFullscreen = false;
        this.tabs = [];
        this.activeTabId = null;
        
        // APP CONFIGURATION
        this.APP_URLS = {
            'rammerhead': {
                url: 'https://schooltechreadong.mywire.org/',
                name: 'Rammerhead',
                description: 'Great web proxy',
                category: 'browser',
                icon: 'fas fa-shield-alt',
                external: true
            },
        };
        
        this.init();
    }

    init() {
        console.log('📱 Apps manager initialized');
        this.setupEventListeners();
        this.setupSearch();
    }

    setupEventListeners() {
        // Close preview modal when clicking outside
        document.getElementById('app-preview-modal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('app-preview-modal')) {
                this.hidePreview();
            }
        });

        // Close preview modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (document.getElementById('app-preview-modal').classList.contains('active')) {
                    this.hidePreview();
                } else if (this.isAppOpen()) {
                    this.closeApp();
                }
            }
            
            if (e.key === 'F11' && this.isAppOpen()) {
                e.preventDefault();
                this.toggleFullscreen();
            }
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
    }

    setupSearch() {
        const searchInput = document.getElementById('app-search');
        const categoryFilter = document.getElementById('category-filter');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterApps(e.target.value, categoryFilter.value);
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
    }

    hidePreview() {
        document.getElementById('app-preview-modal').classList.remove('active');
    }

    openApp(appId) {
        console.log(`🚀 Opening app: ${appId}`);
        
        // Hide preview first
        this.hidePreview();
        
        if (!this.APP_URLS[appId]) {
            console.error('❌ Unknown app:', appId);
            this.showError(`App "${appId}" not found.`);
            return;
        }
        
        const appConfig = this.APP_URLS[appId];
        this.currentApp = appId;
        
        // Create or activate tab
        this.createTab(appId, appConfig);
        
        // Show browser (tabs appear here)
        document.getElementById('app-browser').classList.add('active');
    }

    createTab(appId, appConfig) {
        const tabId = `tab-${Date.now()}`;
        const tab = {
            id: tabId,
            appId: appId,
            title: appConfig.name,
            url: appConfig.url,
            icon: appConfig.icon
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
        
        // Hide browser (tabs disappear)
        document.getElementById('app-browser').classList.remove('active');
        document.getElementById('app-browser').classList.remove('fullscreen');
        
        // Clear state
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

    // Browser controls
    refreshApp() {
        const appFrame = document.getElementById('app-frame');
        this.showLoading();
        appFrame.src = appFrame.src;
    }

    toggleFullscreen() {
        const appBrowser = document.getElementById('app-browser');
        
        if (!this.isFullscreen) {
            if (appBrowser.requestFullscreen) {
                appBrowser.requestFullscreen();
            }
            appBrowser.classList.add('fullscreen');
            this.isFullscreen = true;
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
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

    openInNewTab() {
        const tab = this.getActiveTab();
        if (tab) {
            window.open(tab.url, '_blank');
        }
    }

    goHome() {
        // Close app and return to apps listing
        this.closeApp();
    }

    // Navigation methods (simplified for external apps)
    goBack() {
        // External apps handle their own navigation
        this.showNotification('Use the app\'s own navigation controls');
    }

    goForward() {
        // External apps handle their own navigation
        this.showNotification('Use the app\'s own navigation controls');
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
        `;
        errorEl.style.display = 'flex';
    }

    hideError() {
        const errorEl = document.getElementById('app-error');
        if (errorEl) {
            errorEl.style.display = 'none';
        }
    }

    showNotification(message) {
        // Simple notification for user feedback
        console.log('💡', message);
    }

    isAppOpen() {
        return this.currentApp !== null;
    }

    getCategoryName(category) {
        const categories = {
            'browser': 'Browser',
            'development': 'Development',
            'productivity': 'Productivity',
            'entertainment': 'Entertainment'
        };
        return categories[category] || 'Other';
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

// Initialize apps manager
let appsManager;

document.addEventListener('DOMContentLoaded', function() {
    appsManager = new AppsManager();
    console.log('📱 Apps page ready with Rammerhead and Scramjet!');
});