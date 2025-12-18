import { R as jsxRuntimeExports } from "../server.js";
import { j as Tag, e as Icon, d as cn } from "./format-NPGUXq-g.js";
const RuleGroup = ({
  ruleGroup,
  onClear,
  className
}) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Tag, { color: "purple", size: "small", className: cn("gap-sm", className), children: [
  ruleGroup,
  onClear ? /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { onClick: onClear, icon: "cross", className: "size-4 cursor-pointer hover:opacity-70" }) : null
] });
export {
  RuleGroup as R
};
