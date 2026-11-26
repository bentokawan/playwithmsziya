import { parseRoomMsg, type RoomMsg, type RoomMsgBody, type RoomRole } from './protocol';
import {
  JOIN_TIMEOUT_MS,
  nextStoredSeq,
  readStoredSeq,
  type ConnStatus,
  type JoinResult,
  type RoomTransport,
} from './transport';

interface HubClient {
  sid: string;
  role: RoomRole;
  code: string;
  seq: number;
  dropped: boolean;
  msgCbs: Set<(msg: RoomMsg) => void>;
  presenceCbs: Set<(sid: string, role: RoomRole, present: boolean) => void>;
  statusCbs: Set<(s: ConnStatus) => void>;
  closeSelf(notifyClosed: boolean): void;
}

export interface LoopbackHub {
  createClient(): RoomTransport;
}

/**
 * In-memory loopback hub supporting 2+ clients, presence, same-sid replacement,
 * sequence continuity across simulated drops, and clean bye messages.
 */
export function createLoopbackHub(): LoopbackHub {
  const rooms = new Map<string, Set<HubClient>>();

  const getRoom = (code: string): Set<HubClient> => {
    let set = rooms.get(code);
    if (!set) {
      set = new Set();
      rooms.set(code, set);
    }
    return set;
  };

  const createClient = (): RoomTransport => {
    let active: HubClient | null = null;
    let seq = 0;
    let dropTimer: ReturnType<typeof setTimeout> | null = null;
    const msgCbs = new Set<(msg: RoomMsg) => void>();
    const presenceCbs = new Set<(sid: string, role: RoomRole, present: boolean) => void>();
    const statusCbs = new Set<(s: ConnStatus) => void>();

    const emitStatus = (s: ConnStatus) => {
      for (const cb of statusCbs) cb(s);
    };

    const detach = (sendBye: boolean, notifyClosed: boolean) => {
      if (dropTimer !== null) {
        clearTimeout(dropTimer);
        dropTimer = null;
      }
      if (!active) return;
      const prev = active;
      active = null;
      const room = getRoom(prev.code);
      if (sendBye) {
        const msg = { v: 2 as const, seq: ++seq, sid: prev.sid, t: 'bye' as const };
        for (const peer of room) {
          if (peer !== prev && !peer.dropped) {
            for (const cb of peer.msgCbs) cb(msg);
          }
        }
      }
      room.delete(prev);
      for (const peer of room) {
        if (!peer.dropped) {
          for (const cb of peer.presenceCbs) cb(prev.sid, prev.role, false);
        }
      }
      if (notifyClosed) {
        emitStatus('closed');
      }
    };

    return {
      async join(code, role, sid): Promise<JoinResult> {
        detach(false, false);
        emitStatus('connecting');
        const room = getRoom(code);

        // Replace existing tab with identical sid
        for (const existing of Array.from(room)) {
          if (existing.sid === sid) {
            existing.closeSelf(true);
          }
        }

        const otherPeers = Array.from(room);
        const sameRole = otherPeers.some((p) => p.role === role);
        const distinctSids = new Set(otherPeers.map((p) => p.sid));
        if (sameRole || distinctSids.size >= 2) {
          emitStatus('closed');
          return { ok: false, reason: 'full' };
        }

        if (role === 'guest' && !otherPeers.some((p) => p.role === 'host')) {
          emitStatus('closed');
          return { ok: false, reason: 'no-host' };
        }

        const client: HubClient = {
          sid,
          role,
          code,
          seq,
          dropped: false,
          msgCbs,
          presenceCbs,
          statusCbs,
          closeSelf(notifyClosed) {
            if (active === client) detach(false, notifyClosed);
          },
        };
        active = client;
        room.add(client);
        emitStatus('connected');

        for (const peer of otherPeers) {
          if (!peer.dropped) {
            for (const cb of peer.presenceCbs) cb(sid, role, true);
            for (const cb of presenceCbs) cb(peer.sid, peer.role, true);
          }
        }

        return { ok: true };
      },

      send(body: RoomMsgBody) {
        if (!active || active.dropped) return;
        const msg = { v: 2 as const, seq: ++seq, sid: active.sid, ...body } as RoomMsg;
        const room = getRoom(active.code);
        for (const peer of room) {
          if (peer !== active && !peer.dropped) {
            for (const cb of peer.msgCbs) cb(msg);
          }
        }
      },

      onMessage(cb) {
        msgCbs.add(cb);
        return () => {
          msgCbs.delete(cb);
        };
      },

      onPresence(cb) {
        presenceCbs.add(cb);
        return () => {
          presenceCbs.delete(cb);
        };
      },

      onStatus(cb) {
        statusCbs.add(cb);
        return () => {
          statusCbs.delete(cb);
        };
      },

      leave(sendBye: boolean) {
        detach(sendBye, true);
      },

      simulateDrop(ms: number) {
        if (!active || active.dropped) return;
        const client = active;
        client.dropped = true;
        emitStatus('reconnecting');
        const room = getRoom(client.code);
        for (const peer of room) {
          if (peer !== client && !peer.dropped) {
            for (const cb of peer.presenceCbs) cb(client.sid, client.role, false);
          }
        }
        dropTimer = setTimeout(() => {
          dropTimer = null;
          if (active !== client) return;
          client.dropped = false;
          emitStatus('connected');
          for (const peer of getRoom(client.code)) {
            if (peer !== client && !peer.dropped) {
              for (const cb of peer.presenceCbs) cb(client.sid, client.role, true);
            }
          }
        }, ms);
      },
    };
  };

  return { createClient };
}

