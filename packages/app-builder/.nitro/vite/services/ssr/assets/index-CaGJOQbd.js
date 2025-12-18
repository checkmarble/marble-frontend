import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { _ as createServerFn } from "../server.js";
import { o as object, s as string } from "./short-uuid-MIi3jWzx.js";
import "./services-middleware-DR8Hua1Y.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const createConfigurationLoader_createServerFn_handler = createServerRpc({
  id: "35b91dd8aa3e517665c46541765abb8b29e3966a38ce7df8784c8847df4244f1",
  name: "createConfigurationLoader",
  filename: "src/routes/_app/_builder/continuous-screening/create/index.tsx"
}, (opts) => createConfigurationLoader.__executeServer(opts));
const createConfigurationLoader = createServerFn().middleware([authMiddleware]).validator(object({
  name: string(),
  description: string().optional()
})).handler(createConfigurationLoader_createServerFn_handler, async function continuousScreeningCreateLoader({
  data: {
    name,
    description
  }
}) {
  return {
    name,
    description: description ?? ""
  };
});
export {
  createConfigurationLoader_createServerFn_handler
};
