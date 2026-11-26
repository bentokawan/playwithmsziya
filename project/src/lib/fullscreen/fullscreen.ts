export function isFullscreenSupported(): boolean {
  return typeof document !== 'undefined' && Boolean(document.fullscreenEnabled);
}

export function isFullscreenActive(): boolean {
  return typeof document !== 'undefined' && Boolean(document.fullscreenElement);
}

export async function toggleFullscreen(): Promise<boolean> {
  if (!isFullscreenSupported()) return false;
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen();
    }
  } catch {
    /* ignore browser fullscreen rejection */
  }
  return Boolean(document.fullscreenElement);
}
