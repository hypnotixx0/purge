// category-auth.js - Simple redirect handler for categories
document.addEventListener('DOMContentLoaded', function() {
    // This prevents the old onclick handlers from working
    // Categories now use direct links, so token-validator will handle authentication
    
    console.log('✅ Category auth system ready');
    console.log('ℹ️ Clicking categories will now redirect directly');
    console.log('ℹ️ Token validator will check authentication on each page');
});
