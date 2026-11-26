import {
  getSupabase,
  type RealtimeChannel,
  type SupabaseClient,
} from '@/lib/supabase/client'
import { readEnv } from '@/lib/env'
import { createBroadcastTransport } from './localTransport'
import {
  parseRoomMsg,
  RECONNECT_GRACE_MS,
  type RoomMsg,
  type RoomMsgBody,
  type RoomRole,
} from './protocol'
import {
  JOIN_TIMEOUT_MS,
  nextStoredSeq,
  readStoredSeq,
  type ConnStatus,
  type JoinResult,
  type RoomTransport,
} from './transport'

const BACKOFF_MS = [1000, 2000, 4000, 8000] as const

interface PresenceMeta {
  readonly role?: RoomRole
  readonly joinedAt?: number
}

export function createSupabaseTransport(client: SupabaseClient): RoomTransport {
  let channel: RealtimeChannel | null = null
  let myCode: string | null = null
  let myRole: RoomRole | null = null
  let mySid: string | null = null
  let myJoinedAt = 0
  let seq = 0
  let retryTimer: number | null = null
  let retryAttempt = 0
  let disconnectStartedAt: number | null = null
  const knownPeers = new Map<string, RoomRole>()

  const msgCbs = new Set<(msg: RoomMsg) => void>()
  const presenceCbs = new Set<
    (sid: string, role: RoomRole, present: boolean) => void
  >()
  const statusCbs = new Set<(s: ConnStatus) => void>()

  const emitStatus = (s: ConnStatus) => {
    for (const cb of statusCbs) cb(s)
  }

  let onOnlineHandler: (() => void) | null = null
  let onOfflineHandler: (() => void) | null = null

  const detachNetListeners = () => {
    if (typeof window === 'undefined') return
    if (onOnlineHandler) window.removeEventListener('online', onOnlineHandler)
    if (onOfflineHandler)
      window.removeEventListener('offline', onOfflineHandler)
    onOnlineHandler = null
    onOfflineHandler = null
  }

  const clearRetry = () => {
    if (retryTimer !== null && typeof window !== 'undefined') {
      window.clearTimeout(retryTimer)
      retryTimer = null
    }
  }

  const cleanup = (sendBye: boolean, emitClosed: boolean) => {
    clearRetry()
    detachNetListeners()
    if (channel && mySid) {
      if (sendBye) {
        seq = nextStoredSeq(mySid, seq)
        const msg = {
          v: 2 as const,
          seq,
          sid: mySid,
          t: 'bye' as const,
        } as RoomMsg
        void channel.send({ type: 'broadcast', event: 'room', payload: msg })
      }
      void client.removeChannel(channel)
      channel = null
    }
    myCode = null
    myRole = null
    mySid = null
    retryAttempt = 0
    disconnectStartedAt = null
    knownPeers.clear()
    if (emitClosed) emitStatus('closed')
  }

  return {
    join(code, me, sid): Promise<JoinResult> {
      cleanup(false, false)
      emitStatus('connecting')
      myCode = code
      myRole = me
      mySid = sid
      seq = readStoredSeq(sid)
      myJoinedAt = Date.now()

      return new Promise<JoinResult>((resolve) => {
        let settled = false
        const joinTimer = window.setTimeout(() => {
          finish({ ok: false, reason: me === 'guest' ? 'no-host' : 'timeout' })
        }, JOIN_TIMEOUT_MS)

        const finish = (res: JoinResult) => {
          if (settled) return
          settled = true
          window.clearTimeout(joinTimer)
          if (!res.ok) {
            cleanup(false, true)
          } else {
            emitStatus('connected')
          }
          resolve(res)
        }

        const scheduleReconnect = () => {
          if (
            !settled ||
            !myCode ||
            !myRole ||
            !mySid ||
            typeof window === 'undefined'
          )
            return
          if (disconnectStartedAt === null) {
            disconnectStartedAt = Date.now()
          }
          if (Date.now() - disconnectStartedAt >= RECONNECT_GRACE_MS) {
            cleanup(false, true)
            return
          }
          emitStatus('reconnecting')
          clearRetry()
          const delay =
            BACKOFF_MS[Math.min(retryAttempt, BACKOFF_MS.length - 1)]
          retryAttempt += 1
          retryTimer = window.setTimeout(() => {
            retryTimer = null
            if (myCode && myRole && mySid) {
              subscribeChannel(myCode, myRole, mySid)
            }
          }, delay)
        }

        if (typeof window !== 'undefined') {
          onOfflineHandler = () => {
            if (settled) emitStatus('reconnecting')
          }
          onOnlineHandler = () => {
            if (
              settled &&
              disconnectStartedAt !== null &&
              myCode &&
              myRole &&
              mySid
            ) {
              clearRetry()
              subscribeChannel(myCode, myRole, mySid)
            }
          }
          window.addEventListener('offline', onOfflineHandler)
          window.addEventListener('online', onOnlineHandler)
        }

        const subscribeChannel = (
          targetCode: string,
          role: RoomRole,
          localSid: string
        ) => {
          if (channel) {
            void client.removeChannel(channel)
          }
          const ch = client.channel(`msz-room-${targetCode}`, {
            config: {
              broadcast: { self: false },
              presence: { key: localSid },
            },
          })
          channel = ch

          ch.on('broadcast', { event: 'room' }, ({ payload }) => {
            const parsed = parseRoomMsg(payload)
            if (parsed && parsed.sid !== localSid) {
              for (const cb of msgCbs) cb(parsed)
            }
          })

          ch.on('presence', { event: 'sync' }, () => {
            const state = ch.presenceState<PresenceMeta>()
            const currentOther = new Map<string, RoomRole>()
            let selfMaxJoined = myJoinedAt

            for (const [peerSid, metas] of Object.entries(state)) {
              const latest = metas[metas.length - 1]
              if (!latest?.role) continue
              if (peerSid === localSid) {
                for (const m of metas) {
                  if (
                    typeof m.joinedAt === 'number' &&
                    m.joinedAt > selfMaxJoined
                  ) {
                    selfMaxJoined = m.joinedAt
                  }
                }
                continue
              }
              currentOther.set(peerSid, latest.role)
            }

            if (selfMaxJoined > myJoinedAt) {
              if (!settled) {
                finish({ ok: false, reason: 'replaced' })
              } else {
                cleanup(false, true)
              }
              return
            }

            const sameRoleTaken = Array.from(currentOther.values()).some(
              (r) => r === role
            )
            if (!settled) {
              if (sameRoleTaken || currentOther.size >= 2) {
                finish({ ok: false, reason: 'full' })
                return
              }
              if (role === 'host') {
                finish({ ok: true })
              } else if (
                Array.from(currentOther.values()).some((r) => r === 'host')
              ) {
                finish({ ok: true })
              }
            }

            for (const [peerSid, peerRole] of currentOther.entries()) {
              if (!knownPeers.has(peerSid)) {
                knownPeers.set(peerSid, peerRole)
                for (const cb of presenceCbs) cb(peerSid, peerRole, true)
              }
            }
            for (const [oldSid, oldRole] of Array.from(knownPeers.entries())) {
              if (!currentOther.has(oldSid)) {
                knownPeers.delete(oldSid)
                for (const cb of presenceCbs) cb(oldSid, oldRole, false)
              }
            }
          })

          ch.subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              retryAttempt = 0
              disconnectStartedAt = null
              if (settled) emitStatus('connected')
              void ch.track({ role, joinedAt: myJoinedAt })
            } else if (
              status === 'CHANNEL_ERROR' ||
              status === 'TIMED_OUT' ||
              status === 'CLOSED'
            ) {
              if (!settled) {
                finish({ ok: false, reason: 'offline' })
              } else {
                scheduleReconnect()
              }
            }
          })
        }

        subscribeChannel(code, me, sid)
      })
    },

    send(body: RoomMsgBody) {
      if (!channel || !mySid) return
      seq = nextStoredSeq(mySid, seq)
      const msg = { v: 2 as const, seq, sid: mySid, ...body } as RoomMsg
      void channel.send({ type: 'broadcast', event: 'room', payload: msg })
    },

    onMessage(cb) {
      msgCbs.add(cb)
      return () => {
        msgCbs.delete(cb)
      }
    },

    onPresence(cb) {
      presenceCbs.add(cb)
      return () => {
        presenceCbs.delete(cb)
      }
    },

    onStatus(cb) {
      statusCbs.add(cb)
      return () => {
        statusCbs.delete(cb)
      }
    },

    leave(sendBye: boolean) {
      cleanup(sendBye, true)
    },
  }
}

export { isOnlineConfigured } from './online'

export function createRoomTransport(): RoomTransport | null {
  if (!readEnv().onlineRoom) return null
  if (import.meta.env.VITE_ROOM_TRANSPORT === 'local') {
    return createBroadcastTransport()
  }
  const client = getSupabase()
  if (!client) return null
  return createSupabaseTransport(client)
}
