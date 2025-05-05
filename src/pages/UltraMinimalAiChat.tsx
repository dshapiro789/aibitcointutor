import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';

/**
 * UltraMinimalAiChat - An extremely simplified chat component with no dependencies
 * that should work in any environment as a fallback when other components fail.
 */
const UltraMinimalAiChat: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{id: string; text: string; isUser: boolean}[]>([
    {
      id: 'welcome',
      text: "Hi! I'm your Bitcoin AI Tutor. What would you like to learn about?",
      isUser: false
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      text: input,
      isUser: true
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Simple system message
      const systemPrompt = `You are a knowledgeable Bitcoin educator. 
        Provide concise, factual information about Bitcoin and cryptocurrency.`;
      
      // Simplified fetch to OpenRouter API
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://aibitcointutor.com',
          'X-Title': 'AI Bitcoin Tutor'
        },
        body: JSON.stringify({
          model: 'perplexity/sonar',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: input }
          ],
          temperature: 0.7,
          max_tokens: 2048
        })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
      
      // Add AI response
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: aiResponse,
        isUser: false
      }]);
    } catch (error) {
      console.error('Error:', error);
      // Add error message
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: "Sorry, I couldn't process your request right now. Please try again later.",
        isUser: false
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <h1 className="text-xl font-bold text-center text-orange-600">Bitcoin AI Tutor</h1>
        <p className="text-center text-sm text-gray-500 mt-1">
          Fallback Mode - {user ? `Logged in as ${user.email}` : 'Not logged in'}
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 mb-4 bg-gray-50 rounded-lg">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`mb-4 p-3 rounded-lg ${
              message.isUser 
                ? 'bg-orange-500 text-white ml-auto max-w-[80%]' 
                : 'bg-white border border-gray-200 mr-auto max-w-[80%]'
            }`}
          >
            <p className="whitespace-pre-wrap">{message.text}</p>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg p-3 max-w-[80%]">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse delay-150"></div>
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse delay-300"></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Bitcoin..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg disabled:opacity-50"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
        <p className="text-center text-xs text-gray-500 mt-2">
          Ultra-minimal chat interface - fallback mode
        </p>
      </form>
    </div>
  );
};

export default UltraMinimalAiChat;
