export type Expand<T> = T extends object
  ? T extends infer O
    ? O extends Function
      ? O
      : {
          [K in keyof O]: O[K];
        }
    : never
  : T;

export type DataReturnType<Data, TContext> = {
  data: Data;
  __context: TContext;
  __headers: HeaderEntry[];
};

export type HeaderEntry = [string, string];

export type NextFunction = <TOutContext = undefined>(ctx?: {
  context: TOutContext;
  headers?: HeaderEntry[];
}) => Promise<DataReturnType<any, TOutContext>>;

export type DataFunctionArgs<TInContext> = {
  request: Request;
  params: Record<string, string>;
  context: TInContext;
};

export type MiddlewareFunction<in out TInContext = any, TOutContext = any> = (
  args: DataFunctionArgs<TInContext>,
  next: NextFunction,
) => Promise<DataReturnType<any, TOutContext>>;

export type MiddlewareObject<
  TDependencies extends readonly MiddlewareObject[] = any,
  TOutContext = any,
> = {
  deps: readonly [...TDependencies];
  fn: MiddlewareFunction<Expand<MergeMiddlewareContext<TDependencies>>, TOutContext>;
};

export type MergeMiddlewareContext<T extends readonly MiddlewareObject[]> = T extends readonly [
  infer M,
]
  ? M extends MiddlewareObject<any, infer TOutContext>
    ? TOutContext
    : never
  : T extends readonly [infer M, ...infer R extends readonly MiddlewareObject[]]
    ? M extends MiddlewareObject<any, infer TOutContext>
      ? TOutContext & MergeMiddlewareContext<R>
      : never
    : {};

export type ExecutionEnvironmentQueueItem = {
  data: { context: any } | undefined;
};

export type ExecutionEnvironment = {
  queue: Map<Function, ExecutionEnvironmentQueueItem>;
  ctx: {
    request: Request;
    params: Record<string, string>;
    context: Record<string, unknown>;
  };
};

export type DataWithOptions<Data> = {
  __dataObject: true;
  data: Data;
  headers?: HeaderEntry[];
};

export type ServerFunction<TContext, Data> = (
  args: DataFunctionArgs<TContext>,
) => Promise<Data | DataWithOptions<Data>>;

export type RemixDataFunctionArgs = {
  request: Request;
  params: Record<string, string>;
};
