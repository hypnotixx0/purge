// token-validator.js - UPDATED FOR NEW SESSION-BASED AUTH SYSTEM
(function() {
    'use strict';
    
    // Prevent tampering by checking for common bypass methods
    const AUTH_KEY = "purge_auth";
    const AUTH_LEVEL = "purge_auth_level";
    const AUTH_TIMESTAMP = "purge_auth_timestamp";
    const AUTH_KEY_USED = "purge_auth_key";
    const AUTH_HASH = "purge_auth_hash"; // Hash for integrity check
    const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes
    
    // Valid keys (match auth-overlay.js)
    const VALID_KEYS = {
        free: ['IMPOOR'],
        premium: ['CHARLESISPOOR', 'UNHIIN']
    };
    
    // Secret salt for hash generation (obfuscated)
    const SALT = 'p' + 'u' + 'r' + 'g' + 'e' + '_' + 's' + 'e' + 'c' + 'r' + 'e' + 't' + '_' + '2' + '0' + '2' + '5';
    
    // IMPORTANT: Update allowedPages to include ALL your main pages
    const allowedPages = ['index.html', 'blocked.html', 'themes.html', '', 'loading.js'];
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Prevent bypass attempts
    let validationInProgress = false;
    let redirectInProgress = false;
    
    console.log('🔐 Token validator checking page:', currentPage);
    
    // If we're on index.html and not authenticated, auth-overlay will handle it
    if (currentPage === 'index.html') {
        console.log('✅ On index.html - auth overlay will handle authentication');
        return; // Don't redirect from index
    }
    
    // Check if page is allowed without auth
    if (allowedPages.includes(currentPage)) {
        console.log('✅ Page allowed without auth:', currentPage);
        return;
    }
    
    // Generate hash for integrity check (must match auth-overlay.js)
    function generateHash(key, level, timestamp) {
        const data = `${key}_${level}_${timestamp}_${SALT}`;
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(36);
    }
    
    // Multiple redirect methods to prevent bypass
    function forceRedirect(url) {
        if (redirectInProgress) return;
        redirectInProgress = true;
        
        console.log('🚫 Redirecting to:', url);
        
        // Clear all auth data first
        clearAuthentication();
        
        // Try multiple redirect methods
        try {
            window.location.replace(url);
        } catch (e) {
            try {
                window.location.href = url;
            } catch (e2) {
                try {
                    window.location.assign(url);
                } catch (e3) {
                    // Last resort - meta refresh
                    document.body.innerHTML = `<meta http-equiv="refresh" content="0;url=${url}">`;
                }
            }
        }
    }
    
    // Anti-tampering: Protect sessionStorage
    const originalSetItem = sessionStorage.setItem;
    const originalGetItem = sessionStorage.getItem;
    const originalRemoveItem = sessionStorage.removeItem;
    
    // Validate key is actually in our valid list
    function validateKeyIntegrity() {
        try {
            const storedKey = originalGetItem.call(sessionStorage, AUTH_KEY_USED);
            const authLevel = originalGetItem.call(sessionStorage, AUTH_LEVEL);
            
            if (!storedKey || !authLevel) {
                return false;
            }
            
            // Verify the key is actually valid
            const keyUpper = storedKey.toUpperCase();
            
            if (authLevel === 'free' && VALID_KEYS.free.includes(keyUpper)) {
                return true;
            }
            
            if (authLevel === 'premium' && VALID_KEYS.premium.includes(keyUpper)) {
                return true;
            }
            
            console.log('❌ Key not in valid list:', storedKey, 'Level:', authLevel);
            return false;
        } catch (e) {
            console.error('Key validation error:', e);
            return false;
        }
    }
    
    // MAIN AUTH CHECK FUNCTION
    function isAuthenticated() {
        if (validationInProgress) return false;
        validationInProgress = true;
        
        try {
            // Multiple validation checks
            const authData = originalGetItem.call(sessionStorage, AUTH_KEY);
            const authLevel = originalGetItem.call(sessionStorage, AUTH_LEVEL);
            const timestamp = originalGetItem.call(sessionStorage, AUTH_TIMESTAMP);
            const keyUsed = originalGetItem.call(sessionStorage, AUTH_KEY_USED);
            const hash = originalGetItem.call(sessionStorage, AUTH_HASH);
            
            // Check 1: All required data exists
            if (!authData || authData !== "authenticated" || !authLevel || !timestamp || !keyUsed || !hash) {
                console.log('❌ Missing auth data');
                validationInProgress = false;
                clearAuthentication();
                return false;
            }
            
            // Check 2: Hash integrity
            const expectedHash = generateHash(keyUsed, authLevel, timestamp);
            if (hash !== expectedHash) {
                console.log('❌ Hash integrity check failed');
                console.log('Stored hash:', hash);
                console.log('Expected hash:', expectedHash);
                validationInProgress = false;
                clearAuthentication();
                return false;
            }
            
            // Check 3: Session not expired
            const elapsed = Date.now() - parseInt(timestamp);
            if (elapsed > SESSION_DURATION || elapsed < 0 || isNaN(elapsed)) {
                console.log('❌ Session expired or invalid timestamp');
                validationInProgress = false;
                clearAuthentication();
                return false;
            }
            
            // Check 4: Key integrity validation
            if (!validateKeyIntegrity()) {
                console.log('❌ Key integrity check failed');
                validationInProgress = false;
                clearAuthentication();
                return false;
            }
            
            // Check 5: Access level matches page requirements
            // For our new system, we need to check what pages each level can access
            
            // Define accessible pages for each level
            const premiumPages = ['games.html', 'apps.html', 'tools.html', 'roadmap.html', 'themes.html', 'chat.html'];
            const freePages = ['games.html']; // Free users can only access games
            
            if (authLevel === 'free' && !freePages.includes(currentPage)) {
                console.log('❌ Free user trying to access:', currentPage);
                validationInProgress = false;
                clearAuthentication();
                return false;
            }
            
            if (authLevel === 'premium' && !premiumPages.includes(currentPage)) {
                console.log('❌ Premium user trying to access unauthorized page:', currentPage);
                validationInProgress = false;
                clearAuthentication();
                return false;
            }
            
            // Check 6: Prevent direct manipulation
            if (authLevel !== 'free' && authLevel !== 'premium') {
                console.log('❌ Invalid auth level:', authLevel);
                validationInProgress = false;
                clearAuthentication();
                return false;
            }
            
            // All checks passed - refresh timestamp and hash for active session
            const newTimestamp = Date.now().toString();
            const newHash = generateHash(keyUsed, authLevel, newTimestamp);
            originalSetItem.call(sessionStorage, AUTH_TIMESTAMP, newTimestamp);
            originalSetItem.call(sessionStorage, AUTH_HASH, newHash);
            
            validationInProgress = false;
            console.log('✅ User authenticated with level:', authLevel, 'Accessing:', currentPage);
            return true;
        } catch (e) {
            console.error('Auth check error:', e);
            validationInProgress = false;
            clearAuthentication();
            return false;
        }
    }
    
    function clearAuthentication() {
        try {
            originalRemoveItem.call(sessionStorage, AUTH_KEY);
            originalRemoveItem.call(sessionStorage, AUTH_LEVEL);
            originalRemoveItem.call(sessionStorage, AUTH_TIMESTAMP);
            originalRemoveItem.call(sessionStorage, AUTH_KEY_USED);
            originalRemoveItem.call(sessionStorage, AUTH_HASH);
        } catch (e) {
            console.error('Clear auth error:', e);
        }
    }
    
    // Continuous validation - check every 5 seconds
    function startContinuousValidation() {
        setInterval(() => {
            if (!isAuthenticated()) {
                forceRedirect('blocked.html');
            }
        }, 5000);
        
        // Also check on user activity
        document.addEventListener('mousemove', () => {
            if (!isAuthenticated()) {
                forceRedirect('blocked.html');
            }
        });
        
        // Check on visibility change
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && !isAuthenticated()) {
                forceRedirect('blocked.html');
            }
        });
    }
    
    // Initial check
    if (!isAuthenticated()) {
        console.log('🚫 Not authenticated, redirecting to blocked.html');
        forceRedirect('blocked.html');
    } else {
        // Start continuous validation
        startContinuousValidation();
        
        // Also validate on page unload (prevent back button bypass)
        window.addEventListener('beforeunload', () => {
            if (!isAuthenticated()) {
                clearAuthentication();
            }
        });
    }
    
    // Monitor sessionStorage for tampering
    let storageWatcher = null;
    try {
        storageWatcher = setInterval(() => {
            // Quick hash check every 10 seconds
            const authData = originalGetItem.call(sessionStorage, AUTH_KEY);
            if (authData && !isAuthenticated()) {
                console.log('🚫 Session tampering detected!');
                clearAuthentication();
                forceRedirect('blocked.html');
            }
        }, 10000);
    } catch (e) {
        console.error('Storage watcher error:', e);
    }
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (storageWatcher) {
            clearInterval(storageWatcher);
        }
    });
})();
