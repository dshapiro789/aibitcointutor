import React, { useState, useEffect, useRef } from 'react';
// Simple markdown rendering - avoiding ReactMarkdown library
function simpleMarkdownToHtml(text: string): string {
  if (!text) return '';
  
  try {
    // Convert headers
    let html = text
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>');
    
    // Convert bold text
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // Convert italic text
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    // Convert code blocks
    html = html.replace(/```(.+?)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');
    
    // Convert inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Convert unordered lists
    html = html.replace(/^\s*[-*]\s+(.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    
    // Convert ordered lists
    html = html.replace(/^\s*\d+\.\s+(.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gs, '<ol>$1</ol>');
    
    // Convert paragraphs
    html = html.replace(/^([^<\n][^\n]+)$/gm, '<p>$1</p>');
    
    // Fix multiple paragraph tags
    html = html.replace(/<\/p><p>/g, '</p>\n<p>');
    
    // Replace multiple newlines
    html = html.replace(/\n\n+/g, '\n');
    
    return html;
  } catch (err) {
    console.error('Error converting markdown to HTML:', err);
    return text;
  }
}

// This component has been intentionally removed as part of the optimization
import { useAIChat } from '../hooks/useAIChat';
import { useAuthStore } from '../store/authStore';

// A minimal component with no dependencies on complex libraries
const MinimalAiChat: React.FC = () => {
  // Use auth store
  const { user } = useAuthStore();
  
  // First initialize a basic state
  const [isComponentLoading, setIsComponentLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState('');
  
  // Then safely use the AI chat hook
  const aiChat = useAIChat();
  
  // Extract values with safe null checks
  const messages = aiChat?.messages || [];
  const isProcessing = aiChat?.isProcessing || false;
  const models = aiChat?.models || [];
  const remainingMessages = aiChat?.remainingMessages || 0;
  const isPremium = aiChat?.isPremium || false;
  const chatError = aiChat?.error;
  
  // Default values and fallbacks
  const maxMessagesPerDay = 5; // Reduced message limit as requested
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Check if component is ready to display after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsComponentLoading(false);
    }, 1000); // Wait for hook to initialize
    
    return () => clearTimeout(timer);
  }, []);

  // Handle error propagation
  useEffect(() => {
    if (chatError) {
      setError(typeof chatError === 'string' ? chatError : 'An error occurred');
    }
  }, [chatError]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    try {
      setInput('');
      setError(null);
      
      // Safely get the functions from aiChat
      const updateModel = aiChat?.updateModel || (() => {});
      const sendMessage = aiChat?.sendMessage || (() => Promise.resolve());

      // Find active model or use the first one available
      const activeModel = models?.find(m => m.active) || (models && models.length > 0 ? models[0] : null);
      
      if (!activeModel) {
        setError('No AI models available. Please check your configuration.');
        return;
      }
      
      // If no model is active but we have models, activate the first one
      if (models && models.length > 0 && !models.some(m => m.active)) {
        updateModel(models[0].id, { active: true });
      }
      
      // Use the existing sendMessage function from useAIChat
      await sendMessage(input, activeModel);
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err instanceof Error ? err.message : 'Error sending message');
    }
  };

  // Simple passthrough - formatting is now handled by simpleMarkdownToHtml
  const formatMarkdown = (content: string): string => {
    return content || '';
  };

  // Super minimal UI with enhanced styling
  // Loading/error states
  if (isComponentLoading) {
    return (
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md p-8 text-center">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-2.5"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-2.5"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
        </div>
        <p className="mt-4 text-gray-600">Loading chat interface...</p>
      </div>
    );
  }

  // Check if we have models loaded
  if (!models || models.length === 0) {
    return (
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md p-8">
        <div className="text-center text-red-500">
          <h2 className="text-xl font-semibold mb-2">Configuration Error</h2>
          <p>No AI models available. Please check your API configuration.</p>
          <p className="mt-2 text-sm text-gray-600">If you're an administrator, verify that your API keys are set correctly in the environment variables.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <div className="flex-1 overflow-y-auto p-4 mb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8 max-w-md bg-white shadow-sm rounded-xl border border-gray-100">
              <div className="inline-flex p-3 rounded-full bg-orange-50 text-orange-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to AI Bitcoin Tutor</h3>
              <p className="text-gray-600">What would you like to learn about?</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] rounded-2xl p-5 ${message.isUser 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-white border border-gray-200 shadow-sm'}`}
                >
                  {message.isUser ? (
                    <p className="whitespace-pre-wrap">{message.text}</p>
                  ) : (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <div 
                        className="markdown-content" 
                        dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(message.text) }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="max-w-[80%] bg-white border border-gray-200 shadow-sm rounded-2xl p-5">
                  <div className="flex space-x-2 items-center">
                    <div className="h-2 w-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <div className="h-2 w-2 bg-orange-500 rounded-full animate-pulse delay-150"></div>
                    <div className="h-2 w-2 bg-orange-500 rounded-full animate-pulse delay-300"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {error && (
        <div className="mx-4 mb-4 bg-red-50 text-red-700 p-3 rounded-lg flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          <span>{error}</span>
        </div>
      )}
      
      <div className="sticky bottom-0 p-4 bg-gray-50 border-t">
        {!isPremium && (
          <div className="flex justify-center items-center mb-2 text-sm">
            <div className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span data-component-name="MinimalAiChat">{remainingMessages || 0} of {maxMessagesPerDay} messages remaining today</span>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Bitcoin..."
            className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={isProcessing || !input.trim()}
            className="px-5 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MinimalAiChat;
