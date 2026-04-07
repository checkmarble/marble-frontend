type OmitUndefined<T extends Record<string, unknown>> = {
  [K in keyof T as T[K] extends undefined ? never : K]: Exclude<T[K], undefined>;
};

/**
 * Omit undefined values from an object
 * @param value - The object to omit undefined values from
 * @returns The object with undefined values omitted
 */
export function omitUndefined<const T extends Record<string, unknown>>(value: T): OmitUndefined<T> {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as OmitUndefined<T>;
}
