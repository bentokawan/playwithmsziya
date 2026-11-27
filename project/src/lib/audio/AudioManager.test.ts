import { describe, expect, it, vi } from 'vitest';
import { AudioManager } from './AudioManager';
import { BASE_GAINS, PHRASE_IDS, SFX_IDS, speechPath } from './manifest';

interface MockSource {
  buffer: AudioBuffer | null;
  started: boolean;
  stopped: boolean;
  onended: (() => void) | null;
  connect: ReturnType<typeof vi.fn>;
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
}

function createMockAudioEnv() {
  const gains: { gain: { value: number }; connect: ReturnType<typeof vi.fn> }[] = [];
  const sources: MockSource[] = [];

  const ctx = {
    state: 'running',
    destination: {},
    resume: vi.fn(async () => {}),
    suspend: vi.fn(async () => {}),
    close: vi.fn(async () => {}),
    createGain: vi.fn(() => {
      const g = { gain: { value: 1 }, connect: vi.fn() };
      gains.push(g);
      return g;
    }),
    createBufferSource: vi.fn(() => {
      const src: MockSource = {
        buffer: null,
        started: false,
        stopped: false,
        onended: null,
        connect: vi.fn(),
        start: vi.fn(() => {
          src.started = true;
        }),
        stop: vi.fn(() => {
          src.stopped = true;
        }),
      };
      sources.push(src);
      return src;
    }),
    createMediaElementSource: vi.fn(() => ({ connect: vi.fn() })),
    decodeAudioData: vi.fn(async () => ({ duration: 1 }) as AudioBuffer),
  };

  const mockFetch = vi.fn(async () => ({
    ok: true,
    arrayBuffer: async () => new ArrayBuffer(8),
  })) as unknown as typeof fetch;

  const createMediaElement = () =>
    ({
      crossOrigin: '',
      loop: false,
      preload: '',
      src: '',
      play: vi.fn(async () => {}),
      pause: vi.fn(),
    }) as unknown as HTMLAudioElement;

  return { ctx: ctx as unknown as AudioContext, gains, sources, mockFetch, createMediaElement };
}

async function flushMicrotasks() {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

describe('AudioManager', () => {
  it('throttles identical sfx within 80 ms', async () => {
    const env = createMockAudioEnv();
    let clock = 1000;
    const audio = new AudioManager({
      createContext: () => env.ctx,
      fetch: env.mockFetch,
      createMediaElement: env.createMediaElement,
      now: () => clock,
      isDev: false,
    });

    audio.sfx('tap');
    await flushMicrotasks();
    expect(env.sources).toHaveLength(1);

    clock += 50;
    audio.sfx('tap');
    await flushMicrotasks();
    expect(env.sources).toHaveLength(1);

    clock += 40;
    audio.sfx('tap');
    await flushMicrotasks();
    expect(env.sources).toHaveLength(2);
    audio.dispose();
  });

  it('ignores 4th concurrent SFX when 3 are already playing', async () => {
    const env = createMockAudioEnv();
    const audio = new AudioManager({
      createContext: () => env.ctx,
      fetch: env.mockFetch,
      createMediaElement: env.createMediaElement,
      now: () => 1000,
      isDev: false,
    });

    audio.sfx('tap');
    audio.sfx('select');
    audio.sfx('whoosh');
    await flushMicrotasks();
    expect(env.sources).toHaveLength(3);

    audio.sfx('correct');
    await flushMicrotasks();
    expect(env.sources).toHaveLength(3);

    env.sources[0].onended?.();
    audio.sfx('correct');
    await flushMicrotasks();
    expect(env.sources).toHaveLength(4);
    audio.dispose();
  });

  it('stops previous speech when a new speak() starts and ducks music to 0.4x', async () => {
    const env = createMockAudioEnv();
    const audio = new AudioManager({
      createContext: () => env.ctx,
      fetch: env.mockFetch,
      createMediaElement: env.createMediaElement,
      isDev: false,
    });

    const firstDone = audio.speak({ kind: 'num', locale: 'id', key: 1 });
    await flushMicrotasks();
    // gains order: [0]=master, [1]=music, [2]=ambient, [3]=sfx, [4]=speech
    expect(env.gains[1].gain.value).toBeCloseTo(BASE_GAINS.music * 0.4, 5);
    expect(env.sources).toHaveLength(1);

    const secondDone = audio.speak({ kind: 'num', locale: 'id', key: 2 });
    await flushMicrotasks();
    expect(env.sources[0].stopped).toBe(true);
    await firstDone;

    env.sources[1].onended?.();
    await secondDone;
    expect(env.gains[1].gain.value).toBeCloseTo(BASE_GAINS.music, 5);
    audio.dispose();
  });

  it('sets master gain to 0 when muted and mutes only music/ambient when musicOn=false', async () => {
    const env = createMockAudioEnv();
    const audio = new AudioManager({
      createContext: () => env.ctx,
      fetch: env.mockFetch,
      createMediaElement: env.createMediaElement,
      isDev: false,
    });
    await audio.unlock();

    audio.applyPrefs({ muted: true, musicOn: true, hijaiyyahNatureOnly: false });
    expect(env.gains[0].gain.value).toBe(0);

    audio.applyPrefs({ muted: false, musicOn: false, hijaiyyahNatureOnly: false });
    expect(env.gains[0].gain.value).toBe(1);
    expect(env.gains[1].gain.value).toBe(0);
    expect(env.gains[2].gain.value).toBe(0);
    expect(env.gains[3].gain.value).toBe(BASE_GAINS.sfx);
    audio.dispose();
  });

  it('resolves phrase speechPath and exposes phrase IDs and timer SFX IDs', () => {
    expect(speechPath({ kind: 'phrase', locale: 'id', key: 'try-again' })).toBe(
      '/audio/speech/id/phrase-try-again.mp3',
    );
    expect(speechPath({ kind: 'phrase', locale: 'en', key: 'your-turn' })).toBe(
      '/audio/speech/en/phrase-your-turn.mp3',
    );
    expect(PHRASE_IDS).toEqual([
      'count-together',
      'try-again',
      'great',
      'your-turn',
      'time-up',
      'ready-go',
    ]);
    expect(SFX_IDS).toContain('tick');
    expect(SFX_IDS).toContain('time-up');
    expect(SFX_IDS).toContain('go');
  });
});
