type Params = Record<string, string | undefined>;

import qs, { type IParseOptions } from 'qs';
import { type UUID } from 'short-uuid/src/types';
import { type ZodType, z } from 'zod/v4';

import { shortUUIDSchema } from './schema/shortUUIDSchema';

const defaultQsConfig: IParseOptions = {
  allowDots: true,
  arrayLimit: 200,
  ignoreQueryPrefix: true,
};

function inputFromSearch(queryString: string, options?: IParseOptions) {
  return qs.parse(queryString, {
    ...defaultQsConfig,
    ...options,
  });
}

function inputFromUrl(request: Request, options?: IParseOptions) {
  return inputFromSearch(decodeURIComponent(new URL(request.url).search), options);
}

/**
 * Parse and validate route Params. Doesn't throw if validation fails.
 */
export async function parseParamsSafe<Output>(params: Params, schema: ZodType<Output, any, any>) {
  const result = await schema.safeParseAsync(params);
  if (!result.success) {
    return {
      ...result,
      params,
    };
  }
  return result;
}

/**
 * Parse and validate UUID/sUUID route param.
 *
 * Returns the parsed UUID. Doesn't throw if validation fails.
 */
export async function parseIdParamSafe<KeyName extends string>(
  params: Params,
  keyName: KeyName,
): Promise<{ success: true; data: { [K in KeyName]: UUID } } | { success: false; error: z.ZodError; params: Params }> {
  const schema = z.object({
    [keyName]: z.union([shortUUIDSchema, z.uuid()]),
  });

  const result = await schema.safeParseAsync(params);

  if (!result.success) {
    return {
      success: false,
      error: result.error,
      params,
    };
  }

  return {
    success: true,
    data: { [keyName]: result.data[keyName] as UUID } as { [K in KeyName]: UUID },
  };
}

/**
 * Parse and validate a Request. Doesn't throw if validation fails.
 */
type ParseQuerySafeResult<Output> =
  | z.ZodSafeParseSuccess<Output>
  | (z.ZodSafeParseError<Output> & { searchParams: Record<string, unknown> });

export async function parseQuerySafe<T extends ZodType>(
  request: Request,
  schema: T,
): Promise<ParseQuerySafeResult<z.output<T>>> {
  const searchParams = inputFromUrl(request);
  const result = await schema.safeParseAsync(searchParams);

  if (!result.success) {
    return { ...result, searchParams };
  }
  return result;
}
