import { createHmac, timingSafeEqual } from 'node:crypto';

export function sign(value: string, secret: string): string {
  return `${value}.${createHmac('sha256', secret).update(value).digest('base64url')}`;
}

function unsign(signed: string, secret: string): string | false {
  const i = signed.lastIndexOf('.');
  if (i === -1) return false;
  const value = signed.slice(0, i);
  const expected = Buffer.from(sign(value, secret));
  const actual = Buffer.from(signed);
  return expected.byteLength === actual.byteLength && timingSafeEqual(expected, actual) ? value : false;
}

function parseCookieHeader(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(';')) {
    const eqIdx = part.indexOf('=');
    if (eqIdx === -1) continue;
    const key = part.slice(0, eqIdx).trim();
    if (key !== name) continue;
    return decodeURIComponent(part.slice(eqIdx + 1).trim());
  }
  return null;
}

export interface SignedCookieOptions {
  name: string;
  maxAge?: number;
  path?: string;
  httpOnly?: boolean;
  sameSite?: 'lax' | 'strict' | 'none';
  secure?: boolean;
  secrets?: string[];
}

export function createSignedCookie({ name, secrets = [], ...attrs }: SignedCookieOptions) {
  return {
    name,
    isSigned: secrets.length > 0,
    async parse(cookieHeader: string | null): Promise<string | null> {
      const raw = parseCookieHeader(cookieHeader, name);
      if (!raw) return null;
      if (secrets.length === 0) return raw;
      for (const secret of secrets) {
        const value = unsign(raw, secret);
        if (value !== false) return value;
      }
      return null;
    },
    async serialize(value: string, overrides?: { maxAge?: number }): Promise<string> {
      const signed = secrets.length > 0 ? sign(value, secrets[0]!) : value;
      let cookie = `${name}=${encodeURIComponent(signed)}`;
      const maxAge = overrides?.maxAge ?? attrs.maxAge;
      if (maxAge !== undefined) cookie += `; Max-Age=${maxAge}`;
      if (attrs.path) cookie += `; Path=${attrs.path}`;
      if (attrs.httpOnly) cookie += `; HttpOnly`;
      if (attrs.sameSite) {
        cookie += `; SameSite=${attrs.sameSite.charAt(0).toUpperCase()}${attrs.sameSite.slice(1)}`;
      }
      if (attrs.secure) cookie += `; Secure`;
      return cookie;
    },
  };
}
