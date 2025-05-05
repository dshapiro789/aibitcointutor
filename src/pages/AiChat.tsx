import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, Bot, Key, Crown, CheckCircle, 
  Calendar, AlertTriangle, ArrowRight, X, Menu,
  Search, Filter, Settings, Send, RefreshCw, Brain,
  Sparkles, Clock, Download, Mic, MicOff, ChevronDown,
  ChevronUp, Trash2, MessageSquare
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { ChatMessage } from '../components/ChatMessage';
import { useAIChat } from '../hooks/useAIChat';
import { useVoice } from '../hooks/useVoice';

const AiChat: React.FC = () => {
  const {
    messages,
    isProcessing,
    error: chatError,
    models,
    sendMessage,
    updateModel,
    addModel,
    removeModel,
    isLoading,
    remainingMessages,
    isPremium,
    currentThoughts,
    addReaction,
    exportChatHistory,
    searchMessages
  } = useAIChat();
  
  const [input, setInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [messageFilter, setMessageFilter] = useState<string>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
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
    scrollToBottom();
  }, [messages, currentThoughts]);

  useEffect(() => {
    if (chatError) {
      setError(chatError);
    }
  }, [chatError]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
      console.error('Chat error details:', {
        error: err,
        errorType: err?.constructor?.name,
        errorMessage: err instanceof Error ? err.message : String(err),
        errorStack: err instanceof Error ? err.stack : undefined,
        activeModel: {
          id: activeModel.id,
          provider: activeModel.provider
        }
      });
      
      setError(
        err instanceof Error 
          ? `Error: ${err.message}` 
          : 'Failed to send message. Please check console for details.'
      );
    }
  };

  const handleQuickReply = (reply: string) => {
    setInput(reply);
    handleSubmit({ preventDefault: () => {} } as React.FormEvent);
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const filteredMessages = messages.filter(msg => {
    if (searchQuery) {
      return msg.text.toLowerCase().includes(searchQuery.toLowerCase());
    }
    if (messageFilter !== 'all') {
      return msg.category === messageFilter;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-gray-50 to-orange-50" key="chat-container">
      {/* Header */}
      <div className="bg-white shadow-lg p-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex items-center p-2 rounded-lg">
            <Bot className="h-8 w-8 text-orange-500" />
            <h1 className="text-xl font-bold ml-2 text-gray-800">AI Bitcoin Tutor</h1>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`p-2 rounded-lg flex items-center ${
              showSearch ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            onClick={() => navigate('/subscription')}
            className="p-2 rounded-lg flex items-center text-gray-600 hover:bg-gray-100"
          >
            <CreditCard className="h-5 w-5" />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg flex items-center ${
                showSettings ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Settings className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <AnimatePresence mode="wait" onExitComplete={() => null}>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border-b shadow-sm"
          >
            <div className="p-4 max-w-5xl mx-auto">
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search chat history..."
                    className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={messageFilter}
                  onChange={(e) => setMessageFilter(e.target.value)}
                  className="px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="all">All messages</option>
                  <option value="user">My messages</option>
                  <option value="assistant">AI responses</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border-b shadow-sm overflow-hidden"
          >
            <div className="p-4 max-w-5xl mx-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="border rounded-xl p-4 bg-white shadow-sm">
                  <h3 className="text-md font-semibold mb-3 flex items-center">
                    <Bot className="h-5 w-5 text-orange-500 mr-2" />
                    AI Models
                  </h3>
                  
                  {models.map(model => (
                    <div key={model.id} className="mb-3 pb-3 border-b last:border-b-0 last:mb-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id={`model-${model.id}`}
                            name="activeModel"
                            checked={model.active}
                            onChange={() => {
                              const updatedModels = models.map(m => ({
                                ...m,
                                active: m.id === model.id
                              }));
                              updateModel(model.id, { active: true });
                            }}
                            className="h-4 w-4 text-orange-500"
                          />
                          <label htmlFor={`model-${model.id}`} className="ml-2 flex items-center">
                            <span className="font-medium text-gray-700">{model.name}</span>
                            <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              {model.provider}
                            </span>
                          </label>
                        </div>
                        <div>
                          <button
                            onClick={() => setShowAdvanced(showAdvanced === model.id ? null : model.id)}
                            className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
                          >
                            {showAdvanced === model.id ? (
                              <>
                                <ChevronUp className="h-3 w-3 mr-1" />
                                Hide
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-3 w-3 mr-1" />
                                Advanced
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                      
                      {showAdvanced === model.id && (
                        <div className="mt-3 pl-6 space-y-2">
                          {model.apiKeyRequired && (
                            <div className="flex items-center">
                              <div className="flex-1">
                                <label className="text-xs text-gray-600 mb-1 block">API Key</label>
                                <input
                                  type="password"
                                  value={model.apiKey || ''}
                                  onChange={(e) => updateModel(model.id, { apiKey: e.target.value })}
                                  placeholder="Enter your API key"
                                  className="w-full px-3 py-1 text-sm border rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                                />
                              </div>
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-xs text-gray-600 mb-1 block">Temperature</label>
                              <input
                                type="number"
                                min="0"
                                max="2"
                                step="0.1"
                                value={model.temperature || 0.7}
                                onChange={(e) => updateModel(model.id, { temperature: parseFloat(e.target.value) })}
                                className="w-full px-3 py-1 text-sm border rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-600 mb-1 block">Max Tokens</label>
                              <input
                                type="number"
                                min="100"
                                max="32000"
                                step="100"
                                value={model.maxTokens || 2000}
                                onChange={(e) => updateModel(model.id, { maxTokens: parseInt(e.target.value) })}
                                className="w-full px-3 py-1 text-sm border rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                              />
                            </div>
                          </div>

                          {!model.apiKeyRequired && (
                            <button
                              onClick={() => {
                                if (typeof removeModel === 'function') {
                                  removeModel(model.id);
                                }
                              }}
                              className="flex items-center text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove Model
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  
                </div>
                
                <div className="border rounded-xl p-4 bg-white shadow-sm">
                  <h3 className="text-md font-semibold mb-3 flex items-center">
                    <CreditCard className="h-5 w-5 text-orange-500 mr-2" />
                    Account Status
                  </h3>
                  
                  <div className="p-3 bg-gray-50 rounded-lg mb-4">
                    {isPremium ? (
                      <div className="flex items-center text-green-700">
                        <Crown className="h-5 w-5 mr-2 text-yellow-500" />
                        <div>
                          <div className="font-medium">Premium Subscription</div>
                          <div className="text-sm text-gray-600">Unlimited messages and priority support</div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-700">
                        <div>
                          <div className="font-medium">Free Plan</div>
                          <div className="text-sm text-gray-600">{remainingMessages} messages remaining this hour</div>
                          <button
                            onClick={() => navigate('/subscription')}
                            className="mt-2 px-3 py-1 bg-orange-500 text-white text-sm rounded-lg shadow-sm hover:bg-orange-600 transition-colors flex items-center"
                          >
                            <CreditCard className="h-4 w-4 mr-1" />
                            Upgrade Now
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => exportChatHistory()}
                      className="w-full py-2 px-4 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-700"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Chat History
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4" style={{ paddingBottom: '150px' }}>
        {filteredMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <Brain className="h-16 w-16 text-orange-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Welcome to AI Bitcoin Tutor</h2>
            <p className="text-gray-500 max-w-lg mb-6">
              I'm your personal AI tutor for learning about Bitcoin. Ask me anything from basic concepts to advanced technical details!
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
              <button
                onClick={() => handleQuickReply("What is Bitcoin?")}
                className="px-4 py-3 border border-orange-200 rounded-xl bg-white hover:bg-orange-50 transition-colors text-left text-gray-700 shadow-sm"
              >
                <div className="font-medium">What is Bitcoin?</div>
                <div className="text-sm text-gray-500">Learn the basics</div>
              </button>
              <button
                onClick={() => handleQuickReply("How does blockchain work?")}
                className="px-4 py-3 border border-orange-200 rounded-xl bg-white hover:bg-orange-50 transition-colors text-left text-gray-700 shadow-sm"
              >
                <div className="font-medium">How does blockchain work?</div>
                <div className="text-sm text-gray-500">Technical foundations</div>
              </button>
              <button
                onClick={() => handleQuickReply("What's the difference between Bitcoin and other cryptocurrencies?")}
                className="px-4 py-3 border border-orange-200 rounded-xl bg-white hover:bg-orange-50 transition-colors text-left text-gray-700 shadow-sm"
              >
                <div className="font-medium">Bitcoin vs others</div>
                <div className="text-sm text-gray-500">Compare cryptocurrencies</div>
              </button>
              <button
                onClick={() => handleQuickReply("How can I buy Bitcoin safely?")}
                className="px-4 py-3 border border-orange-200 rounded-xl bg-white hover:bg-orange-50 transition-colors text-left text-gray-700 shadow-sm"
              >
                <div className="font-medium">How to buy Bitcoin</div>
                <div className="text-sm text-gray-500">Safe purchasing guide</div>
              </button>
            </div>
          </div>
        ) : (
          filteredMessages.map((message) => (
            <ChatMessage
              key={message.id}
              id={message.id}
              text={message.text}
              isUser={message.isUser}
              model={message.model}
              timestamp={message.timestamp}
              reactions={message.reactions}
              category={message.category}
              codeBlocks={message.codeBlocks}
              quickReplies={message.quickReplies}
              isPremium={isPremium}
              onQuickReply={(reply) => {
                const activeModel = models.find(m => m.active);
                if (activeModel) {
                  sendMessage(reply, activeModel);
                }
              }}
              onAddReaction={addReaction}
              onSpeakMessage={() => {
                speak(message.text);
              }}
              isSpeaking={isSpeaking}
              onStopSpeaking={stopSpeaking}
            />
          ))
        )}
        
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="my-4"
          >
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm max-w-[85%] ms-auto">
              <div className="flex items-center space-x-4 mb-2">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-orange-500 text-white rounded-full flex items-center justify-center">
                    <Bot className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <div className="font-medium">AI Assistant</div>
                  <div className="text-sm text-gray-500">Thinking...</div>
                </div>
              </div>
              <div className="flex space-x-1 mt-1">
                <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              {currentThoughts && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-base text-gray-500 italic border-l-2 border-orange-200 pl-4"
                >
                  {currentThoughts}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center"
          >
            <div className="bg-red-50 text-red-800 p-4 rounded-xl max-w-[85%] flex items-center shadow-lg border border-red-200">
              <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span className="text-base">{error}</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t shadow-lg p-4">
        <form onSubmit={handleSubmit} className="flex items-center space-x-3 max-w-5xl mx-auto">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className={`p-3 rounded-xl transition-colors ${
                showSettings 
                  ? 'bg-orange-500 text-white' 
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Settings className="h-5 w-5" />
            </button>

            {isSupported && (
              <button
                type="button"
                onClick={handleVoiceToggle}
                className={`p-3 rounded-xl transition-colors ${
                  isListening
                    ? 'bg-red-500 text-white'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {isListening ? (
                  <MicOff className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </button>
            )}
          </div>

          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isPremium ? "Ask anything about Bitcoin..." : "Ask anything about Bitcoin"}
              className="w-full px-6 py-3 text-lg border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-shadow duration-200 shadow-sm hover:shadow-md"
              disabled={isProcessing}
            />
          </div>

          <div className="flex items-center space-x-3">
            {!isPremium && (
              <div className="hidden sm:flex items-center px-3 py-2 bg-orange-50 text-orange-700 rounded-lg">
                <MessageSquare className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">{remainingMessages} messages left</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing || !input.trim()}
              className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium shadow-sm hover:shadow-md"
            >
              <Send className="h-5 w-5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </form>

        {/* Mobile message counter */}
        {!isPremium && (
          <div className="sm:hidden flex justify-center mt-2">
            <div className="flex items-center text-sm text-gray-500">
              <MessageSquare className="h-4 w-4 mr-1" />
              <span>{remainingMessages} messages remaining</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiChat;
