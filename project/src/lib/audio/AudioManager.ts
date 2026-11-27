import type { Preferences } from '@/app/providers/preferences';
import {
  ambientPath,
  BASE_GAINS,
  CORE_SFX,
  musicPath,
  sfxPath,
  speechPath,
  type AmbientId,
  type AudioApi,
  type MusicId,
  type SceneAudioRequest,
  type SfxId,
  type SpeechClip,
} from './manifest';

export interface AudioUrlResolver {
  sceneAudioUrl(id: `${'music' | 'ambient' | 'sfx'}:${string}`): string | null;
  speechUrl(clip: SpeechClip): string | null;
}

export interface AudioManagerDeps {
  readonly createContext?: () => AudioContext;
  readonly fetch?: typeof fetch;
  readonly createMediaElement?: () => HTMLAudioElement;
  readonly now?: () => number;
  readonly isDev?: boolean;
  readonly urlResolver?: AudioUrlResolver;
}

const SFX_THROTTLE_MS = 80;
const MAX_CONCURRENT_SFX = 3;
const DUCK_FACTOR = 0.4;

function defaultResolver(): AudioUrlResolver {
  return {
    sceneAudioUrl(id) {
      const [layer, key] = id.split(':');
      if (layer === 'music') return musicPath(key as MusicId);
      if (layer === 'ambient') return ambientPath(key as AmbientId);
      if (layer === 'sfx') return sfxPath(key as SfxId);
      return null;
    },
    speechUrl(clip) {
      return speechPath(clip);
    },
  };
}

function setGainValue(gain: GainNode | null, value: number): void {
  if (!gain) return;
  try {
    gain.gain.value = value;
  } catch {
    /* ignore audio param errors in mock environments */
  }
}

export class AudioManager implements AudioApi {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private speechGain: GainNode | null = null;

  private musicEl: HTMLAudioElement | null = null;
  private ambientEl: HTMLAudioElement | null = null;
  private currentMusicId: MusicId | null = null;
  private currentAmbientId: AmbientId | null = null;
  private currentScene: SceneAudioRequest = { music: null, ambient: null };

  private bufferCache = new Map<string, AudioBuffer>();
  private lastSfxTime = new Map<SfxId, number>();
  private activeSfx = new Set<{ source: AudioBufferSourceNode; isKids: boolean }>();

  private activeSpeechSource: AudioBufferSourceNode | null = null;
  private activeSpeechResolve: (() => void) | null = null;
  private ducked = false;

  private prefs: Pick<Preferences, 'muted' | 'musicOn' | 'hijaiyyahNatureOnly'> = {
    muted: false,
    musicOn: true,
    hijaiyyahNatureOnly: false,
  };

  private _unlocked = false;
  private disposed = false;
  private urlResolver: AudioUrlResolver;
  private readonly deps: {
    createContext: () => AudioContext;
    fetch: typeof fetch;
    createMediaElement: () => HTMLAudioElement;
    now: () => number;
    isDev: boolean;
  };

  private readonly onVisibilityChange = () => {
    if (typeof document === 'undefined' || !this.ctx) return;
    if (document.hidden) {
      void this.ctx.suspend?.().catch(() => {});
      this.musicEl?.pause();
      this.ambientEl?.pause();
    } else {
      void this.ctx.resume?.().catch(() => {});
      if (this.currentMusicId && this.shouldPlayMusic()) {
        void this.musicEl?.play?.().catch(() => {});
      }
      if (this.currentAmbientId && this.prefs.musicOn) {
        void this.ambientEl?.play?.().catch(() => {});
      }
    }
  };

