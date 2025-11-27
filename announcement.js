// announcement.js - Session-based Announcement System
class AnnouncementManager {
    constructor() {
        this.SESSION_KEY = 'purge_announcement_shown';
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupAnnouncement());
        } else {
            this.setupAnnouncement();
        }
    }

    setupAnnouncement() {
        const modal = document.getElementById('announcement-modal');
        const okBtn = document.getElementById('announcement-ok-btn');

        if (!modal || !okBtn) {
            console.warn('Announcement elements not found');
            return;
        }

        // Only show on homepage and if not shown this session
        const isHomepage = this.isHomepage();
        const hasShownThisSession = sessionStorage.getItem(this.SESSION_KEY);

        if (isHomepage && !hasShownThisSession) {
            this.waitForLoadingComplete().then(() => {
                setTimeout(() => {
                    this.showAnnouncement();
                    sessionStorage.setItem(this.SESSION_KEY, 'true');
                }, 500);
            });
        }

        // Setup event listeners
        okBtn.addEventListener('click', () => this.hideAnnouncement());
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                this.hideAnnouncement();
            }
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.hideAnnouncement();
        });
    }

    isHomepage() {
        const path = window.location.pathname;
        return path.endsWith('index.html') || path.endsWith('/') || path === '';
    }

    waitForLoadingComplete() {
        return new Promise((resolve) => {
            const checkLoading = () => {
                const loadingScreen = document.getElementById('loading-screen');
                if (loadingScreen && !loadingScreen.classList.contains('fade-out')) {
                    setTimeout(checkLoading, 100);
                } else {
                    resolve();
                }
            };
            checkLoading();
        });
    }

    showAnnouncement() {
        const modal = document.getElementById('announcement-modal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            this.applyThemeToAnnouncement();
        }
    }

    hideAnnouncement() {
        const modal = document.getElementById('announcement-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    applyThemeToAnnouncement() {
        const currentTheme = themeManager?.getCurrentTheme();
        if (currentTheme === 'christmas') {
            const content = document.querySelector('.announcement-content');
            if (content) {
                content.style.borderColor = '#dc2626';
                content.style.boxShadow = '0 20px 60px rgba(220, 38, 38, 0.3)';
            }
        }
    }
}

// Initialize
let announcementManager;
document.addEventListener('DOMContentLoaded', function() {
    announcementManager = new AnnouncementManager();
});