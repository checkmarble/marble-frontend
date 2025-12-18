import { r as reactExports, R as jsxRuntimeExports } from "../server.js";
import { u as useLoaderRevalidator } from "./LoaderRevalidatorContext-C9s56i-l.js";
import { o as createAnnotationFn } from "./data-BFm2FCTm.js";
import { u as useMutation } from "./useMutation-C5oG90Zs.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { s as srcExports } from "./Time-IafhAG3W.js";
import { b as createCommentAnnotationSchema } from "./annotations-DpAN3M8g.js";
import { s as submitOnCtrlEnter, h as handleSubmit } from "./form-D2XmDKeG.js";
import { u as useCallbackRef } from "./use-callback-ref-DXzIzfqy.js";
import { u as useForm } from "./useForm-BwABQKAs.js";
import { u as useTranslation, B as Button, e as Icon, b as clsx, d as cn } from "./format-NPGUXq-g.js";
import { z as zt } from "./CopyToClipboardButton-CJNJJful.js";
const useCreateAnnotationMutation = () => {
  const createAnnotation = useServerFn(createAnnotationFn);
  return useMutation({
    mutationKey: ["annotations", "create"],
    mutationFn: async (payload) => {
      const formData = srcExports.serialize(payload, { dotsForObjectNotation: true, indices: true });
      return createAnnotation({ data: formData });
    }
  });
};
function ClientCommentForm({
  caseId,
  tableName,
  objectId,
  className,
  onAnnotateSuccess: onAnnotateSuccessProps
}) {
  const { t } = useTranslation(["common", "cases"]);
  const createAnnotationMutation = useCreateAnnotationMutation();
  const onAnnotateSuccess = useCallbackRef(onAnnotateSuccessProps);
  const revalidate = useLoaderRevalidator();
  const form = useForm({
    defaultValues: {
      caseId,
      tableName,
      objectId,
      type: "comment",
      payload: {
        text: ""
      }
    },
    validators: {
      onSubmit: createCommentAnnotationSchema,
      onChange: createCommentAnnotationSchema,
      onMount: createCommentAnnotationSchema
    },
    onSubmit({ value }) {
      createAnnotationMutation.mutateAsync(value).then((result) => {
        revalidate();
        if (result.success) {
          form.setFieldValue("payload.text", "");
          onAnnotateSuccess();
        } else {
          zt.error(t("common:errors.unknown"));
        }
      }).catch(() => {
        zt.error(t("common:errors.unknown"));
      });
    }
  });
  reactExports.useEffect(() => {
    form.validate("mount");
  }, [form]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "form",
    {
      onSubmit: handleSubmit(form),
      className: cn("flex justify-between rounded-md px-md py-md bg-surface-elevated", className),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "payload.text", children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex grow flex-col gap-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            value: field.state.value,
            onChange: (e) => field.handleChange(e.currentTarget.value),
            onKeyDown: submitOnCtrlEnter,
            name: field.name,
            placeholder: t("cases:case_detail.add_a_comment.placeholder"),
            className: "form-textarea text-small max-h-40 w-full grow resize-none overflow-y-scroll border-none bg-transparent outline-hidden"
          }
        ) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(form.Subscribe, { selector: (state) => [state.canSubmit, state.isSubmitting], children: ([canSubmit, isSubmitting]) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "submit",
            mode: "icon",
            variant: "primary",
            className: "shrink-0",
            disabled: !canSubmit || isSubmitting,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Icon,
              {
                icon: isSubmitting ? "spinner" : "send",
                className: clsx("size-3.5", { "animate-spin": isSubmitting })
              }
            )
          }
        ) })
      ]
    }
  );
}
export {
  ClientCommentForm as C,
  useCreateAnnotationMutation as u
};
