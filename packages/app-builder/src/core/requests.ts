export type GlobalMiddlewares =
  import('@app-builder/core/middleware-config').MiddlewareConfig['GlobalMiddlewares'];

import type {
  DataReturnType,
  ExecutionEnvironment,
  ExecutionEnvironmentQueueItem,
  Expand,
  MergeMiddlewareContext,
  MiddlewareFunction,
  MiddlewareObject,
  NextFunction,
  RemixDataFunctionArgs,
  ServerFunction,
} from './middleware-types';

let globalMiddlewares: readonly MiddlewareObject[] = [];

function createMiddlewareCallbable(
  object: MiddlewareObject,
  env: ExecutionEnvironment,
  globalEnv: ExecutionEnvironment | undefined,
  next: NextFunction,
) {
  // Create a env specific to middleware queue to not pollute the global request one
  const middlewareEnv = createExecutionEnvironment(env);
  middlewareEnv.ctx.context = { ...globalEnv?.ctx.context };

  const finalMiddleware: NextFunction = async (args): Promise<DataReturnType<any, any>> => {
    middlewareEnv.ctx.context = { ...middlewareEnv.ctx.context, ...args?.context };
    return object.fn(middlewareEnv.ctx, next);
  };

  return createMiddlewareChain(object.deps, middlewareEnv, globalEnv, finalMiddleware);
}

function createServerFunctionCallable(
  middlewares: readonly MiddlewareObject[],
  env: ExecutionEnvironment,
  fn: ServerFunction<any, any>,
) {
  const final: NextFunction = async (args): Promise<DataReturnType<any, any>> => {
    env.ctx.context = { ...env.ctx.context, ...args?.context };
    const res = await fn(env.ctx);
    const data =
      res instanceof Object && '__dataObject' in res && res.__dataObject ? res.data : res;

    return {
      data,
      __context: env.ctx.context,
      __headers: [...(args?.headers ?? []), ...(res.headers ?? [])],
    };
  };

  const globalEnv = createExecutionEnvironment(env);

  const routeMiddlewareChain = createMiddlewareChain(middlewares, env, globalEnv, final);
  const globalMiddlewareChain = createMiddlewareChain(
    globalMiddlewares,
    globalEnv,
    undefined,
    (nextArgs) => {
      globalEnv.ctx.context = { ...globalEnv.ctx.context, ...nextArgs?.context };
      return routeMiddlewareChain();
    },
  );

  return globalMiddlewareChain;
}

function createMiddlewareChain(
  middlewares: readonly MiddlewareObject[],
  env: ExecutionEnvironment,
  globalEnv: ExecutionEnvironment | undefined,
  final: NextFunction,
): NextFunction {
  return middlewares.reduceRight<NextFunction>((nextFn, middleware) => {
    return async (args) => {
      env.ctx.context = { ...env.ctx.context, ...args?.context };

      const queueItem = env.queue.get(middleware.fn);
      if (queueItem) {
        return nextFn(queueItem.data);
      }

      const callable = createMiddlewareCallbable(middleware, env, globalEnv, (nextArgs) => {
        env.queue.set(middleware.fn, { data: nextArgs });
        return nextFn(nextArgs);
      });

      return callable();
    };
  }, final);
}

function createExecutionEnvironment(
  ...args: [ExecutionEnvironment] | [Request, Record<string, string>]
): ExecutionEnvironment {
  if (args[0] instanceof Request) {
    return {
      queue: new Map<Function, ExecutionEnvironmentQueueItem>(),
      ctx: { context: {}, request: args[0], params: args[1] ?? {} },
    };
  }

  return {
    queue: args[0].queue,
    ctx: { ...args[0].ctx, context: {} },
  };
}

function buildResponse(ret: DataReturnType<any, any>) {
  const headers = new Headers();
  for (const [key, value] of ret.__headers) {
    headers.append(key, value);
  }
  return Response.json(ret.data, { headers });
}

export function createServerFn<T extends readonly MiddlewareObject[], Ret>(
  middlewares: readonly [...T],
  fn: ServerFunction<Expand<MergeMiddlewareContext<[...GlobalMiddlewares, ...T]>>, Ret>,
) {
  return async (args: RemixDataFunctionArgs): Promise<Response> => {
    const env = createExecutionEnvironment(args.request, args.params);
    const middlewareChain = createServerFunctionCallable(middlewares, env, fn);

    const ret = await middlewareChain();
    return buildResponse(ret);
  };
}

export function createMiddleware<T extends readonly MiddlewareObject[], TOutContext>(
  middlewares: readonly [...T],
  fn: MiddlewareFunction<Expand<MergeMiddlewareContext<T>>, TOutContext>,
): MiddlewareObject<any, TOutContext> {
  return { deps: middlewares, fn: fn as any };
}

export function createMiddlewareWithGlobalContext<
  T extends readonly MiddlewareObject[],
  TOutContext,
>(
  middlewares: readonly [...T],
  fn: MiddlewareFunction<Expand<MergeMiddlewareContext<[...GlobalMiddlewares, ...T]>>, TOutContext>,
): MiddlewareObject<any, TOutContext> {
  return createMiddleware(middlewares, fn as any);
}

export function setGlobalMiddlewares<T extends readonly MiddlewareObject[]>(...middlewares: T) {
  globalMiddlewares = middlewares;
  return middlewares;
}
