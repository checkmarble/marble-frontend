import { type Params } from '@remix-run/react';
import qs, { type IParseOptions } from 'qs';
import { type UUID } from 'short-uuid';
import { z, type ZodType, type ZodTypeDef } from 'zod';

import { shortUUIDSchema } from './schema/shortUUIDSchema';

const defaultQsConfig: IParseOptions = {
  allowDots: true,
  arrayLimit: 200,
  ignoreQueryPrefix: true,
};

export function inputFromSearch(queryString: string, options?: IParseOptions) {
  return qs.parse(queryString, {
    ...defaultQsConfig,
    ...options,
  });
}

export function inputFromUrl(request: Request, options?: IParseOptions) {
  return inputFromSearch(decodeURIComponent(new URL(request.url).search), options);
}

/**
 * File entries from formData are filtered out
 */
export function inputFromFormData(formData: FormData, options?: IParseOptions) {
  const formDataWithoutFileEntries = Array.from(formData).filter(
    (entry): entry is [string, string] => typeof entry[1] === 'string',
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
 * Parse and validate Params from LoaderFunctionArgs or ActionFunctionArgs. Doesn't throw if validation fails.
 */
export async function parseParamsSafe<Output, Def extends ZodTypeDef = ZodTypeDef, Input = Output>(
  params: Params,
  schema: ZodType<Output, Def, Input>,
) {
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
 * Parse and validate UUID/sUUID param from LoaderFunctionArgs or ActionFunctionArgs.
 *
 * Returns the parsed UUID. Doesn't throw if validation fails.
 */
export async function parseIdParamSafe<KeyName extends string>(
  params: Params,
  keyName: KeyName,
): Promise<
  | { success: true; data: { [K in KeyName]: UUID } }
  | { success: false; error: z.ZodError; params: Params }
> {
  const schema = z.object({
    [keyName]: z.union([shortUUIDSchema, z.string().uuid()]),
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
 * Parse and validate Params from LoaderFunctionArgs or ActionFunctionArgs. Throws if validation fails.
 */
export async function parseParams<Output, Def extends ZodTypeDef = ZodTypeDef, Input = Output>(
  params: Params,
  schema: ZodType<Output, Def, Input>,
) {
  return schema.parseAsync(params);
}

/**
 * Parse and validate a Request. Doesn't throw if validation fails.
 */
export async function parseQuerySafe<Output, Def extends ZodTypeDef = ZodTypeDef, Input = Output>(
  request: Request,
  schema: ZodType<Output, Def, Input>,
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
export async function parseQuery<Output, Def extends ZodTypeDef = ZodTypeDef, Input = Output>(
  request: Request,
  schema: ZodType<Output, Def, Input>,
) {
  const searchParams = inputFromUrl(request);
  return schema.parseAsync(searchParams);
}

/**
 * Parse and validate FormData from a Request. Doesn't throw if validation fails.
 */
export async function parseFormSafe<Output, Def extends ZodTypeDef = ZodTypeDef, Input = Output>(
  request: Request,
  schema: ZodType<Output, Def, Input>,
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
export async function parseForm<Output, Def extends ZodTypeDef = ZodTypeDef, Input = Output>(
  request: Request,
  schema: ZodType<Output, Def, Input>,
) {
  const formData = await inputFromForm(request);
  return schema.parseAsync(formData);
}
