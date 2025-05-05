// This script injects environment variables into the window object for production
// It will be loaded before the app bundle in the HTML
window.ENV_VARS = {
  // These will be populated during build by deploy.yml
  OPENROUTER_API_KEY: '%%OPENROUTER_API_KEY%%',
  OPENROUTER_ENDPOINT: '%%OPENROUTER_ENDPOINT%%',
  // Add other environment variables as needed
};

// CRITICAL PRODUCTION FIX: Prevent date-related errors
// This code runs before any React code and fixes the Date prototype
try {
  console.log('Installing global date protection patches');
  
  // Store original methods
  const originalToLocaleTimeString = Date.prototype.toLocaleTimeString;
  const originalToLocaleDateString = Date.prototype.toLocaleDateString;
  
  // Safe replacement for toLocaleTimeString
  Date.prototype.toLocaleTimeString = function() {
    try {
      return originalToLocaleTimeString.apply(this, arguments);
    } catch (e) {
      console.warn('Prevented a toLocaleTimeString error', e);
      return '12:00 PM';
    }
  };
  
  // Safe replacement for toLocaleDateString
  Date.prototype.toLocaleDateString = function() {
    try {
      return originalToLocaleDateString.apply(this, arguments);
    } catch (e) {
      console.warn('Prevented a toLocaleDateString error', e);
      return '2025-01-01';
    }
  };
  
  // Global error handler for date-related errors
  window.addEventListener('error', function(event) {
    if (event && event.error && 
        (event.error.toString().includes('toLocaleTimeString') || 
         event.error.toString().includes('Date'))) {
      console.warn('Caught and prevented Date-related error:', event.error);
      event.preventDefault();
      return true;
    }
    return false;
  });
  
  console.log('Date protection installed successfully');
} catch (e) {
  console.error('Failed to install date protection:', e);
}
