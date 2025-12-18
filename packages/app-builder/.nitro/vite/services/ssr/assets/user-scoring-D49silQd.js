import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { a1 as isAnalyst } from "./services-middleware-DR8Hua1Y.js";
import { M as isUserScoringAvailable } from "./feature-access-B8PIS8ad.js";
import { _ as createServerFn, x as redirect } from "../server.js";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const userScoringLayoutLoader_createServerFn_handler = createServerRpc({
  id: "69c1121ba3b9733ad8a1ec4ec65753e354d35c7612bd9734056c85c59b5b1017",
  name: "userScoringLayoutLoader",
  filename: "src/routes/_app/_builder/user-scoring.tsx"
}, (opts) => userScoringLayoutLoader.__executeServer(opts));
const userScoringLayoutLoader = createServerFn().middleware([authMiddleware]).handler(userScoringLayoutLoader_createServerFn_handler, async function userScoringLayout({
  context
}) {
  const {
    user,
    entitlements,
    userScoring
  } = context.authInfo;
  if (isAnalyst(user) || !isUserScoringAvailable(entitlements)) {
    throw redirect({
      to: "/"
    });
  }
  const settings = await userScoring.getSettings();
  return {
    settings
  };
});
export {
  userScoringLayoutLoader_createServerFn_handler
};
