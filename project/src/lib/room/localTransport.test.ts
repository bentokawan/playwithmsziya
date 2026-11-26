import { describe, expect, it } from 'vitest';
import { createLoopbackHub, createLoopbackPair } from './localTransport';
import type { RoomMsg, RoomRole } from './protocol';
import type { ConnStatus } from './transport';

describe('localTransport v2 (Task 2)', () => {
  it('increments seq monotonically across simulateDrop and updates peer presence', async () => {
    const [host, guest] = createLoopbackPair();
    const received: RoomMsg[] = [];
    const hostPresence: Array<{ sid: string; role: RoomRole; present: boolean }> = [];
    const guestStatus: ConnStatus[] = [];

    host.onMessage((msg) => received.push(msg));
    host.onPresence((sid, role, present) => hostPresence.push({ sid, role, present }));
    guest.onStatus((s) => guestStatus.push(s));

    expect(await host.join('1234', 'host', 's-host')).toEqual({ ok: true });
    expect(await guest.join('1234', 'guest', 's-guest')).toEqual({ ok: true });

    guest.send({ t: 'ready', ready: true });
    expect(received).toHaveLength(1);
    expect(received[0].seq).toBe(1);

    guest.simulateDrop?.(40);
    expect(guestStatus).toContain('reconnecting');
    expect(hostPresence.at(-1)).toEqual({ sid: 's-guest', role: 'guest', present: false });

    await new Promise((r) => setTimeout(r, 70));
    expect(hostPresence.at(-1)).toEqual({ sid: 's-guest', role: 'guest', present: true });

    guest.send({ t: 'ready', ready: false });
    expect(received).toHaveLength(2);
    expect(received[1].seq).toBe(2);

    guest.leave(true);
    expect(received.at(-1)).toMatchObject({ t: 'bye', sid: 's-guest', seq: 3 });

    host.leave(false);
  });

  it('rejects 3rd client with full and replaces older instance with identical sid', async () => {
    const hub = createLoopbackHub();
    const host = hub.createClient();
    const guest = hub.createClient();
    const third = hub.createClient();
    const guestClone = hub.createClient();

    const guestStatuses: ConnStatus[] = [];
    guest.onStatus((s) => guestStatuses.push(s));

    expect(await host.join('5678', 'host', 's-host')).toEqual({ ok: true });
    expect(await guest.join('5678', 'guest', 's-guest')).toEqual({ ok: true });
    expect(await third.join('5678', 'guest', 's-third')).toEqual({ ok: false, reason: 'full' });

    // Rejoin with same sid replaces previous guest client and marks old client closed
    expect(await guestClone.join('5678', 'guest', 's-guest')).toEqual({ ok: true });
    expect(guestStatuses.at(-1)).toBe('closed');

    host.leave(false);
    guestClone.leave(false);
  });
});
