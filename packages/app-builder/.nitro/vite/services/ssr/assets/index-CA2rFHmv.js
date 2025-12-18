import { R as jsxRuntimeExports } from "../server.js";
import { u as useLoaderRevalidator } from "./LoaderRevalidatorContext-C9s56i-l.js";
import { c as createContinuousScreeningConfigurationFn } from "./continuous-screening-By89dWjI.js";
import { y as useQueryClient } from "./QueryClientProvider-DYTpkCko.js";
import { u as useMutation } from "./useMutation-C5oG90Zs.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { u as useCallbackRef } from "./use-callback-ref-DXzIzfqy.js";
import { z as zt } from "./CopyToClipboardButton-CJNJJful.js";
import { P as Page, B as BreadCrumbs, a5 as Route } from "./router-vb7i5euz.js";
import { C as ContinuousScreeningConfigurationStepper } from "./continuous-screenings-DX2ib6rI.js";
import { O as ObjectMapping, D as DatasetSelection, S as ScoringConfiguration, F as FormPagination, L as ListAndTopicDatasetConfigurationBridge, a as Stepper } from "./ScoringConfiguration-8ZZtJkEX.js";
import { bI as SCREENING_CATEGORY_I18N_KEY_MAP, M } from "./services-middleware-DR8Hua1Y.js";
import { j as Tag, u as useTranslation, d as cn } from "./format-NPGUXq-g.js";
import { g as getSectionLeafKeys } from "./dataset-utils-C1Lb7jdi.js";
import { u as useListConfigQuery } from "./lists-config-CsQWGvXL.js";
import { u as useGetInboxesQuery } from "./get-inboxes-6fSfvled.js";
import { g } from "./sharpstate.es-CeF1Mf5b.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
import "./createSsrRpc-ZXUHv2Er.js";
import "./auth-middleware-C4ap47rJ.js";
import "./short-uuid-MIi3jWzx.js";
import "./security-headers.server-BdP3HrPp.js";
import "./ThemeContext-B40HQxfH.js";
import "./config-ut8rAdyo.js";
import "./i18n-instance-store-UssbGYOM.js";
import "./inboxes-D556s0BB.js";
import "./files-fO9wUXBf.js";
import "./case-detail-middleware-C3JS8Yme.js";
import "./input-validation-CU_reV2S.js";
import "./async-C3pYACua.js";
import "./decisions-B-2DmJW1.js";
import "./unique-CBeBxAXx.js";
import "./scenarios-8U74nJp4.js";
import "./DatasetSelectionContent-CZ4GOM-S.js";
import "./Spinner-GK6cEAdR.js";
import "./capitalize-CzwYzf_g.js";
import "./Callout-DX4NBXlG.js";
import "./DatatypeOption-Csn4su3e.js";
import "./get-data-model-CAY4ZWaH.js";
import "./data-BFm2FCTm.js";
import "./data-fdG1PpsD.js";
import "./useQuery-B7mL_evE.js";
import "./useBaseQuery-CMboOtTR.js";
import "./index-DhVP5FgH.js";
import "./index-C_WgunUr.js";
import "./index-CR1bHmei.js";
import "./ScreeningThreshold-6mmbXp7u.js";
import "node:crypto";
import "./isNullish-B8pc8Ntu.js";
import "./screenings-CS8peAlI.js";
import "./cases-DJ9ABIdo.js";
import "./cases-PZYcTUxr.js";
const useCreateContinuousScreeningConfigurationMutation = () => {
  const createContinuousScreeningConfiguration = useServerFn(createContinuousScreeningConfigurationFn);
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["continuous-screening", "create-configuration"],
    mutationFn: async (payload) => {
      await createContinuousScreeningConfiguration({ data: payload });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["continuous-screening", "configurations"] });
    }
  });
};
const RecapRow = ({ children }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-row items-center gap-xs h-[25px]", children });
};
const RecapCapsule = ({ children }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Tag,
    {
      color: "grey",
      className: "bg-grey-background [.group\\/recap-valid_&]:bg-surface-card [.group\\/recap-valid_&]:dark:border [.group\\/recap-valid_&]:dark:border-green-primary",
      children
    }
  );
};
const DatasetSelectionRecap = () => {
  const { t } = useTranslation(["continuousScreening", "scenarios"]);
  const listConfigQuery = useListConfigQuery("continuous_monitoring");
  const datasets = ContinuousScreeningConfigurationStepper.select((state) => state.data.datasets);
  const enabledSections = Object.entries(listConfigQuery.data?.filters ?? {}).filter(
    ([key, section]) => !!datasets[key] && section != null
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(RecapRow, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("continuousScreening:creation.datasetSelection.recap.title", { count: enabledSections.length }) }),
    enabledSections.map(([key, section]) => {
      const leafCount = getSectionLeafKeys(section, key).filter((k) => !!datasets[k]).length;
      const sectionLabel = t(`scenarios:sanction.lists.${SCREENING_CATEGORY_I18N_KEY_MAP[key]}`);
      return /* @__PURE__ */ jsxRuntimeExports.jsx(RecapCapsule, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex flex-row items-center gap-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: sectionLabel }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("continuousScreening:creation.datasetSelection.recap.section_items", { count: leafCount }) })
      ] }) }, key);
    })
  ] });
};
const ObjectMappingRecap = () => {
  const { t } = useTranslation(["continuousScreening"]);
  const mappingConfigs = ContinuousScreeningConfigurationStepper.select((state) => state.data.mappingConfigs);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(RecapRow, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("continuousScreening:creation.objectMapping.recap.title", { count: mappingConfigs.length }) }),
    mappingConfigs.map((mappingConfig) => /* @__PURE__ */ jsxRuntimeExports.jsx(RecapCapsule, { children: mappingConfig.objectType }, mappingConfig.objectType))
  ] });
};
const ScoringConfigurationRecap = () => {
  const { t } = useTranslation(["continuousScreening"]);
  const inboxesQuery = useGetInboxesQuery();
  const inboxId = ContinuousScreeningConfigurationStepper.select((state) => state.data.$inboxId);
  const inboxName = ContinuousScreeningConfigurationStepper.select((state) => state.data.$inboxName);
  const matchThreshold = ContinuousScreeningConfigurationStepper.select((state) => state.data.matchThreshold);
  const matchLimit = ContinuousScreeningConfigurationStepper.select((state) => state.data.matchLimit);
  const inboxDisplayName = g(() => {
    if (inboxName.value) {
      return inboxName.value;
    }
    return inboxesQuery.data?.inboxes.find((inbox) => inbox.id === inboxId.value)?.name;
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(RecapRow, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("continuousScreening:creation.scoringConfiguration.recap.title") }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row items-center gap-xs h-[25px]", children: [
      !isNaN(matchThreshold) ? /* @__PURE__ */ jsxRuntimeExports.jsx(RecapCapsule, { children: t("continuousScreening:creation.scoringConfiguration.recap.matchThreshold", { score: matchThreshold }) }) : null,
      !isNaN(matchLimit) ? /* @__PURE__ */ jsxRuntimeExports.jsx(RecapCapsule, { children: t("continuousScreening:creation.scoringConfiguration.recap.matchLimit", { limit: matchLimit }) }) : null,
      inboxId.value || inboxName.value ? /* @__PURE__ */ jsxRuntimeExports.jsx(RecapCapsule, { children: t("continuousScreening:creation.scoringConfiguration.recap.inbox", {
        inbox: inboxDisplayName.value
      }) }) : null
    ] })
  ] });
};
const CreationContent = () => {
  const { t } = useTranslation(["continuousScreening"]);
  const creationStepper = ContinuousScreeningConfigurationStepper.useSharp();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col flex-1 min-h-0 p-lg relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grow min-h-0 overflow-y-auto flex flex-col gap-md max-w-(--breakpoint-lg)", children: [
      M(creationStepper.computed.currentStep.value).with(1, () => /* @__PURE__ */ jsxRuntimeExports.jsx(ObjectMapping, {})).with(2, () => /* @__PURE__ */ jsxRuntimeExports.jsx(DatasetSelection, { useCase: "continuous_monitoring" })).with(3, () => /* @__PURE__ */ jsxRuntimeExports.jsx(ScoringConfiguration, {})).otherwise(() => null),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CreationContentRecap, {})
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(FormPagination, { finalButtonText: t("continuousScreening:creation.save_configuration") })
  ] });
};
const CreationContentRecap = () => {
  const creationStepper = ContinuousScreeningConfigurationStepper.useSharp();
  const currentStep = creationStepper.computed.currentStep.value;
  const isValid = creationStepper.computed.isValid.value;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn("bg-surface-card rounded-lg border border-grey-border p-md flex flex-col gap-sm", {
        "bg-green-background-light border-green-border dark:bg-transparent dark:border-green-primary text-green-primary group/recap-valid": isValid
      }),
      children: [
        currentStep >= 1 ? /* @__PURE__ */ jsxRuntimeExports.jsx(ObjectMappingRecap, {}) : null,
        currentStep >= 2 ? /* @__PURE__ */ jsxRuntimeExports.jsx(DatasetSelectionRecap, {}) : null,
        currentStep >= 3 ? /* @__PURE__ */ jsxRuntimeExports.jsx(ScoringConfigurationRecap, {}) : null
      ]
    }
  );
};
const CreationPage = ({ name, description }) => {
  const { t } = useTranslation(["continuousScreening", "common"]);
  const revalidate = useLoaderRevalidator();
  const createConfigurationMutation = useCreateContinuousScreeningConfigurationMutation();
  const handleSubmit = useCallbackRef((value) => {
    createConfigurationMutation.mutateAsync(value).then((_) => {
      revalidate();
    }).catch(() => {
      zt.error(t("common:errors.unknown"));
    });
  });
  const creationStepper = ContinuousScreeningConfigurationStepper.createSharp(
    "create",
    {
      mappingConfigs: [],
      matchThreshold: 70,
      matchLimit: 10,
      inboxId: null,
      inboxName: null,
      datasets: {},
      name,
      description
    },
    handleSubmit,
    { initialStep: 1 }
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ContinuousScreeningConfigurationStepper.Provider, { value: creationStepper, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ListAndTopicDatasetConfigurationBridge, { useCase: "continuous_monitoring", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Main, { className: "min-h-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Header, { className: "justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(BreadCrumbs, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stepper, { fromZero: true, getStepLabel: (stepName) => t(`continuousScreening:creation.stepper.${stepName}`) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Page.Container, { className: "min-h-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Page.Content, { padding: "none", className: "min-h-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CreationContent, {}) }) })
  ] }) }) });
};
function CreateContinuousScreeningConfigurationPage() {
  const {
    name,
    description
  } = Route.useLoaderData();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(CreationPage, { name, description });
}
export {
  CreateContinuousScreeningConfigurationPage as component
};
