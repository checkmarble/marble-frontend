import { R as jsxRuntimeExports } from "../server.js";
import { e as Icon, d as cn, f as cva } from "./format-NPGUXq-g.js";
const iconColorClassName = {
  grey: "text-grey-primary",
  purple: "text-purple-primary",
  red: "text-red-primary",
  orange: "text-orange-primary",
  yellow: "text-yellow-primary"
};
const callout = cva("text-s flex flex-row items-center gap-sm rounded-sm p-sm font-normal", {
  variants: {
    /**
     * Outlined variant is usefull when you want to use the callout on non white background
     * @default soft
     */
    variant: {
      outlined: "bg-surface-card border-grey-border border",
      soft: "bg-grey-background-light"
    },
    color: {
      grey: null,
      purple: "border-s-2 border-s-purple-primary",
      red: "border-s-2 border-s-red-primary",
      orange: "border-s-2 border-s-orange-primary",
      yellow: "border-s-2 border-s-yellow-primary"
    },
    bordered: {
      true: "border border-grey-border",
      false: null
    }
  }
});
function Callout({
  children,
  className,
  color = "purple",
  variant = "soft",
  bordered,
  icon = "lightbulb",
  iconColor = "grey",
  ...otherProps
}) {
  if (!children) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: callout({ color, variant, className, bordered }), ...otherProps, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon, className: cn("size-4 shrink-0", iconColorClassName[iconColor ?? "grey"]) }),
    children
  ] });
}
function CalloutV2({ children, className, ...otherProps }) {
  if (!children) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "aside",
    {
      className: cn(
        "bg-purple-background-light text-s text-purple-primary flex flex-row gap-sm rounded-lg p-md font-normal items-center dark:text-grey-primary",
        className
      ),
      ...otherProps,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "tip", className: "size-4 shrink-0" }),
        children
      ]
    }
  );
}
export {
  Callout as C,
  CalloutV2 as a
};