  constructor(deps: AudioManagerDeps = {}) {
    this.deps = {
      createContext:
        deps.createContext ??
        (() => {
          const Ctor =
            globalThis.AudioContext ??
            (globalThis as unknown as { webkitAudioContext: typeof AudioContext })
              .webkitAudioContext;
          return new Ctor();
        }),
      fetch: deps.fetch ?? ((...args) => globalThis.fetch(...args)),
      createMediaElement: deps.createMediaElement ?? (() => new Audio()),
      now: deps.now ?? (() => Date.now()),
      isDev: deps.isDev ?? Boolean(import.meta.env?.DEV),
    };
    this.urlResolver = deps.urlResolver ?? defaultResolver();

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.onVisibilityChange);
    }
  }

  get unlocked(): boolean {
    if (typeof window !== 'undefined' && Boolean(window.__MSZ_TEST__)) return true;
    return this._unlocked;
  }

  setUrlResolver(resolver: AudioUrlResolver): void {
    this.urlResolver = resolver;
    // A scene requested before content loaded had no URL yet; start it now.
    this.ensureSceneMedia();
  }

  /**
   * (Re)starts the current scene's loops: creates elements whose URL was unknown when the
   * scene was set, and replays elements whose play() was blocked by the autoplay policy.
   */
  private ensureSceneMedia(): void {
    if (this.disposed) return;
    if (this.currentMusicId) {
      if (!this.musicEl) {
        const url = this.urlResolver.sceneAudioUrl(`music:${this.currentMusicId}`);
        if (url && this.ensureGraph() && this.musicGain) {
          this.musicEl = this.startMediaLoop(url, this.musicGain, this.currentScene.loop ?? true);
        }
      } else if (this.musicEl.paused && !this.musicEl.ended && this.shouldPlayMusic()) {
        void this.musicEl.play?.().catch(() => {});
      }
    }
    if (this.currentAmbientId) {
      if (!this.ambientEl) {
        const url = this.urlResolver.sceneAudioUrl(`ambient:${this.currentAmbientId}`);
        if (url && this.ensureGraph() && this.ambientGain) {
          this.ambientEl = this.startMediaLoop(url, this.ambientGain, true);
        }
      } else if (this.ambientEl.paused && this.prefs.musicOn) {
        void this.ambientEl.play?.().catch(() => {});
      }
    }
  }

  private ensureGraph(): boolean {
    if (this.disposed) return false;
    if (typeof window !== 'undefined' && Boolean(window.__MSZ_TEST__)) return false;
    if (this.ctx) return true;
    try {
      const ctx = this.deps.createContext();
      const master = ctx.createGain();
      const music = ctx.createGain();
      const ambient = ctx.createGain();
      const sfx = ctx.createGain();
      const speech = ctx.createGain();

      music.connect(master);
      ambient.connect(master);
      sfx.connect(master);
      speech.connect(master);
      master.connect(ctx.destination);

      this.ctx = ctx;
      this.masterGain = master;
      this.musicGain = music;
      this.ambientGain = ambient;
      this.sfxGain = sfx;
      this.speechGain = speech;

      this.syncGains();
      return true;
    } catch {
      return false;
    }
  }

  private shouldPlayMusic(): boolean {
    if (!this.prefs.musicOn) return false;
    if (this.prefs.hijaiyyahNatureOnly && this.currentScene.music === 'world-hijaiyyah') {
      return false;
    }
    return true;
  }

  private syncGains(): void {
    const master = this.prefs.muted ? 0 : 1;
    const duckMultiplier = this.ducked ? DUCK_FACTOR : 1;
    const musicTarget = this.shouldPlayMusic() ? BASE_GAINS.music * duckMultiplier : 0;
    const ambientTarget = this.prefs.musicOn ? BASE_GAINS.ambient * duckMultiplier : 0;

    setGainValue(this.masterGain, master);
    setGainValue(this.musicGain, musicTarget);
    setGainValue(this.ambientGain, ambientTarget);
    setGainValue(this.sfxGain, BASE_GAINS.sfx);
    setGainValue(this.speechGain, BASE_GAINS.speech);
  }

  applyPrefs(prefs: Pick<Preferences, 'muted' | 'musicOn' | 'hijaiyyahNatureOnly'>): void {
    this.prefs = {
      muted: prefs.muted,
      musicOn: prefs.musicOn,
      hijaiyyahNatureOnly: prefs.hijaiyyahNatureOnly,
    };
    this.syncGains();
  }

  async unlock(): Promise<void> {
    if (this.disposed) return;
    if (!this.ensureGraph()) return;
    try {
      if (this.ctx?.state === 'suspended') {
        await this.ctx.resume();
      }
      this._unlocked = true;
      this.ensureSceneMedia();
      for (const id of CORE_SFX) {
        const url = this.urlResolver.sceneAudioUrl(`sfx:${id}`);
        if (url) void this.loadBuffer(url);
      }
    } catch {
      /* ignore unlock errors */
    }
  }

  setScene(scene: SceneAudioRequest): void {
    if (this.disposed) return;
    this.currentScene = scene;

    const targetMusic =
      this.prefs.hijaiyyahNatureOnly && scene.music === 'world-hijaiyyah' ? null : scene.music;

    if (targetMusic !== this.currentMusicId) {
      this.musicEl?.pause();
      this.musicEl = null;
      this.currentMusicId = targetMusic;
      if (targetMusic && this.ensureGraph() && this.ctx && this.musicGain) {
        const url = this.urlResolver.sceneAudioUrl(`music:${targetMusic}`);
        if (url) {
          this.musicEl = this.startMediaLoop(url, this.musicGain, scene.loop ?? true);
        }
      }
    }

    if (scene.ambient !== this.currentAmbientId) {
      this.ambientEl?.pause();
      this.ambientEl = null;
      this.currentAmbientId = scene.ambient;
      if (scene.ambient && this.ensureGraph() && this.ctx && this.ambientGain) {
        const url = this.urlResolver.sceneAudioUrl(`ambient:${scene.ambient}`);
        if (url) {
          this.ambientEl = this.startMediaLoop(url, this.ambientGain, true);
        }
      }
    }

    this.syncGains();
  }

  private startMediaLoop(url: string, targetGain: GainNode, loop: boolean): HTMLAudioElement | null {
    if (!this.ctx) return null;
    try {
      const el = this.deps.createMediaElement();
      el.crossOrigin = 'anonymous';
      el.loop = loop;
      el.preload = 'auto';
      el.src = url;
      const node = this.ctx.createMediaElementSource(el);
      node.connect(targetGain);
      void el.play?.().catch(() => {});
      return el;
    } catch {
      return null;
    }
  }

  private async loadBuffer(url: string): Promise<AudioBuffer | null> {
    const cached = this.bufferCache.get(url);
    if (cached) return cached;
    if (!this.ctx) return null;
    try {
      const res = await this.deps.fetch(url);
      if (!res.ok) return null;
      const arr = await res.arrayBuffer();
      const buffer = await this.ctx.decodeAudioData(arr);
      this.bufferCache.set(url, buffer);
      return buffer;
    } catch {
      return null;
    }
  }

  sfx(id: SfxId): void {
    if (this.disposed || this.prefs.muted) return;
    const now = this.deps.now();
    const last = this.lastSfxTime.get(id);
    if (last !== undefined && now - last < SFX_THROTTLE_MS) return;
    if (this.activeSfx.size >= MAX_CONCURRENT_SFX) return;

    const isKids = id.startsWith('kids-');
    if (isKids) {
      for (const item of this.activeSfx) {
        if (item.isKids) return;
      }
    }

    const url = this.urlResolver.sceneAudioUrl(`sfx:${id}`);
    if (!url || !this.ensureGraph() || !this.ctx || !this.sfxGain) return;

    this.lastSfxTime.set(id, now);
    void this.playSfxBuffer(url, isKids);
  }

  private async playSfxBuffer(url: string, isKids: boolean): Promise<void> {
    if (this.activeSfx.size >= MAX_CONCURRENT_SFX) return;
    const buffer = await this.loadBuffer(url);
    if (!buffer || !this.ctx || !this.sfxGain || this.disposed) return;
    if (this.activeSfx.size >= MAX_CONCURRENT_SFX) return;

    try {
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.sfxGain);
      const entry = { source, isKids };
      this.activeSfx.add(entry);
      source.onended = () => {
        this.activeSfx.delete(entry);
      };
      source.start(0);
    } catch {
      /* ignore playback failure */
    }
  }

  async speak(clip: SpeechClip): Promise<void> {
    if (this.disposed) return;
    if (typeof window !== 'undefined' && Boolean(window.__MSZ_TEST__)) return;
    this.stopSpeech();

    const url = this.urlResolver.speechUrl(clip);
    if (!url) {
      this.devSpeakFallback(clip, speechPath(clip));
      return;
    }

    if (!this.ensureGraph() || !this.ctx || !this.speechGain) return;

    const buffer = await this.loadBuffer(url);
    if (!buffer) {
      this.devSpeakFallback(clip, url);
      return;
    }
    if (this.disposed || !this.ctx || !this.speechGain) return;

    this.ducked = true;
    this.syncGains();

    return new Promise<void>((resolve) => {
      try {
        const source = this.ctx!.createBufferSource();
        source.buffer = buffer;
        source.connect(this.speechGain!);
        this.activeSpeechSource = source;
        this.activeSpeechResolve = resolve;
        source.onended = () => {
          if (this.activeSpeechSource === source) {
            this.activeSpeechSource = null;
            this.activeSpeechResolve = null;
            this.ducked = false;
            this.syncGains();
          }
          resolve();
        };
        source.start(0);
      } catch {
        this.ducked = false;
        this.syncGains();
        resolve();
      }
    });
  }

  private devSpeakFallback(clip: SpeechClip, missingPath: string): void {
    if (!this.deps.isDev) return;
    console.warn('[audio] missing', missingPath);
    if (this.prefs.muted || typeof globalThis.speechSynthesis === 'undefined') return;
    try {
      globalThis.speechSynthesis.cancel();
      const text = clip.kind === 'hija' ? clip.key : String(clip.key);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang =
        clip.kind === 'hija' ? 'ar-SA' : clip.locale === 'en' ? 'en-US' : 'id-ID';
      globalThis.speechSynthesis.speak(utterance);
    } catch {
      /* ignore speechSynthesis failures */
    }
  }

  stopSpeech(): void {
    if (this.activeSpeechSource) {
      const source = this.activeSpeechSource;
      const resolve = this.activeSpeechResolve;
      this.activeSpeechSource = null;
      this.activeSpeechResolve = null;
      try {
        source.stop();
      } catch {
        /* already stopped */
      }
      this.ducked = false;
      this.syncGains();
      resolve?.();
    }
  }

  preloadSpeech(clips: readonly SpeechClip[]): void {
    if (!this.ensureGraph()) return;
    for (const clip of clips) {
      const url = this.urlResolver.speechUrl(clip);
      if (url) void this.loadBuffer(url);
    }
  }

  dispose(): void {
    this.disposed = true;
    this.stopSpeech();
    this.musicEl?.pause();
    this.ambientEl?.pause();
    for (const item of this.activeSfx) {
      try {
        item.source.stop();
      } catch {
        /* ignore */
      }
    }
    this.activeSfx.clear();
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.onVisibilityChange);
    }
    void this.ctx?.close?.().catch(() => {});
    this.ctx = null;
  }
}
