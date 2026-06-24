export function getReferer(request: Request, options: { fallback: string }) {
  return request.headers.get('referer') ?? options.fallback;
}

export { loadClientDetailObject } from './client-detail-object';
export {
  clientDetailLinkParams,
  decodeClientDetailObjectIdParam,
  encodeClientDetailObjectIdParam,
} from './client-detail-url';
