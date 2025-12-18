import { r as reactExports, R as jsxRuntimeExports } from "../server.js";
import { C as Callout } from "./Callout-DX4NBXlG.js";
import { z as zt, C as CopyToClipboardButton } from "./CopyToClipboardButton-CJNJJful.js";
import { J as Route, P as Page, L as Link } from "./router-vb7i5euz.js";
import { u as useTranslation, e4 as Modal, B as Button, e as Icon, dZ as SelectV2, en as useTable, ek as Table, el as createColumnHelper, T as Typo, s as Trans, em as getCoreRowModel } from "./format-NPGUXq-g.js";
import { C as CollapsiblePaper } from "./Paper-6W_X6MFt.js";
import { E as ExternalLink } from "./ExternalLink-CG_77QdX.js";
import { N as Nudge } from "./Nudge-C1ux5IUa.js";
import { F as FormErrorOrDescription } from "./FormErrorOrDescription-DO6Hdfmn.js";
import { F as FormInput } from "./FormInput-S5xzkMXf.js";
import { F as FormLabel } from "./FormLabel-DeCgtgtj.js";
import { u as useLoaderRevalidator } from "./LoaderRevalidatorContext-C9s56i-l.js";
import { aL as apiKeyRoleOptions } from "./services-middleware-DR8Hua1Y.js";
import { c as createApiKeyPayloadSchema } from "./settings-CEpHMlp5.js";
import { m as createApiKeyFn, n as deleteApiKeyFn } from "./settings-CPv2zx4k.js";
import { u as useMutation } from "./useMutation-C5oG90Zs.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { g as getFieldErrors, h as handleSubmit } from "./form-D2XmDKeG.js";
import { u as useForm } from "./useForm-BwABQKAs.js";
import { C as CreateWebhook } from "./CreateWebhook-CGusmE0t.js";
import { E as EventTypes } from "./EventTypes-s30OEB2P.js";
import { w as webhooksSetupDocHref } from "./documentation-href-uAe88WFl.js";
import { A as isAccessible } from "./feature-access-B8PIS8ad.js";
import { d as downloadFile } from "./download-file-C533i5xX.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
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
import "./sharpstate.es-CeF1Mf5b.js";
import "./isNullish-B8pc8Ntu.js";
import "./use-callback-ref-DXzIzfqy.js";
import "./index-CtZTigeT.js";
import "./index-BF4TC3go.js";
import "./index-C_WgunUr.js";
import "./index-CR1bHmei.js";
import "./index-x7n7VJTa.js";
import "node:crypto";
import "./array-BFSjnO9c.js";
const useCreateApiKeyMutation = () => {
  const createApiKey = useServerFn(createApiKeyFn);
  return useMutation({
    mutationKey: ["settings", "api-keys", "create"],
    mutationFn: async (payload) => createApiKey({ data: payload })
  });
};
function tKeyForApiKeyRole(role) {
  switch (role) {
    case "API_CLIENT":
      return "settings:api_keys.role.api_client";
    default:
      return "settings:api_keys.role.unknown";
  }
}
function CreateApiKey() {
  const { t } = useTranslation(["settings"]);
  const [open, setOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { onClick: (e) => e.stopPropagation(), asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-5" }),
      t("settings:api_keys.new_api_key")
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Content, { onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(CreateApiKeyContent, { onSuccess: () => setOpen(false) }) })
  ] });
}
const CreateApiKeyContent = ({ onSuccess }) => {
  const { t } = useTranslation(["settings", "common"]);
  const createApiKeyMutation = useCreateApiKeyMutation();
  const revalidate = useLoaderRevalidator();
  const form = useForm({
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        createApiKeyMutation.mutateAsync(value).then(() => {
          onSuccess();
          revalidate();
        }).catch(() => {
          zt.error(t("common:errors.unknown"));
        });
      }
    },
    defaultValues: { description: "", role: "API_CLIENT" },
    validators: {
      onChange: createApiKeyPayloadSchema,
      onSubmit: createApiKeyPayloadSchema
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit(form), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t("settings:api_keys.new_api_key") }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface-card flex flex-col gap-lg p-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "description", children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group flex flex-col gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { name: field.name, children: t("settings:api_keys.description") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          FormInput,
          {
            name: field.name,
            onBlur: field.handleBlur,
            onChange: (e) => field.handleChange(e.currentTarget.value),
            valid: field.state.meta.errors.length === 0,
            type: "text"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "role", children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group flex flex-col gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { name: field.name, children: t("settings:api_keys.role") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SelectV2,
          {
            disabled: apiKeyRoleOptions.length === 1,
            value: field.state.value,
            onChange: (role) => field.handleChange(role),
            placeholder: t("settings:api_keys.role"),
            options: apiKeyRoleOptions.map((role) => ({
              label: t(tKeyForApiKeyRole(role)),
              value: role
            }))
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t("common:cancel") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { label: t("settings:api_keys.create"), type: "submit" })
    ] })
  ] });
};
const useDeleteApiKeyMutation = () => {
  const deleteApiKey = useServerFn(deleteApiKeyFn);
  return useMutation({
    mutationKey: ["settings", "api-keys", "delete"],
    mutationFn: async (payload) => deleteApiKey({ data: payload })
  });
};
function DeleteApiKey({ apiKey }) {
  const { t } = useTranslation(["settings"]);
  const [open, setOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "delete", className: "size-6 shrink-0", "aria-label": t("settings:api_keys.delete") }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteApiKeyContent, { apiKey, onSuccess: () => setOpen(false) }) })
  ] });
}
function DeleteApiKeyContent({ apiKey, onSuccess }) {
  const { t } = useTranslation(["settings", "common"]);
  const deleteApiKeyMutation = useDeleteApiKeyMutation();
  const revalidate = useLoaderRevalidator();
  const handleDeleteApiKey = () => {
    deleteApiKeyMutation.mutateAsync({ apiKeyId: apiKey.id }).then((res) => {
      if (!res) {
        onSuccess();
      }
      revalidate();
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t("settings:api_keys.delete") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-lg p-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-s flex flex-1 flex-col gap-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { name: "apiKeyId", value: apiKey.id, type: "hidden" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center", children: t("settings:api_keys.delete.content") })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t("common:cancel") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Modal.FooterButton,
        {
          label: t("common:delete"),
          variant: "destructive",
          onClick: handleDeleteApiKey,
          leadingIcon: "delete",
          isLoading: deleteApiKeyMutation.isPending
        }
      )
    ] })
  ] });
}
const apiKeyColumnHelper = createColumnHelper();
const webhookColumnHelper = createColumnHelper();
function ApiKeys() {
  const {
    t
  } = useTranslation(["common", "settings", "api"]);
  const {
    apiKeys,
    openapiV1,
    createdApiKey,
    isCreateApiKeyAvailable,
    isDeleteApiKeyAvailable,
    webhooks,
    canReadWebhooks,
    webhooksError,
    isCreateWebhookAvailable,
    webhooksStatus
  } = Route.useLoaderData();
  const apiKeyColumns = reactExports.useMemo(() => {
    return [apiKeyColumnHelper.accessor((row) => row.prefix, {
      id: "prefix",
      header: t("settings:api_keys.value"),
      size: 100,
      cell: ({
        getValue
      }) => {
        return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: `${getValue()}*************` });
      }
    }), apiKeyColumnHelper.accessor((row) => row.description, {
      id: "description",
      header: t("settings:api_keys.description"),
      size: 300
    }), apiKeyColumnHelper.accessor((row) => row.role, {
      id: "role",
      header: t("settings:api_keys.role"),
      size: 150,
      cell: ({
        getValue
      }) => t(tKeyForApiKeyRole(getValue()))
    }), ...isDeleteApiKeyAvailable ? [apiKeyColumnHelper.display({
      id: "actions",
      size: 100,
      cell: ({
        cell
      }) => {
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "group-hover:text-grey-primary focus-within:text-grey-primary text-transparent", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteApiKey, { apiKey: cell.row.original }) });
      }
    })] : []];
  }, [isDeleteApiKeyAvailable, t]);
  const apiKeyTable = useTable({
    data: apiKeys,
    columns: apiKeyColumns,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel()
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Content, { width: "readable", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col items-start gap-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", onClick: () => {
      try {
        const blob = new Blob([JSON.stringify(openapiV1)], {
          type: "application/json;charset=utf-8,"
        });
        const url = URL.createObjectURL(blob);
        void downloadFile(url, "openapi-v1.json");
      } catch (_error) {
        zt.error(t("common:errors.unknown"));
      }
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "download", className: "me-sm size-5" }),
      t("api:download_openapi_spec_v1")
    ] }) }),
    createdApiKey ? /* @__PURE__ */ jsxRuntimeExports.jsx(CreatedAPIKey, { createdApiKey }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CollapsiblePaper.Container, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CollapsiblePaper.Title, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1", children: t("settings:api_keys") }),
        isCreateApiKeyAvailable ? /* @__PURE__ */ jsxRuntimeExports.jsx(CreateApiKey, {}) : null
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CollapsiblePaper.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table.Container, { ...apiKeyTable.getContainerProps(), className: "max-h-96", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Header, { headerGroups: apiKeyTable.table.getHeaderGroups() }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Body, { ...apiKeyTable.getBodyProps(), children: apiKeyTable.rows.map((row) => {
          return /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Row, { className: "hover:bg-purple-background-light group", row }, row.id);
        }) })
      ] }) })
    ] }),
    canReadWebhooks ? /* @__PURE__ */ jsxRuntimeExports.jsx(WebhooksSection, { webhooks, webhooksError, isCreateWebhookAvailable, webhooksStatus }) : null
  ] });
}
function CreatedAPIKey({
  createdApiKey
}) {
  const {
    t
  } = useTranslation(["settings"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { variant: "outlined", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: t("settings:api_keys.new_api_key") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("settings:api_keys.copy_api_key") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CopyToClipboardButton, { toCopy: createdApiKey.key, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s line-clamp-1 font-semibold", children: createdApiKey.key }) })
  ] }) });
}
function WebhooksSection({
  webhooks,
  webhooksError,
  isCreateWebhookAvailable,
  webhooksStatus
}) {
  const {
    t
  } = useTranslation(["settings"]);
  const columns = reactExports.useMemo(() => {
    return [webhookColumnHelper.accessor((row) => row.url, {
      id: "url",
      header: t("settings:webhooks.url"),
      size: 200
    }), webhookColumnHelper.accessor((row) => row.eventTypes, {
      id: "eventTypes",
      header: t("settings:webhooks.event_types"),
      size: 200,
      cell: ({
        getValue
      }) => {
        const eventTypes = getValue();
        if (eventTypes.length === 0) {
          return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-disabled text-s", children: t("settings:webhooks.event_types.placeholder") });
        }
        return /* @__PURE__ */ jsxRuntimeExports.jsx(EventTypes, { eventTypes });
      }
    })];
  }, [t]);
  const {
    table,
    getBodyProps,
    rows,
    getContainerProps
  } = useTable({
    data: webhooks,
    columns,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false,
    rowLink: (webhook) => /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/settings/webhooks/$webhookId", params: {
      webhookId: webhook.id
    } })
  });
  const webhooksTitleContent = /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex flex-1 items-center gap-sm", children: [
    t("settings:webhooks"),
    webhooksStatus !== "allowed" && !isAccessible(webhooksStatus) ? /* @__PURE__ */ jsxRuntimeExports.jsx(Nudge, { content: "", kind: webhooksStatus, className: "size-5" }) : null
  ] });
  if (webhooksError || !isAccessible(webhooksStatus)) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(CollapsiblePaper.Container, { defaultOpen: false, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CollapsiblePaper.Title, { children: [
        webhooksTitleContent,
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "primary", disabled: true, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-5" }),
          t("settings:webhooks.new_webhook")
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CollapsiblePaper.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-md py-xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typo, { variant: "title2", className: "text-grey-primary", children: t("settings:webhooks.configuration_error") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { variant: "outlined", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trans, { t, i18nKey: "settings:webhooks.convoy_error", components: {
          DocLink: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { href: webhooksSetupDocHref })
        } }) }) })
      ] }) })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(CollapsiblePaper.Container, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CollapsiblePaper.Title, { children: [
      webhooksTitleContent,
      isCreateWebhookAvailable ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(CreateWebhook, { webhookStatus: webhooksStatus, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "primary", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-5" }),
        t("settings:webhooks.new_webhook")
      ] }) }) }) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CollapsiblePaper.Content, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { className: "mb-md lg:mb-lg", variant: "outlined", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trans, { t, i18nKey: "settings:webhooks.setup_documentation", components: {
        DocLink: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { href: webhooksSetupDocHref })
      } }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Table.Container, { ...getContainerProps(), className: "max-h-96", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Header, { headerGroups: table.getHeaderGroups() }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Body, { ...getBodyProps(), children: rows.map((row) => {
          return /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Row, { row }, row.id);
        }) })
      ] })
    ] })
  ] });
}
export {
  ApiKeys as component
};
