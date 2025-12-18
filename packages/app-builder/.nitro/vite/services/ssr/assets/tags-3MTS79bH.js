import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { d as isReadTagAvailable, e as isDeleteTagAvailable, f as isEditTagAvailable, g as isCreateTagAvailable } from "./feature-access-B8PIS8ad.js";
import { _ as createServerFn, x as redirect } from "../server.js";
import "./services-middleware-DR8Hua1Y.js";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const tagsLoader_createServerFn_handler = createServerRpc({
  id: "7742794cc8be33a097adf2021e2e520283bee78d2312e4fcf4ba47a465cadff1",
  name: "tagsLoader",
  filename: "src/routes/_app/_builder/settings/tags.tsx"
}, (opts) => tagsLoader.__executeServer(opts));
const tagsLoader = createServerFn().middleware([authMiddleware]).handler(tagsLoader_createServerFn_handler, async function tagsLoader2({
  context
}) {
  const {
    organization,
    user
  } = context.authInfo;
  if (!isReadTagAvailable(user)) throw redirect({
    to: "/"
  });
  const [caseTags, objectTags] = await Promise.all([organization.listTags({
    withCaseCount: true
  }).then((tags) => tags.map((t) => ({
    ...t,
    target: "case"
  }))), organization.listTags({
    target: "object"
  }).then((tags) => tags.map((t) => ({
    ...t,
    target: "object"
  })))]);
  return {
    tags: [...caseTags, ...objectTags],
    isCreateTagAvailable: isCreateTagAvailable(user),
    isEditTagAvailable: isEditTagAvailable(user),
    isDeleteTagAvailable: isDeleteTagAvailable(user)
  };
});
export {
  tagsLoader_createServerFn_handler
};
