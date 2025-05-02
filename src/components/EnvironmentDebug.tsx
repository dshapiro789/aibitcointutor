import React, { useState } from 'react';

export const EnvironmentDebug: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [debugInfo, setDebugInfo] = useState<Record<string, any>>({});

  const generateDebugInfo = () => {
    // Check all relevant environment variables
    const envVars = {
      // Show if env vars exist but not their values
      VITE_OPENROUTER_API_KEY: !!import.meta.env.VITE_OPENROUTER_API_KEY,
      VITE_OPENROUTER_ENDPOINT: import.meta.env.VITE_OPENROUTER_ENDPOINT,
      VITE_OPENROUTER_GEMINI_MODEL: import.meta.env.VITE_OPENROUTER_GEMINI_MODEL,
      VITE_OPENROUTER_DEEPSEEK_MODEL: import.meta.env.VITE_OPENROUTER_DEEPSEEK_MODEL,
      VITE_OPENROUTER_GEMMA_MODEL: import.meta.env.VITE_OPENROUTER_GEMMA_MODEL,
      MODE: import.meta.env.MODE,
      DEV: import.meta.env.DEV,
      PROD: import.meta.env.PROD,
      BASE_URL: import.meta.env.BASE_URL
    };

    // Check browser details
    const browserInfo = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      cookiesEnabled: navigator.cookieEnabled,
      online: navigator.onLine,
      url: window.location.href,
      origin: window.location.origin
    };

    setDebugInfo({
      environmentVariables: envVars,
      browser: browserInfo,
      timestamp: new Date().toISOString()
    });

    setVisible(true);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={generateDebugInfo}
        className="bg-gray-800 text-white p-2 rounded-full shadow-lg"
        title="Debug Environment"
      >
        🔧
      </button>
      {visible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-3xl max-h-[80vh] overflow-auto">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">Environment Debug Info</h2>
              <button 
                onClick={() => setVisible(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>
            </div>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setVisible(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnvironmentDebug;
