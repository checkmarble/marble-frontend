import { R as jsxRuntimeExports } from "../server.js";
import { H as HoverCard, a as HoverCardTrigger, b as HoverCardPortal, c as HoverCardContent } from "./index-CtZTigeT.js";
import { u as useTranslation, e as Icon, d as cn, C as CtaV2ClassName, f as cva } from "./format-NPGUXq-g.js";
import { M } from "./services-middleware-DR8Hua1Y.js";
const triggerClassName = cva("flex items-center justify-center text-white rounded-sm size-6", {
  variants: {
    kind: {
      test: "bg-purple-primary",
      restricted: "bg-purple-disabled",
      missing_configuration: "bg-yellow-primary"
    }
  }
});
const Nudge = ({ content, link, className, kind = "restricted", iconClass }) => {
  const { t } = useTranslation(["common"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(HoverCard, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(HoverCardTrigger, { tabIndex: -1, asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: triggerClassName({ kind, className }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Icon,
      {
        icon: M(kind).with("restricted", () => "lock").with("test", () => "unlock-right").with("missing_configuration", () => "warning").exhaustive(),
        className: cn("size-3", iconClass),
        "aria-hidden": true
      }
    ) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(HoverCardPortal, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      HoverCardContent,
      {
        side: "right",
        align: "start",
        sideOffset: 8,
        alignOffset: -8,
        className: cn(
          "bg-surface-card z-50 flex w-60 flex-col items-center gap-lg rounded-sm border p-md pointer-events-auto shadow-lg",
          {
            "border-purple-disabled": kind !== "missing_configuration",
            "border-yellow-primary": kind === "missing_configuration"
          }
        ),
        onClick: (e) => e.stopPropagation(),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-m font-bold", children: M(kind).with("missing_configuration", () => t("common:missing_configuration_title")).otherwise(() => t("common:premium")) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full flex-col items-center gap-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-s w-full text-center font-medium", children: M(kind).with("missing_configuration", () => t("common:missing_configuration")).otherwise(() => content) }),
            link ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              "a",
              {
                className: "text-s text-purple-primary inline-block w-full text-center hover:underline",
                target: "_blank",
                rel: "noreferrer",
                href: link,
                children: t("common:check_on_docs")
              }
            ) : null
          ] }),
          kind !== "missing_configuration" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "a",
            {
              className: CtaV2ClassName({
                variant: "primary",
                color: "primary",
                className: "mt-md text-center"
              }),
              href: "https://checkmarble.com/upgrade",
              target: "_blank",
              rel: "noreferrer",
              children: t("common:upgrade")
            }
          ) : null
        ]
      }
    ) })
  ] });
};
export {
  Nudge as N
};
