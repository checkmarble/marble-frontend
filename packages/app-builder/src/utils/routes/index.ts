import { type routes } from './routes';

/**
 * Inspiration and some utility types are taken from https://github.com/swan-io/chicane/blob/main/src/types.ts
 */

type Route = {
  readonly id: string;
  readonly path?: string;
  children?: readonly Route[];
};

type JoinPath<
  Prefix extends string | undefined,
  Path extends string | undefined
> = Prefix extends string
  ? Path extends string
    ? `${Prefix}/${Path}`
    : Prefix
  : Path extends string
  ? Path
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

type GetRoutesIds<T extends readonly Route[]> = T extends readonly [
  infer Head,
  ...infer Tail
]
  ? [
      ...(Head extends Route
        ? [
            Head['id'],
            ...(Head['children'] extends readonly Route[]
              ? GetRoutesIds<Head['children']>
              : [])
          ]
        : []),
      ...(Tail extends readonly Route[] ? GetRoutesIds<Tail> : [])
    ]
  : [];

export type RouteIDs = GetRoutesIds<typeof routes>[number];

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
