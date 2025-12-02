// token-validator.js - WITH SOSAPARTY KEY
(function() {
    'use strict';
    
    console.log('🔐 Token validator checking...');
    
    // Configuration
    const AUTH_KEY = "purge_auth";
    const AUTH_LEVEL = "purge_auth_level";
    const AUTH_TIMESTAMP = "purge_auth_timestamp";
    const AUTH_KEY_USED = "purge_auth_key";
    const AUTH_HASH = "purge_auth_hash";
    const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes
    
    // Valid keys - NOW INCLUDES SOSAPARTY
    const VALID_KEYS = {
        free: ['IMPOOR'],
        premium: ['CHARLESISPOOR', 'UNHIIN', 'SOSAPARTY']
    };
    
    // Secret salt
    const SALT = 'p' + 'u' + 'r' + 'g' + 'e' + '_' + 's' + 'e' + 'c' + 'r' + 'e' + 't' + '_' + '2' + '0' + '2' + '5';
    
    // Pages that don't require auth
    const ALLOWED_WITHOUT_AUTH = [
        'index.html', 
        'blocked.html', 
        '',  // root
        'loading.js',
        'sw.js',
        'favicon.ico'
    ];
    
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    console.log('📄 Current page:', currentPage);
    
    // If we're on a page that doesn't need auth, exit early
    if (ALLOWED_WITHOUT_AUTH.includes(currentPage)) {
        console.log('✅ Page allowed without auth:', currentPage);
        return;
    }
    
    // Generate hash for integrity check
    function generateHash(key, level, timestamp) {
        const data = `${key}_${level}_${timestamp}_${SALT}`;
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    }
    
    // Redirect to blocked page
    function redirectToBlocked() {
        console.log('🚫 Not authenticated, redirecting to blocked.html');
        try {
            // Clear any invalid auth data first
            sessionStorage.removeItem(AUTH_KEY);
            sessionStorage.removeItem(AUTH_LEVEL);
            sessionStorage.removeItem(AUTH_TIMESTAMP);
            sessionStorage.removeItem(AUTH_KEY_USED);
            sessionStorage.removeItem(AUTH_HASH);
            
            window.location.replace('blocked.html');
        } catch (e) {
            window.location.href = 'blocked.html';
        }
    }
    
    // Validate key is in our valid list
    function validateKeyIntegrity(storedKey, authLevel) {
        if (!storedKey || !authLevel) {
            return false;
        }
        
        const keyUpper = storedKey.toUpperCase();
        
        if (authLevel === 'free' && VALID_KEYS.free.includes(keyUpper)) {
            return true;
        }
        
        if (authLevel === 'premium' && VALID_KEYS.premium.includes(keyUpper)) {
            return true;
        }
        
        console.log('❌ Key not in valid list:', storedKey, 'Level:', authLevel);
        return false;
    }
    
    // Main authentication check
    function checkAuthentication() {
        try {
            const authData = sessionStorage.getItem(AUTH_KEY);
            const authLevel = sessionStorage.getItem(AUTH_LEVEL);
            const timestamp = sessionStorage.getItem(AUTH_TIMESTAMP);
            const keyUsed = sessionStorage.getItem(AUTH_KEY_USED);
            const hash = sessionStorage.getItem(AUTH_HASH);
            
            // Check 1: All required data exists
            if (!authData || authData !== "authenticated" || !authLevel || !timestamp || !keyUsed || !hash) {
                console.log('❌ Missing auth data');
                return false;
            }
            
            // Check 2: Hash integrity
            const expectedHash = generateHash(keyUsed, authLevel, timestamp);
            if (hash !== expectedHash) {
                console.log('❌ Hash integrity check failed');
                return false;
            }
            
            // Check 3: Session not expired
            const elapsed = Date.now() - parseInt(timestamp);
            if (elapsed > SESSION_DURATION || elapsed < 0 || isNaN(elapsed)) {
                console.log('❌ Session expired');
                return false;
            }
            
            // Check 4: Key is actually valid
            if (!validateKeyIntegrity(keyUsed, authLevel)) {
                console.log('❌ Key integrity check failed');
                return false;
            }
            
            // Check 5: Access level matches page requirements
            const premiumPages = [
                'games.html', 'apps.html', 'tools.html', 'roadmap.html', 
                'themes.html', 'chat.html', 'credits.html', 'settings.html'
            ];
            
            const freePages = ['games.html'];
            
            if (authLevel === 'free' && !freePages.includes(currentPage)) {
                console.log('❌ Free user trying to access:', currentPage);
                return false;
            }
            
            if (authLevel === 'premium' && !premiumPages.includes(currentPage)) {
                console.log('❌ Premium user trying to access unauthorized page:', currentPage);
                return false;
            }
            
            // All checks passed!
            console.log('✅ User authenticated! Level:', authLevel, 'Page:', currentPage);
            return true;
            
        } catch (e) {
            console.error('Auth check error:', e);
            return false;
        }
    }
    
    // Run the check
    if (!checkAuthentication()) {
        redirectToBlocked();
    } else {
        // Update timestamp to keep session alive
        const newTimestamp = Date.now().toString();
        const keyUsed = sessionStorage.getItem(AUTH_KEY_USED);
        const authLevel = sessionStorage.getItem(AUTH_LEVEL);
        const newHash = generateHash(keyUsed, authLevel, newTimestamp);
        
        sessionStorage.setItem(AUTH_TIMESTAMP, newTimestamp);
        sessionStorage.setItem(AUTH_HASH, newHash);
        
        console.log('🔄 Session timestamp updated');
    }
})();
