// Apps functionality
class AppsManager {
    constructor() {
        this.currentApp = null;
        this.isFullscreen = false;
        this.init();
    }

    init() {
        console.log('📱 Apps manager initialized');
        this.setupEventListeners();
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
    }

    openApp(appId) {
        console.log(`🚀 Opening app: ${appId}`);
        
        let appUrl = '';
        let appTitle = '';
        
        switch(appId) {
            case 'terbium-os':
                appUrl = 'apps/terbium-os.html';
                appTitle = 'Terbium OS';
                break;
            case 'anura-os':
                appUrl = 'apps/anura-os.html';
                appTitle = 'Anura OS';
                break;
            default:
                console.error('Unknown app:', appId);
                return;
        }
        
        this.currentApp = appId;
        
        // Update viewer
        document.getElementById('app-viewer-title').textContent = appTitle;
        document.getElementById('app-viewer-url').textContent = appUrl;
        
        // Load app in embed
        const appFrame = document.getElementById('app-frame');
        appFrame.src = appUrl;
        
        // Show viewer
        document.getElementById('app-viewer').classList.add('active');
        
        // Track app launch
        this.trackAppLaunch(appId);
    }

    closeApp() {
        console.log('🔒 Closing app');
        
        // Hide viewer
        document.getElementById('app-viewer').classList.remove('active');
        document.getElementById('app-viewer').classList.remove('fullscreen');
        
        // Clear embed
        const appFrame = document.getElementById('app-frame');
        appFrame.src = '';
        
        this.currentApp = null;
        this.isFullscreen = false;
        
        // Exit fullscreen if active
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
    }

    refreshApp() {
        if (this.currentApp) {
            console.log('🔄 Refreshing app:', this.currentApp);
            const appFrame = document.getElementById('app-frame');
            appFrame.src = appFrame.src;
        }
    }

    toggleFullscreen() {
        const appViewer = document.getElementById('app-viewer');
        
        if (!this.isFullscreen) {
            // Enter fullscreen
            if (appViewer.requestFullscreen) {
                appViewer.requestFullscreen();
            } else if (appViewer.webkitRequestFullscreen) {
                appViewer.webkitRequestFullscreen();
            } else if (appViewer.msRequestFullscreen) {
                appViewer.msRequestFullscreen();
            }
            
            appViewer.classList.add('fullscreen');
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
            
            appViewer.classList.remove('fullscreen');
            this.isFullscreen = false;
        }
        
        this.updateFullscreenButton();
    }

    updateFullscreenButton() {
        const fullscreenBtn = document.querySelector('.app-control-btn:nth-child(2)');
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

    isAppOpen() {
        return this.currentApp !== null;
    }

    trackAppLaunch(appId) {
        // Track app usage for analytics
        console.log(`📊 App launched: ${appId}`);
        
        // You can integrate with your analytics service here
        if (typeof gtag !== 'undefined') {
            gtag('event', 'app_launch', {
                'app_id': appId,
                'app_name': appId === 'terbium-os' ? 'Terbium OS' : 'Anura OS'
            });
        }
    }
}

// Global functions for HTML onclick
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

// Initialize apps manager
let appsManager;

document.addEventListener('DOMContentLoaded', function() {
    appsManager = new AppsManager();
    console.log('📱 Apps page ready!');
});