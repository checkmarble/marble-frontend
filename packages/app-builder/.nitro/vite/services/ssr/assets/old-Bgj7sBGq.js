import { R as jsxRuntimeExports } from "../server.js";
import { N as useAgnosticNavigation, av as casesI18n, E as ErrorComponent } from "./router-vb7i5euz.js";
import { b as captureException, H as isNotFoundHttpError } from "./services-middleware-DR8Hua1Y.js";
import { u as useTranslation, B as Button } from "./format-NPGUXq-g.js";
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
const SplitErrorComponent = ({
  error
}) => {
  const navigate = useAgnosticNavigation();
  const {
    t
  } = useTranslation(casesI18n);
  captureException(error);
  if (isNotFoundHttpError(error)) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "m-auto flex flex-col items-center gap-md", children: [
      t("common:errors.not_found"),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "primary", onClick: () => navigate(-1), children: t("common:go_back") }) })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorComponent, { error });
};
export {
  SplitErrorComponent as errorComponent
};
