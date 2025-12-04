export function getLocalStorageItem<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setLocalStorageItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function removeLocalStorageItem(key: string): void {
  localStorage.removeItem(key);
}
