import { r as reactExports, R as jsxRuntimeExports } from "../server.js";
import { u as useTranslation, e as Icon, b as clsx, e4 as Modal, s as Trans, B as Button, t as useFormatDateTime, en as useTable, ek as Table, el as createColumnHelper, ev as getSortedRowModel, em as getCoreRowModel } from "./format-NPGUXq-g.js";
import { ac as Route, i as AppConfigContext, P as Page } from "./router-vb7i5euz.js";
import { C as CollapsiblePaper } from "./Paper-6W_X6MFt.js";
import { u as useGetCopyToClipboard, z as zt } from "./CopyToClipboardButton-CJNJJful.js";
import { F as FormErrorOrDescription } from "./FormErrorOrDescription-DO6Hdfmn.js";
import { F as FormInput } from "./FormInput-S5xzkMXf.js";
import { F as FormLabel } from "./FormLabel-DeCgtgtj.js";
import { u as useLoaderRevalidator } from "./LoaderRevalidatorContext-C9s56i-l.js";
import { x as createWebhookSecretPayloadSchema, A as updateWebhookPayloadSchema } from "./settings-CEpHMlp5.js";
import { q as createWebhookSecretFn, r as deleteWebhookFn, t as revokeWebhookSecretFn, v as updateWebhookFn } from "./settings-CPv2zx4k.js";
import { u as useMutation } from "./useMutation-C5oG90Zs.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { g as getFieldErrors } from "./form-D2XmDKeG.js";
import { u as useForm } from "./useForm-BwABQKAs.js";
import { E as ExternalLink } from "./ExternalLink-CG_77QdX.js";
import { N as Nudge } from "./Nudge-C1ux5IUa.js";
import { S as SelectEvents, E as EventTypes } from "./EventTypes-s30OEB2P.js";
import { a as webhooksEventsDocHref } from "./documentation-href-uAe88WFl.js";
import { M } from "./services-middleware-DR8Hua1Y.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
import "./sharpstate.es-CeF1Mf5b.js";
import "./isNullish-B8pc8Ntu.js";
import "./use-callback-ref-DXzIzfqy.js";
import "./QueryClientProvider-DYTpkCko.js";
import "./security-headers.server-BdP3HrPp.js";
import "./ThemeContext-B40HQxfH.js";
import "./config-ut8rAdyo.js";
import "./short-uuid-MIi3jWzx.js";
import "./createSsrRpc-ZXUHv2Er.js";
import "./i18n-instance-store-UssbGYOM.js";
import "./auth-middleware-C4ap47rJ.js";
import "./inboxes-D556s0BB.js";
import "./files-fO9wUXBf.js";
import "./case-detail-middleware-C3JS8Yme.js";
import "./input-validation-CU_reV2S.js";
import "./async-C3pYACua.js";
import "./decisions-B-2DmJW1.js";
import "./unique-CBeBxAXx.js";
import "./scenarios-8U74nJp4.js";
import "./index-x7n7VJTa.js";
import "./index-C_WgunUr.js";
import "./array-BFSjnO9c.js";
import "./index-CtZTigeT.js";
import "./index-BF4TC3go.js";
import "./index-CR1bHmei.js";
import "node:crypto";
function SecretValue({ value, alwaysVisible, className }) {
  const [show, setShow] = reactExports.useState(false);
  const visible = alwaysVisible || show;
  const { t } = useTranslation(["common"]);
  const getCopyToClipboardProps = useGetCopyToClipboard();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 items-center gap-sm", children: [
    !alwaysVisible ? /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "shrink-0", onClick: () => setShow((prev) => !prev), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: visible ? "visibility" : "visibility_off", className: "size-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: visible ? t("common:hide") : t("common:show") })
    ] }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: clsx("truncate font-mono text-xs", className), children: visible ? value : "••••••••••••••••••••••••" }),
    visible ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "shrink-0", ...getCopyToClipboardProps(value), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "copy", className: "size-4" }) }) : null
  ] });
}
const useCreateWebhookSecretMutation = () => {
  const createWebhookSecret = useServerFn(createWebhookSecretFn);
  return useMutation({
    mutationFn: async (payload) => createWebhookSecret({ data: payload })
  });
};
function CreateWebhookSecret({ webhookId, children }) {
  const [open, setOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { asChild: true, children }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Content, { onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(CreateWebhookSecretContent, { webhookId, onSuccess: () => setOpen(false) }) })
  ] });
}
function CreateWebhookSecretContent({ webhookId, onSuccess }) {
  const { t } = useTranslation(["common", "settings"]);
  const createMutation = useCreateWebhookSecretMutation();
  const revalidate = useLoaderRevalidator();
  const form = useForm({
    defaultValues: {
      webhookId,
      expireExistingInDays: void 0
    },
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        createMutation.mutateAsync(value).then(() => {
          onSuccess();
          revalidate();
        }).catch(() => {
          zt.error(t("common:errors.unknown"));
        });
      }
    },
    validators: {
      onSubmit: createWebhookSecretPayloadSchema
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
        /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t("settings:webhooks.create_secret.title") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-lg p-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          form.Field,
          {
            name: "expireExistingInDays",
            validators: {
              onChange: createWebhookSecretPayloadSchema.shape.expireExistingInDays
            },
            children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-start gap-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { name: field.name, children: t("settings:webhooks.create_secret.expire_existing_in_days") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                FormInput,
                {
                  type: "number",
                  name: field.name,
                  onBlur: field.handleBlur,
                  onChange: (e) => field.handleChange(e.currentTarget.value ? +e.currentTarget.value : void 0),
                  defaultValue: field.state.value,
                  valid: field.state.meta.errors.length === 0,
                  className: "w-full"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                FormErrorOrDescription,
                {
                  errors: getFieldErrors(field.state.meta.errors),
                  description: t("settings:webhooks.create_secret.expire_existing_in_days.description")
                }
              )
            ] })
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t("common:cancel") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Modal.FooterButton,
            {
              label: t("settings:webhooks.create_secret"),
              type: "submit",
              isLoading: createMutation.isPending,
              leadingIcon: "plus"
            }
          )
        ] })
      ]
    }
  );
}
const useDeleteWebhookMutation = () => {
  const deleteWebhook = useServerFn(deleteWebhookFn);
  return useMutation({
    mutationFn: async (payload) => deleteWebhook({ data: payload })
  });
};
function DeleteWebhook({ webhookId, children }) {
  const [open, setOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { asChild: true, children }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Content, { onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteWebhookContent, { webhookId, onSuccess: () => setOpen(false) }) })
  ] });
}
function DeleteWebhookContent({ webhookId, onSuccess }) {
  const { t } = useTranslation(["common", "settings"]);
  const deleteWebhookMutation = useDeleteWebhookMutation();
  const revalidate = useLoaderRevalidator();
  const handleDeleteWebhook = () => {
    deleteWebhookMutation.mutateAsync({ webhookId }).then((res) => {
      if (!res) {
        onSuccess();
      }
      revalidate();
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t("settings:webhooks.delete_webhook.title") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-lg p-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-s flex flex-1 flex-col gap-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { name: "webhookId", value: webhookId, type: "hidden" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center", children: t("settings:webhooks.delete_webhook.content") })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t("common:cancel") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Modal.FooterButton,
        {
          label: t("common:delete"),
          variant: "destructive",
          type: "submit",
          name: "create",
          onClick: handleDeleteWebhook,
          disabled: deleteWebhookMutation.isPending,
          leadingIcon: "delete"
        }
      )
    ] })
  ] });
}
const useRevokeWebhookSecretMutation = () => {
  const revokeWebhookSecret = useServerFn(revokeWebhookSecretFn);
  return useMutation({
    mutationFn: async (payload) => revokeWebhookSecret({ data: payload })
  });
};
function RevokeWebhookSecret({
  webhookId,
  secretId,
  children
}) {
  const [open, setOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { asChild: true, children }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Content, { onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(RevokeWebhookSecretContent, { webhookId, secretId, onSuccess: () => setOpen(false) }) })
  ] });
}
function RevokeWebhookSecretContent({
  webhookId,
  secretId,
  onSuccess
}) {
  const { t } = useTranslation(["common", "settings"]);
  const revokeMutation = useRevokeWebhookSecretMutation();
  const revalidate = useLoaderRevalidator();
  const handleRevoke = () => {
    revokeMutation.mutateAsync({ webhookId, secretId }).then(() => {
      onSuccess();
      revalidate();
    }).catch(() => {
      zt.error(t("common:errors.unknown"));
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t("settings:webhooks.revoke_secret.title") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-lg p-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-s flex flex-1 flex-col gap-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center", children: t("settings:webhooks.revoke_secret.content") }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t("common:cancel") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Modal.FooterButton,
        {
          label: t("settings:webhooks.revoke_secret"),
          type: "submit",
          onClick: handleRevoke,
          disabled: revokeMutation.isPending,
          leadingIcon: "delete"
        }
      )
    ] })
  ] });
}
const useUpdateWebhookMutation = () => {
  const updateWebhook = useServerFn(updateWebhookFn);
  return useMutation({
    mutationFn: async (payload) => updateWebhook({ data: payload })
  });
};
function UpdateWebhook({
  defaultValue,
  children,
  webhookStatus
}) {
  const [open, setOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { asChild: true, children }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(UpdateWebhookContent, { defaultValue, webhookStatus, setOpen }) })
  ] });
}
function UpdateWebhookContent({
  defaultValue,
  setOpen,
  webhookStatus
}) {
  const { t } = useTranslation(["common", "settings"]);
  const updateWebhookMutation = useUpdateWebhookMutation();
  const revalidate = useLoaderRevalidator();
  const form = useForm({
    defaultValues: defaultValue,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        updateWebhookMutation.mutateAsync(value).then(() => {
          setOpen(false);
          revalidate();
        }).catch(() => {
          zt.error(t("common:errors.unknown"));
        });
      }
    },
    validators: {
      onSubmitAsync: updateWebhookPayloadSchema
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
        /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t("settings:webhooks.update_webhook") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-lg p-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            form.Field,
            {
              name: "eventTypes",
              validators: {
                onChange: updateWebhookPayloadSchema.shape.eventTypes
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
                onChange: updateWebhookPayloadSchema.shape.httpTimeout
              },
              children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-start gap-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { name: field.name, children: t("settings:webhooks.http_timeout") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  FormInput,
                  {
                    type: "number",
                    name: field.name,
                    defaultValue: field.state.value,
                    onChange: (e) => field.handleChange(Number(e.currentTarget.value)),
                    onBlur: field.handleBlur,
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
              label: t("settings:webhooks.update_webhook"),
              type: "submit",
              name: "update",
              isLoading: updateWebhookMutation.isPending,
              leadingIcon: "edit-square"
            }
          )
        ] })
      ]
    }
  );
}
function WebhookDetail() {
  const {
    t
  } = useTranslation(["settings"]);
  const {
    webhook,
    isEditWebhookAvailable,
    isDeleteWebhookAvailable,
    webhookStatus
  } = Route.useLoaderData();
  const {
    features
  } = AppConfigContext.useValue();
  const isWebhookSecretRotationAvailable = features.webhookSecretRotation && isEditWebhookAvailable;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Page.Header, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Content, { width: "readable", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CollapsiblePaper.Container, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CollapsiblePaper.Title, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1", children: t("settings:webhook_details") }),
          isEditWebhookAvailable ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(UpdateWebhook, { defaultValue: webhook, webhookStatus, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "primary", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-5" }),
            t("settings:webhooks.update_webhook")
          ] }) }) }) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CollapsiblePaper.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid auto-rows-fr grid-cols-[max-content_1fr] items-center gap-x-10 gap-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(WebhookLabel, { children: t("settings:webhooks.url") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(WebhookValue, { children: webhook.url }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(WebhookLabel, { children: t("settings:webhooks.event_types") }),
          webhook.eventTypes.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EventTypes, { eventTypes: webhook.eventTypes }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-disabled text-s", children: t("settings:webhooks.event_types.placeholder") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(WebhookLabel, { children: t("settings:webhooks.http_timeout") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(WebhookValue, { children: webhook.httpTimeout }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(WebhookLabel, { children: t("settings:webhooks.rate_limit") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(WebhookValue, { children: webhook.rateLimit }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(WebhookLabel, { children: t("settings:webhooks.rate_limit_duration") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(WebhookValue, { children: webhook.rateLimitDuration })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CollapsiblePaper.Container, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CollapsiblePaper.Title, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1", children: t("settings:webhook_secrets") }),
          isWebhookSecretRotationAvailable ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(CreateWebhookSecret, { webhookId: webhook.id, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "primary", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "restart-alt", className: "size-5" }),
            t("settings:webhooks.create_secret")
          ] }) }) }) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CollapsiblePaper.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(WebhookSecrets, { secrets: webhook.secrets, webhookId: webhook.id, isWebhookSecretRotationAvailable }) })
      ] }),
      isDeleteWebhookAvailable ? /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteWebhook, { webhookId: webhook.id, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", className: "w-fit", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "delete", className: "size-5" }),
        t("settings:webhooks.delete_webhook")
      ] }) }) : null
    ] })
  ] });
}
const WebhookLabel = ({
  children
}) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold first-letter:capitalize", children });
const WebhookValue = ({
  children
}) => {
  if (children === null || children === void 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-secondary", children: "-" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-primary", children });
};
const columnHelper = createColumnHelper();
function WebhookSecrets({
  secrets,
  webhookId,
  isWebhookSecretRotationAvailable
}) {
  const {
    t
  } = useTranslation(["settings"]);
  const formatDateTime = useFormatDateTime();
  const columns = reactExports.useMemo(() => [columnHelper.accessor((row) => row.value, {
    id: "value",
    header: t("settings:webhooks.secret.value"),
    size: 200,
    enableSorting: false,
    cell: ({
      getValue,
      row
    }) => {
      const value = getValue();
      const isExpired = row.original.expiresAt ? new Date(row.original.expiresAt) < /* @__PURE__ */ new Date() : false;
      const isDeactivated = !!row.original.deletedAt || isExpired;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(SecretValue, { value, alwaysVisible: isDeactivated });
    }
  }), columnHelper.accessor((row) => row.createdAt, {
    id: "createdAt",
    header: t("settings:webhooks.secret.created_at"),
    size: 100,
    cell: ({
      getValue
    }) => {
      const dateTime = getValue();
      return /* @__PURE__ */ jsxRuntimeExports.jsx("time", { dateTime, children: formatDateTime(dateTime, {
        dateStyle: "short"
      }) });
    }
  }), columnHelper.accessor((row) => row.expiresAt, {
    id: "expiresAt",
    header: t("settings:webhooks.secret.expires_at"),
    size: 100,
    cell: ({
      getValue
    }) => {
      const dateTime = getValue();
      if (!dateTime) {
        return "-";
      }
      return /* @__PURE__ */ jsxRuntimeExports.jsx("time", { dateTime, children: formatDateTime(dateTime, {
        dateStyle: "short"
      }) });
    }
  }), columnHelper.accessor((row) => row.deletedAt, {
    id: "deletedAt",
    header: t("settings:webhooks.secret.deleted_at"),
    size: 200,
    cell: ({
      getValue,
      row
    }) => {
      const dateTime = getValue();
      const isLastActiveNonExpiring = !row.original.deletedAt && !row.original.expiresAt && secrets.filter((s) => !s.deletedAt && !s.expiresAt).length <= 1;
      const showRevoke = isWebhookSecretRotationAvailable && !row.original.deletedAt && !isLastActiveNonExpiring;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: dateTime ? /* @__PURE__ */ jsxRuntimeExports.jsx("time", { dateTime, children: formatDateTime(dateTime, {
          dateStyle: "short"
        }) }) : "-" }),
        showRevoke ? /* @__PURE__ */ jsxRuntimeExports.jsx(RevokeWebhookSecret, { webhookId, secretId: row.original.id, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", size: "small", children: t("settings:webhooks.revoke_secret") }) }) : null
      ] });
    }
  })], [formatDateTime, t, isWebhookSecretRotationAvailable, webhookId, secrets]);
  const {
    table,
    getBodyProps,
    rows,
    getContainerProps
  } = useTable({
    data: secrets,
    columns,
    enableColumnResizing: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Table.Container, { ...getContainerProps(), className: "max-h-96", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Header, { headerGroups: table.getHeaderGroups() }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Body, { ...getBodyProps(), children: rows.map((row) => {
      const isExpired = row.original.expiresAt ? new Date(row.original.expiresAt) < /* @__PURE__ */ new Date() : false;
      const isDeactivated = !!row.original.deletedAt || isExpired;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Row, { row, className: isDeactivated ? "text-grey-disabled opacity-50" : void 0 }, row.id);
    }) })
  ] });
}
export {
  WebhookDetail as component
};
