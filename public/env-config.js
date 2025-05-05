// This script injects environment variables into the window object for production
// It will be loaded before the app bundle in the HTML
window.ENV_VARS = {
  // These will be populated during build by deploy.yml
  OPENROUTER_API_KEY: '%%OPENROUTER_API_KEY%%',
  OPENROUTER_ENDPOINT: '%%OPENROUTER_ENDPOINT%%',
  SUPABASE_URL: '%%SUPABASE_URL%%',
  SUPABASE_ANON_KEY: '%%SUPABASE_ANON_KEY%%',
  // Add other environment variables as needed
};

// NO DATE OPERATIONS: We've completely removed all date-related methods
// to avoid any possible errors in production
console.log('Environment variables loaded successfully');

// Add a global error handler to catch any unexpected errors
window.addEventListener('error', function(event) {
  console.warn('Caught error:', event.error);
  // Don't prevent default for most errors
  return false;
});
