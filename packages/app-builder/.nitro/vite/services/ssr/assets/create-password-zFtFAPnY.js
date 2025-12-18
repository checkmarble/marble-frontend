import { R as jsxRuntimeExports, $ as ClientOnly } from "../server.js";
import { m as Route, a as authI18n, L as Link } from "./router-vb7i5euz.js";
import "./totp-65577477-CYlAgNy9.js";
import "./CopyToClipboardButton-CJNJJful.js";
import { u as useTranslation, B as Button, T as Typo, s as Trans } from "./format-NPGUXq-g.js";
import "./FormErrorOrDescription-DO6Hdfmn.js";
import { F as FormInput } from "./FormInput-S5xzkMXf.js";
import { F as FormLabel } from "./FormLabel-DeCgtgtj.js";
import { o as object, ff as email } from "./short-uuid-MIi3jWzx.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
import "./QueryClientProvider-DYTpkCko.js";
import "./security-headers.server-BdP3HrPp.js";
import "./services-middleware-DR8Hua1Y.js";
import "node:crypto";
import "./ThemeContext-B40HQxfH.js";
import "./config-ut8rAdyo.js";
import "./createSsrRpc-ZXUHv2Er.js";
import "./i18n-instance-store-UssbGYOM.js";
import "./auth-middleware-C4ap47rJ.js";
import "./inboxes-D556s0BB.js";
import "./files-fO9wUXBf.js";
import "./case-detail-middleware-C3JS8Yme.js";
import "./input-validation-CU_reV2S.js";
import "./async-C3pYACua.js";
import "./decisions-B-2DmJW1.js";
import "./unique-CBeBxAXx.js";
import "./scenarios-8U74nJp4.js";
import "./sharpstate.es-CeF1Mf5b.js";
import "./isNullish-B8pc8Ntu.js";
import "./use-callback-ref-DXzIzfqy.js";
import "./index-x7n7VJTa.js";
import "./index-C_WgunUr.js";
object({
  email: email()
});
const StaticResetPassword = ({ prefilledEmail }) => {
  const { t } = useTranslation(["auth", "common"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "flex w-full flex-col gap-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-start gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { name: "email", children: t("auth:sign_in.email") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormInput, { type: "email", className: "w-full", defaultValue: prefilledEmail ?? "", enablePasswordManagers: true })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { children: t("auth:reset-password.send") })
  ] });
};
function ForgotPassword() {
  const {
    prefilledEmail
  } = Route.useLoaderData();
  const {
    t
  } = useTranslation(authI18n);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2xl w-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typo, { variant: "title2", className: "text-center", children: t("auth:reset-password.title") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ClientOnly, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(StaticResetPassword, { prefilledEmail }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-sm text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trans, { t, i18nKey: "auth:reset-password.wrong_place", components: {
      SignIn: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { className: "text-purple-primary underline", to: "/sign-in-email" })
    } }) })
  ] });
}
export {
  ForgotPassword as component
};
