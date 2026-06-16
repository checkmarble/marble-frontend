import { type AppConfig } from '@app-builder/models/app-config';

interface FirebaseSecureTokenResponse {
  id_token: string;
  refresh_token: string;
  expires_in: string;
}

/**
 * Exchange a long-lived Firebase refresh token for a fresh Firebase ID token,
 * using the Secure Token REST API. This lets the server mint a new ID token
 * during SSR (without a browser), which is then exchanged for a new Marble
 * token at the `/token` endpoint — the same way the OIDC refresh flow works.
 *
 * @see https://firebase.google.com/docs/reference/rest/auth#section-refresh-token
 */
export async function refreshFirebaseIdToken(
  config: AppConfig,
  refreshToken: string,
): Promise<{ idToken: string; refreshToken: string }> {
  const firebase = config.auth.firebase;
  const apiKey = firebase.apiKey ?? 'fake-api-key';

  // The Firebase Auth emulator serves the Secure Token API under its own host.
  const baseUrl = firebase.isEmulator
    ? `${firebase.emulatorUrl}/securetoken.googleapis.com`
    : 'https://securetoken.googleapis.com';

  const response = await fetch(`${baseUrl}/v1/token?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }),
  });

  if (!response.ok) {
    throw new Error(`Firebase token refresh failed with status ${response.status}`);
  }

  const data = (await response.json()) as FirebaseSecureTokenResponse;
  return { idToken: data.id_token, refreshToken: data.refresh_token };
}
