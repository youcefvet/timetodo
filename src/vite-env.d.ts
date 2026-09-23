/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HABIT_FEATURE_PAID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
