/// <reference types="vite/client" />

/**
 * Vite environment variable type definitions
 * Provides type safety and IDE autocomplete for import.meta.env
 */
declare module 'vite' {
  interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
    readonly VITE_GEMINI_API_KEY?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
