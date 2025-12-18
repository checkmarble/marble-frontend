import { R as jsxRuntimeExports, $ as ClientOnly } from "../server.js";
import { U as UnreadyCallout, A as AuthError, S as SignInFirstConnection } from "./UnreadyCallout-YhzxRqAj.js";
import { u as useTranslation, B as Button, dE as Logo, T as Typo, C as CtaV2ClassName } from "./format-NPGUXq-g.js";
import { S as Spinner } from "./Spinner-GK6cEAdR.js";
import { s as signInFn } from "./auth-DIvtpsPG.js";
import { u as useMutation } from "./useMutation-C5oG90Zs.js";
import { l as Route, L as Link } from "./router-vb7i5euz.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
import "./Callout-DX4NBXlG.js";
import "./services-middleware-DR8Hua1Y.js";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "./sharpstate.es-CeF1Mf5b.js";
import "./isNullish-B8pc8Ntu.js";
import "./use-callback-ref-DXzIzfqy.js";
import "./CopyToClipboardButton-CJNJJful.js";
import "./createSsrRpc-ZXUHv2Er.js";
import "./QueryClientProvider-DYTpkCko.js";
import "./security-headers.server-BdP3HrPp.js";
import "./ThemeContext-B40HQxfH.js";
import "./config-ut8rAdyo.js";
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
function SignInWithGoogleButton({
  onClick,
  loading
}) {
  const {
    t
  } = useTranslation(["auth"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", color: "grey", size: "large", appearance: "stroked", className: "w-full justify-center gap-sm relative", onClick, disabled: loading, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { logo: "google-logo", className: "size-6" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s whitespace-nowrap text-center font-medium", children: t("auth:sign_in.google") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute end-0 mx-sm size-4", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-4" }) : null })
  ] });
}
function SignInWithGoogle({
  signIn,
  loading
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ClientOnly, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(SignInWithGoogleButton, { loading }) });
}
function MicrosoftButton({
  onClick,
  loading
}) {
  const {
    t
  } = useTranslation(["auth"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", color: "grey", size: "large", appearance: "stroked", className: "w-full justify-center gap-sm relative", onClick: () => {
    void onClick?.();
  }, disabled: loading, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { logo: "microsoft-logo", className: "size-6" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s whitespace-nowrap text-center font-medium", children: t("auth:sign_in.microsoft") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute end-0 mx-sm size-4", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-4" }) : null })
  ] });
}
function SignInWithMicrosoft({
  signIn,
  loading
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ClientOnly, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(MicrosoftButton, { loading }) });
}
function Login() {
  const {
    t
  } = useTranslation(["auth", "common"]);
  const {
    isSignupReady,
    authProvider,
    didMigrationsRun,
    isManagedMarble,
    authError,
    redirectTo
  } = Route.useLoaderData();
  const signInMutation = useMutation({
    mutationFn: async (authPayload) => signInFn({
      data: {
        idToken: authPayload.idToken,
        refreshToken: authPayload.refreshToken,
        csrf: authPayload.csrf,
        redirectTo: redirectTo ?? void 0
      }
    }).then((r) => r.redirectTo),
    onSuccess: (destination) => {
      window.location.href = destination;
    }
  });
  const signIn = (authPayload) => signInMutation.mutate(authPayload);
  const loading = signInMutation.isPending;
  const type = signInMutation.variables?.type;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2xl w-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typo, { variant: "title2", className: "text-center", children: t("auth:sign_in") }),
      !isSignupReady ? /* @__PURE__ */ jsxRuntimeExports.jsx(UnreadyCallout, { didMigrationsRun }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-sm", children: authProvider == "oidc" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "relative flex h-10 w-full items-center rounded border-2 border-[#1a73e8] bg-[#1a73e8] transition hover:bg-[rgb(69,128,233)] disabled:cursor-wait", onClick: () => {
          window.location.href = "/oidc/auth";
        }, disabled: loading, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-white w-full whitespace-nowrap text-center align-middle font-medium", children: "Sign in with OpenID Connect" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute end-0 mx-sm size-4", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-4" }) : null })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AuthError, { error: authError, className: "mt-xl" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SignInWithGoogle, { signIn, loading: loading && type === "google" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SignInWithMicrosoft, { signIn, loading: loading && type === "microsoft" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { className: CtaV2ClassName({
          variant: "primary",
          color: "primary",
          size: "large",
          className: "w-full justify-center"
        }), to: "/sign-in-email", children: t("auth:sign_in.with_email") })
      ] }) })
    ] }),
    authProvider == "firebase" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-md self-stretch", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px bg-grey-border grow" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("common:or") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px bg-grey-border grow" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typo, { variant: "title2", className: "text-center", children: t("auth:sign_in.first_connection") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SignInFirstConnection, { isSignInHomepage: true, showAskDemoButton: isManagedMarble }) })
      ] })
    ] }) : null
  ] });
}
export {
  Login as component
};
