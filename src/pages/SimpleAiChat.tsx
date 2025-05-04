import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Bot, Settings, Send, Mic, MicOff, AlertTriangle, MessageSquare } from 'lucide-react';
import { useAIChat } from '../hooks/useAIChat';
import { useVoice } from '../hooks/useVoice';
import { ChatMessage } from '../components/ChatMessage';

// A simplified version of the AiChat component to rule out any complex component issues
const SimpleAiChat: React.FC = () => {
  const {
    messages,
    isProcessing,
    error: chatError,
    models,
    sendMessage,
    updateModel,
    remainingMessages,
    isPremium,
    currentThoughts,
    addReaction
  } = useAIChat();
  
  const [input, setInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const {
    isListening,
    isSpeaking,
    isSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking
  } = useVoice({
    onResult: (transcript) => {
      setInput(transcript);
      handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    },
    onError: (error) => {
      console.error('Voice error:', error);
      setError('Voice input error: ' + error);
    }
  });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, currentThoughts]);

  useEffect(() => {
    if (chatError) {
      setError(chatError);
    }
  }, [chatError]);

  // Simplified submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const activeModel = models.find(m => m.active);
    if (!activeModel) {
      setError('Please select an AI model first');
      return;
    }

    const message = input;
    setInput('');
    setError(null);
    
    try {
      console.log('Sending message with model:', {
        modelId: activeModel.id,
        modelProvider: activeModel.provider,
        messageLength: message.length
      });
      
      await sendMessage(message, activeModel);
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err instanceof Error ? err.message : 'Error sending message');
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Basic rendering of the chat interface
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Basic Header */}
      <header className="bg-white p-4 shadow-sm flex justify-between items-center">
        <div className="flex items-center">
          <Bot className="h-6 w-6 text-orange-500 mr-2" />
          <h1 className="text-xl font-bold">AI Bitcoin Tutor</h1>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate('/subscription')}
            className="p-2 rounded hover:bg-gray-100"
          >
            <CreditCard className="h-5 w-5 text-gray-600" />
          </button>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded hover:bg-gray-100"
          >
            <Settings className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </header>

      {/* Settings Panel (Simplified) */}
      {showSettings && (
        <div className="bg-white border-b p-4">
          <h2 className="text-lg font-semibold mb-3">AI Models</h2>
          <div className="space-y-2">
            {models.map(model => (
              <div key={model.id} className="flex items-center">
                <input
                  type="radio"
                  id={`model-${model.id}`}
                  name="activeModel"
                  checked={model.active}
                  onChange={() => updateModel(model.id, { active: true })}
                  className="mr-2"
                />
                <label htmlFor={`model-${model.id}`}>
                  {model.name} ({model.provider})
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages Section */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center p-8">
            <Bot className="h-12 w-12 text-orange-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Welcome to AI Bitcoin Tutor</h2>
            <p className="text-gray-600 mb-4">
              Ask me anything about Bitcoin and cryptocurrency!
            </p>
          </div>
        ) : (
          messages.map(message => (
            <ChatMessage
              key={message.id}
              id={message.id}
              text={message.text}
              isUser={message.isUser}
              model={message.model}
              timestamp={message.timestamp}
              reactions={message.reactions}
              category={message.category as any}
              codeBlocks={message.codeBlocks}
              quickReplies={message.quickReplies}
              remainingMessages={remainingMessages}
              isPremium={isPremium}
              onQuickReply={(reply) => sendMessage(reply, models.find(m => m.active)!)}
            />
          ))
        )}

        {/* Thinking indicator */}
        {isProcessing && (
          <div className="bg-white border rounded-lg p-4 max-w-[80%] ml-auto">
            <div className="flex items-center space-x-2 mb-2">
              <Bot className="h-5 w-5 text-orange-500" />
              <div className="font-medium">AI Assistant</div>
            </div>
            <div className="flex space-x-1">
              <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce"></div>
              <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce delay-75"></div>
              <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce delay-150"></div>
            </div>
            {currentThoughts && (
              <div className="mt-2 text-sm text-gray-500 italic border-l-2 border-orange-200 pl-2">
                {currentThoughts}
              </div>
            )}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Section */}
      <div className="bg-white border-t p-4">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          {isSupported && (
            <button
              type="button"
              onClick={handleVoiceToggle}
              className={`p-2 rounded ${isListening ? 'bg-red-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
          )}
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about Bitcoin..."
            className="flex-1 px-4 py-2 border rounded-lg"
            disabled={isProcessing}
          />
          
          <button
            type="submit"
            disabled={isProcessing || !input.trim()}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
        
        {!isPremium && (
          <div className="flex justify-center mt-2 text-sm text-gray-500">
            <MessageSquare className="h-4 w-4 mr-1" />
            <span>{remainingMessages} messages remaining</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleAiChat;
