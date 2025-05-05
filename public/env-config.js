// This script injects environment variables into the window object for production
// It will be loaded before the app bundle in the HTML
window.ENV_VARS = {
  // These will be populated during build by deploy.yml
  OPENROUTER_API_KEY: '%%OPENROUTER_API_KEY%%',
  OPENROUTER_ENDPOINT: '%%OPENROUTER_ENDPOINT%%',
  // Add other environment variables as needed
};
