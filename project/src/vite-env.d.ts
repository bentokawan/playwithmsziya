/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_CONTENT_BASE_URL?: string;
  readonly VITE_ADMIN_EMAIL_DOMAIN?: string;
  readonly VITE_ROOM_TRANSPORT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface MszTestHook {
  solveRound?: (
    player?: 1 | 2,
    result?: { readonly firstTry?: boolean; readonly attempts?: number },
  ) => void;
  simulateRoomDrop?: (ms: number) => void;
}

interface Window {
  __MSZ_TEST__?: boolean | MszTestHook;
}
