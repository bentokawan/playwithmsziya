import bundled from './bundledFiles.json';

export const BUNDLED_AUDIO_FILES: ReadonlySet<string> = new Set(bundled.files);
