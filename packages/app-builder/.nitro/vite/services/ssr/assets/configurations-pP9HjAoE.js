import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { l as listContinuousScreeningConfigurationsFn } from "./continuous-screening-By89dWjI.js";
import { g as getListConfigFn } from "./screenings-CS8peAlI.js";
import { _ as createServerFn } from "../server.js";
import "./services-middleware-DR8Hua1Y.js";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "./createSsrRpc-ZXUHv2Er.js";
import "./continuous-screenings-DX2ib6rI.js";
import "./sharpstate.es-CeF1Mf5b.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const configurationsLoader_createServerFn_handler = createServerRpc({
  id: "a140ea9b3129290100dd40aa3114c38f68c58f854cd3ca6624c3b39efdd53a4e",
  name: "configurationsLoader",
  filename: "src/routes/_app/_builder/continuous-screening/configurations.tsx"
}, (opts) => configurationsLoader.__executeServer(opts));
const configurationsLoader = createServerFn().middleware([authMiddleware]).handler(configurationsLoader_createServerFn_handler, async function continuousScreeningConfigurationsLoader({
  context
}) {
  const {
    user
  } = context.authInfo;
  const [listContinuousScreeningConfigurations, datasets] = await Promise.all([listContinuousScreeningConfigurationsFn(), getListConfigFn({
    data: {
      feature: "continuous_monitoring"
    }
  })]);
  return {
    canEdit: ["ADMIN", "PUBLISHER"].includes(user.role),
    configurations: listContinuousScreeningConfigurations.configurations,
    datasets
  };
});
export {
  configurationsLoader_createServerFn_handler
};
