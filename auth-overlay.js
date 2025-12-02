// auth-overlay.js - Immersive Authentication Overlay
(function() {
    'use strict';
    
    console.log('🚀 Loading /Purge Authentication Overlay...');
    
    // Check if already authenticated
    function checkAuthentication() {
        const authData = sessionStorage.getItem('purge_auth');
        const authLevel = sessionStorage.getItem('purge_auth_level');
        const timestamp = sessionStorage.getItem('purge_auth_timestamp');
        const keyUsed = sessionStorage.getItem('purge_auth_key');
        const hash = sessionStorage.getItem('purge_auth_hash');
        
        // All required data must exist
        if (!authData || !authLevel || !timestamp || !keyUsed || !hash) {
            return false;
        }
        
        // Validate hash (simplified - full validation in token-validator.js)
        const SALT = 'p' + 'u' + 'r' + 'g' + 'e' + '_' + 's' + 'e' + 'c' + 'r' + 'e' + 't' + '_' + '2' + '0' + '2' + '5';
        const data = `${keyUsed}_${authLevel}_${timestamp}_${SALT}`;
        let expectedHash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            expectedHash = ((expectedHash << 5) - expectedHash) + char;
            expectedHash = expectedHash & expectedHash;
        }
        expectedHash = Math.abs(expectedHash).toString(36);
        
        if (hash !== expectedHash) {
            return false;
        }
        
        // Check session duration (30 minutes)
        const elapsed = Date.now() - parseInt(timestamp);
        return elapsed < (30 * 60 * 1000) && elapsed >= 0;
    }
    
    // Wait for page to load
    document.addEventListener('DOMContentLoaded', function() {
        // Wait for loading screen to finish
        const loadingScreen = document.getElementById('loading-screen');
        
        const checkLoadingComplete = () => {
            if (!loadingScreen || !loadingScreen.classList.contains('fade-out')) {
                setTimeout(checkLoadingComplete, 100);
                return;
            }
            
            initializeAuthOverlay();
        };
        
        checkLoadingComplete();
    });
    
    function initializeAuthOverlay() {
        const overlay = document.getElementById('purge-auth-overlay');
        if (!overlay) return;
        
        // Check if already authenticated
        if (checkAuthentication()) {
            console.log('✅ Already authenticated, skipping overlay');
            return;
        }
        
        console.log('🎬 Starting authentication experience');
        
        // Show overlay
        overlay.classList.add('active');
        
        // Cache elements
        const authContainer = overlay.querySelector('.auth-container');
        const keyInput = document.getElementById('auth-key-input');
        const showKeyBtn = document.getElementById('auth-show-key');
        const submitBtn = document.getElementById('auth-submit');
        const authStatus = document.getElementById('auth-status');
        
        // Auto-scroll after 2 seconds
        setTimeout(() => {
            authContainer.classList.add('scrolled');
            console.log('⬇️ Auto-scrolling to key input');
        }, 2000);
        
        // Manual scroll on click
        overlay.addEventListener('click', function(e) {
            if (e.target.closest('.scroll-indicator') || 
                (e.target === overlay && !authContainer.classList.contains('scrolled'))) {
                authContainer.classList.add('scrolled');
            }
        });
        
        // Show/hide password
        if (showKeyBtn && keyInput) {
            showKeyBtn.addEventListener('click', function() {
                const type = keyInput.getAttribute('type') === 'password' ? 'text' : 'password';
                keyInput.setAttribute('type', type);
                showKeyBtn.innerHTML = type === 'password' ? 
                    '<i class="fas fa-eye"></i>' : 
                    '<i class="fas fa-eye-slash"></i>';
            });
        }
        
        // Submit key
        if (submitBtn && keyInput) {
            submitBtn.addEventListener('click', validateKey);
            keyInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    validateKey();
                }
            });
        }
        
        function validateKey() {
            const key = keyInput.value.trim().toUpperCase();
            
            if (!key) {
                showError('Please enter a key');
                return;
            }
            
            // Show loading state
            submitBtn.classList.add('loading');
            authStatus.className = 'auth-status';
            authStatus.textContent = '';
            
            // Simulate network delay
            setTimeout(() => {
                const freeKeys = ['IMPOOR'];
                const premiumKeys = ['CHARLESISPOOR', 'UNHIIN'];
                
                let authLevel = null;
                
                if (premiumKeys.includes(key)) {
                    authLevel = 'premium';
                } else if (freeKeys.includes(key)) {
                    authLevel = 'free';
                }
                
                if (authLevel) {
                    grantAccess(key, authLevel);
                } else {
                    showError('Invalid key. Try: IMPOOR (free) or a premium key');
                    submitBtn.classList.remove('loading');
                }
            }, 500);
        }
        
        function grantAccess(key, level) {
            console.log(`✅ Access granted! Level: ${level}, Key: ${key}`);
            
            // Generate session data (same as key-system.js)
            const timestamp = Date.now().toString();
            const SALT = 'p' + 'u' + 'r' + 'g' + 'e' + '_' + 's' + 'e' + 'c' + 'r' + 'e' + 't' + '_' + '2' + '0' + '2' + '5';
            const data = `${key}_${level}_${timestamp}_${SALT}`;
            let hash = 0;
            for (let i = 0; i < data.length; i++) {
                const char = data.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            const authHash = Math.abs(hash).toString(36);
            
            // Store session data
            sessionStorage.setItem('purge_auth', 'authenticated');
            sessionStorage.setItem('purge_auth_level', level);
            sessionStorage.setItem('purge_auth_timestamp', timestamp);
            sessionStorage.setItem('purge_auth_key', key);
            sessionStorage.setItem('purge_auth_hash', authHash);
            
            // Show success message
            const levelText = level === 'premium' ? 'Premium' : 'Free';
            authStatus.className = 'auth-status success show';
            authStatus.textContent = `✅ ${levelText} access granted!`;
            
            // Add success animation to button
            submitBtn.classList.remove('loading');
            submitBtn.classList.add('auth-success');
            
            // Hide overlay after delay
            setTimeout(() => {
                overlay.classList.add('fade-out');
                
                // Show your site content after overlay fades out
                setTimeout(() => {
                    overlay.style.display = 'none';
                    
                    // Show announcement modal if it exists
                    const announcementModal = document.getElementById('announcement-modal');
                    if (announcementModal) {
                        setTimeout(() => {
                            announcementModal.classList.add('active');
                        }, 300);
                    }
                    
                    console.log('🎉 Authentication complete, site content visible');
                }, 800);
            }, 1500);
        }
        
        function showError(message) {
            authStatus.className = 'auth-status error show';
            authStatus.textContent = `❌ ${message}`;
            submitBtn.classList.remove('loading');
        }
        
        // Add particle effect
        createParticles();
        
        console.log('🎭 Authentication overlay ready');
    }
    
    function createParticles() {
        const container = document.querySelector('.purge-auth-overlay');
        if (!container) return;
        
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'auth-particles';
        container.appendChild(particlesContainer);
        
        // Create 9 particles
        for (let i = 0; i < 9; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particlesContainer.appendChild(particle);
        }
    }
    
    // Public API for manual authentication check
    window.checkPurgeAuth = checkAuthentication;
    
    console.log('✅ Auth overlay system loaded');
})();
