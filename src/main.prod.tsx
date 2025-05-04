import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';

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
      // Fallback UI when an error occurs
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
          <p className="mb-4 text-gray-600">
            We're experiencing some technical difficulties. Please try again later.
          </p>
          <pre className="bg-gray-100 p-4 rounded text-sm text-left max-w-full overflow-auto">
            {this.state.error?.toString()}
          </pre>
          <button
            onClick={() => window.location.href = '/'}
            className="mt-6 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Return to Home
          </button>
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
