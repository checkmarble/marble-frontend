import { r as reactExports, R as jsxRuntimeExports, ae as Outlet, O as useRouter } from "../server.js";
import { u as useLoaderRevalidator, L as LoaderRevalidatorContext } from "./LoaderRevalidatorContext-C9s56i-l.js";
import { u as useSetLanguageMutation } from "./set-language-Butr3gYn.js";
import { d as supportedLngs } from "./services-middleware-DR8Hua1Y.js";
import { z as zt } from "./CopyToClipboardButton-CJNJJful.js";
import { u as useTranslation, dD as Tooltip } from "./format-NPGUXq-g.js";
import { b as useNavigate, A as AgnosticNavigationContext } from "./router-vb7i5euz.js";
import { u as useSegmentPageTracking } from "./index-QKAcT_2P.js";
import { Q as QueryString } from "./input-validation-CU_reV2S.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
import "./createSsrRpc-ZXUHv2Er.js";
import "./short-uuid-MIi3jWzx.js";
import "./useMutation-C5oG90Zs.js";
import "./QueryClientProvider-DYTpkCko.js";
import "./useServerFn-CrqFKl7V.js";
import "node:crypto";
import "./sharpstate.es-CeF1Mf5b.js";
import "./isNullish-B8pc8Ntu.js";
import "./use-callback-ref-DXzIzfqy.js";
import "./security-headers.server-BdP3HrPp.js";
import "./ThemeContext-B40HQxfH.js";
import "./config-ut8rAdyo.js";
import "./i18n-instance-store-UssbGYOM.js";
import "./auth-middleware-C4ap47rJ.js";
import "./inboxes-D556s0BB.js";
import "./files-fO9wUXBf.js";
import "./case-detail-middleware-C3JS8Yme.js";
import "./async-C3pYACua.js";
import "./decisions-B-2DmJW1.js";
import "./unique-CBeBxAXx.js";
import "./scenarios-8U74nJp4.js";
function DevLanguageShortcut() {
  const {
    t,
    i18n: { language, changeLanguage }
  } = useTranslation(["common"]);
  const setLanguageMutation = useSetLanguageMutation();
  const revalidate = useLoaderRevalidator();
  reactExports.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === "L") {
        e.preventDefault();
        const currentIndex = supportedLngs.indexOf(language);
        const nextIndex = (currentIndex + 1) % supportedLngs.length;
        const nextLang = supportedLngs[nextIndex];
        if (!nextLang) return;
        setLanguageMutation.mutate(
          { preferredLanguage: nextLang },
          {
            onSuccess: () => {
              changeLanguage(nextLang);
              revalidate();
            },
            onError: () => zt.error(t("common:errors.unknown"))
          }
        );
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [language, setLanguageMutation, revalidate]);
  return null;
}
function App() {
  useSegmentPageTracking();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(RootProviders, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DevLanguageShortcut, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {})
  ] });
}
function RootProviders({
  children
}) {
  const router = useRouter();
  const tsNavigate = useNavigate();
  const navigate = reactExports.useCallback((toOrDelta, options) => {
    if (typeof toOrDelta === "number") {
      window.history.go(toOrDelta);
      return;
    }
    const to = typeof toOrDelta === "string" ? toOrDelta : toOrDelta.pathname ?? "/";
    const search = typeof toOrDelta !== "string" && toOrDelta.search ? QueryString.parse(toOrDelta.search, {
      ignoreQueryPrefix: true
    }) : void 0;
    tsNavigate({
      to,
      replace: options?.replace,
      search
    });
  }, [tsNavigate]);
  const invalidate = reactExports.useCallback(() => {
    router.invalidate();
  }, [router]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderRevalidatorContext.Provider, { value: invalidate, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AgnosticNavigationContext.Provider, { value: navigate, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip.Provider, { children }) }) });
}
export {
  App as component
};
