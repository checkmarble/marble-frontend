import { R as jsxRuntimeExports, a as isRedirect } from "../server.js";
import { a as authI18n, E as ErrorComponent } from "./router-vb7i5euz.js";
import { l as logoutFn } from "./auth-DIvtpsPG.js";
import { s as segment } from "./index-QKAcT_2P.js";
import { F as FORBIDDEN, b as captureException } from "./services-middleware-DR8Hua1Y.js";
import { u as useTranslation, T as Typo, B as Button, e as Icon } from "./format-NPGUXq-g.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
import "./QueryClientProvider-DYTpkCko.js";
import "./security-headers.server-BdP3HrPp.js";
import "./ThemeContext-B40HQxfH.js";
import "./config-ut8rAdyo.js";
import "./short-uuid-MIi3jWzx.js";
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
import "node:crypto";
import "./sharpstate.es-CeF1Mf5b.js";
import "./isNullish-B8pc8Ntu.js";
import "./use-callback-ref-DXzIzfqy.js";
function AppRouterError({
  error
}) {
  const {
    t
  } = useTranslation(authI18n);
  let errorComponent;
  if (error instanceof Response && error.status === FORBIDDEN) {
    errorComponent = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "m-auto flex flex-col items-center gap-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typo, { variant: "title1", className: "text-purple-hover", children: t("common:error_boundary.marble_admin.title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-s mb-lg", children: t("common:error_boundary.marble_admin.subtitle") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "primary", onClick: () => {
        void segment.reset();
        void logoutFn({
          data: {}
        });
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "logout", className: "size-5" }),
        t("common:auth.logout")
      ] }) })
    ] });
  } else if (!isRedirect(error)) {
    captureException(error);
    errorComponent = /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorComponent, { error });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-purple-background-light flex size-full items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface-card flex max-w-md rounded-2xl p-2xl shadow-md", children: errorComponent }) });
}
export {
  AppRouterError as errorComponent
};
