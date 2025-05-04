import React, { useState, useEffect } from 'react';
import { openai } from '../services/ai';
import { ChatCompletionMessageParam } from 'openai/resources';

// A minimal component with no dependencies on complex libraries
const MinimalAiChat: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{id: string, text: string, isUser: boolean}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Basic scroll-to-bottom effect
  useEffect(() => {
    window.scrollTo(0, document.body.scrollHeight);
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

  // Super minimal UI with no complex components
  return (
    <div className="p-4 max-w-4xl mx-auto">
      
      <div className="mb-4">
        {messages.length === 0 ? (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <p>Welcome to AI Bitcoin Tutor! Ask me anything about Bitcoin.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`p-4 rounded-lg ${
                  message.isUser 
                    ? 'bg-orange-100 ml-12' 
                    : 'bg-gray-100 mr-12'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.text}</p>
              </div>
            ))}
          </div>
        )}
        
        {isLoading && (
          <div className="bg-gray-100 p-4 rounded-lg mr-12 mt-4">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mt-4">
            <p>Error: {error}</p>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about Bitcoin..."
          className="flex-1 px-4 py-2 border rounded-lg"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default MinimalAiChat;
