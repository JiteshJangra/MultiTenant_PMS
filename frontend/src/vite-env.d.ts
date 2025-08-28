/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GRAPHQL_URL: string;
  // add other env vars here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
