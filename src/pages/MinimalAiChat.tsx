import React, { useState, useEffect, useRef } from 'react';
import { openai } from '../services/ai';
import { ChatCompletionMessageParam } from 'openai/resources';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// A minimal component with no dependencies on complex libraries
const MinimalAiChat: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{id: string, text: string, isUser: boolean}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Very simplified send message function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    try {
      // Add user message to the list
      const userMessage = {
        id: Date.now().toString(),
        text: input,
        isUser: true
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);
      setError(null);
      
      // Call OpenAI API directly - basic error handling
      let response;
      try {
        // Prepare messages with proper typing
        const systemMessage: ChatCompletionMessageParam = {
          role: "system",
          content: "You are an AI Bitcoin expert tutor. Provide accurate, educational information about Bitcoin and cryptocurrency."
        };
        
        // Convert chat history to properly typed messages
        const historyMessages: ChatCompletionMessageParam[] = messages.map(msg => ({
          role: msg.isUser ? "user" : "assistant",
          content: msg.text
        }));
        
        // Current user message
        const userMessage: ChatCompletionMessageParam = {
          role: "user",
          content: input
        };
        
        // Combine all messages
        const allMessages: ChatCompletionMessageParam[] = [
          systemMessage,
          ...historyMessages,
          userMessage
        ];
        
        response = await openai.chat.completions.create({
          model: "perplexity/sonar",
          messages: allMessages,
          temperature: 0.7,
          max_tokens: 1024
        });
      } catch (err: any) {
        console.error('OpenAI API Error:', err);
        throw new Error(`API Error: ${err.message || JSON.stringify(err)}`);
      }
      
      // Add AI response to messages
      if (response?.choices?.[0]?.message?.content) {
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          text: response.choices[0].message.content,
          isUser: false
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('No response from AI service');
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err instanceof Error ? err.message : 'Error sending message');
    } finally {
      setIsLoading(false);
    }
  };

  // Format markdown content to replace ### and ** with proper headings and formatting
  const formatMarkdown = (content: string): string => {
    // Replace ### headers with proper markdown headers
    let formatted = content.replace(/^###\s+(.+)$/gm, '## $1');
    
    // Replace ** bold with proper markdown bold
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '**$1**');
    
    return formatted;
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
                          h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-4 mb-2" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-4 mb-2 border-b pb-1" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-md font-bold mt-3 mb-1" {...props} />,
                          p: ({node, ...props}) => <p className="mb-3" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3" {...props} />,
                          li: ({node, ...props}) => <li className="mb-1" {...props} />,
                          a: ({node, ...props}) => <a className="text-blue-600 underline" {...props} />,
                          code: ({node, inline, ...props}) => 
                            inline 
                              ? <code className="bg-gray-100 px-1 py-0.5 rounded text-sm" {...props} />
                              : <pre className="bg-gray-100 p-3 rounded overflow-x-auto text-sm my-3"><code {...props} /></pre>
                        }}
                      >
                        {formatMarkdown(message.text)}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
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
              <span>{remainingMessages} of {maxMessagesPerHour} messages remaining today</span>
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
            disabled={isLoading || !input.trim()}
            className="px-5 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MinimalAiChat;
