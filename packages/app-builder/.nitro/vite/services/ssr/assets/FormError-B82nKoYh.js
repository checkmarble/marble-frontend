import { R as jsxRuntimeExports } from "../server.js";
import { u as useTranslation, d as cn } from "./format-NPGUXq-g.js";
const supportedErrors = ["duplicates", "duplicate_value"];
function FormError({ field, className, asString = false, translations }) {
  const { t } = useTranslation(["common"]);
  if (field.state.meta.errors.length === 0) return null;
  const errorMessages = field.state.meta.errors.map((error) => {
    const errorCode = error.params?.code ?? error.code;
    if (translations?.[errorCode]) {
      return translations[errorCode];
    }
    if (supportedErrors.includes(errorCode)) {
      return t(`common:errors.forms.${errorCode}`, { ...error.params });
    }
    return error.message;
  });
  return asString ? /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorDisplayAsString, { className, messages: errorMessages }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorDisplayAsComponents, { className, messages: errorMessages });
}
const containerClassName = "text-red-base bg-red-background rounded-md";
function FormErrorDisplayAsString({ messages, className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(containerClassName, "px-sm py-xs", className), children: messages.join(", ") });
}
function FormErrorDisplayAsComponents({ messages, className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(containerClassName, "w-fit p-md", className), children: /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "list-disc list-inside", children: messages.map((message) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: message }, message)) }) });
}
export {
  FormError as F
};
