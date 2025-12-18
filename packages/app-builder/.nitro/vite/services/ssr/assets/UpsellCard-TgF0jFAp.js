import { R as jsxRuntimeExports } from "../server.js";
import { u as useTranslation, e as Icon, T as Typo, C as CtaV2ClassName, d as cn } from "./format-NPGUXq-g.js";
function UpsellCard({ title, description, benefits = [], className }) {
  const { t } = useTranslation(["common"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn(
        "bg-surface-card border-purple-border flex flex-col items-center gap-md rounded-lg border-2 border-dashed p-lg text-center",
        className
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-purple-background-light text-purple-primary flex size-12 items-center justify-center rounded-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "lock", className: "size-6" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typo, { variant: "subtitle1", children: title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-s text-grey-secondary max-w-md", children: description })
        ] }),
        benefits.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "text-s text-grey-primary flex flex-col items-start gap-xs", children: benefits.map((benefit) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "tick", className: "text-purple-primary size-4 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: benefit })
        ] }, benefit)) }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "a",
          {
            className: CtaV2ClassName({ variant: "primary", size: "large", color: "primary" }),
            href: "https://checkmarble.com/upgrade",
            target: "_blank",
            rel: "noreferrer",
            children: t("common:upgrade")
          }
        )
      ]
    }
  );
}
export {
  UpsellCard as U
};
