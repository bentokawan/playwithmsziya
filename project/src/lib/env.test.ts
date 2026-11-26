import { describe, expect, it } from 'vitest'
import { readEnv } from './env'

describe('online room flag', () => {
  it('enables rooms only for the exact value 1', () => {
    expect(readEnv({ VITE_FEATURE_ONLINE_ROOM: '1' }).onlineRoom).toBe(true)
    expect(readEnv({}).onlineRoom).toBe(false)
    expect(readEnv({ VITE_FEATURE_ONLINE_ROOM: 'true' }).onlineRoom).toBe(false)
  })
})