export function createLoopbackPair(): readonly [RoomTransport, RoomTransport] {
  const hub = createLoopbackHub();
  return [hub.createClient(), hub.createClient()];
}

type WireEvent =
  | { readonly kind: 'msg'; readonly sid: string; readonly payload: RoomMsg }
  | { readonly kind: 'probe'; readonly sid: string; readonly role: RoomRole; readonly joinedAt: number }
  | { readonly kind: 'here'; readonly sid: string; readonly role: RoomRole; readonly joinedAt: number }
  | { readonly kind: 'gone'; readonly sid: string; readonly role: RoomRole };

/**
 * BroadcastChannel-backed transport v2 for local multi-tab testing & Playwright E2E.
 */
export function createBroadcastTransport(): RoomTransport {
  let channel: BroadcastChannel | null = null;
  let myRole: RoomRole | null = null;
  let mySid: string | null = null;
  let myJoinedAt = 0;
  let seq = 0;
  let dropped = false;
  let dropTimer: number | null = null;
  const knownPeers = new Map<string, { role: RoomRole; joinedAt: number }>();

  const msgCbs = new Set<(msg: RoomMsg) => void>();
  const presenceCbs = new Set<(sid: string, role: RoomRole, present: boolean) => void>();
  const statusCbs = new Set<(s: ConnStatus) => void>();

  const emitStatus = (s: ConnStatus) => {
    for (const cb of statusCbs) cb(s);
  };

  const post = (ev: WireEvent) => {
    try {
      channel?.postMessage(ev);
    } catch {
      /* ignore closed channel */
    }
  };

  let onOnlineHandler: (() => void) | null = null;
  let onOfflineHandler: (() => void) | null = null;

  const detachNetListeners = () => {
    if (typeof window === 'undefined') return;
    if (onOnlineHandler) window.removeEventListener('online', onOnlineHandler);
    if (onOfflineHandler) window.removeEventListener('offline', onOfflineHandler);
    onOnlineHandler = null;
    onOfflineHandler = null;
  };

  const cleanup = (sendBye: boolean, emitClosed: boolean) => {
    if (dropTimer !== null && typeof window !== 'undefined') {
      window.clearTimeout(dropTimer);
      dropTimer = null;
    }
    detachNetListeners();
    if (channel && myRole && mySid) {
      if (sendBye && !dropped) {
        seq = nextStoredSeq(mySid, seq);
        const msg = { v: 2 as const, seq, sid: mySid, t: 'bye' as const } as RoomMsg;
        post({ kind: 'msg', sid: mySid, payload: msg });
      }
      post({ kind: 'gone', sid: mySid, role: myRole });
      channel.close();
    }
    channel = null;
    myRole = null;
    mySid = null;
    dropped = false;
    knownPeers.clear();
    if (emitClosed) {
      emitStatus('closed');
    }
  };

  return {
    join(code, me, sid): Promise<JoinResult> {
      cleanup(false, false);
      if (typeof BroadcastChannel === 'undefined') {
        emitStatus('closed');
        return Promise.resolve({ ok: false, reason: 'offline' });
      }

      emitStatus('connecting');
      myRole = me;
      mySid = sid;
      seq = readStoredSeq(sid);
      myJoinedAt = Date.now();
      channel = new BroadcastChannel(`msz-room-${code}`);

      if (typeof window !== 'undefined') {
        onOfflineHandler = () => emitStatus('reconnecting');
        onOnlineHandler = () => {
          if (!dropped && channel && mySid && myRole) {
            emitStatus('connected');
            post({ kind: 'probe', sid: mySid, role: myRole, joinedAt: myJoinedAt });
          }
        };
        window.addEventListener('offline', onOfflineHandler);
        window.addEventListener('online', onOnlineHandler);
      }

      return new Promise<JoinResult>((resolve) => {
        let settled = false;
        let waitTimer: number | null = null;
        let hostGraceTimer: number | null = null;

        const finish = (res: JoinResult) => {
          if (settled) return;
          settled = true;
          if (waitTimer !== null) window.clearTimeout(waitTimer);
          if (hostGraceTimer !== null) window.clearTimeout(hostGraceTimer);
          if (!res.ok) {
            cleanup(false, true);
          } else {
            emitStatus('connected');
            for (const [peerSid, info] of knownPeers.entries()) {
              for (const cb of presenceCbs) cb(peerSid, info.role, true);
            }
          }
          resolve(res);
        };

        const handlePeerSeen = (peerSid: string, peerRole: RoomRole, peerJoinedAt: number) => {
          if (peerSid === sid) {
            // Same sid opened elsewhere with a newer timestamp -> replace self
            if (peerJoinedAt > myJoinedAt) {
              if (!settled) {
                finish({ ok: false, reason: 'replaced' });
              } else {
                cleanup(false, true);
              }
            }
            return;
          }

          if (!settled) {
            if (peerRole === me || (knownPeers.size >= 2 && !knownPeers.has(peerSid))) {
              finish({ ok: false, reason: 'full' });
              return;
            }
          }

          const wasPresent = knownPeers.has(peerSid);
          knownPeers.set(peerSid, { role: peerRole, joinedAt: peerJoinedAt });
          if (settled && !wasPresent) {
            for (const cb of presenceCbs) cb(peerSid, peerRole, true);
          }

          if (!settled && me === 'guest' && peerRole === 'host') {
            finish({ ok: true });
          }
        };

        if (channel) {
          channel.onmessage = (e: MessageEvent<WireEvent>) => {
            const data = e.data;
            if (!data || typeof data !== 'object' || dropped) return;

            if (data.kind === 'probe') {
              if (data.sid !== sid) {
                post({ kind: 'here', sid, role: me, joinedAt: myJoinedAt });
              }
              handlePeerSeen(data.sid, data.role, data.joinedAt);
              return;
            }

            if (data.kind === 'here') {
              handlePeerSeen(data.sid, data.role, data.joinedAt);
              return;
            }

            if (data.kind === 'gone') {
              if (data.sid === sid) return;
              if (knownPeers.delete(data.sid)) {
                for (const cb of presenceCbs) cb(data.sid, data.role, false);
              }
              return;
            }

            if (data.kind === 'msg') {
              if (data.sid === sid) return;
              const parsed = parseRoomMsg(data.payload);
              if (parsed) {
                for (const cb of msgCbs) cb(parsed);
              }
            }
          };
        }

        post({ kind: 'probe', sid, role: me, joinedAt: myJoinedAt });

        if (me === 'host') {
          hostGraceTimer = window.setTimeout(() => {
            finish({ ok: true });
          }, 120);
        } else {
          waitTimer = window.setTimeout(() => {
            finish({ ok: false, reason: 'no-host' });
          }, JOIN_TIMEOUT_MS);
        }
      });
    },

    send(body: RoomMsgBody) {
      if (!myRole || !mySid || !channel || dropped) return;
      seq = nextStoredSeq(mySid, seq);
      const msg = { v: 2 as const, seq, sid: mySid, ...body } as RoomMsg;
      post({ kind: 'msg', sid: mySid, payload: msg });
    },

    onMessage(cb) {
      msgCbs.add(cb);
      return () => {
        msgCbs.delete(cb);
      };
    },

    onPresence(cb) {
      presenceCbs.add(cb);
      return () => {
        presenceCbs.delete(cb);
      };
    },

    onStatus(cb) {
      statusCbs.add(cb);
      return () => {
        statusCbs.delete(cb);
      };
    },

    leave(sendBye: boolean) {
      cleanup(sendBye, true);
    },

    simulateDrop(ms: number) {
      if (!channel || !mySid || !myRole || dropped || typeof window === 'undefined') return;
      const sidSnap = mySid;
      const roleSnap = myRole;
      post({ kind: 'gone', sid: sidSnap, role: roleSnap });
      dropped = true;
      emitStatus('reconnecting');
      dropTimer = window.setTimeout(() => {
        dropTimer = null;
        if (!channel || mySid !== sidSnap) return;
        dropped = false;
        emitStatus('connected');
        post({ kind: 'probe', sid: sidSnap, role: roleSnap, joinedAt: myJoinedAt });
      }, ms);
    },
  };
}
