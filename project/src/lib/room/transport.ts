import type { RoomMsg, RoomMsgBody, RoomRole } from './protocol';

export const JOIN_TIMEOUT_MS = 5000;

export type ConnStatus = 'connecting' | 'connected' | 'reconnecting' | 'closed';

export type JoinResult =
  | { readonly ok: true }
  | {
      readonly ok: false;
      readonly reason: 'full' | 'no-host' | 'offline' | 'timeout' | 'replaced';
    };

export interface RoomTransport {
  join(code: string, me: RoomRole, sid: string): Promise<JoinResult>;
  send(body: RoomMsgBody): void;
  onMessage(cb: (msg: RoomMsg) => void): () => void;
  onPresence(cb: (sid: string, role: RoomRole, present: boolean) => void): () => void;
  onStatus(cb: (status: ConnStatus) => void): () => void;
  leave(sendBye: boolean): void;
  simulateDrop?(ms: number): void;
}

const SEQ_KEY_PREFIX = 'msz:room:seq:';

export function readStoredSeq(sid: string): number {
  try {
    const raw = globalThis.sessionStorage?.getItem(`${SEQ_KEY_PREFIX}${sid}`);
    const n = raw ? Number(raw) : 0;
    return Number.isInteger(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

export function nextStoredSeq(sid: string, current: number): number {
  const next = Math.max(current, readStoredSeq(sid)) + 1;
  try {
    globalThis.sessionStorage?.setItem(`${SEQ_KEY_PREFIX}${sid}`, String(next));
  } catch {
    /* ignore */
  }
  return next;
}
