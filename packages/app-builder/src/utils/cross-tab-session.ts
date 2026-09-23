const SIGNED_OUT_PARAM = 'signedOut';

export const ORGANIZATION_CHANGE_CHANNEL = 'marble:organization-change';

interface CrossTabUser {
  organizationId: string;
  email?: string;
}

export type CrossTabSessionAction = 'logout' | 'organization-change' | 'none';

// Email identifies the person across organizations. A membership id changes when
// the same person moves to another organization, so it cannot decide logout.
export function resolveCrossTabSession(current: CrossTabUser, session: CrossTabUser): CrossTabSessionAction {
  if (isDifferentUser(current.email, session.email)) return 'logout';
  if (current.organizationId !== session.organizationId) return 'organization-change';
  return 'none';
}

export function signedOutTabHref() {
  return `/sign-in?${SIGNED_OUT_PARAM}=1`;
}

export function preserveSignedOut(href: string, signedOut: boolean) {
  if (!signedOut) return href;
  const separator = href.includes('?') ? '&' : '?';
  return `${href}${separator}${SIGNED_OUT_PARAM}=1`;
}

export function isSignedOutTabRequest(url: URL) {
  return url.searchParams.get(SIGNED_OUT_PARAM) === '1';
}

export function notifyOtherTabsToCheckSession() {
  if (typeof BroadcastChannel === 'undefined') return;
  const channel = new BroadcastChannel(ORGANIZATION_CHANGE_CHANNEL);
  channel.postMessage({ status: 'check', sourceTabId: crypto.randomUUID() });
  channel.close();
}

function isDifferentUser(currentEmail: string | undefined, sessionEmail: string | undefined) {
  const current = normalizeEmail(currentEmail);
  const session = normalizeEmail(sessionEmail);
  if (!current || !session) return false;
  return current !== session;
}

function normalizeEmail(email: string | undefined) {
  const normalized = email?.trim().toLowerCase();
  return normalized ? normalized : undefined;
}
