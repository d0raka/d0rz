/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_STATUS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
