let requested = false

export async function requestPersistentStorage(): Promise<boolean> {
  if (requested) return false
  requested = true
  try {
    return (await navigator.storage?.persist?.()) ?? false
  } catch {
    return false
  }
}
