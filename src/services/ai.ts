import { marked } from 'marked';
import hljs from 'highlight.js';
import OpenAI from 'openai';

// API key used for authentication
const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || '';

// Log the API key (masked) for debugging
console.log('API Key availability check on init:', 
  apiKey ? `Key present (starts with: ${apiKey.substring(0, 8)}...)` : 'No API key found');
console.log('Environment variables available:', 
  Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));

// Configure OpenAI with valid API key from environment variables
export const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: apiKey,
  dangerouslyAllowBrowser: true,
  defaultHeaders: {
    "HTTP-Referer": "https://aibitcointutor.com", // Site URL for rankings on openrouter.ai
    "X-Title": "AI Bitcoin Tutor", // Site title for rankings on openrouter.ai
    "Content-Type": "application/json",
  },
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
    id: 'perplexity/sonar',
    // UPGRADE POINT: Update this name to match the new model
    name: 'Perplexity Sonar',
    provider: 'OpenRouter',
    apiKeyRequired: false,
    apiEndpoint: 'https://openrouter.ai/api/v1',
    apiKey: import.meta.env.VITE_OPENROUTER_API_KEY || '',
    active: true,
    // UPGRADE POINT: These parameters may need adjustment for different models
    contextLength: 32768,  // Using a standard context size for Perplexity models
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

    try {
      // Use the OpenAI client directly instead of fetch for better compatibility
      console.log('Using OpenAI client with model:', this.currentModel.id);
      
      // Define the system prompt for Bitcoin expertise
      const systemPrompt = `You are a knowledgeable and friendly Bitcoin and financial educator. Your role is to provide clear, accurate information about Bitcoin, cryptocurrency, traditional finance, and related topics.

Your expertise includes:
- Bitcoin technology, history, and ecosystem
- Cryptocurrency markets and technologies
- Investment concepts and strategies
- Traditional financial markets (equity, gold, silver, etc.)
- Monetary policy and macroeconomics

When answering questions:
1. Be factual and balanced in your responses
2. Provide citations to reputable sources when possible
3. Explain complex concepts in accessible language
4. Acknowledge different perspectives on controversial topics

IMPORTANT: Always clarify that you provide educational information only, NOT financial advice. Never make price predictions or tell people what to do with their money.

For technical questions, break down your answers into clear steps and explain underlying concepts.`;
      
      // Make the API call using the OpenAI client
      const completion = await openai.chat.completions.create({
        model: this.currentModel.id,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        temperature: this.currentModel.temperature || 0.7,
        max_tokens: this.currentModel.maxTokens || 4096
      });

      console.log('OpenAI API response received successfully');
      
      // Extract the AI response
      return completion.choices[0]?.message?.content || 'No response received';
      
    } catch (error) {
      // Log detailed error information
      console.error('AI Service Error:', error);
      
      // Format error message for the user
      let errorMessage = 'An error occurred while communicating with the AI service';
      
      if (error instanceof Error) {
        // Add more specific error information if available
        errorMessage = `AI Service Error: ${error.message}`;
        
        // Extract API error details if present
        if ('status' in error && typeof error.status === 'number') {
          errorMessage += ` (Status: ${error.status})`;
        }
      }
      
      // Throw a formatted error with useful information
      throw new Error(errorMessage);
    }
  }
}

export const aiService = new AIService();