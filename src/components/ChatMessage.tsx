import React, { useState } from 'react';
import { 
  Bot, Clock, Copy, CheckCircle, MessageSquare,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

interface MessageReaction {
  type: '👍';
  timestamp: Date;
}

interface CodeBlock {
  language: string;
  code: string;
}

interface ChatMessageProps {
  id: string;
  text: string;
  isUser: boolean;
  model?: string;
  timestamp: Date;
  reactions?: MessageReaction[];
  category?: 'question' | 'explanation' | 'code' | 'error' | 'success';
  codeBlocks?: CodeBlock[];
  quickReplies?: string[];
  remainingMessages?: number;
  isPremium?: boolean;
  onQuickReply: (reply: string) => void;
}

const categoryIcons = {
  question: MessageSquare,
  explanation: MessageSquare,
  code: MessageSquare,
  error: AlertCircle,
  success: CheckCircle
};

export function ChatMessage({
  id,
  text,
  isUser,
  model,
  timestamp,
  reactions = [],
  category,
  codeBlocks = [],
  quickReplies = [],
  remainingMessages,
  isPremium,
  onQuickReply
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const CategoryIcon = category ? categoryIcons[category] : null;

  const handleCopy = async (textToCopy: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const formatText = (inputText: string) => {
    // Format code blocks with syntax highlighting
    let formattedText = inputText.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
      try {
        const language = lang || 'plaintext';
        const highlighted = hljs.highlight(code.trim(), { language }).value;
        return `<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg my-4 overflow-x-auto"><code class="language-${language}">${highlighted}</code></pre>`;
      } catch (error) {
        console.error('Syntax highlighting error:', error);
        return `<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg my-4 overflow-x-auto"><code>${code.trim()}</code></pre>`;
      }
    });

    // Format inline code
    formattedText = formattedText.replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-orange-600 px-1.5 py-0.5 rounded">$1</code>');

    // Format links
    formattedText = formattedText.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-orange-500 hover:text-orange-600 underline">$1</a>'
    );

    return formattedText;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} relative max-w-full`}
    >
      <div
        className={`w-full md:max-w-[85%] p-6 rounded-2xl relative group ${
          isUser
            ? 'bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white shadow-orange-500/20'
            : 'bg-white text-gray-800 shadow-lg'
        } shadow-xl hover:shadow-2xl transition-all duration-300`}
      >
        {/* Message Header */}
        <div className={`flex items-center justify-between mb-2 ${
          isUser ? 'text-orange-100/90' : 'text-gray-500'
        }`}>
          <div className="flex items-center space-x-2">
            {CategoryIcon && <CategoryIcon className="h-4 w-4" />}
            {model && (
              <>
                <Bot className="h-4 w-4" />
                <span className="text-sm font-medium truncate max-w-[150px]">{model}</span>
              </>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span className="text-sm">{timestamp.toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Message Content */}
        <div 
          className={`text-lg leading-relaxed break-words ${isUser ? 'text-white' : 'text-gray-800'}`}
          dangerouslySetInnerHTML={{ __html: formatText(text) }}
        />

        {/* Quick Replies */}
        {!isUser && quickReplies.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {quickReplies.map((reply, index) => (
              <button
                key={index}
                onClick={() => onQuickReply(reply)}
                className="px-3 py-1.5 text-sm bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition-colors truncate max-w-[200px]"
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        {/* Message Actions */}
        <div className="mt-4 flex items-center justify-end space-x-2">
          {/* Copy Button */}
          <button
            onClick={() => handleCopy(text)}
            className={`p-2 rounded-lg ${
              isUser
                ? 'text-white/80 hover:bg-white/10'
                : 'text-gray-600 hover:bg-gray-100'
            } transition-colors`}
            title={copied ? "Copied!" : "Copy message"}
          >
            {copied ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}