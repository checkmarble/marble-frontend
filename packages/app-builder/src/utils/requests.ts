export type Params<Key extends string = string> = {
  readonly [key in Key]: string | undefined;
};

type DataFunctionArgs = {
  request: Request;
  params: Params;
  context?: Record<string, unknown>;
};
type DataFunctionValue = Response | NonNullable<unknown> | null;
type DataFunctionReturnValue = Promise<DataFunctionValue> | DataFunctionValue;
export type DataFunction = (args: DataFunctionArgs) => DataFunctionReturnValue;


export type MiddlewareContext = Record<string, unknown>;
export type NextFnArgs<in out OutCtx> = {
  context?: OutCtx,
}
export type ServerFnArgs<TMiddlewares extends MiddlewareFn<any, any>[]> = {
  request: Request;
  params: Params;
  context: MergedMiddlewareContext<TMiddlewares>;
};
export interface ResponseWithCtx<in out NewCtx, in out Ctx> extends Response {
  _type: { context: NewCtx & Ctx };
}
export interface MiddlewareArgs<TMiddlewares extends MiddlewareFn<any, any>[], in out OutCtx> extends ServerFnArgs<TMiddlewares> {
  next: <TNewOutContext = undefined>(args: NextFnArgs<TNewOutContext>) => Promise<ResponseWithCtx<TNewOutContext, OutCtx>>;
}

type MergedMiddlewareContext<T extends MiddlewareFn<any, any>[]> = T extends [infer M, ...infer R extends MiddlewareFn<any, any>[]]
  ? M extends MiddlewareFn<any, infer C> ? C & MergedMiddlewareContext<R> : never
  : Record<string, never>;

export type MiddlewareFn<TMiddlewares extends MiddlewareFn<any, any>[], OutCtx> = (args: MiddlewareArgs<TMiddlewares, OutCtx>) => Promise<ResponseWithCtx<any, any>>;
export type ServerFn<TMiddlewares extends MiddlewareFn<any, any>[]> = (args: ServerFnArgs<TMiddlewares>) => Promise<ResponseWithCtx<any, any>>;

export function composeMiddlewares<T extends MiddlewareFn<any, any>[]>(middlewares: [...T], finalFn: ServerFn<T>): DataFunction {
  return async (args: DataFunctionArgs) => {
    const { request, params } = args;

    let chainCtx: { value: Record<string, unknown> } = { value: {} };
    const final = (nextArgs: NextFnArgs<any>) => {
      chainCtx.value = { ...chainCtx.value, ...nextArgs.context };
      return finalFn({ request, params, context: chainCtx.value as MergedMiddlewareContext<T> })
    };

    const middlewareChain = middlewares.reduceRight((next, middleware) => {
      return async (nextArgs: NextFnArgs<any>) => {
        chainCtx.value = { ...chainCtx.value, ...nextArgs.context };
        return middleware({ request, params, context: chainCtx.value as any, next });
      };
    }, final);

    return middlewareChain({});
  };
}

export function createMiddleware<OutCtx>(middlewareFn: MiddlewareFn<any, OutCtx>): MiddlewareFn<[], OutCtx> {
  return middlewareFn;
}
