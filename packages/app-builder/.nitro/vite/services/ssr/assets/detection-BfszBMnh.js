import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { a1 as isAnalyst } from "./services-middleware-DR8Hua1Y.js";
import { _ as createServerFn, x as redirect } from "../server.js";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const detectionLayoutLoader_createServerFn_handler = createServerRpc({
  id: "96e778b85525688a73f39daf945f12d0e8bf1582e4d62ff331d7c45582857d17",
  name: "detectionLayoutLoader",
  filename: "src/routes/_app/_builder/detection.tsx"
}, (opts) => detectionLayoutLoader.__executeServer(opts));
const detectionLayoutLoader = createServerFn().middleware([authMiddleware]).handler(detectionLayoutLoader_createServerFn_handler, async function detectionLayout({
  context
}) {
  if (isAnalyst(context.authInfo.user)) {
    throw redirect({
      to: "/cases"
    });
  }
  return null;
});
export {
  detectionLayoutLoader_createServerFn_handler
};
