// auth-overlay-simple.js - Simple, reliable auth overlay
(function() {
    'use strict';
    
    console.log('🎬 Simple auth overlay starting');
    
    // Wait for DOM to be ready
    function init() {
        const overlay = document.getElementById('purge-auth-overlay');
        if (!overlay) {
            console.error('❌ Auth overlay element not found');
            return;
        }
        
        console.log('🔍 Checking current auth status...');
        
        // Check if user already has valid session
        const auth = sessionStorage.getItem('purge_auth');
        const level = sessionStorage.getItem('purge_auth_level');
        const timestamp = sessionStorage.getItem('purge_auth_timestamp');
        
        if (auth === 'authenticated' && level && timestamp) {
            const sessionTime = parseInt(timestamp);
            const now = Date.now();
            const sessionAge = now - sessionTime;
            
            // Check if session is less than 30 minutes old
            if (sessionAge < (30 * 60 * 1000)) {
                console.log('✅ Valid session found (age:', Math.round(sessionAge/1000), 'seconds)');
                console.log('👤 Level:', level);
                overlay.style.display = 'none';
                return; // Don't show overlay
            } else {
                console.log('❌ Session expired (age:', Math.round(sessionAge/1000), 'seconds)');
                sessionStorage.clear();
            }
        } else {
            console.log('❌ No valid session found');
            sessionStorage.clear();
        }
        
        // Show the auth overlay
        console.log('🔐 Showing auth overlay');
        overlay.style.display = 'block';
        
        // Start the experience after a short delay
        setTimeout(() => {
            overlay.classList.add('active');
            startAuthExperience();
        }, 100);
    }
    
    function startAuthExperience() {
        const overlay = document.getElementById('purge-auth-overlay');
        const authContainer = overlay.querySelector('.auth-container');
        const keyInput = document.getElementById('auth-key-input');
        const showKeyBtn = document.getElementById('auth-show-key');
        const submitBtn = document.getElementById('auth-submit');
        const authStatus = document.getElementById('auth-status');
        
        console.log('🎭 Starting auth experience');
        
        // Auto-scroll after 2 seconds
        setTimeout(() => {
            if (authContainer && !authContainer.classList.contains('scrolled')) {
                authContainer.classList.add('scrolled');
                console.log('⬇️ Auto-scrolled to key input');
            }
        }, 2000);
        
        // Manual scroll on click
        overlay.addEventListener('click', function(e) {
            if (!authContainer.classList.contains('scrolled')) {
                if (e.target.closest('.scroll-indicator') || e.target === overlay) {
                    authContainer.classList.add('scrolled');
                    console.log('⬇️ Manual scroll to key input');
                }
            }
        });
        
        // Show/hide password toggle
        if (showKeyBtn && keyInput) {
            showKeyBtn.addEventListener('click', function() {
                const type = keyInput.type === 'password' ? 'text' : 'password';
                keyInput.type = type;
                showKeyBtn.innerHTML = type === 'password' 
                    ? '<i class="fas fa-eye"></i>' 
                    : '<i class="fas fa-eye-slash"></i>';
                console.log('👁️ Password visibility:', type);
            });
        }
        
        // Key validation
        const validKeys = {
            free: ['IMPOOR'],
            premium: ['CHARLESISPOOR', 'UNHIIN', 'SOSAPARTY']
        };
        
        function validateKey() {
            const key = keyInput.value.trim().toUpperCase();
            
            if (!key) {
                showError('Please enter a key');
                return;
            }
            
            console.log('🔑 Validating key:', key);
            
            // Show loading state
            submitBtn.classList.add('loading');
            authStatus.className = 'auth-status';
            authStatus.textContent = '';
            
            // Simulate validation delay
            setTimeout(() => {
                let userLevel = null;
                
                if (validKeys.premium.includes(key)) {
                    userLevel = 'premium';
                } else if (validKeys.free.includes(key)) {
                    userLevel = 'free';
                }
                
                if (userLevel) {
                    grantAccess(key, userLevel);
                } else {
                    showError('Invalid key. Try: IMPOOR (free) or premium key');
                    submitBtn.classList.remove('loading');
                }
            }, 500);
        }
        
        // Submit on button click
        if (submitBtn) {
            submitBtn.addEventListener('click', validateKey);
        }
        
        // Submit on Enter key
        if (keyInput) {
            keyInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    validateKey();
                }
            });
        }
        
        function grantAccess(key, level) {
            console.log(`✅ Access granted! Level: ${level}, Key: ${key}`);
            
            // Generate session data
            const timestamp = Date.now().toString();
            const SALT = 'p' + 'u' + 'r' + 'g' + 'e' + '_' + 's' + 'e' + 'c' + 'r' + 'e' + 't' + '_' + '2' + '0' + '2' + '5';
            const data = `${key}_${level}_${timestamp}_${SALT}`;
            
            // Simple hash function
            let hash = 0;
            for (let i = 0; i < data.length; i++) {
                const char = data.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            const authHash = Math.abs(hash).toString(36);
            
            // Save to sessionStorage
            sessionStorage.setItem('purge_auth', 'authenticated');
            sessionStorage.setItem('purge_auth_level', level);
            sessionStorage.setItem('purge_auth_timestamp', timestamp);
            sessionStorage.setItem('purge_auth_key', key);
            sessionStorage.setItem('purge_auth_hash', authHash);
            
            console.log('💾 Session saved:', {
                level: level,
                key: key,
                timestamp: timestamp,
                hash: authHash
            });
            
            // Show success message
            authStatus.className = 'auth-status success show';
            authStatus.textContent = `✅ ${level === 'premium' ? 'Premium' : 'Free'} access granted!`;
            
            // Update button state
            submitBtn.classList.remove('loading');
            submitBtn.classList.add('auth-success');
            
            // Hide overlay after delay
            setTimeout(() => {
                console.log('🎬 Fading out auth overlay');
                overlay.classList.add('fade-out');
                
                // Completely hide after animation
                setTimeout(() => {
                    overlay.style.display = 'none';
                    console.log('✅ Auth complete! Site is now accessible');
                    
                    // Show announcement modal if it exists
                    const announcement = document.getElementById('announcement-modal');
                    if (announcement) {
                        setTimeout(() => {
                            announcement.classList.add('active');
                            console.log('📢 Announcement modal shown');
                        }, 500);
                    }
                }, 800);
            }, 1500);
        }
        
        function showError(message) {
            console.log('❌ Auth error:', message);
            
            authStatus.className = 'auth-status error show';
            authStatus.textContent = `❌ ${message}`;
            
            submitBtn.classList.remove('loading');
            
            // Shake animation for error
            keyInput.style.animation = 'none';
            setTimeout(() => {
                keyInput.style.animation = 'shake 0.5s ease-in-out';
            }, 10);
        }
        
        console.log('✅ Auth experience ready');
    }
    
    // Add shake animation for errors
    if (!document.querySelector('#auth-animations')) {
        const style = document.createElement('style');
        style.id = 'auth-animations';
        style.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Make auth functions globally available
    window.checkAuthStatus = function() {
        const auth = sessionStorage.getItem('purge_auth');
        const level = sessionStorage.getItem('purge_auth_level');
        return auth === 'authenticated' && level;
    };
    
})();
