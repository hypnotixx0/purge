// credits.js - Fixed Credits Page Functionality

// Global function to create avatar placeholder
function createAvatarPlaceholder(letter) {
    const placeholder = document.createElement('div');
    placeholder.className = 'avatar-placeholder';
    placeholder.textContent = letter;
    return placeholder;
}

// Global function to go home
function goHome() {
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎉 Credits page initializing...');
    
    // Remove loading screen immediately with guaranteed removal
    const removeLoadingScreen = () => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            console.log('Removing loading screen');
            // Force hide immediately
            loadingScreen.style.opacity = '0';
            loadingScreen.style.visibility = 'hidden';
            loadingScreen.style.transition = 'opacity 0.3s ease, visibility 0.3s ease';
            
            // Remove from DOM after transition
            setTimeout(() => {
                if (loadingScreen.parentNode) {
                    loadingScreen.remove();
                    console.log('Loading screen removed from DOM');
                }
            }, 350);
        }
    };

    // Safe theme application
    const safeThemeApply = () => {
        if (window.themeManager && typeof themeManager.applyCurrentTheme === 'function') {
            try {
                setTimeout(() => {
                    themeManager.applyCurrentTheme();
                    console.log('Theme applied');
                }, 100);
            } catch (e) {
                console.warn('Theme application skipped:', e);
            }
        }
    };

    // Setup avatar images with error handling
    const setupAvatars = () => {
        const avatars = document.querySelectorAll('.avatar-image');
        avatars.forEach(img => {
            // Check if image loads successfully
            img.onload = function() {
                console.log('Image loaded:', this.src);
            };
            
            img.onerror = function() {
                console.log('Image failed to load:', this.src);
                // The onerror attribute in HTML will handle replacement
            };
        });
    };

    // Initialize everything with error protection
    try {
        // Remove loading screen first
        setTimeout(removeLoadingScreen, 800);
        
        // Apply theme with delay
        setTimeout(safeThemeApply, 200);
        
        // Setup avatars
        setupAvatars();
        
        console.log('✅ Credits page loaded successfully');
        
    } catch (error) {
        console.error('❌ Credits page error:', error);
        // Emergency cleanup - force remove loading screen
        setTimeout(removeLoadingScreen, 100);
    }
});