import { a3 as createMiddleware, a as isRedirect, a4 as getRequest } from "../server.js";
import { r as runWithSecurityHeadersStore, a as getContentSecurityPolicy } from "./security-headers.server-BdP3HrPp.js";
import { b as fromUUIDtoSUUID, j as uuid } from "./short-uuid-MIi3jWzx.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
function dedupeSerializationAdapters(deduped, serializationAdapters) {
  for (let i = 0, len = serializationAdapters.length; i < len; i++) {
    const current = serializationAdapters[i];
    if (!deduped.has(current)) {
      deduped.add(current);
      if (current.extends) dedupeSerializationAdapters(deduped, current.extends);
    }
  }
}
var createStart = (getOptions) => {
  return {
    getOptions: async () => {
      const options = await getOptions();
      if (options.serializationAdapters) {
        const deduped = /* @__PURE__ */ new Set();
        dedupeSerializationAdapters(deduped, options.serializationAdapters);
        options.serializationAdapters = Array.from(deduped);
      }
      return options;
    },
    createMiddleware
  };
};
const convertRedirectErrorToExceptionMiddleware = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const result = await next();
    if ("error" in result && isRedirect(result.error)) {
      throw result.error;
    }
    return result;
  }
);
const securityHeadersMiddleware = createMiddleware().server(({ next }) => {
  const nonce = crypto.randomUUID().replace(/-/g, "");
  return runWithSecurityHeadersStore(nonce, async () => {
    const result = await next();
    const csp = getContentSecurityPolicy();
    if (csp && !result.response.headers.has("content-security-policy")) {
      result.response.headers.set("Content-Security-Policy", csp);
    }
    if (!result.response.headers.has("x-frame-options")) {
      result.response.headers.set("X-Frame-Options", "DENY");
    }
    return result;
  });
});
const isLongUUID = (value) => uuid().safeParse(value).success;
const SKIP_PREFIXES = ["/client-detail/", "/ressources/", "/oidc/"];
const protectsLastSegment = (pathname) => pathname.startsWith("/cases/s/") && pathname.includes("/clients/");
const shortUUIDRedirectMiddleware = createMiddleware().server(async ({ next }) => {
  const request = getRequest();
  if (request.method === "GET") {
    const url = new URL(request.url);
    if (!SKIP_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) {
      const segments = url.pathname.split("/");
      const protectedIndex = protectsLastSegment(url.pathname) ? segments.length - 1 : -1;
      let changed = false;
      const rewritten = segments.map((segment, index) => {
        if (index === protectedIndex || !isLongUUID(segment)) return segment;
        try {
          const short = fromUUIDtoSUUID(segment);
          changed = true;
          return short;
        } catch {
          return segment;
        }
      }).join("/");
      if (changed) {
        const safePathname = "/" + rewritten.replace(/^\/+/, "");
        return new Response(null, {
          status: 302,
          headers: { Location: safePathname + url.search + url.hash }
        });
      }
    }
  }
  return next();
});
const startInstance = createStart(() => {
  return {
    requestMiddleware: [shortUUIDRedirectMiddleware, securityHeadersMiddleware],
    functionMiddleware: [convertRedirectErrorToExceptionMiddleware]
  };
});
export {
  startInstance
};
