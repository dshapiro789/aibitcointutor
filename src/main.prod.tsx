import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { installDateProtection } from './utils/dateUtils';

// Install global protection for Date methods
installDateProtection();

// Production-specific error handler
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error?: Error }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Production error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Import the App component to access routes
      const App = require('./App').default;
      // Use simplified UI for production errors
      return (
        <div className="min-h-screen bg-orange-50 flex flex-col">
          <header className="bg-white p-4 shadow-sm">
            <h1 className="text-xl font-bold text-center text-orange-600">Bitcoin AI Tutor</h1>
            <p className="text-center text-sm text-gray-500">Fallback Mode</p>
          </header>
          <main className="flex-1 p-4">
            <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md">
              <div className="mb-6 pb-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-red-600">An error occurred</h2>
                <p className="text-gray-600 mt-2">
                  We encountered a technical issue, but you can still use the basic chat functionality below.
                </p>
              </div>
              
              <div className="py-4">
                {/* Simplified chat interface */}
                <div className="mb-4 p-3 bg-white border border-gray-200 rounded-lg">
                  <p>Hi! I'm your Bitcoin AI Tutor. What would you like to learn about?</p>
                </div>
                
                <form className="mt-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask about Bitcoin..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <button
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg"
                    >
                      Send
                    </button>
                  </div>
                </form>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-100 text-right">
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-4 py-2 text-sm text-orange-600 hover:text-orange-700"
                >
                  Return to Home
                </button>
              </div>
            </div>
          </main>
        </div>
      );
    }

    return this.props.children;
  }
}

// Initialize API key check
const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
if (!apiKey) {
  console.warn('API Key not found. Some features might not work properly.');
}

// Render the app with production error handling
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
