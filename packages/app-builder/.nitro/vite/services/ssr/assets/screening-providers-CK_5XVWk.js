import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { B as isAdmin } from "./services-middleware-DR8Hua1Y.js";
import { O as isLexisNexisAvailable } from "./feature-access-B8PIS8ad.js";
import { _ as createServerFn, x as redirect } from "../server.js";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const screeningProvidersLoader_createServerFn_handler = createServerRpc({
  id: "75a4947011a2503d8a104142cd6ac180bd616d9a9a6fd524eeb348bf5f5c4e54",
  name: "screeningProvidersLoader",
  filename: "src/routes/_app/_builder/settings/screening-providers.tsx"
}, (opts) => screeningProvidersLoader.__executeServer(opts));
const screeningProvidersLoader = createServerFn().middleware([authMiddleware]).handler(screeningProvidersLoader_createServerFn_handler, async function screeningProvidersLoader2({
  context
}) {
  const {
    organization: orgRepo,
    user,
    entitlements
  } = context.authInfo;
  const {
    appConfig
  } = context;
  if (!isAdmin(user) || appConfig.isManagedMarble) {
    throw redirect({
      to: "/settings"
    });
  }
  const organization = await orgRepo.getCurrentOrganization();
  const availableProviders = ["opensanctions"];
  if (isLexisNexisAvailable(entitlements)) availableProviders.push("lexisnexis");
  return {
    providers: organization.screeningProviders,
    organizationId: organization.id,
    availableProviders
  };
});
export {
  screeningProvidersLoader_createServerFn_handler
};
