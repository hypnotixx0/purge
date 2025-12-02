// auth-overlay.js - FINAL VERSION
(function() {
    'use strict';
    
    console.log('🚀 Loading /Purge Authentication Overlay...');
    
    // Check if we should show the overlay
    function shouldShowOverlay() {
        // Check if user is already authenticated
        const auth = sessionStorage.getItem('purge_auth');
        const level = sessionStorage.getItem('purge_auth_level');
        const timestamp = sessionStorage.getItem('purge_auth_timestamp');
        const key = sessionStorage.getItem('purge_auth_key');
        const hash = sessionStorage.getItem('purge_auth_hash');
        
        // If we have all session data, don't show overlay
        if (auth && level && timestamp && key && hash) {
            console.log('✅ Already authenticated, skipping overlay');
            return false;
        }
        
        // Clear any incomplete session data
        if (!auth || !level || !timestamp || !key || !hash) {
            sessionStorage.clear();
        }
        
        return true;
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
            
            // Check if we should show overlay
            if (shouldShowOverlay()) {
                initializeAuthOverlay();
            } else {
                console.log('✅ Session valid, overlay not needed');
            }
        };
        
        checkLoadingComplete();
    });
    
    function initializeAuthOverlay() {
        const overlay = document.getElementById('purge-auth-overlay');
        if (!overlay) {
            console.error('❌ Auth overlay element not found');
            return;
        }
        
        console.log('🎬 Starting authentication experience');
        
        // Show overlay immediately
        overlay.style.display = 'block';
        setTimeout(() => {
            overlay.classList.add('active');
        }, 50);
        
        // Cache elements
        const authContainer = overlay.querySelector('.auth-container');
        const keyInput = document.getElementById('auth-key-input');
        const showKeyBtn = document.getElementById('auth-show-key');
        const submitBtn = document.getElementById('auth-submit');
        const authStatus = document.getElementById('auth-status');
        
        // Auto-scroll after 2.5 seconds
        setTimeout(() => {
            if (authContainer && !authContainer.classList.contains('scrolled')) {
                authContainer.classList.add('scrolled');
                console.log('⬇️ Auto-scrolling to key input');
            }
        }, 2500);
        
        // Manual scroll on click
        overlay.addEventListener('click', function(e) {
            if (authContainer && !authContainer.classList.contains('scrolled')) {
                if (e.target.closest('.scroll-indicator') || e.target === overlay) {
                    authContainer.classList.add('scrolled');
                }
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
            
            // Validate after short delay
            setTimeout(() => {
                const freeKeys = ['IMPOOR'];
                const premiumKeys = ['CHARLESISPOOR', 'UNHIIN', 'SOSAPARTY'];
                
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
            
            // Generate session data
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
            
            // Store ALL session data
            sessionStorage.setItem('purge_auth', 'authenticated');
            sessionStorage.setItem('purge_auth_level', level);
            sessionStorage.setItem('purge_auth_timestamp', timestamp);
            sessionStorage.setItem('purge_auth_key', key);
            sessionStorage.setItem('purge_auth_hash', authHash);
            
            console.log('💾 Session saved with all data');
            
            // Show success message
            const levelText = level === 'premium' ? 'Premium' : 'Free';
            authStatus.className = 'auth-status success show';
            authStatus.textContent = `✅ ${levelText} access granted!`;
            
            // Add success animation
            submitBtn.classList.remove('loading');
            submitBtn.classList.add('auth-success');
            
            // CRITICAL: Wait for session to be fully saved
            setTimeout(() => {
                overlay.classList.add('fade-out');
                
                // After overlay fades out
                setTimeout(() => {
                    overlay.style.display = 'none';
                    
                    // Show announcement modal
                    const announcementModal = document.getElementById('announcement-modal');
                    if (announcementModal) {
                        setTimeout(() => {
                            announcementModal.classList.add('active');
                        }, 300);
                    }
                    
                    console.log('🎉 Authentication complete!');
                    console.log('🔑 Key:', key);
                    console.log('📊 Level:', level);
                    console.log('🕐 Timestamp:', timestamp);
                    console.log('🔐 Hash:', authHash);
                    
                    // Enable category navigation
                    enableCategoryNavigation();
                    
                }, 800);
            }, 1500);
        }
        
        function showError(message) {
            authStatus.className = 'auth-status error show';
            authStatus.textContent = `❌ ${message}`;
            submitBtn.classList.remove('loading');
        }
        
        // Enable category links after auth
        function enableCategoryNavigation() {
            const categoryLinks = document.querySelectorAll('.category-box');
            
            categoryLinks.forEach(link => {
                // Remove any existing click handlers
                link.onclick = null;
                
                // Make sure it's a proper link
                if (!link.getAttribute('href')) {
                    const page = link.querySelector('h3').textContent.toLowerCase();
                    link.setAttribute('href', page + '.html');
                }
            });
            
            console.log('🔗 Category links enabled');
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
        
        // Create particles
        for (let i = 0; i < 9; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particlesContainer.appendChild(particle);
        }
    }
    
    // Global function to check session
    window.checkPurgeSession = function() {
        const auth = sessionStorage.getItem('purge_auth');
        const level = sessionStorage.getItem('purge_auth_level');
        return !!(auth && level);
    };
    
    console.log('✅ Auth overlay system loaded');
})();
