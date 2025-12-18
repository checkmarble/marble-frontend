import { r as reactExports, R as jsxRuntimeExports } from "../server.js";
import { E as ExternalLink } from "./ExternalLink-CG_77QdX.js";
import { F as FormErrorOrDescription } from "./FormErrorOrDescription-DO6Hdfmn.js";
import { F as FormInput } from "./FormInput-S5xzkMXf.js";
import { F as FormLabel } from "./FormLabel-DeCgtgtj.js";
import { N as Nudge } from "./Nudge-C1ux5IUa.js";
import { S as SelectEvents } from "./EventTypes-s30OEB2P.js";
import { u as useLoaderRevalidator } from "./LoaderRevalidatorContext-C9s56i-l.js";
import { w as createWebhookPayloadSchema } from "./settings-CEpHMlp5.js";
import { a as createWebhookFn } from "./settings-CPv2zx4k.js";
import { u as useMutation } from "./useMutation-C5oG90Zs.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { a as webhooksEventsDocHref } from "./documentation-href-uAe88WFl.js";
import { g as getFieldErrors } from "./form-D2XmDKeG.js";
import { u as useForm } from "./useForm-BwABQKAs.js";
import { z as zt } from "./CopyToClipboardButton-CJNJJful.js";
import { M } from "./services-middleware-DR8Hua1Y.js";
import { e4 as Modal, u as useTranslation, s as Trans } from "./format-NPGUXq-g.js";
const useCreateWebhookMutation = () => {
  const createWebhook = useServerFn(createWebhookFn);
  return useMutation({
    mutationFn: async (payload) => createWebhook({ data: payload })
  });
};
function CreateWebhook({
  children,
  webhookStatus
}) {
  const [open, setOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { asChild: true, children }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CreateWebhookContent, { webhookStatus, onSuccess: () => setOpen(false) }) })
  ] });
}
function CreateWebhookContent({
  webhookStatus,
  onSuccess
}) {
  const { t } = useTranslation(["common", "settings"]);
  const createWebhookMutation = useCreateWebhookMutation();
  const revalidate = useLoaderRevalidator();
  const form = useForm({
    defaultValues: {
      url: "",
      eventTypes: []
    },
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        createWebhookMutation.mutateAsync(value).then(() => {
          onSuccess();
          revalidate();
        }).catch(() => {
          zt.error(t("common:errors.unknown"));
        });
      }
    },
    validators: {
      onSubmit: createWebhookPayloadSchema
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "form",
    {
      onSubmit: (e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t("settings:webhooks.new_webhook") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-lg p-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            form.Field,
            {
              name: "url",
              validators: {
                onChange: createWebhookPayloadSchema.shape.url
              },
              children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-start gap-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { name: field.name, children: t("settings:webhooks.url") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  FormInput,
                  {
                    type: "url",
                    name: field.name,
                    onBlur: field.handleBlur,
                    onChange: (e) => field.handleChange(e.currentTarget.value),
                    defaultValue: field.state.value,
                    valid: field.state.meta.errors.length === 0,
                    className: "w-full"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            form.Field,
            {
              name: "eventTypes",
              validators: {
                onChange: createWebhookPayloadSchema.shape.eventTypes
              },
              children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-start gap-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(FormLabel, { name: field.name, className: "flex items-center gap-sm", children: [
                  t("settings:webhooks.event_types"),
                  M(webhookStatus).with("allowed", () => null).otherwise((status) => /* @__PURE__ */ jsxRuntimeExports.jsx(Nudge, { kind: status, content: t("settings:webhooks.nudge"), className: "size-6" }))
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  SelectEvents,
                  {
                    selectedEventTypes: field.state.value,
                    className: "w-full",
                    name: field.name,
                    onBlur: field.handleBlur,
                    onChange: (types) => field.handleChange(types),
                    webhookStatus
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  FormErrorOrDescription,
                  {
                    errors: getFieldErrors(field.state.meta.errors),
                    description: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "whitespace-pre-wrap", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Trans,
                      {
                        t,
                        i18nKey: "settings:webhooks.events_documentation",
                        components: {
                          DocLink: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { href: webhooksEventsDocHref })
                        }
                      }
                    ) })
                  }
                )
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            form.Field,
            {
              name: "httpTimeout",
              validators: {
                onChange: createWebhookPayloadSchema.shape.httpTimeout
              },
              children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-start gap-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { name: field.name, children: t("settings:webhooks.http_timeout") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  FormInput,
                  {
                    type: "number",
                    name: field.name,
                    onBlur: field.handleBlur,
                    onChange: (e) => field.handleChange(+e.currentTarget.value),
                    defaultValue: field.state.value,
                    valid: field.state.meta.errors.length === 0,
                    className: "w-full"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  FormErrorOrDescription,
                  {
                    errors: getFieldErrors(field.state.meta.errors),
                    description: t("settings:webhooks.http_timeout.description")
                  }
                )
              ] })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t("common:cancel") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Modal.FooterButton,
            {
              label: t("settings:webhooks.new_webhook.create"),
              type: "submit",
              name: "create",
              isLoading: createWebhookMutation.isPending,
              leadingIcon: "plus"
            }
          )
        ] })
      ]
    }
  );
}
export {
  CreateWebhook as C
};
