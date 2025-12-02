// token-validator.js - FINAL FIXED VERSION
(function() {
    'use strict';
    
    console.log('🔐 Token validator v3.0 - Session-based auth');
    
    // Configuration - MUST match auth-overlay.js
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
    
    // Salt for hash generation
    const SALT = 'p' + 'u' + 'r' + 'g' + 'e' + '_' + 's' + 'e' + 'c' + 'r' + 'e' + 't' + '_' + '2' + '0' + '2' + '5';
    
    // Get current page
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';
    const isIndexPage = currentPage === 'index.html' || currentPage === '';
    
    console.log('📄 Current page:', currentPage);
    
    // If we're on index.html, DO NOT CHECK AUTH - let auth-overlay handle it
    if (isIndexPage) {
        console.log('✅ On index page - auth overlay will handle authentication');
        return;
    }
    
    // Other pages that don't need auth
    const PUBLIC_PAGES = ['blocked.html', 'favicon.ico', 'sw.js', 'loading.js'];
    if (PUBLIC_PAGES.includes(currentPage)) {
        console.log('✅ Public page - no auth required');
        return;
    }
    
    console.log('🔒 Protected page - checking authentication...');
    
    // Wait for page to be fully ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAuth);
    } else {
        // Small delay to ensure sessionStorage is ready
        setTimeout(checkAuth, 100);
    }
    
    // Main authentication check
    function checkAuth() {
        try {
            console.log('🔍 Starting authentication check...');
            
            // Get all session data
            const auth = sessionStorage.getItem(AUTH_KEY);
            const level = sessionStorage.getItem(AUTH_LEVEL);
            const timestamp = sessionStorage.getItem(AUTH_TIMESTAMP);
            const key = sessionStorage.getItem(AUTH_KEY_USED);
            const hash = sessionStorage.getItem(AUTH_HASH);
            
            console.log('📊 Session data:', {
                auth: auth ? 'YES' : 'NO',
                level: level || 'NONE',
                hasTimestamp: !!timestamp,
                key: key ? '***' + key.slice(-3) : 'NONE',
                hash: hash ? 'YES' : 'NO'
            });
            
            // Check 1: Basic session data exists
            if (!auth || auth !== "authenticated") {
                console.log('❌ Not authenticated');
                redirectToBlocked();
                return;
            }
            
            // Check 2: All required data present
            if (!level || !timestamp || !key || !hash) {
                console.log('❌ Incomplete session data');
                redirectToBlocked();
                return;
            }
            
            // Check 3: Hash integrity
            const expectedHash = generateHash(key, level, timestamp);
            if (hash !== expectedHash) {
                console.log('❌ Hash mismatch - possible tampering');
                console.log('Expected:', expectedHash);
                console.log('Got:', hash);
                redirectToBlocked();
                return;
            }
            
            // Check 4: Session expiration
            const sessionTime = parseInt(timestamp);
            const now = Date.now();
            const elapsed = now - sessionTime;
            
            if (isNaN(sessionTime) || elapsed > SESSION_DURATION || elapsed < 0) {
                console.log('❌ Session expired');
                redirectToBlocked();
                return;
            }
            
            // Check 5: Valid key
            const keyUpper = key.toUpperCase();
            const isValidFree = VALID_KEYS.free.includes(keyUpper);
            const isValidPremium = VALID_KEYS.premium.includes(keyUpper);
            
            if (level === 'free' && !isValidFree) {
                console.log('❌ Invalid free key:', keyUpper);
                redirectToBlocked();
                return;
            }
            
            if (level === 'premium' && !isValidPremium) {
                console.log('❌ Invalid premium key:', keyUpper);
                redirectToBlocked();
                return;
            }
            
            // Check 6: Page permissions
            const premiumPages = [
                'games.html', 'apps.html', 'tools.html', 'roadmap.html',
                'themes.html', 'chat.html', 'credits.html', 'settings.html',
                'admin.html'
            ];
            
            const freePages = ['games.html'];
            
            if (level === 'free' && !freePages.includes(currentPage)) {
                console.log('❌ Free user cannot access:', currentPage);
                redirectToBlocked();
                return;
            }
            
            if (level === 'premium' && !premiumPages.includes(currentPage)) {
                console.log('❌ Premium user cannot access:', currentPage);
                redirectToBlocked();
                return;
            }
            
            // SUCCESS - User is authenticated!
            console.log('✅ Authentication SUCCESSFUL!');
            console.log('👤 Level:', level);
            console.log('🔑 Key:', keyUpper);
            console.log('⏰ Session age:', Math.round(elapsed / 1000), 'seconds');
            
            // Refresh session timestamp
            refreshSession(key, level);
            
        } catch (error) {
            console.error('❌ Authentication error:', error);
            redirectToBlocked();
        }
    }
    
    // Generate hash (must match auth-overlay.js)
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
    
    // Refresh session to keep it alive
    function refreshSession(key, level) {
        try {
            const newTimestamp = Date.now().toString();
            const newHash = generateHash(key, level, newTimestamp);
            
            sessionStorage.setItem(AUTH_TIMESTAMP, newTimestamp);
            sessionStorage.setItem(AUTH_HASH, newHash);
            
            console.log('🔄 Session refreshed');
        } catch (error) {
            console.error('Error refreshing session:', error);
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
        
        // Redirect
        setTimeout(() => {
            window.location.replace('blocked.html');
        }, 100);
    }
    
})();
