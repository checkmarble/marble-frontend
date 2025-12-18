import { R as jsxRuntimeExports } from "../server.js";
import { d as distExports } from "./CopyToClipboardButton-CJNJJful.js";
import { u as useTranslation, d as cn, e as Icon } from "./format-NPGUXq-g.js";
function Spinner({ className }) {
  const { t } = useTranslation(["common"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { role: "status", className: "inline-flex items-center justify-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "span",
      {
        "aria-hidden": true,
        className: cn(
          "border-purple-background border-r-purple-primary box-border shrink-0 animate-spin rounded-full border-2 border-solid inline-block",
          className
        )
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: t("common:loading") })
  ] });
}
function LoadingIcon({ className, loading, icon }) {
  const showSpinner = distExports.useSpinDelay(loading);
  return showSpinner ? /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon, className });
}
export {
  LoadingIcon as L,
  Spinner as S
};
