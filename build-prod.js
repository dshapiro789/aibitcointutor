// Direct production build patch - completely bypasses regular build
const fs = require('fs');
const path = require('path');

console.log('Applying production build patch...');

// Create production index.html that uses a direct script reference 
// instead of going through the React build system
const productionHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Bitcoin AI Tutor</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
    <style>
      /* Basic styles for the fallback app */
      body { font-family: system-ui, -apple-system, sans-serif; background-color: #fff7ed; }
      .chat-container { max-width: 800px; margin: 0 auto; padding: 20px; }
      .user-message { background-color: #f97316; color: white; padding: 10px; border-radius: 8px; margin-bottom: 10px; }
      .ai-message { background-color: white; border: 1px solid #e5e7eb; padding: 10px; border-radius: 8px; margin-bottom: 10px; }
      .input-container { display: flex; margin-top: 20px; }
      input { flex-grow: 1; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px 0 0 8px; }
      button { background-color: #f97316; color: white; padding: 10px 15px; border: none; border-radius: 0 8px 8px 0; cursor: pointer; }
      button:disabled { opacity: 0.5; cursor: not-allowed; }
      .loading { display: flex; gap: 4px; }
      .loading div { width: 8px; height: 8px; border-radius: 50%; background-color: #f97316; animation: bounce 1.4s infinite ease-in-out both; }
      .loading div:nth-child(1) { animation-delay: -0.32s; }
      .loading div:nth-child(2) { animation-delay: -0.16s; }
      @keyframes bounce {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
      }
      .header { text-align: center; padding: 20px; margin-bottom: 20px; }
      .footer { text-align: center; padding: 10px; font-size: 12px; color: #6b7280; margin-top: 20px; }
    </style>
  </head>
  <body>
    <div id="root">
      <div class="chat-container">
        <div class="header">
          <h1 class="text-3xl font-bold text-orange-500">Bitcoin AI Tutor</h1>
          <p class="text-gray-500">Fallback Mode - Production</p>
        </div>
        
        <div id="messages">
          <div class="ai-message">
            <p>Hi! I'm your Bitcoin AI Tutor. What would you like to learn about?</p>
          </div>
        </div>
        
        <div class="input-container">
          <input id="user-input" type="text" placeholder="Ask about Bitcoin..." />
          <button id="send-button">Send</button>
        </div>
        
        <div class="footer">
          <p>© 2025 Bitcoin AI Tutor - Stable Production Mode</p>
        </div>
      </div>
    </div>
    
    <script>
      // Ultra-minimal chat implementation with no dependencies
      document.addEventListener('DOMContentLoaded', () => {
        const input = document.getElementById('user-input');
        const sendButton = document.getElementById('send-button');
        const messagesContainer = document.getElementById('messages');
        
        // Get API key safely
        const getApiKey = () => {
          try {
            // Try multiple possible locations for the API key
            const queryParams = new URLSearchParams(window.location.search);
            return queryParams.get('apiKey') || 
                   window.ENV_VARS?.OPENROUTER_API_KEY || 
                   ''; // Empty fallback
          } catch (e) {
            console.error('Error accessing API key:', e);
            return '';
          }
        };
        
        const addMessage = (text, isUser) => {
          const messageDiv = document.createElement('div');
          messageDiv.className = isUser ? 'user-message' : 'ai-message';
          messageDiv.innerHTML = \`<p>\${text}</p>\`;
          messagesContainer.appendChild(messageDiv);
          messageDiv.scrollIntoView({ behavior: 'smooth' });
        };
        
        const addLoadingIndicator = () => {
          const loadingDiv = document.createElement('div');
          loadingDiv.className = 'ai-message loading';
          loadingDiv.id = 'loading-indicator';
          loadingDiv.innerHTML = '<div></div><div></div><div></div>';
          messagesContainer.appendChild(loadingDiv);
          loadingDiv.scrollIntoView({ behavior: 'smooth' });
          return loadingDiv;
        };
        
        const sendMessage = async () => {
          const message = input.value.trim();
          if (!message) return;
          
          // Disable input while processing
          input.value = '';
          input.disabled = true;
          sendButton.disabled = true;
          
          // Add user message
          addMessage(message, true);
          
          // Add loading indicator
          const loadingIndicator = addLoadingIndicator();
          
          try {
            // Simple system message
            const systemPrompt = 'You are a knowledgeable Bitcoin educator. Provide concise, factual information about Bitcoin and cryptocurrency.';
            
            // Get API key
            const apiKey = getApiKey();
            
            if (!apiKey) {
              throw new Error('API key not available');
            }
            
            // Simplified fetch to OpenRouter API
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': \`Bearer \${apiKey}\`,
                'HTTP-Referer': 'https://aibitcointutor.com',
                'X-Title': 'AI Bitcoin Tutor'
              },
              body: JSON.stringify({
                model: 'perplexity/sonar',
                messages: [
                  { role: 'system', content: systemPrompt },
                  { role: 'user', content: message }
                ],
                temperature: 0.7,
                max_tokens: 2048
              })
            });
            
            if (!response.ok) {
              throw new Error(\`API error: \${response.status}\`);
            }
            
            const data = await response.json();
            const aiResponse = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
            
            // Remove loading indicator
            messagesContainer.removeChild(loadingIndicator);
            
            // Add AI response
            addMessage(aiResponse, false);
          } catch (error) {
            console.error('Error:', error);
            
            // Remove loading indicator
            messagesContainer.removeChild(loadingIndicator);
            
            // Add error message
            addMessage("Sorry, I couldn't process your request right now. Please try again later.", false);
          } finally {
            // Re-enable input
            input.disabled = false;
            sendButton.disabled = false;
            input.focus();
          }
        };
        
        // Event listeners
        sendButton.addEventListener('click', sendMessage);
        input.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            sendMessage();
          }
        });
        
        // Focus input on load
        input.focus();
        
        // Display API key status in console
        const apiKey = getApiKey();
        console.log(\`API Key availability check: \${apiKey ? \`Key present (length: \${apiKey.length})\` : 'No API key found!'}\`);
      });
    </script>
  </body>
</html>`;

// Write the production HTML directly to the project
fs.writeFileSync(path.join(__dirname, 'index.html'), productionHtml);

console.log('Production build patch applied successfully!');
