export function readContentBaseUrl(override?: string | null): string | null {
  const raw = override !== undefined ? override : import.meta.env.VITE_CONTENT_BASE_URL;
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed.replace(/\/+$/, '') : null;
}
