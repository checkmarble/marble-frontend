import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { n as isReadUserAvailable, B as isDeleteUserAvailable, C as isEditUserAvailable, D as isCreateUserAvailable, E as getUserRoles } from "./feature-access-B8PIS8ad.js";
import { _ as createServerFn, x as redirect } from "../server.js";
import { u as t, _ as t$1, $ as t$2, p as t$3 } from "./services-middleware-DR8Hua1Y.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
const usersLoader_createServerFn_handler = createServerRpc({
  id: "4ee212221fd2c5a6804cf0cbc02015d124e15beabde51f40dfd55a284d3b7eba",
  name: "usersLoader",
  filename: "src/routes/_app/_builder/settings/users.tsx"
}, (opts) => usersLoader.__executeServer(opts));
const usersLoader = createServerFn().middleware([authMiddleware]).handler(usersLoader_createServerFn_handler, async function usersLoader2({
  context
}) {
  const {
    user,
    inbox,
    entitlements
  } = context.authInfo;
  if (!isReadUserAvailable(user)) throw redirect({
    to: "/"
  });
  const inboxUsers = await inbox.listAllInboxUsers();
  const inboxUsersByUserId = t(inboxUsers, t$2(({
    userId
  }) => userId), t$1((value) => t(value, t$2((v) => v.role), t$1((v) => v.length), t$3())));
  return {
    inboxUsersByUserId,
    user,
    entitlements,
    userRoles: getUserRoles(entitlements),
    isCreateUserAvailable: isCreateUserAvailable(user),
    isEditUserAvailable: isEditUserAvailable(user),
    isDeleteUserAvailable: isDeleteUserAvailable(user)
  };
});
export {
  usersLoader_createServerFn_handler
};
