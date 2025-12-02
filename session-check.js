// session-check.js - Handles category link clicks
(function() {
    'use strict';
    
    console.log('🔗 Session check for category links');
    
    // Check session before navigating
    function checkSessionBeforeNav(event) {
        // Only check if it's a category link
        const link = event.currentTarget;
        const href = link.getAttribute('href');
        
        if (!href || href.includes('http') || href === '#' || href === 'index.html') {
            return true; // Allow external links and index
        }
        
        console.log('🔍 Checking session for:', href);
        
        // Check session data
        const auth = sessionStorage.getItem('purge_auth');
        const level = sessionStorage.getItem('purge_auth_level');
        const timestamp = sessionStorage.getItem('purge_auth_timestamp');
        const key = sessionStorage.getItem('purge_auth_key');
        const hash = sessionStorage.getItem('purge_auth_hash');
        
        // If missing any data, prevent navigation
        if (!auth || auth !== "authenticated" || !level || !timestamp || !key || !hash) {
            console.log('❌ Session incomplete, preventing navigation');
            event.preventDefault();
            
            // Show auth overlay again
            const overlay = document.getElementById('purge-auth-overlay');
            if (overlay) {
                overlay.style.display = 'block';
                setTimeout(() => {
                    overlay.classList.add('active');
                    overlay.classList.remove('fade-out');
                }, 100);
                
                // Scroll to key input
                const authContainer = overlay.querySelector('.auth-container');
                if (authContainer) {
                    authContainer.classList.add('scrolled');
                }
            }
            
            return false;
        }
        
        console.log('✅ Session valid, allowing navigation to', href);
        return true;
    }
    
    // Add click handlers to category links
    document.addEventListener('DOMContentLoaded', function() {
        const categoryLinks = document.querySelectorAll('.category-box');
        
        categoryLinks.forEach(link => {
            link.addEventListener('click', checkSessionBeforeNav);
        });
        
        console.log('✅ Category links protected');
    });
    
})();
