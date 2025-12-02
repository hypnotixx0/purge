// token-validator.js - FIXED TIMING ISSUE
(function() {
    'use strict';
    
    console.log('🔐 Token validator v2.0');
    
    // Configuration
    const AUTH_KEY = "purge_auth";
    const AUTH_LEVEL = "purge_auth_level";
    const AUTH_TIMESTAMP = "purge_auth_timestamp";
    const AUTH_KEY_USED = "purge_auth_key";
    const AUTH_HASH = "purge_auth_hash";
    
    // Valid keys
    const VALID_KEYS = {
        free: ['IMPOOR'],
        premium: ['CHARLESISPOOR', 'UNHIIN', 'SOSAPARTY']
    };
    
    // Pages that DON'T need authentication
    const PUBLIC_PAGES = [
        'index.html',
        'blocked.html',
        '', // root
        'favicon.ico'
    ];
    
    // Get current page
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';
    
    console.log('📄 Current page:', currentPage);
    
    // If it's a public page, DON'T RUN AUTH CHECK
    if (PUBLIC_PAGES.includes(currentPage)) {
        console.log('✅ Public page - no auth check needed');
        return; // EXIT - don't check authentication
    }
    
    console.log('🔒 Protected page - checking authentication...');
    
    // Wait for page to fully load AND sessionStorage to be ready
    window.addEventListener('load', function() {
        // Extra delay to ensure sessionStorage is ready
        setTimeout(checkAuth, 50);
    });
    
    function checkAuth() {
        try {
            console.log('🔍 Checking session data...');
            
            // Get session data
            const auth = sessionStorage.getItem(AUTH_KEY);
            const level = sessionStorage.getItem(AUTH_LEVEL);
            const timestamp = sessionStorage.getItem(AUTH_TIMESTAMP);
            const key = sessionStorage.getItem(AUTH_KEY_USED);
            const hash = sessionStorage.getItem(AUTH_HASH);
            
            console.log('Session data loaded:', {
                hasAuth: !!auth,
                level: level,
                hasKey: !!key,
                hasHash: !!hash
            });
            
            // If NO session data at all, redirect immediately
            if (!auth && !level && !key && !hash) {
                console.log('❌ No session data found');
                redirectToBlocked();
                return;
            }
            
            // Check if we have all required data
            if (!auth || auth !== "authenticated") {
                console.log('❌ Not authenticated');
                redirectToBlocked();
                return;
            }
            
            if (!level || !timestamp || !key || !hash) {
                console.log('❌ Incomplete session data');
                redirectToBlocked();
                return;
            }
            
            // Validate key
            const keyUpper = key.toUpperCase();
            const isValidFree = VALID_KEYS.free.includes(keyUpper);
            const isValidPremium = VALID_KEYS.premium.includes(keyUpper);
            
            if (level === 'free' && !isValidFree) {
                console.log('❌ Invalid free key');
                redirectToBlocked();
                return;
            }
            
            if (level === 'premium' && !isValidPremium) {
                console.log('❌ Invalid premium key');
                redirectToBlocked();
                return;
            }
            
            // Simple timestamp check (30 minute session)
            const time = parseInt(timestamp);
            const now = Date.now();
            if (isNaN(time) || (now - time) > (30 * 60 * 1000)) {
                console.log('❌ Session expired');
                redirectToBlocked();
                return;
            }
            
            // Check page permissions
            const premiumPages = [
                'games.html', 'apps.html', 'tools.html', 'roadmap.html',
                'themes.html', 'credits.html', 'settings.html'
            ];
            const freePages = ['games.html'];
            
            if (level === 'free' && !freePages.includes(currentPage)) {
                console.log('❌ Free users can only access games.html');
                redirectToBlocked();
                return;
            }
            
            if (level === 'premium' && !premiumPages.includes(currentPage)) {
                console.log('❌ Premium users cannot access this page:', currentPage);
                redirectToBlocked();
                return;
            }
            
            // SUCCESS!
            console.log('✅ Authentication successful!');
            console.log('👤 User level:', level);
            console.log('🔑 Key:', keyUpper);
            console.log('⏰ Session active');
            
            // Update timestamp to keep session alive
            sessionStorage.setItem(AUTH_TIMESTAMP, now.toString());
            
        } catch (error) {
            console.error('❌ Auth check error:', error);
            redirectToBlocked();
        }
    }
    
    function redirectToBlocked() {
        console.log('🚫 Redirecting to blocked.html');
        
        // Clear any invalid session data
        sessionStorage.clear();
        
        // Use replace to prevent back button
        window.location.replace('blocked.html');
    }
    
})();
