import { marked } from 'marked';
import hljs from 'highlight.js';
import OpenAI from 'openai';

// Configure OpenAI with valid API key
export const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENROUTER_DEEPSEEK_KEY || '',
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

// Default model configurations
export const defaultModels: AIModel[] = [
  {
    id: 'google/gemini-pro',
    name: 'Gemini Pro 2.5',
    provider: 'OpenRouter',
    apiKeyRequired: false,
    apiEndpoint: 'https://openrouter.ai/api/v1',
    apiKey: import.meta.env.VITE_OPENROUTER_GEMINI_KEY,
    active: true,
    contextLength: 32768,
    temperature: 0.7,
    maxTokens: 4096
  },
  {
    id: 'deepseek-ai/deepseek-chat-v1',
    name: 'DeepSeek V3',
    provider: 'OpenRouter',
    apiKeyRequired: false,
    apiEndpoint: 'https://openrouter.ai/api/v1',
    apiKey: import.meta.env.VITE_OPENROUTER_DEEPSEEK_KEY,
    active: false,
    contextLength: 120000,
    temperature: 0.7,
    maxTokens: 2000
  },
  {
    id: 'google/gemma-7b-it',
    name: 'Gemma 3 27B',
    provider: 'OpenRouter',
    apiKeyRequired: false,
    apiEndpoint: 'https://openrouter.ai/api/v1',
    apiKey: import.meta.env.VITE_OPENROUTER_GEMMA_KEY,
    active: false,
    contextLength: 32768,
    temperature: 0.7,
    maxTokens: 4096
  }
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

  async sendMessage(text: string): Promise<string> {
    if (!this.currentModel) {
      throw new Error('No model selected');
    }

    if (!this.currentModel.apiKey) {
      throw new Error('API key is not configured');
    }

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.currentModel.apiKey}`,
          'HTTP-Referer': 'https://aibitcointutor.com',
          'X-Title': 'AI Bitcoin Tutor',
          'User-Agent': 'AI Bitcoin Tutor/1.0.0'
        },
        body: JSON.stringify({
          model: this.currentModel.id,
          messages: [
            { role: 'system', content: 'You are an AI Bitcoin Tutor, an expert in explaining Bitcoin, blockchain technology, and cryptocurrency concepts in a clear and engaging way.' },
            { role: 'user', content: text }
          ],
          temperature: this.currentModel.temperature || 0.7,
          max_tokens: this.currentModel.maxTokens || 4096
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          `API error (${response.status}): ${errorData?.error?.message || response.statusText}`
        );
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'No response received';
    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to communicate with AI service'
      );
    }
  }
}

export const aiService = new AIService();