// token-validator.js - UPDATED FOR NEW AUTH SYSTEM
(function() {
    'use strict';
    
    console.log('🔐 Token validator loading...');
    
    // Configuration - MUST MATCH auth-overlay.js
    const AUTH_KEY = "purge_auth";
    const AUTH_LEVEL = "purge_auth_level";
    const AUTH_TIMESTAMP = "purge_auth_timestamp";
    const AUTH_KEY_USED = "purge_auth_key";
    const AUTH_HASH = "purge_auth_hash";
    const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes
    
    // Valid keys - INCLUDES SOSAPARTY
    const VALID_KEYS = {
        free: ['IMPOOR'],
        premium: ['CHARLESISPOOR', 'UNHIIN', 'SOSAPARTY']
    };
    
    const SALT = 'p' + 'u' + 'r' + 'g' + 'e' + '_' + 's' + 'e' + 'c' + 'r' + 'e' + 't' + '_' + '2' + '0' + '2' + '5';
    
    // Pages that don't require authentication
    const PUBLIC_PAGES = [
        'index.html',
        'blocked.html',
        '',
        'favicon.ico',
        'sw.js',
        'loading.js'
    ];
    
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    console.log('📄 Current page:', currentPage);
    
    // If it's a public page, don't check authentication
    if (PUBLIC_PAGES.includes(currentPage)) {
        console.log('✅ Public page, no auth required');
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
    
    // Validate the key is in our valid list
    function isValidKey(key, level) {
        if (!key || !level) return false;
        
        const keyUpper = key.toUpperCase();
        
        if (level === 'free' && VALID_KEYS.free.includes(keyUpper)) {
            return true;
        }
        
        if (level === 'premium' && VALID_KEYS.premium.includes(keyUpper)) {
            return true;
        }
        
        console.log('❌ Invalid key combination:', key, 'Level:', level);
        return false;
    }
    
    // Check if user has permission to access this page
    function hasPagePermission(level, page) {
        const premiumPages = [
            'games.html', 'apps.html', 'tools.html', 'roadmap.html',
            'themes.html', 'chat.html', 'credits.html', 'settings.html'
        ];
        
        const freePages = ['games.html'];
        
        if (level === 'free' && freePages.includes(page)) {
            return true;
        }
        
        if (level === 'premium' && premiumPages.includes(page)) {
            return true;
        }
        
        console.log(`❌ ${level} user cannot access: ${page}`);
        return false;
    }
    
    // Main authentication check function
    function checkAuthentication() {
        try {
            console.log('🔍 Checking authentication...');
            
            // Get all session data
            const auth = sessionStorage.getItem(AUTH_KEY);
            const level = sessionStorage.getItem(AUTH_LEVEL);
            const timestamp = sessionStorage.getItem(AUTH_TIMESTAMP);
            const key = sessionStorage.getItem(AUTH_KEY_USED);
            const hash = sessionStorage.getItem(AUTH_HASH);
            
            console.log('Session data:', { 
                auth: auth ? 'YES' : 'NO',
                level: level || 'NONE',
                timestamp: timestamp || 'NONE',
                key: key ? '***' + key.slice(-3) : 'NONE',
                hash: hash ? 'YES' : 'NO'
            });
            
            // Check 1: All required data exists
            if (!auth || auth !== "authenticated" || !level || !timestamp || !key || !hash) {
                console.log('❌ Missing or invalid authentication data');
                return false;
            }
            
            // Check 2: Hash integrity
            const expectedHash = generateHash(key, level, timestamp);
            if (hash !== expectedHash) {
                console.log('❌ Hash mismatch - possible tampering');
                console.log('Expected:', expectedHash);
                console.log('Got:', hash);
                return false;
            }
            
            // Check 3: Session not expired
            const elapsed = Date.now() - parseInt(timestamp);
            if (elapsed > SESSION_DURATION || elapsed < 0 || isNaN(elapsed)) {
                console.log('❌ Session expired or invalid timestamp');
                return false;
            }
            
            // Check 4: Key is valid
            if (!isValidKey(key, level)) {
                console.log('❌ Invalid key');
                return false;
            }
            
            // Check 5: User has permission for this page
            if (!hasPagePermission(level, currentPage)) {
                console.log('❌ Page permission denied');
                return false;
            }
            
            // All checks passed!
            console.log('✅ Authentication successful!');
            console.log('👤 Level:', level);
            console.log('📄 Page:', currentPage);
            console.log('⏰ Session age:', Math.round(elapsed / 1000), 'seconds');
            
            return true;
            
        } catch (error) {
            console.error('❌ Authentication check error:', error);
            return false;
        }
    }
    
    // Redirect to blocked page
    function redirectToBlocked() {
        console.log('🚫 Redirecting to blocked.html');
        
        // Clear any invalid session data
        sessionStorage.removeItem(AUTH_KEY);
        sessionStorage.removeItem(AUTH_LEVEL);
        sessionStorage.removeItem(AUTH_TIMESTAMP);
        sessionStorage.removeItem(AUTH_KEY_USED);
        sessionStorage.removeItem(AUTH_HASH);
        
        // Use replace to prevent back button issues
        try {
            window.location.replace('blocked.html');
        } catch (e) {
            window.location.href = 'blocked.html';
        }
    }
    
    // Update session timestamp to keep it alive
    function refreshSession() {
        try {
            const key = sessionStorage.getItem(AUTH_KEY_USED);
            const level = sessionStorage.getItem(AUTH_LEVEL);
            
            if (key && level) {
                const newTimestamp = Date.now().toString();
                const newHash = generateHash(key, level, newTimestamp);
                
                sessionStorage.setItem(AUTH_TIMESTAMP, newTimestamp);
                sessionStorage.setItem(AUTH_HASH, newHash);
                
                console.log('🔄 Session refreshed');
            }
        } catch (e) {
            console.error('Error refreshing session:', e);
        }
    }
    
    // Wait a moment before checking to ensure sessionStorage is ready
    // This is CRITICAL for the auth overlay system
    setTimeout(() => {
        if (checkAuthentication()) {
            // Session is valid, refresh it
            refreshSession();
            
            // Start periodic validation (every 1 minute)
            setInterval(() => {
                if (!checkAuthentication()) {
                    console.log('🚫 Periodic check failed, redirecting');
                    redirectToBlocked();
                }
            }, 60000);
            
        } else {
            // Not authenticated, redirect to blocked
            redirectToBlocked();
        }
    }, 100); // Small delay to ensure sessionStorage is set by auth-overlay
    
})();
