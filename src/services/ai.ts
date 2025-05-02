import { marked } from 'marked';
import hljs from 'highlight.js';
import OpenAI from 'openai';

// Configure OpenAI with valid API key
export const openai = new OpenAI({
  apiKey: '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',
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
    id: 'google/gemini-2.5-pro-exp-03-25:free',
    name: 'Gemini Pro 2.5',
    provider: 'OpenRouter',
    apiKeyRequired: false,
    apiEndpoint: 'https://openrouter.ai/api/v1',
    apiKey: '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',
    active: true,
    contextLength: 32768,
    temperature: 0.7,
    maxTokens: 4096
  },
  {
    id: 'deepseek/deepseek-chat-v3-0324:free',
    name: 'DeepSeek V3',
    provider: 'OpenRouter',
    apiKeyRequired: false,
    apiEndpoint: 'https://openrouter.ai/api/v1',
    apiKey: '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',
    active: false,
    contextLength: 120000,
    temperature: 0.7,
    maxTokens: 2000
  },
  {
    id: 'google/gemma-3-27b-it:free',
    name: 'Gemma 3 27B',
    provider: 'OpenRouter',
    apiKeyRequired: false,
    apiEndpoint: 'https://openrouter.ai/api/v1',
    apiKey: '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',
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

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.currentModel.apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'AI Bitcoin Tutor'
      },
      body: JSON.stringify({
        model: this.currentModel.id,
        messages: [
          { role: 'user', content: text }
        ],
        temperature: this.currentModel.temperature || 0.7,
        max_tokens: this.currentModel.maxTokens || 4096
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response received';
  }
}

export const aiService = new AIService();