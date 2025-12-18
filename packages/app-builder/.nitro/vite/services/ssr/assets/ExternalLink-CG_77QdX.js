import { r as reactExports, R as jsxRuntimeExports } from "../server.js";
import { d as cn } from "./format-NPGUXq-g.js";
const linkClasses = "hover:text-purple-hover focus:text-purple-hover font-semibold lowercase text-purple-primary hover:underline focus:underline";
const ExternalLink = reactExports.forwardRef(function ExternalLink2({ className, children, ...otherProps }, ref) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("a", { ref, className: cn(linkClasses, className), target: "_blank", rel: "noopener noreferrer", ...otherProps, children });
});
export {
  ExternalLink as E,
  linkClasses as l
};
