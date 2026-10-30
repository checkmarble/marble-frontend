import { type AppConfigDto } from 'marble-api';

export type AuthProvider = AppConfigDto['auth']['providers'][number];

/**
 * How users sign in, derived from the providers the backend announces:
 * - `firebase`: Google, Microsoft and email/password through Firebase
 * - `oidc-legacy`: a single OpenID Connect provider configured for the whole deployment
 * - `firebase-oidc`: per-tenant OpenID Connect found from the email domain, Firebase otherwise
 */
export type AuthMode = 'firebase' | 'oidc-legacy' | 'firebase-oidc';

const AUTH_MODES: { mode: AuthMode; providers: AuthProvider[] }[] = [
  { mode: 'firebase', providers: ['firebase'] },
  { mode: 'oidc-legacy', providers: ['oidc-legacy'] },
  { mode: 'firebase-oidc', providers: ['firebase', 'oidc'] },
];

/** Returns `null` for any other combination: the deployment is misconfigured. */
export function getAuthMode(providers: readonly AuthProvider[]): AuthMode | null {
  const announced = new Set(providers);
  const match = AUTH_MODES.find(
    ({ providers: expected }) =>
      expected.length === announced.size && expected.every((provider) => announced.has(provider)),
  );
  return match?.mode ?? null;
}
