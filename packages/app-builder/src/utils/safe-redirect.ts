/**
 * Validates that a redirect URL is safe (relative, not external).
 * Returns the defaultRedirect if the URL is null, empty, or external.
 */
export function safeRedirect(to: string | null | undefined, defaultRedirect: string): string {
  if (!to || typeof to !== 'string') return defaultRedirect;
  if (!to.startsWith('/') || to.startsWith('//')) return defaultRedirect;
  return to;
}
