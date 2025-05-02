declare module 'vite-plugin-node-polyfills' {
  export function nodePolyfills(options?: {
    include?: string[];
    exclude?: string[];
    globals?: {
      process?: boolean;
      Buffer?: boolean;
    };
    protocolImports?: boolean;
  }): any;
}
