import { C as COOKIE_NAME, P as PreferencesCookieSchema } from "./config-ut8rAdyo.js";
import { b as captureException } from "./services-middleware-DR8Hua1Y.js";
function getPreferencesCookie(request, name) {
  const rawValue = request.headers.get("Cookie")?.split("; ").map((cookie) => cookie.split("=")).map(([key, value]) => [key, decodeURIComponent(value ?? "")]).filter(([key]) => key === COOKIE_NAME)[0]?.[1];
  if (!rawValue) return void 0;
  let parsedObj;
  try {
    parsedObj = JSON.parse(rawValue);
  } catch (error) {
    captureException(error);
    parsedObj = { [name]: rawValue };
  }
  try {
    const parsed = PreferencesCookieSchema.partial().parse(parsedObj);
    return parsed[name];
  } catch {
    return void 0;
  }
}
export {
  getPreferencesCookie as g
};
