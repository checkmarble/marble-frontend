export function getReferer(request: Request, options: { fallback: string }) {
  return request.headers.get('referer') ?? options.fallback;
}
