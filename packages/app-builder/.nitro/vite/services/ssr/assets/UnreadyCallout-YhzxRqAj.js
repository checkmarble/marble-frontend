import { R as jsxRuntimeExports } from "../server.js";
import { u as useTranslation, b as clsx, C as CtaV2ClassName } from "./format-NPGUXq-g.js";
import { a as authI18n, L as Link } from "./router-vb7i5euz.js";
import { C as Callout } from "./Callout-DX4NBXlG.js";
const errorLabels = {
  NoAccount: "auth:errors.no_account",
  CSRFError: "auth:errors.csrf_error",
  Unknown: "common:errors.unknown",
  BackendUnavailable: "common:errors.backend_unvailable"
};
function AuthError({ error, className }) {
  const { t } = useTranslation(authI18n);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: clsx("text-m bg-red-background text-red-primary w-full rounded-xs p-sm font-normal", className), children: t(errorLabels[error]) });
}
function SignInFirstConnection({
  isSignInHomepage,
  showAskDemoButton
}) {
  const { t } = useTranslation(["auth"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        className: CtaV2ClassName({
          variant: "secondary",
          size: "large",
          className: "w-full justify-center text-center h-auto min-h-10 py-sm"
        }),
        to: "/create-password",
        children: t(isSignInHomepage ? "auth:sign_up.set_password_sign_in" : "auth:sign_up.set_password_sign_in_email")
      }
    ),
    showAskDemoButton ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      "a",
      {
        className: CtaV2ClassName({
          variant: "secondary",
          size: "large",
          className: "w-full justify-center text-center h-auto min-h-10 py-sm"
        }),
        href: "https://www.checkmarble.com/demo-fraud",
        target: "_blank",
        rel: "noopener noreferrer",
        children: t("auth:sign_up.no_account")
      }
    ) : null
  ] });
}
function UnreadyCallout({ didMigrationsRun }) {
  const { t } = useTranslation(["auth"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { variant: "soft", color: "red", className: "mb-lg text-start", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    didMigrationsRun ? t("auth:sign_up.warning.instance_not_initialized") : t("auth:sign_up.warning.database_not_migrated"),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
      t("auth:sign_up.read_more"),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "https://github.com/checkmarble/marble/blob/main/installation/first_connection.md",
          className: "text-purple-primary px-[1ch] underline",
          children: t("auth:sign_up.first_connection_guide")
        }
      )
    ] })
  ] }) });
}
export {
  AuthError as A,
  SignInFirstConnection as S,
  UnreadyCallout as U
};
