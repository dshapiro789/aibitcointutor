import React, { useState, useEffect, useRef } from 'react';
import { openai } from '../services/ai';
import { ChatCompletionMessageParam } from 'openai/resources';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// A minimal component with no dependencies on complex libraries
const MinimalAiChat: React.FC = () => {
  const {
    messages,
    isProcessing,
    error: chatError,
    models,
    sendMessage,
    updateModel,
    remainingMessages = 0,
    isPremium = false,
    currentThoughts,
    addReaction,
  } = useAIChat() || {};
  
  // Default values and fallbacks
  const maxMessagesPerHour = 20; // Default value if not provided from environment
  const [input, setInput] = useState('');
  // Use the error state from the hook but allow local overrides
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Very simplified send message function
  // Handle error propagation
  useEffect(() => {
    if (chatError) {
      setError(chatError);
    }
  }, [chatError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    try {
      setInput('');
      setError(null);

      // Find active model
      const activeModel = models?.find(m => m.active);
      if (!activeModel) {
        setError('Please select an AI model');
        return;
      }
      
      // Use the existing sendMessage function from useAIChat
      await sendMessage(input, activeModel);
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err instanceof Error ? err.message : 'Error sending message');
    }
  };

  // Format markdown content to replace ### and ** with proper headings and formatting
  const formatMarkdown = (content: string): string => {
    if (!content) return '';
    
    try {
      // Replace ### headers with proper markdown headers
      let formatted = content.replace(/^###\s+(.+)$/gm, '## $1');
      
      // Replace ** bold with proper markdown bold
      formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '**$1**');
      
      return formatted;
    } catch (err) {
      console.error('Error formatting markdown:', err);
      return content || '';
    }
  };

  // Super minimal UI with enhanced styling
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
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({node, children, ...props}) => <h1 className="text-xl font-bold mt-4 mb-2" {...props}>{children}</h1>,
                          h2: ({node, children, ...props}) => <h2 className="text-lg font-bold mt-4 mb-2 border-b pb-1" {...props}>{children}</h2>,
                          h3: ({node, children, ...props}) => <h3 className="text-md font-bold mt-3 mb-1" {...props}>{children}</h3>,
                          p: ({node, children, ...props}) => <p className="mb-3" {...props}>{children}</p>,
                          ul: ({node, children, ...props}) => <ul className="list-disc pl-5 mb-3" {...props}>{children}</ul>,
                          ol: ({node, children, ...props}) => <ol className="list-decimal pl-5 mb-3" {...props}>{children}</ol>,
                          li: ({node, children, ...props}) => <li className="mb-1" {...props}>{children}</li>,
                          a: ({node, children, ...props}) => <a className="text-blue-600 underline" {...props}>{children}</a>,
                          code: ({node, inline, className, children, ...props}) => 
                            inline 
                              ? <code className={`bg-gray-100 px-1 py-0.5 rounded text-sm ${className || ''}`} {...props}>{children}</code>
                              : <pre className="bg-gray-100 p-3 rounded overflow-x-auto text-sm my-3"><code className={className || ''} {...props}>{children}</code></pre>
                        }}
                      >
                        {formatMarkdown(message.text)}
                      </ReactMarkdown>
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
        {isPremium === false && remainingMessages !== undefined && (
          <div className="flex justify-center items-center mb-2 text-sm">
            <div className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{remainingMessages || 0} of {maxMessagesPerHour} messages remaining today</span>
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
            disabled={isLoading}
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
