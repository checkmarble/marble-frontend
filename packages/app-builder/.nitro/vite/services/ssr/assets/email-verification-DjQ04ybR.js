import { R as jsxRuntimeExports, $ as ClientOnly, U as useHydrated } from "../server.js";
import { u as useTranslation, B as Button, e as Icon, T as Typo } from "./format-NPGUXq-g.js";
import { L as Link } from "./router-vb7i5euz.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
import "./services-middleware-DR8Hua1Y.js";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "./sharpstate.es-CeF1Mf5b.js";
import "./isNullish-B8pc8Ntu.js";
import "./use-callback-ref-DXzIzfqy.js";
import "./QueryClientProvider-DYTpkCko.js";
import "./security-headers.server-BdP3HrPp.js";
import "./ThemeContext-B40HQxfH.js";
import "./config-ut8rAdyo.js";
import "./createSsrRpc-ZXUHv2Er.js";
import "./i18n-instance-store-UssbGYOM.js";
import "./auth-middleware-C4ap47rJ.js";
import "./inboxes-D556s0BB.js";
import "./files-fO9wUXBf.js";
import "./CopyToClipboardButton-CJNJJful.js";
import "./case-detail-middleware-C3JS8Yme.js";
import "./input-validation-CU_reV2S.js";
import "./async-C3pYACua.js";
import "./decisions-B-2DmJW1.js";
import "./unique-CBeBxAXx.js";
import "./scenarios-8U74nJp4.js";
function SendEmailVerificationButton({
  onClick,
  children
}) {
  const isHydrated = useHydrated();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", className: "w-full capitalize", onClick, disabled: !isHydrated, children });
}
function SendEmailVerification() {
  const {
    t
  } = useTranslation(["auth"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ClientOnly, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(SendEmailVerificationButton, { children: t("auth:email-verification.resend") }) });
}
function SignUp() {
  const {
    t
  } = useTranslation(["common", "auth"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full flex-col gap-2xl items-center text-s", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { className: "absolute top-[60px] left-[60px] flex gap-sm text-s items-center", to: "/sign-in-email", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "arrow-left", className: "size-4" }),
      t("common:back")
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typo, { variant: "title2", className: "text-center", children: t("auth:email-verification.title") }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-lg items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: t("auth:email-verification.email_sent") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ClientOnly, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: t("auth:email-verification.click_on_link") })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: t("auth:email-verification.not_received") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SendEmailVerification, {})
    ] })
  ] });
}
export {
  SignUp as component
};
