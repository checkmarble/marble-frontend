import type { routes } from './routes';

/**
 * Inspiration and some utility types are taken from https://github.com/swan-io/chicane/blob/main/src/types.ts
 */

type Route = {
  readonly id: string;
  readonly path?: string;
  readonly file: string;
  children?: readonly Route[];
};

type JoinPath<
  Prefix extends string | undefined,
  Path extends string | undefined
> = Path extends string
  ? Prefix extends string
    ? `${Prefix}/${Path}`
    : Path
  : '';

type GetRoutePaths<
  T extends Route,
  Prefix extends string | undefined = undefined
> = [
  JoinPath<Prefix, T['path']>,
  ...(T['children'] extends readonly Route[]
    ? GetRoutesPaths<T['children'], JoinPath<Prefix, T['path']>>
    : [])
];

type GetRoutesPaths<
  T extends readonly Route[],
  Prefix extends string | undefined = undefined
> = T extends readonly [infer Head, ...infer Tail]
  ? [
      ...(Head extends Route ? GetRoutePaths<Head, Prefix> : []),
      ...(Tail extends readonly Route[] ? GetRoutesPaths<Tail, Prefix> : [])
    ]
  : [];

export type Paths = GetRoutesPaths<typeof routes>;

type NonEmptySplit<
  Value extends string,
  Separator extends string
> = Value extends `${infer Head}${Separator}${infer Tail}`
  ? Head extends ''
    ? NonEmptySplit<Tail, Separator>
    : [Head, ...NonEmptySplit<Tail, Separator>]
  : Value extends ''
  ? []
  : [Value];

export type GetPathParams<
  Path extends string,
  Parts = NonEmptySplit<Path, '/'>
> = Parts extends [infer Head, ...infer Tail]
  ? Head extends `:${infer Name}`
    ? { [K in Name]: string } & GetPathParams<Path, Tail>
    : GetPathParams<Path, Tail>
  : {}; // eslint-disable-line @typescript-eslint/ban-types

export function getRoute<Path extends Paths[number]>(
  path: Path,
  ...params: GetPathParams<Path> extends Record<string, never>
    ? []
    : [params: GetPathParams<Path>]
) {
  return path
    .split('/')
    .filter((value) => value !== '')
    .map((part) => {
      const isParam = part.startsWith(':');
      //@ts-expect-error part is ensured by TS to be present in params here
      return isParam ? params[part] : part;
    })
    .map(encodeURIComponent)
    .join('/');
}

export function getReferer(request: Request) {
  return request.headers.get('referer');
}
