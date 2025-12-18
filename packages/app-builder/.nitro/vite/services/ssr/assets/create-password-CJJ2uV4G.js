import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { s as servicesMiddleware } from "./services-middleware-DR8Hua1Y.js";
import { _ as createServerFn, a4 as getRequest, x as redirect } from "../server.js";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const createPasswordLoader_createServerFn_handler = createServerRpc({
  id: "6da7fd1e937eb76a3da98c1eae2f5b00ba1261770e9e39059ea4e42fb39c05a0",
  name: "createPasswordLoader",
  filename: "src/routes/_app/_auth/create-password.tsx"
}, (opts) => createPasswordLoader.__executeServer(opts));
const createPasswordLoader = createServerFn().middleware([servicesMiddleware]).handler(createPasswordLoader_createServerFn_handler, async function createPasswordLoader2({
  context
}) {
  const request = getRequest();
  const appConfig = context.appConfig;
  if (appConfig?.auth.provider === "oidc") {
    throw redirect({
      to: "/sign-in"
    });
  }
  const url = new URL(request.url);
  const emailParam = url.searchParams.toString().match(/email=([^&]*)/)?.[1];
  const prefilledEmail = emailParam ? decodeURIComponent(emailParam.replace(/\+/g, "%2B")) : null;
  return {
    prefilledEmail
  };
});
export {
  createPasswordLoader_createServerFn_handler
};
