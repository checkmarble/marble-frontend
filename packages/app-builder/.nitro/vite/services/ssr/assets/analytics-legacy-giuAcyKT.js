import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { i as isAnalyticsAvailable } from "./feature-access-B8PIS8ad.js";
import { _ as createServerFn, x as redirect } from "../server.js";
import "./services-middleware-DR8Hua1Y.js";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const analyticsLegacyLoader_createServerFn_handler = createServerRpc({
  id: "f83b5212fec014171a188acfaf7c75cdb389ad95ff8015a1b0d5e8fe47315f6b",
  name: "analyticsLegacyLoader",
  filename: "src/routes/_app/_builder/analytics-legacy.tsx"
}, (opts) => analyticsLegacyLoader.__executeServer(opts));
const analyticsLegacyLoader = createServerFn().middleware([authMiddleware]).handler(analyticsLegacyLoader_createServerFn_handler, async function analyticsLegacyLoader2({
  context
}) {
  const {
    user,
    analytics,
    entitlements
  } = context.authInfo;
  if (!isAnalyticsAvailable(user, entitlements)) {
    throw redirect({
      to: "/"
    });
  }
  const analyticsList = await analytics.legacyListAnalytics();
  const globalDashbord = analyticsList.find(({
    embeddingType
  }) => embeddingType === "global_dashboard");
  if (!globalDashbord) {
    throw new Response("Global dashboard doesn't exist", {
      status: 404
    });
  }
  return {
    globalDashbord: {
      title: "Global Dashboard",
      src: globalDashbord.signedEmbeddingUrl
    }
  };
});
export {
  analyticsLegacyLoader_createServerFn_handler
};
