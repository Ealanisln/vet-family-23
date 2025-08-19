// Debugging script para monitorear redirecciones en tiempo real
// Pega este script en la consola del navegador para monitorear redirecciones

(function() {
    console.log('🚀 Starting Redirect Flow Debugger...');
    
    // Monitor all fetch requests to admin-check
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const url = args[0];
        if (typeof url === 'string' && url.includes('/api/admin-check')) {
            console.log('🔍 [REDIRECT-DEBUG] Intercepted admin-check request');
            return originalFetch.apply(this, args)
                .then(response => {
                    console.log('🔍 [REDIRECT-DEBUG] admin-check response status:', response.status);
                    return response.clone().json().then(data => {
                        console.log('🔍 [REDIRECT-DEBUG] admin-check response data:', data);
                        return response;
                    });
                })
                .catch(error => {
                    console.error('❌ [REDIRECT-DEBUG] admin-check error:', error);
                    throw error;
                });
        }
        return originalFetch.apply(this, args);
    };
    
    // Monitor router.push calls
    if (window.next && window.next.router) {
        const originalPush = window.next.router.push;
        window.next.router.push = function(url, as, options) {
            console.log('🔄 [REDIRECT-DEBUG] Router push called:', { url, as, options });
            console.log('🔄 [REDIRECT-DEBUG] Current location:', window.location.href);
            return originalPush.call(this, url, as, options);
        };
    }
    
    // Monitor window location changes
    let currentUrl = window.location.href;
    setInterval(() => {
        if (window.location.href !== currentUrl) {
            console.log('🔄 [REDIRECT-DEBUG] URL changed:', {
                from: currentUrl,
                to: window.location.href
            });
            currentUrl = window.location.href;
        }
    }, 100);
    
    // Log current auth status
    fetch('/api/admin-check')
        .then(response => response.json())
        .then(data => {
            console.log('🔍 [REDIRECT-DEBUG] Current auth status:', data);
        })
        .catch(error => {
            console.error('❌ [REDIRECT-DEBUG] Failed to get auth status:', error);
        });
    
    console.log('✅ Redirect Flow Debugger is now active!');
    console.log('   - Monitoring fetch requests to /api/admin-check');
    console.log('   - Monitoring router.push calls');
    console.log('   - Monitoring URL changes');
})();
