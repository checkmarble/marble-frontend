import { r as reactExports } from "../server.js";
import { u as useCallbackRef } from "./use-callback-ref-DXzIzfqy.js";
function base64ToBytes(base64) {
  const binString = atob(base64);
  return Uint8Array.from(binString, (m) => m.codePointAt(0));
}
function bytesToBase64(bytes) {
  const binString = String.fromCodePoint(...bytes);
  return btoa(binString);
}
function useBase64Query(schema, query, options = {}) {
  const decodedObject = reactExports.useMemo(() => {
    const decodedQuery = new TextDecoder().decode(base64ToBytes(query));
    try {
      return JSON.parse(decodedQuery !== "" ? decodedQuery : "{}");
    } catch {
      return {};
    }
  }, [query]);
  const validatedObject = reactExports.useMemo(() => {
    return schema.safeParse(decodedObject);
  }, [decodedObject, schema]);
  const update = useCallbackRef((filters) => {
    const nextFilters = { ...decodedObject, ...filters };
    const stringifiedFilters = JSON.stringify(nextFilters);
    const nextQuery = bytesToBase64(new TextEncoder().encode(stringifiedFilters === "{}" ? "" : stringifiedFilters));
    options.onUpdate?.(nextQuery, nextFilters);
  });
  const result = reactExports.useMemo(() => {
    const asArray = Object.entries(validatedObject.data ?? {}).filter(([_, value]) => !!value);
    return {
      ...validatedObject,
      asArray,
      update
    };
  }, [validatedObject, update]);
  return result;
}
export {
  useBase64Query as u
};
