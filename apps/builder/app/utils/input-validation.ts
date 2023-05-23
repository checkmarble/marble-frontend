import { type Params } from '@remix-run/react';
import qs, { type IParseOptions } from 'qs';
import {
  type objectInputType,
  type objectOutputType,
  type UnknownKeysParam,
  type ZodObject,
  type ZodRawShape,
  type ZodTypeAny,
} from 'zod';

const defaultQsConfig: IParseOptions = {
  allowDots: true,
  arrayLimit: 200,
};

export function inputFromSearch(
  queryString: URLSearchParams,
  options?: IParseOptions
) {
  return qs.parse(Object.fromEntries(queryString), {
    ...defaultQsConfig,
    ...options,
  });
}

export function inputFromUrl(request: Request, options?: IParseOptions) {
  return inputFromSearch(new URL(request.url).searchParams, options);
}

/**
 * File entries from formData are filtered out
 */
export function inputFromFormData(formData: FormData, options?: IParseOptions) {
  const formDataWithoutFileEntries = Array.from(formData).filter(
    (entry): entry is [string, string] => typeof entry[1] === 'string'
  );
  return qs.parse(Object.fromEntries(formDataWithoutFileEntries), {
    ...defaultQsConfig,
    ...options,
  });
}

/**
 * File entries from formData are filtered out
 */
export async function inputFromForm(request: Request, options?: IParseOptions) {
  return inputFromFormData(await request.clone().formData(), options);
}

/**
 * Parse and validate Params from LoaderArgs or ActionArgs. Doesn't throw if validation fails.
 */
export async function parseParamsSafe<
  T extends ZodRawShape,
  UnknownKeys extends UnknownKeysParam = 'strip',
  Catchall extends ZodTypeAny = ZodTypeAny,
  Output = objectOutputType<T, Catchall>,
  Input = objectInputType<T, Catchall>
>(params: Params, schema: ZodObject<T, UnknownKeys, Catchall, Output, Input>) {
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
 * Parse and validate a Request. Doesn't throw if validation fails.
 */
export async function parseQuerySafe<
  T extends ZodRawShape,
  UnknownKeys extends UnknownKeysParam = 'strip',
  Catchall extends ZodTypeAny = ZodTypeAny,
  Output = objectOutputType<T, Catchall>,
  Input = objectInputType<T, Catchall>
>(
  request: Request,
  schema: ZodObject<T, UnknownKeys, Catchall, Output, Input>
) {
  const searchParams = inputFromUrl(request);
  const result = await schema.safeParseAsync(searchParams);
  if (!result.success) {
    return {
      ...result,
      searchParams,
    };
  }
  return result;
}

/**
 * Parse and validate a Request. Throws if validation fails.
 */
export async function parseQuery<
  T extends ZodRawShape,
  UnknownKeys extends UnknownKeysParam = 'strip',
  Catchall extends ZodTypeAny = ZodTypeAny,
  Output = objectOutputType<T, Catchall>,
  Input = objectInputType<T, Catchall>
>(
  request: Request,
  schema: ZodObject<T, UnknownKeys, Catchall, Output, Input>
) {
  const searchParams = inputFromUrl(request);
  return schema.parseAsync(searchParams);
}

/**
 * Parse and validate FormData from a Request. Doesn't throw if validation fails.
 */
export async function parseFormSafe<
  T extends ZodRawShape,
  UnknownKeys extends UnknownKeysParam = 'strip',
  Catchall extends ZodTypeAny = ZodTypeAny,
  Output = objectOutputType<T, Catchall>,
  Input = objectInputType<T, Catchall>
>(
  request: Request,
  schema: ZodObject<T, UnknownKeys, Catchall, Output, Input>
) {
  const formData = await inputFromForm(request);
  const result = await schema.safeParseAsync(formData);
  if (!result.success) {
    return {
      ...result,
      formData,
    };
  }
  return result;
}

/**
 * Parse and validate FormData from a Request. Throws if validation fails.
 */
export async function parseForm<
  T extends ZodRawShape,
  UnknownKeys extends UnknownKeysParam = 'strip',
  Catchall extends ZodTypeAny = ZodTypeAny,
  Output = objectOutputType<T, Catchall>,
  Input = objectInputType<T, Catchall>
>(
  request: Request,
  schema: ZodObject<T, UnknownKeys, Catchall, Output, Input>
) {
  const formData = await inputFromForm(request);
  return schema.parseAsync(formData);
}
