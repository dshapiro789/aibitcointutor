import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import UltraMinimalAiChat from './pages/UltraMinimalAiChat';
import Subscription from './pages/Subscription';
import Resources from './pages/Resources';
import Auth from './pages/Auth';
import AccountSettings from './pages/AccountSettings';
import { Background } from './components/Background';
import { ScrollToTop } from './components/ScrollToTop';
import { useAuthStore } from './store/authStore';
import { useSubscriptionStore } from './store/subscriptionStore';
import { RequireAuth } from './components/RequireAuth';
import { RequireSubscription } from './components/RequireSubscription';

// CRITICAL PRODUCTION FIX
// This is a completely safe version of the app that bypasses all problematic components

// API key check
const apiKey = typeof window !== 'undefined' && 
  (window.ENV_VARS?.OPENROUTER_API_KEY || 
   import.meta.env.VITE_OPENROUTER_API_KEY);

console.log(`API Key availability check: ${apiKey ? `Key present (length: ${apiKey.length})` : 'No API key found!'}`);

// Simple App component that avoids all date operations completely
function SafeApp() {
  const { restoreSession } = useAuthStore();
  const { loadSubscription } = useSubscriptionStore();

  React.useEffect(() => {
    restoreSession();
    loadSubscription();
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100/80">
        <Background />
        <Navbar />

        <main className="pt-4 pb-12 px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/subscription" element={<Subscription />} />
            
            {/* Protected Routes */}
            <Route 
              path="/account" 
              element={
                <RequireAuth>
                  <AccountSettings />
                </RequireAuth>
              } 
            />
            <Route 
              path="/ai-chat" 
              element={
                <RequireAuth>
                  {/* Always use ultra-minimal in production */}
                  <UltraMinimalAiChat />
                </RequireAuth>
              } 
            />
            <Route 
              path="/resources" 
              element={
                <RequireAuth>
                  <Resources />
                </RequireAuth>
              } 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

// Error boundary for extra safety
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
      return (
        <div className="min-h-screen bg-orange-50 flex flex-col">
          <header className="bg-white p-4 shadow-sm">
            <h1 className="text-xl font-bold text-center text-orange-600">Bitcoin AI Tutor</h1>
            <p className="text-center text-sm text-gray-500">Error Recovery Mode</p>
          </header>
          <main className="flex-1 p-4">
            <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-md">
              <UltraMinimalAiChat />
            </div>
          </main>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// Mount the application with error boundary
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <SafeApp />
    </ErrorBoundary>
  </React.StrictMode>
);