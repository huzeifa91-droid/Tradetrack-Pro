/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PAYSTACK_PUBLIC_KEY: string;
  readonly APP_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
