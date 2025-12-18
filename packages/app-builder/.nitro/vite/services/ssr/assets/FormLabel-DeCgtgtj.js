import { r as reactExports, R as jsxRuntimeExports } from "../server.js";
import { R as Root } from "./index-x7n7VJTa.js";
import { d as cn } from "./format-NPGUXq-g.js";
const FormLabel = reactExports.forwardRef(
  function FormLabel2({ className, valid, name, ...props }, ref) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Root,
      {
        ref,
        htmlFor: name,
        className: cn(className, {
          "text-red-primary": valid !== void 0 && !valid
        }),
        ...props
      }
    );
  }
);
export {
  FormLabel as F
};
