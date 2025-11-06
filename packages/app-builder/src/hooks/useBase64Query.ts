import { useCallbackRef } from '@marble/shared';
import { useMemo } from 'react';
import { ZodObject, z } from 'zod/v4';

// From https://developer.mozilla.org/en-US/docs/Glossary/Base64#the_unicode_problem.
function base64ToBytes(base64: string) {
  const binString = atob(base64);
  return Uint8Array.from(binString, (m) => m.codePointAt(0)!);
}

// From https://developer.mozilla.org/en-US/docs/Glossary/Base64#the_unicode_problem.
function bytesToBase64(bytes: Uint8Array) {
  const binString = String.fromCodePoint(...bytes);
  return btoa(binString);
}

type UseBase64QueryOptions = {
  onUpdate?: (query: string, newFilters: Record<string, unknown>) => void;
};

type UseBase64QueryResultSuccess<T extends ZodObject> = {
  success: true;
  data: z.infer<T>;
  error?: undefined;
};

type UseBase64QueryResultError = {
  success: false;
  data?: undefined;
  error: Error;
};

type UseBase64QueryResult<T extends ZodObject> = {
  update: (filters: Partial<z.infer<T>>) => void;
  asArray: QueryEntry<T>[];
} & (UseBase64QueryResultSuccess<T> | UseBase64QueryResultError);

export type QueryEntry<T extends ZodObject> = z.infer<T> extends infer O
  ? Exclude<{ [K in keyof O]: [K, Exclude<NonNullable<O[K]>, undefined>] }[keyof O], undefined>
  : never;

export function useBase64Query<T extends ZodObject>(
  schema: T,
  query: string,
  options: UseBase64QueryOptions = {},
): UseBase64QueryResult<T> {
  const decodedObject = useMemo(() => {
    const decodedQuery = new TextDecoder().decode(base64ToBytes(query));
    try {
      return JSON.parse(decodedQuery !== '' ? decodedQuery : '{}');
    } catch {
      return {};
    }
  }, [query]);

  const validatedObject = useMemo(() => {
    return schema.safeParse(decodedObject);
  }, [decodedObject, schema]);

  const update = useCallbackRef((filters: Partial<z.infer<T>>) => {
    const nextFilters = { ...decodedObject, ...filters };
    const stringifiedFilters = JSON.stringify(nextFilters);
    const nextQuery = bytesToBase64(new TextEncoder().encode(stringifiedFilters === '{}' ? '' : stringifiedFilters));
    options.onUpdate?.(nextQuery, nextFilters);
  });

  const result = useMemo(() => {
    const asArray = Object.entries(validatedObject.data ?? {}).filter(([_, value]) => !!value) as QueryEntry<T>[];

    return {
      ...validatedObject,
      asArray,
      update,
    };
  }, [validatedObject, update]);

  return result;
}
