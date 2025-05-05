// Global type definitions
interface Window {
  ENV_VARS?: {
    OPENROUTER_API_KEY?: string;
    OPENROUTER_ENDPOINT?: string;
    [key: string]: string | undefined;
  };
  Buffer: any;
}
