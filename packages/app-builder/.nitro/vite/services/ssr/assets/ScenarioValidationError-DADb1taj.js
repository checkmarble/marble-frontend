import { R as jsxRuntimeExports } from "../server.js";
import { b as clsx } from "./format-NPGUXq-g.js";
function EvaluationErrors({ errors, className }) {
  if (errors.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: clsx("flex flex-row flex-wrap gap-sm", className), children: errors.map((error) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "span",
    {
      className: clsx(
        "bg-red-background text-s text-red-primary flex h-8 items-center justify-center rounded-sm border border-transparent px-xs py-2xs font-medium",
        "dark:bg-transparent dark:border-red-primary",
        className
      ),
      children: error
    },
    error
  )) });
}
export {
  EvaluationErrors as E
};
