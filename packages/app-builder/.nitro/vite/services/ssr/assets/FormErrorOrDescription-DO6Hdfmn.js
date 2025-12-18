import { r as reactExports, R as jsxRuntimeExports } from "../server.js";
import { d as cn, b as clsx } from "./format-NPGUXq-g.js";
const FormErrorOrDescription = reactExports.forwardRef(
  function FormErrorOrDescription2({ errorClassName, descriptionClassName, ...props }, ref) {
    if (props.errors?.length) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        "p",
        {
          ref,
          className: cn(
            "bg-red-background text-s text-red-primary flex flex-col gap-xs rounded-sm border border-transparent px-xs py-2xs font-medium transition-opacity duration-200 ease-in-out",
            "dark:bg-transparent dark:border-red-primary",
            errorClassName
          ),
          ...props,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: props.errors[0] })
        }
      );
    }
    if (props.description) {
      return typeof props.description === "string" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "p",
        {
          ref,
          className: clsx(
            "text-s text-grey-secondary font-medium transition-opacity duration-200 ease-in-out",
            descriptionClassName
          ),
          ...props,
          children: props.description
        }
      ) : props.description;
    }
    return null;
  }
);
export {
  FormErrorOrDescription as F
};
