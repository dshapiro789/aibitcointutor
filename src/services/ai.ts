import { marked } from 'marked';
import hljs from 'highlight.js';
import OpenAI from 'openai';

// Configure OpenAI with valid API key
export const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY || '',
  dangerouslyAllowBrowser: true
});

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  apiKeyRequired: boolean;
  apiKey?: string;
  apiEndpoint?: string;
  active: boolean;
  contextLength?: number;
  temperature?: number;
  maxTokens?: number;
}

// =============================================
// MODEL CONFIGURATION
// =============================================
// To upgrade or change the AI model in the future:
// 1. Update the 'id' field with the new model identifier from OpenRouter
// 2. Update the 'name' field with a user-friendly name
// 3. Adjust parameters like contextLength, temperature, and maxTokens as needed
// 4. Ensure your OpenRouter API key has access to the new model
//
// Popular models to consider for future upgrades:
// - Anthropic models: 'anthropic/claude-3-opus:beta', 'anthropic/claude-3-sonnet:beta'  
// - OpenAI models: 'openai/gpt-4-turbo', 'openai/gpt-4o'
// - Other Google models: 'google/gemini-pro', 'google/gemini-1.5-pro'
//
// For the latest models, check: https://openrouter.ai/docs
// =============================================

// Default model configuration
export const defaultModels: AIModel[] = [
  {
    // UPGRADE POINT: Change this ID to use a new model
    id: 'google/gemma-7b-it',
    // UPGRADE POINT: Update this name to match the new model
    name: 'Gemma AI',
    provider: 'OpenRouter',
    apiKeyRequired: false,
    apiEndpoint: 'https://openrouter.ai/api/v1',
    apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
    active: true,
    // UPGRADE POINT: These parameters may need adjustment for different models
    contextLength: 32768,
    temperature: 0.7,
    maxTokens: 4096
  }
  
  // To add additional models, uncomment and modify this template:
  /*
  ,{
    id: 'model/identifier',
    name: 'Model Name',
    provider: 'OpenRouter',
    apiKeyRequired: false,
    apiEndpoint: 'https://openrouter.ai/api/v1',
    apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
    active: false, // Set only one model to active: true
    contextLength: 32768,
    temperature: 0.7,
    maxTokens: 4096
  }
  */
];

export class AIService {
  private currentModel: AIModel | null = null;

  constructor() {
    this.currentModel = defaultModels.find(m => m.active) || null;
  }

  setModel(model: AIModel) {
    this.currentModel = model;
  }

  getCurrentModel(): AIModel | null {
    return this.currentModel;
  }

  // =============================================
  // SEND MESSAGE METHOD
  // =============================================
  // This method handles sending messages to the AI model through OpenRouter
  // If you upgrade your model, you may need to adjust:
  // 1. The format of the messages array
  // 2. The request parameters like temperature and max_tokens
  // 3. Response parsing logic if the new model returns different JSON structure
  // =============================================
  async sendMessage(text: string): Promise<string> {
    if (!this.currentModel) {
      throw new Error('No model selected');
    }

    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    console.log('API Key present:', !!apiKey);
    
    if (!apiKey) {
      throw new Error('OpenRouter API key is not configured');
    }

    try {
      console.log('Making request to OpenRouter with model:', this.currentModel.id);
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://aibitcointutor.com',
          'X-Title': 'AI Bitcoin Tutor',
          'User-Agent': 'AI Bitcoin Tutor/1.0.0'
        },
        // UPGRADE POINT: Request body structure may need to be updated for different models
        body: JSON.stringify({
          model: this.currentModel.id,
          route: 'openai', // UPGRADE POINT: Routing may change with different providers
          messages: [
            // UPGRADE POINT: System message may need adjustment for different models
            { role: 'system', content: 'You are an AI Bitcoin Tutor, an expert in explaining Bitcoin, blockchain technology, and cryptocurrency concepts in a clear and engaging way.' },
            { role: 'user', content: text }
          ],
          // UPGRADE POINT: These parameters can be fine-tuned for different models
          temperature: this.currentModel.temperature || 0.7,
          max_tokens: this.currentModel.maxTokens || 4096,
          stream: false // UPGRADE POINT: Consider enabling streaming for real-time responses
        })
      });

      // Log request details
      console.log('Request details:', {
        url: 'https://openrouter.ai/api/v1/chat/completions',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer [REDACTED]',
          'HTTP-Referer': 'https://aibitcointutor.com',
          'X-Title': 'AI Bitcoin Tutor',
          'User-Agent': 'AI Bitcoin Tutor/1.0.0'
        },
        model: this.currentModel.id
      });

      if (!response.ok) {
        try {
          const errorText = await response.text();
          console.error('OpenRouter Error Response:', {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            body: errorText
          });
          
          let errorMessage = `API error (${response.status}): ${response.statusText}`;
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.error?.message) {
              errorMessage += ` - ${errorData.error.message}`;
            }
          } catch (parseError) {
            console.error('Error parsing error response:', parseError);
            errorMessage += ` - ${errorText}`;
          }
          throw new Error(errorMessage);
        } catch (responseError) {
          console.error('Error handling response:', responseError);
          throw new Error(`API error (${response.status}): ${response.statusText}`);
        }
      }

      // UPGRADE POINT: Response parsing may need to change for different model providers
      const data = await response.json();
      // UPGRADE POINT: Different models may structure their response differently
      return data.choices[0]?.message?.content || 'No response received';
    } catch (error) {
      // First log the raw error
      console.error('Raw error object:', error);

      // Then try to extract useful information
      const errorInfo = {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        type: error?.constructor?.name,
        currentModel: {
          id: this.currentModel?.id,
          provider: this.currentModel?.provider
        },
        apiKeyPresent: !!apiKey,
        env: {
          VITE_OPENROUTER_API_KEY: !!import.meta.env.VITE_OPENROUTER_API_KEY,
          NODE_ENV: import.meta.env.MODE
        }
      };

      console.error('AI Service Error Details:', errorInfo);
      throw new Error(`AI Service Error: ${errorInfo.message}`);
    }
  }
}

export const aiService = new AIService();