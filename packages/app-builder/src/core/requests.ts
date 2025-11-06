export type GlobalMiddlewares = import('@app-builder/core/middleware-config').MiddlewareConfig['GlobalMiddlewares'];

import type {
  DataReturnType,
  DataWithOptions,
  ExecutionEnvironment,
  Expand,
  HeaderEntry,
  MergeMiddlewareContext,
  MiddlewareFunction,
  MiddlewareObject,
  NextFunction,
  NextFunctionArgs,
  RemixDataFunctionArgs,
  ServerFunction,
  TypedResponse,
} from './middleware-types';

let globalMiddlewares: readonly MiddlewareObject[] = [];

const isDataWithOptions = (data: any): data is DataWithOptions<any> => {
  return data instanceof Object && '__dataObject' in data && data.__dataObject;
};

function createDataReturnType(
  res: unknown,
  context: Record<string, unknown>,
  storedHeaders: HeaderEntry[],
): DataReturnType<any, any> {
  const isResDataObject = isDataWithOptions(res);
  const data = isResDataObject ? res.data : res;
  const resHeaders = isResDataObject ? res.headers : [];
  const headers = [...storedHeaders, ...(resHeaders ?? [])];

  return {
    data,
    pushHeader(name, value) {
      headers.push([name, value]);
    },
    __context: context,
    __headers: headers,
  };
}

function createExecutionEnvironment(request: Request, params: Record<string, string>): ExecutionEnvironment {
  return {
    queue: new Map(),
    request,
    params,
    context: {},
  };
}

function appendToHeaders(headers: Headers, entries: HeaderEntry[]): Headers {
  for (const [key, value] of entries) {
    headers.append(key, value);
  }
  return headers;
}

function buildResponse(ret: DataReturnType<any, any>): TypedResponse<any> {
  if (ret.data instanceof Response) {
    return ret.data;
  }

  const headers = appendToHeaders(new Headers(), ret.__headers);
  return Response.json(ret.data, { headers });
}

function createMiddlewareCallbable(object: MiddlewareObject, env: ExecutionEnvironment, next: NextFunction) {
  // Create a env specific to middleware queue to not pollute the global request one
  const middlewareCtx = { value: {} };
  const onMiddlewareNext = (nextArgs?: NextFunctionArgs<any>) => {
    middlewareCtx.value = { ...middlewareCtx.value, ...nextArgs?.context };
  };

  const finalMiddleware: NextFunction = async (args): Promise<DataReturnType<any, any>> => {
    onMiddlewareNext(args);
    return object.fn(
      {
        request: env.request,
        params: env.params,
        context: { ...env.context, ...middlewareCtx.value },
      },
      next,
      (res: unknown) => {
        return createDataReturnType(res, middlewareCtx.value, args?.headers ?? []);
      },
    );
  };

  return createMiddlewareChain(object.deps, env, onMiddlewareNext, finalMiddleware);
}

function createServerFunctionCallable(
  middlewares: readonly MiddlewareObject[],
  env: ExecutionEnvironment,
  fn: ServerFunction<any, any>,
) {
  const fnCtx = { value: {} };
  const onGlobalNext = (nextArgs?: NextFunctionArgs<any>) => {
    env.context = { ...env.context, ...nextArgs?.context };
  };
  const onFnNext = (nextArgs?: NextFunctionArgs<any>) => {
    fnCtx.value = { ...fnCtx.value, ...nextArgs?.context };
  };

  const final: NextFunction = async (args): Promise<DataReturnType<any, any>> => {
    onFnNext(args);
    const res = await fn({
      request: env.request,
      params: env.params,
      context: { ...env.context, ...fnCtx.value },
    });
    return createDataReturnType(res, fnCtx.value, args?.headers ?? []);
  };

  const routeMiddlewareChain = createMiddlewareChain(middlewares, env, onFnNext, final);
  const globalMiddlewareChain = createMiddlewareChain(globalMiddlewares, env, onGlobalNext, (nextArgs) => {
    onGlobalNext(nextArgs);
    return routeMiddlewareChain();
  });

  return globalMiddlewareChain;
}

function createMiddlewareChain(
  middlewares: readonly MiddlewareObject[],
  env: ExecutionEnvironment,
  onNext: (nextArgs?: NextFunctionArgs<any>) => void,
  // globalEnv: ExecutionEnvironment | undefined,
  final: NextFunction,
): NextFunction {
  return middlewares.reduceRight<NextFunction>((nextFn, middleware) => {
    return async (args) => {
      onNext(args);

      const queueItem = env.queue.get(middleware.fn);
      if (queueItem) {
        return nextFn(queueItem.data);
      }

      const callable = createMiddlewareCallbable(middleware, env, (nextArgs) => {
        env.queue.set(middleware.fn, { data: nextArgs });
        return nextFn(nextArgs);
      });

      return callable();
    };
  }, final);
}

export function createServerFn<T extends readonly MiddlewareObject[], Ret>(
  middlewares: readonly [...T],
  fn: ServerFunction<Expand<MergeMiddlewareContext<[...GlobalMiddlewares, ...T]>>, Ret>,
) {
  return async (args: RemixDataFunctionArgs): Promise<TypedResponse<Ret>> => {
    const env = createExecutionEnvironment(args.request, args.params);
    const callable = createServerFunctionCallable(middlewares, env, fn);

    const ret = await callable();
    return buildResponse(ret);
  };
}

export function createMiddleware<T extends readonly MiddlewareObject[], TOutContext>(
  middlewares: readonly [...T],
  fn: MiddlewareFunction<Expand<MergeMiddlewareContext<T>>, TOutContext>,
): MiddlewareObject<any, TOutContext> {
  return { deps: middlewares, fn: fn as any };
}

export function createMiddlewareWithGlobalContext<T extends readonly MiddlewareObject[], TOutContext>(
  middlewares: readonly [...T],
  fn: MiddlewareFunction<Expand<MergeMiddlewareContext<[...GlobalMiddlewares, ...T]>>, TOutContext>,
): MiddlewareObject<any, TOutContext> {
  return createMiddleware(middlewares, fn as any);
}

export function setGlobalMiddlewares<T extends readonly MiddlewareObject[]>(...middlewares: T) {
  globalMiddlewares = middlewares;
  return middlewares;
}

export function cleanGlobalMiddlewares() {
  globalMiddlewares = [];
}

export function data<TData>(data: TData, headers?: HeaderEntry[]): DataWithOptions<TData> {
  return {
    __dataObject: true,
    data,
    headers,
  };
}
