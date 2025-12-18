import { R as jsxRuntimeExports } from "../server.js";
import { u as useTranslation, e as Icon } from "./format-NPGUXq-g.js";
function getPivotDisplayValue(pivot) {
  if (pivot.type === "field") {
    return pivot.field;
  }
  return `->${pivot.pathLinks.join("->")}`;
}
function ScreeningErrors({ screening }) {
  const { t } = useTranslation(["screenings"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-s bg-red-background text-red-primary flex items-center gap-md rounded-sm p-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "error", className: "size-5 shrink-0" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: t("screenings:error_label", {
        count: screening.errorCodes.length,
        name: screening.config.name
      }) }),
      screening.errorCodes.map((errorCode) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: t(`screenings:error.${errorCode}`) }, errorCode))
    ] })
  ] });
}
export {
  ScreeningErrors as S,
  getPivotDisplayValue as g
};
