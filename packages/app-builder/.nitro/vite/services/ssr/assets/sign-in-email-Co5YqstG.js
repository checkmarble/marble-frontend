import { U as useHydrated, R as jsxRuntimeExports, $ as ClientOnly } from "../server.js";
import { U as UnreadyCallout, S as SignInFirstConnection, A as AuthError } from "./UnreadyCallout-YhzxRqAj.js";
import { L as Link, k as Route } from "./router-vb7i5euz.js";
import "./totp-65577477-CYlAgNy9.js";
import "./CopyToClipboardButton-CJNJJful.js";
import { u as useTranslation, B as Button, e as Icon, T as Typo } from "./format-NPGUXq-g.js";
import "./FormErrorOrDescription-DO6Hdfmn.js";
import { F as FormInput } from "./FormInput-S5xzkMXf.js";
import { F as FormLabel } from "./FormLabel-DeCgtgtj.js";
import { o as object, s as string, ff as email } from "./short-uuid-MIi3jWzx.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
import "./Callout-DX4NBXlG.js";
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
  credentials: object({
    email: email(),
    password: string().min(1, "Required")
  })
});
const StaticSignInWithEmailAndPassword = ({
  additionalContent,
  prefilledEmail
}) => {
  const hydrated = useHydrated();
  const { t } = useTranslation(["auth", "common"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "contents", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full flex-col gap-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-start gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { name: "credentials.email", children: t("auth:sign_in.email") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          FormInput,
          {
            type: "email",
            name: "credentials.email",
            disabled: !hydrated,
            className: "w-full",
            valid: true,
            defaultValue: prefilledEmail ?? "",
            enablePasswordManagers: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-start gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { name: "credentials.password", children: t("auth:sign_in.password") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          FormInput,
          {
            type: "password",
            name: "credentials.password",
            autoComplete: "current-password",
            disabled: !hydrated,
            className: "w-full",
            valid: true,
            enablePasswordManagers: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { className: "text-s text-purple-primary underline", to: "/create-password", children: t("auth:sign_in.forgot_password") })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", size: "large", className: "w-full justify-center", disabled: !hydrated, children: t("auth:sign_in") }),
      additionalContent
    ] })
  ] });
};
function LoginWithEmail() {
  const {
    t
  } = useTranslation(["common", "auth"]);
  const {
    authError,
    isSsoEnabled,
    isSignupReady,
    didMigrationsRun,
    isManagedMarble,
    prefilledEmail
  } = Route.useLoaderData();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2xl w-full", children: [
    isSsoEnabled ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { className: "absolute top-[60px] left-[60px] flex gap-sm text-s items-center", to: "/sign-in", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "arrow-left", className: "size-4" }),
      t("common:back")
    ] }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typo, { variant: "title2", className: "text-center", children: t("auth:sign_in") }),
      !isSignupReady ? /* @__PURE__ */ jsxRuntimeExports.jsx(UnreadyCallout, { didMigrationsRun }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsx(ClientOnly, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(StaticSignInWithEmailAndPassword, { additionalContent: isSsoEnabled ? /* @__PURE__ */ jsxRuntimeExports.jsx(SignInFirstConnection, { isSignInHomepage: false }) : null, prefilledEmail }) }),
      !isSsoEnabled ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-md self-stretch", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px bg-grey-border grow" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("common:or") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px bg-grey-border grow" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typo, { variant: "title2", className: "text-center", children: t("auth:sign_in.first_connection") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SignInFirstConnection, { isSignInHomepage: false, showAskDemoButton: !isSsoEnabled && isManagedMarble }) })
        ] })
      ] }) : null
    ] }),
    authError ? /* @__PURE__ */ jsxRuntimeExports.jsx(AuthError, { error: authError, className: "mt-xl" }) : null
  ] });
}
export {
  LoginWithEmail as component
};
