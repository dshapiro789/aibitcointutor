/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Stripe integration temporarily disabled
  // readonly VITE_STRIPE_PUBLIC_KEY: string
  readonly VITE_OPENROUTER_ENDPOINT: string
  readonly VITE_OPENROUTER_GEMINI_KEY: string
  readonly VITE_OPENROUTER_DEEPSEEK_KEY: string
  readonly VITE_OPENROUTER_GEMMA_KEY: string
  readonly VITE_OPENROUTER_GEMINI_MODEL: string
  readonly VITE_OPENROUTER_DEEPSEEK_MODEL: string
  readonly VITE_OPENROUTER_GEMMA_MODEL: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_MAX_MESSAGES_PER_DAY: string
  readonly VITE_ENABLE_VOICE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
