/**
 * Validates that a redirect URL is safe (relative, not external).
 * Returns the defaultRedirect if the URL is null, empty, or external.
 */
export function safeRedirect(to: string | null | undefined, defaultRedirect: string): string {
  if (!to || typeof to !== 'string') return defaultRedirect;
  // Read it as a browser does, which drops tabs and newlines and treats a backslash as a slash.
  const normalized = to.replace(/[\t\n\r]/g, '').replace(/\\/g, '/');
  if (!normalized.startsWith('/') || normalized.startsWith('//')) return defaultRedirect;
  return to;
}
