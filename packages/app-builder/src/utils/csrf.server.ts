import { timingSafeEqual } from 'node:crypto';
import { getCsrfCookie } from '@app-builder/repositories/SessionStorageRepositories/CsrfStorageRepository';
import { sign } from '@app-builder/repositories/SessionStorageRepositories/signed-cookie';
import { getServerEnv } from '@app-builder/utils/environment';
import { setCookie } from '@tanstack/react-start/server';

export { CsrfError } from './csrf';

import { CsrfError } from './csrf';

function isSecureRequest(request: Request): boolean {
  const proto = request.headers.get('x-forwarded-proto') ?? new URL(request.url).protocol;
  return proto === 'https:';
}

function getCsrfCookieForRequest(request: Request) {
  return getCsrfCookie({
    maxAge: Number(getServerEnv('SESSION_MAX_AGE')) || 43200,
    secrets: [getServerEnv('SESSION_SECRET')],
    secure: isSecureRequest(request),
  });
}

export async function commitCsrfToken(request: Request): Promise<string> {
  const cookie = getCsrfCookieForRequest(request);
  const existing = await cookie.parse(request.headers.get('cookie'));
  if (typeof existing === 'string' && existing.length > 0) {
    return existing;
  }

  const token = crypto.randomUUID();
  const secret = getServerEnv('SESSION_SECRET');
  const maxAge = Number(getServerEnv('SESSION_MAX_AGE')) || 43200;

  setCookie('csrf', sign(token, secret), {
    maxAge,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: isSecureRequest(request),
  });

  return token;
}

export async function validateCsrf(request: Request, formToken: string): Promise<void> {
  const cookie = getCsrfCookieForRequest(request);
  const cookieToken = (await cookie.parse(request.headers.get('cookie'))) ?? '';
  const a = Buffer.from(formToken);
  const b = Buffer.from(cookieToken);
  if (!a.length || a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new CsrfError();
  }
}
