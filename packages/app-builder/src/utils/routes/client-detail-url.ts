const B64_PREFIX = 'b64.';

function toBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(encoded: string): string {
  const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(base64 + padding);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** Encode an ingested object id for the client-detail route param. */
export function encodeClientDetailObjectIdParam(objectId: string): string {
  if (!objectId.includes('/') && !objectId.startsWith(B64_PREFIX)) {
    return objectId;
  }
  return `${B64_PREFIX}${toBase64Url(objectId)}`;
}

/** Decode the client-detail route param back to the ingested object id. */
export function decodeClientDetailObjectIdParam(objectIdParam: string): string {
  if (!objectIdParam.startsWith(B64_PREFIX)) {
    return objectIdParam;
  }
  return fromBase64Url(objectIdParam.slice(B64_PREFIX.length));
}

export function clientDetailLinkParams(objectType: string, objectId: string) {
  return { objectType, objectId: encodeClientDetailObjectIdParam(objectId) };
}
