import { type RouteID, type RoutePath } from './types';

export { type RouteID };

type NonEmptySplit<
  Value extends string,
  Separator extends string,
> = Value extends `${infer Head}${Separator}${infer Tail}`
  ? Head extends ''
    ? NonEmptySplit<Tail, Separator>
    : [Head, ...NonEmptySplit<Tail, Separator>]
  : Value extends ''
    ? []
    : [Value];

export type GetPathParams<
  Path extends string,
  Parts = NonEmptySplit<Path, '/'>,
> = Parts extends [infer Head, ...infer Tail]
  ? Head extends `:${infer Name}`
    ? { [K in Name]: string } & GetPathParams<Path, Tail>
    : GetPathParams<Path, Tail>
  : // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    {};

export function getRoute<Path extends RoutePath>(
  path: Path,
  ...args: GetPathParams<Path> extends Record<string, never>
    ? []
    : [params: GetPathParams<Path>]
) {
  const params = args.length === 1 ? args[0] : {};
  return path
    .split('/')
    .map((part) => {
      const isParam = part.startsWith(':');
      //@ts-expect-error part is ensured by TS to be present in params here
      return isParam ? params[part.slice(1)] : part;
    })
    .map(encodeURIComponent)
    .join('/');
}

export function getReferer(request: Request, options: { fallback: string }) {
  return request.headers.get('referer') ?? options.fallback;
}
