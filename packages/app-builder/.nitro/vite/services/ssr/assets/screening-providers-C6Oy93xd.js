import { r as reactExports, R as jsxRuntimeExports } from "../server.js";
import { C as Callout } from "./Callout-DX4NBXlG.js";
import { P as Page, C as Route } from "./router-vb7i5euz.js";
import { C as CollapsiblePaper } from "./Paper-6W_X6MFt.js";
import { u as useLoaderRevalidator } from "./LoaderRevalidatorContext-C9s56i-l.js";
import { o as updateScreeningProvidersPayloadSchema } from "./settings-CEpHMlp5.js";
import { i as updateScreeningProvidersFn } from "./settings-CPv2zx4k.js";
import { u as useMutation } from "./useMutation-C5oG90Zs.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { h as handleSubmit } from "./form-D2XmDKeG.js";
import { u as useForm } from "./useForm-BwABQKAs.js";
import { z as zt } from "./CopyToClipboardButton-CJNJJful.js";
import { u as useTranslation, B as Button, dZ as SelectV2 } from "./format-NPGUXq-g.js";
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
const useUpdateScreeningProviders = (organizationId) => {
  const updateScreeningProviders = useServerFn(updateScreeningProvidersFn);
  return useMutation({
    mutationKey: ["settings", "organization", "update-screening-providers", organizationId],
    mutationFn: async (payload) => updateScreeningProviders({ data: { ...payload, organizationId } })
  });
};
const SCREENING_FEATURES = [
  { name: "manualSearch", labelKey: "settings:screening_providers.manual_search" },
  { name: "transactionMonitoring", labelKey: "settings:screening_providers.transaction_monitoring" },
  { name: "continuousMonitoring", labelKey: "settings:screening_providers.continuous_screening" }
];
const ScreeningProvidersSettingsPage = ({
  providers,
  organizationId,
  availableProviders
}) => {
  const { t } = useTranslation(["common", "settings"]);
  const updateScreeningProvidersMutation = useUpdateScreeningProviders(organizationId);
  const revalidate = useLoaderRevalidator();
  const [submitError, setSubmitError] = reactExports.useState(null);
  const providerLabels = {
    opensanctions: t("settings:screening_providers.provider.opensanctions"),
    lexisnexis: t("settings:screening_providers.provider.lexisnexis")
  };
  const providerOptions = availableProviders.map((provider) => ({
    value: provider,
    label: providerLabels[provider]
  }));
  const form = useForm({
    defaultValues: {
      manualSearch: providers?.manualSearch ?? "opensanctions",
      transactionMonitoring: providers?.transactionMonitoring ?? "opensanctions",
      continuousMonitoring: providers?.continuousMonitoring ?? "opensanctions"
    },
    onSubmit: ({ value }) => {
      setSubmitError(null);
      updateScreeningProvidersMutation.mutateAsync(value).then((res) => {
        if (res && "error" in res) {
          setSubmitError(res.error);
          return;
        }
        zt.success(t("common:success.save"));
        revalidate();
      }).catch((error) => {
        const message = error instanceof Error ? error.message : t("common:errors.unknown");
        setSubmitError(message);
        zt.error(message);
      });
    },
    validators: {
      onSubmit: updateScreeningProvidersPayloadSchema.omit({ organizationId: true })
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Page.Content, { width: "readable", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CollapsiblePaper.Container, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CollapsiblePaper.Title, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1", children: t("settings:screening_providers") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "secondary",
          appearance: "stroked",
          onClick: (e) => {
            e.stopPropagation();
            setSubmitError(null);
            form.reset();
          },
          children: t("settings:screening_providers.reset")
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "primary", type: "submit", form: "screening-providers-form", onClick: (e) => e.stopPropagation(), children: t("settings:screening_providers.save") })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CollapsiblePaper.Content, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { color: "red", icon: "error", iconColor: "red", className: "mb-md", children: submitError }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "form",
        {
          onSubmit: handleSubmit(form),
          className: "grid grid-cols-[300px_1fr] gap-sm items-center",
          id: "screening-providers-form",
          children: SCREENING_FEATURES.map((feature) => /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: feature.name, children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-primary", children: t(feature.labelKey) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              SelectV2,
              {
                value: field.state.value,
                onChange: field.handleChange,
                options: providerOptions,
                placeholder: t("settings:screening_providers.provider.opensanctions"),
                className: "w-fit"
              }
            )
          ] }) }, feature.name))
        }
      )
    ] })
  ] }) });
};
function ScreeningProvidersSettings() {
  const {
    providers,
    organizationId,
    availableProviders
  } = Route.useLoaderData();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ScreeningProvidersSettingsPage, { organizationId, providers, availableProviders });
}
export {
  ScreeningProvidersSettings as component
};
