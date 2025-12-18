import { R as jsxRuntimeExports } from "../server.js";
import { d as cn, f as cva } from "./format-NPGUXq-g.js";
const cardClassName = cva("border rounded-md p-md", {
  variants: {
    color: {
      default: "border-grey-border bg-surface-card",
      purple: "border-purple-border-light bg-purple-background-light dark:border-purple-disabled dark:bg-purple-border"
    }
  },
  defaultVariants: {
    color: "default"
  }
});
function Card({ children, className, color }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(cardClassName({ color }), className), children });
}
export {
  Card as C
};
