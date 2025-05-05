// Direct production build patch - completely bypasses regular build
const fs = require('fs');
const path = require('path');

try {
  // Create dist directory if it doesn't exist
  const distDir = path.resolve(__dirname, 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // Create a completely self-contained HTML file
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AI Bitcoin Tutor</title>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }
    body {
      background-color: #f9f9f9;
      color: #333;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .app-container {
      max-width: 1024px;
      margin: 0 auto;
      padding: 1rem;
      width: 100%;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
    }
    .chat-container {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1rem;
      padding: 1rem;
      overflow-y: auto;
      max-height: calc(100vh - 180px);
      border-radius: 0.5rem;
      background: white;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .message {
      border-radius: 0.5rem;
      padding: 1rem;
      max-width: 90%;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .user-message {
      align-self: flex-end;
      background: linear-gradient(to bottom right, #f97316, #ea580c);
      color: white;
      margin-left: auto;
    }
    .ai-message {
      align-self: flex-start;
      background: white;
      border: 1px solid #e5e7eb;
    }
    .input-container {
      display: flex;
      gap: 0.5rem;
      margin-top: auto;
    }
    input {
      flex-grow: 1;
      padding: 0.75rem 1rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 1rem;
    }
    button {
      padding: 0.75rem 1.5rem;
      background: #f97316;
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    button:hover {
      background: #ea580c;
    }
    button:disabled {
      background: #d1d5db;
      cursor: not-allowed;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      margin-bottom: 1rem;
    }
    h1 {
      font-size: 1.5rem;
      color: #f97316;
    }
    pre {
      background: #1e293b;
      color: #e2e8f0;
      padding: 1rem;
      border-radius: 0.5rem;
      overflow-x: auto;
      margin: 1rem 0;
    }
    code {
      font-family: monospace;
    }
    p {
      margin-bottom: 0.5rem;
    }
    .loading {
      display: inline-block;
      width: 1.5rem;
      height: 1.5rem;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s ease-in-out infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="app-container">
    <div class="header">
      <h1>AI Bitcoin Tutor</h1>
    </div>
    <div id="chat-container" class="chat-container">
      <div class="message ai-message">
        <p>Hello! I'm your AI Bitcoin tutor. How can I help you learn about Bitcoin today?</p>
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

  // Write the HTML file to the dist directory
  fs.writeFileSync(path.join(distDir, 'index.html'), html);

  // Create .nojekyll file to bypass GitHub Pages Jekyll processing
  fs.writeFileSync(path.join(distDir, '.nojekyll'), '');

  console.log('Created self-contained HTML file in dist/index.html');
  console.log('Production build completed successfully');
} catch (error) {
  console.error('Error generating production build:', error);
  process.exit(1);
}
