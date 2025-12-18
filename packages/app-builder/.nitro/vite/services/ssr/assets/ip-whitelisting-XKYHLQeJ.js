import { r as reactExports, R as jsxRuntimeExports } from "../server.js";
import { F as FormError } from "./FormError-B82nKoYh.js";
import { P as Page, F as Route } from "./router-vb7i5euz.js";
import { C as CollapsiblePaper } from "./Paper-6W_X6MFt.js";
import { u as useLoaderRevalidator } from "./LoaderRevalidatorContext-C9s56i-l.js";
import { l as updateAllowedNetworksPayloadSchema } from "./settings-CEpHMlp5.js";
import { k as updateAllowedNetworksFn } from "./settings-CPv2zx4k.js";
import { u as useMutation } from "./useMutation-C5oG90Zs.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { h as handleSubmit } from "./form-D2XmDKeG.js";
import { u as useForm, a as useStore } from "./useForm-BwABQKAs.js";
import { z as zt } from "./CopyToClipboardButton-CJNJJful.js";
import { u as useTranslation, e4 as Modal, B as Button, e1 as Input, e as Icon } from "./format-NPGUXq-g.js";
import { r } from "./difference-Byy3Ycrn.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
import "./QueryClientProvider-DYTpkCko.js";
import "./security-headers.server-BdP3HrPp.js";
import "./services-middleware-DR8Hua1Y.js";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "./ThemeContext-B40HQxfH.js";
import "./config-ut8rAdyo.js";
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
import "./array-BFSjnO9c.js";
import "./sharpstate.es-CeF1Mf5b.js";
import "./isNullish-B8pc8Ntu.js";
import "./use-callback-ref-DXzIzfqy.js";
const useUpdateAllowedNetworks = (organizationId) => {
  const updateAllowedNetworks = useServerFn(updateAllowedNetworksFn);
  return useMutation({
    mutationKey: ["settings", "organization", "update-allowed-networks", organizationId],
    mutationFn: async (payload) => updateAllowedNetworks({ data: { ...payload, organizationId } })
  });
};
const ConfirmSaveModal = ({ onConfirm, children }) => {
  const { t } = useTranslation(["common", "settings"]);
  const [open, setOpen] = reactExports.useState(false);
  const handleSaveClick = () => {
    setOpen(false);
    onConfirm();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { asChild: true, children }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Content, { onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t("settings:ip_whitelisting.save") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-lg p-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-s flex flex-1 flex-col gap-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center", children: t("settings:ip_whitelisting.save_confirm.content") }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t("common:cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { label: t("common:save"), onClick: handleSaveClick })
      ] })
    ] })
  ] });
};
const IpWhitelistingSettingsPage = ({
  allowedNetworks,
  organizationId
}) => {
  const { t } = useTranslation(["common", "settings"]);
  const updateAllowedNetworksMutation = useUpdateAllowedNetworks(organizationId);
  const revalidate = useLoaderRevalidator();
  const form = useForm({
    defaultValues: {
      allowedNetworks
    },
    onSubmit: ({ value }) => {
      updateAllowedNetworksMutation.mutateAsync(value).then((res) => {
        if (res && "error" in res) {
          zt.error(t("settings:ip_whitelisting.errors.ip_not_in_range"));
          return;
        }
        if (res?.subnets) {
          form.setFieldValue("allowedNetworks", res.subnets);
        }
        zt.success(t("common:success.save"));
        revalidate();
      }).catch(() => {
        zt.error(t("common:errors.unknown"));
      });
    },
    validators: {
      onSubmit: updateAllowedNetworksPayloadSchema
    }
  });
  const removedNetworks = useStore(form.store, (state) => r(allowedNetworks, state.values.allowedNetworks));
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Page.Content, { width: "readable", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CollapsiblePaper.Container, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CollapsiblePaper.Title, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1", children: t("settings:ip_whitelisting") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "secondary",
          appearance: "stroked",
          onClick: (e) => {
            e.stopPropagation();
            form.reset();
          },
          children: t("settings:ip_whitelisting.reset")
        }
      ),
      removedNetworks.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmSaveModal, { onConfirm: () => form.handleSubmit(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "primary", onClick: (e) => e.stopPropagation(), children: t("settings:ip_whitelisting.save") }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "primary", type: "submit", form: "ip-whitelisting-form", onClick: (e) => e.stopPropagation(), children: t("settings:ip_whitelisting.save") })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CollapsiblePaper.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "form",
      {
        onSubmit: handleSubmit(form),
        className: "grid grid-cols-[300px_1fr] gap-sm items-center",
        id: "ip-whitelisting-form",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "allowedNetworks", mode: "array", children: (networksField) => /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          networksField.state.value.map((_, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: `allowedNetworks[${idx}]`, children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: field.state.value,
                onChange: (e) => {
                  field.handleChange(e.target.value);
                  networksField.validate("change");
                },
                placeholder: t("settings:ip_whitelisting.placeholder")
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { mode: "icon", variant: "secondary", onClick: () => networksField.removeValue(idx), children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Icon,
                {
                  icon: "delete",
                  className: "size-3.5 shrink-0 cursor-pointer",
                  "aria-label": t("settings:ip_whitelisting.delete")
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                FormError,
                {
                  field,
                  asString: true,
                  translations: {
                    invalid_union: t("settings:ip_whitelisting.add_new.error")
                  }
                }
              )
            ] })
          ] }) }, idx)),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-md items-center col-span-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "primary", className: "w-fit", onClick: () => networksField.pushValue(""), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-3.5 shrink-0 cursor-pointer" }),
            t("settings:ip_whitelisting.add_new")
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormError, { field: networksField, className: "col-span-full" })
        ] }) })
      }
    ) })
  ] }) });
};
function IpWhitelistingSettings() {
  const {
    allowedNetworks,
    organizationId
  } = Route.useLoaderData();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(IpWhitelistingSettingsPage, { organizationId, allowedNetworks });
}
export {
  IpWhitelistingSettings as component
};
