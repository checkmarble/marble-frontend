import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { n as normalizeListConfig } from "./lists-config-CsQWGvXL.js";
import { _ as createServerFn } from "../server.js";
import "./services-middleware-DR8Hua1Y.js";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "./screenings-CS8peAlI.js";
import "./createSsrRpc-ZXUHv2Er.js";
import "./useQuery-B7mL_evE.js";
import "./useBaseQuery-CMboOtTR.js";
import "./QueryClientProvider-DYTpkCko.js";
import "./useServerFn-CrqFKl7V.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const screeningSearchLoader_createServerFn_handler = createServerRpc({
  id: "ed369d932318dab0b42256698a8e38d6f47487bdb776a258c2db28c0893fff84",
  name: "screeningSearchLoader",
  filename: "src/routes/_app/_builder/screening-search/index.tsx"
}, (opts) => screeningSearchLoader.__executeServer(opts));
const screeningSearchLoader = createServerFn().middleware([authMiddleware]).handler(screeningSearchLoader_createServerFn_handler, async function screeningSearchLoader2({
  context
}) {
  const rawListConfig = await context.authInfo.screening.getAvailableFilters({
    feature: "manual_search"
  });
  return {
    listConfig: normalizeListConfig(rawListConfig)
  };
});
export {
  screeningSearchLoader_createServerFn_handler
};
