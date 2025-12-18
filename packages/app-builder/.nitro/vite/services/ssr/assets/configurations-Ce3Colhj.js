import { R as jsxRuntimeExports, r as reactExports } from "../server.js";
import { P as Panel, a as PanelSharpFactory } from "./Panel-kj8Z2GDk.js";
import { N as useAgnosticNavigation, P as Page, O as Route } from "./router-vb7i5euz.js";
import { Q as QueryString } from "./input-validation-CU_reV2S.js";
import { M, bu as SCREENING_CATEGORY_TO_DTO_SECTION, a2 as sanitizeTruthyDatasets, aX as z, b6 as makeDatasetsMap } from "./services-middleware-DR8Hua1Y.js";
import { d as cn, u as useTranslation, e1 as Input, er as TextArea, B as Button, e4 as Modal, eb as Collapsible, e as Icon, T as Typo, ee as ExpandableGroupTagLine, j as Tag } from "./format-NPGUXq-g.js";
import { C as CopyToClipboardButton, z as zt } from "./CopyToClipboardButton-CJNJJful.js";
import { u as useDatasetTitle, e as findDatasetOrTopicByKey } from "./dataset-utils-C1Lb7jdi.js";
import { C as ContinuousScreeningConfigurationStepper } from "./continuous-screenings-DX2ib6rI.js";
import { L as ListAndTopicDatasetConfigurationBridge, O as ObjectMapping, D as DatasetSelection, S as ScoringConfiguration, F as FormPagination, a as Stepper } from "./ScoringConfiguration-8ZZtJkEX.js";
import { o as object, s as string } from "./short-uuid-MIi3jWzx.js";
import { u as useLoaderRevalidator } from "./LoaderRevalidatorContext-C9s56i-l.js";
import { u as updateContinuousScreeningConfigurationFn } from "./continuous-screening-By89dWjI.js";
import { y as useQueryClient } from "./QueryClientProvider-DYTpkCko.js";
import { u as useMutation } from "./useMutation-C5oG90Zs.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { C as Callout } from "./Callout-DX4NBXlG.js";
import { a as DatasetTag } from "./DatasetSelectionContent-CZ4GOM-S.js";
import { D as DatatypeIcon, a as DatatypeToPrimitiveType } from "./DatatypeOption-Csn4su3e.js";
import { u as useDataModelQuery } from "./get-data-model-CAY4ZWaH.js";
import { S as Spinner } from "./Spinner-GK6cEAdR.js";
import { u as useGetInboxesQuery } from "./get-inboxes-6fSfvled.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
import "./sharpstate.es-CeF1Mf5b.js";
import "./security-headers.server-BdP3HrPp.js";
import "./ThemeContext-B40HQxfH.js";
import "./config-ut8rAdyo.js";
import "./createSsrRpc-ZXUHv2Er.js";
import "./i18n-instance-store-UssbGYOM.js";
import "./auth-middleware-C4ap47rJ.js";
import "./inboxes-D556s0BB.js";
import "./files-fO9wUXBf.js";
import "./case-detail-middleware-C3JS8Yme.js";
import "./async-C3pYACua.js";
import "./decisions-B-2DmJW1.js";
import "./unique-CBeBxAXx.js";
import "./scenarios-8U74nJp4.js";
import "node:crypto";
import "./isNullish-B8pc8Ntu.js";
import "./use-callback-ref-DXzIzfqy.js";
import "./lists-config-CsQWGvXL.js";
import "./screenings-CS8peAlI.js";
import "./useQuery-B7mL_evE.js";
import "./useBaseQuery-CMboOtTR.js";
import "./index-DhVP5FgH.js";
import "./index-C_WgunUr.js";
import "./index-CR1bHmei.js";
import "./ScreeningThreshold-6mmbXp7u.js";
import "./capitalize-CzwYzf_g.js";
import "./data-BFm2FCTm.js";
import "./data-fdG1PpsD.js";
import "./cases-DJ9ABIdo.js";
import "./cases-PZYcTUxr.js";
const Table = ({ className, children }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("grid border border-grey-border rounded-lg bg-surface-card", className), children });
};
const TableRow = ({ className, children, ...props }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("group/row grid grid-cols-subgrid col-span-full items-center", className), ...props, children });
};
const TableCell = ({ className, children }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("p-md flex gap-sm items-center", className), children });
};
const GridTable = {
  Table,
  Row: TableRow,
  Cell: TableCell
};
const GeneralInfo = ({ stableId }) => {
  const { t } = useTranslation(["continuousScreening"]);
  const name = ContinuousScreeningConfigurationStepper.select((state) => state.data.$name);
  const description = ContinuousScreeningConfigurationStepper.select((state) => state.data.$description);
  const mode = ContinuousScreeningConfigurationStepper.select((state) => state.__internals.mode);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm p-md rounded-md bg-surface-card border border-grey-border", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[3fr_2fr] gap-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { readOnly: mode === "view", value: name.value, onChange: (e) => name.value = e.target.value }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "self-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CopyToClipboardButton, { toCopy: stableId, size: "chip", rounded: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: stableId }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      TextArea,
      {
        readOnly: mode === "view",
        value: description.value,
        placeholder: mode === "view" ? t("continuousScreening:field.description.view_placeholder") : t("continuousScreening:field.description.placeholder"),
        onChange: (e) => description.value = e.target.value
      }
    )
  ] });
};
const ConfigurationPanel = ({
  baseConfig,
  newConfig,
  onUpdate,
  initialMode,
  baseStep
}) => {
  const { t } = useTranslation(["continuousScreening"]);
  const configurationStepper = ContinuousScreeningConfigurationStepper.createSharp(
    initialMode ?? "view",
    newConfig,
    (data) => {
      onUpdate(data);
    }
  );
  reactExports.useEffect(() => {
    if (baseStep !== void 0) {
      configurationStepper.actions.setCurrentStep(baseStep);
    }
  }, [baseStep]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Container, { size: "medium", className: "isolate", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ContinuousScreeningConfigurationStepper.Provider, { value: configurationStepper, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ListAndTopicDatasetConfigurationBridge, { useCase: "continuous_monitoring", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel.Content, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConfigurationPanelHeader, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grow", children: M(configurationStepper.value.__internals.currentStep).with(0, () => /* @__PURE__ */ jsxRuntimeExports.jsx(GeneralInfo, { stableId: baseConfig.stableId })).with(1, () => /* @__PURE__ */ jsxRuntimeExports.jsx(ObjectMapping, { baseConfig })).with(2, () => /* @__PURE__ */ jsxRuntimeExports.jsx(DatasetSelection, { useCase: "continuous_monitoring" })).with(3, () => /* @__PURE__ */ jsxRuntimeExports.jsx(ScoringConfiguration, {})).otherwise(() => null) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      FormPagination,
      {
        className: "bg-surface-card",
        finalButtonText: t("continuousScreening:edition.validate_button")
      }
    )
  ] }) }) }) });
};
const ConfigurationPanelHeader = () => {
  const { t } = useTranslation(["continuousScreening"]);
  const configurationStepper = ContinuousScreeningConfigurationStepper.useSharp();
  const mode = ContinuousScreeningConfigurationStepper.select((state) => state.__internals.mode);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Header, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-md shrink-0 sticky top-0 z-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "me-auto", children: mode === "view" ? t("continuousScreening:panel.title.view") : t("continuousScreening:panel.title.edit") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Stepper, { fromZero: true, getStepLabel: (stepName) => t(`continuousScreening:panel.stepper.${stepName}`) }),
    mode === "view" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "primary", onClick: () => configurationStepper.actions.setMode("edit", 0), children: t("common:edit") }) : null
  ] }) });
};
const basePayloadSchema = object({
  name: string().min(1),
  description: string()
});
const CreationModal = ({ open, onOpenChange, onSubmit }) => {
  const { t } = useTranslation(["common", "continuousScreening"]);
  const [name, setName] = reactExports.useState("");
  const [description, setDescription] = reactExports.useState("");
  const isValid = basePayloadSchema.safeParse({ name, description }).success;
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValid) {
      onSubmit({ name, description });
    }
  };
  const innerOpenChange = (open2) => {
    if (!open2) {
      setName("");
      setDescription("");
    }
    onOpenChange(open2);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Root, { open, onOpenChange: innerOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Content, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t("continuousScreening:creation.modal.title") }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-lg p-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            name: "name",
            placeholder: t("continuousScreening:creation.modal.name_placeholder"),
            value: name,
            onChange: (e) => setName(e.currentTarget.value)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextArea,
          {
            name: "description",
            placeholder: t("continuousScreening:creation.modal.description_placeholder"),
            rows: 3,
            value: description,
            onChange: (e) => setDescription(e.currentTarget.value)
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t("common:cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { label: t("common:create"), type: "submit", disabled: !isValid })
      ] })
    ] })
  ] }) });
};
const useUpdateContinuousScreeningConfigurationMutation = (configStableId) => {
  const updateContinuousScreeningConfiguration = useServerFn(updateContinuousScreeningConfigurationFn);
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["continuous-screening", "update-configuration"],
    mutationFn: async (payload) => {
      await updateContinuousScreeningConfiguration({ data: { ...payload, configStableId } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["continuous-screening", "configurations"] });
    }
  });
};
function getSectionFromKey(key) {
  const section = key.split(":")[0];
  if (!section || !(section in SCREENING_CATEGORY_TO_DTO_SECTION)) return void 0;
  return section;
}
function DatasetChangeList({
  keys,
  catalog,
  emptyLabel
}) {
  const { formatItemName } = useDatasetTitle();
  const rows = keys.flatMap((key) => {
    const item = findDatasetOrTopicByKey(catalog, key);
    if (!item) return [];
    const category = getSectionFromKey(key);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate min-w-0", children: formatItemName(item) }),
      category ? /* @__PURE__ */ jsxRuntimeExports.jsx(DatasetTag, { category }) : null
    ] }, key);
  });
  if (rows.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary text-center", children: emptyLabel });
  }
  return rows;
}
const DatasetSelectionSection = ({ updatedConfig, baseConfig, datasets }) => {
  const { t } = useTranslation(["common", "continuousScreening"]);
  const addedDatasets = Object.keys(updatedConfig.datasets).filter(
    (k) => !!updatedConfig.datasets[k] && !baseConfig.datasets.includes(k)
  );
  const removedDatasets = baseConfig.datasets.filter((k) => !updatedConfig.datasets[k]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Collapsible.Container, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible.Title, { children: t("continuousScreening:edition.validation.datasetSelection.title") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("continuousScreening:edition.validation.datasetSelection.added.title") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-sm border border-grey-border rounded-md p-md max-h-50 overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          DatasetChangeList,
          {
            keys: addedDatasets,
            catalog: datasets,
            emptyLabel: t("continuousScreening:edition.validation.datasetSelection.no_added")
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("continuousScreening:edition.validation.datasetSelection.removed.title") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-sm border border-grey-border rounded-md p-md max-h-50 overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          DatasetChangeList,
          {
            keys: removedDatasets,
            catalog: datasets,
            emptyLabel: t("continuousScreening:edition.validation.datasetSelection.no_removed")
          }
        ) })
      ] })
    ] }) })
  ] });
};
const GeneralInfoSection = ({ updatedConfig, baseConfig }) => {
  const { t } = useTranslation(["continuousScreening"]);
  const hasNameChanged = updatedConfig.name !== baseConfig.name;
  const hasDescriptionChanged = updatedConfig.description !== (baseConfig.description ?? "");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Collapsible.Container, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible.Title, { children: t("continuousScreening:edition.validation.generalInfo.title") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[140px_1fr] gap-sm items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("continuousScreening:field.name.label") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
          hasNameChanged ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-through text-grey-secondary", children: baseConfig.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "->" })
          ] }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: updatedConfig.name })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[140px_1fr] gap-sm items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("continuousScreening:field.description.label") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
          hasDescriptionChanged ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-through text-grey-secondary", children: !baseConfig.description ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "italic", children: "(Empty)" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: baseConfig.description }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "->" })
          ] }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: updatedConfig.description })
        ] })
      ] })
    ] }) })
  ] });
};
const ObjectMappingSection = ({ updatedConfig, baseConfig }) => {
  const dataModelQuery = useDataModelQuery();
  const { t } = useTranslation(["common", "continuousScreening"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Collapsible.Container, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible.Title, { children: t("continuousScreening:edition.validation.objectMapping.title") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible.Content, { children: M(dataModelQuery).with({ isPending: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-10" }) })).with({ isError: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md items-center justify-center h-50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "", children: t("common:generic_fetch_data_error") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", onClick: () => dataModelQuery.refetch(), children: t("common:retry") })
    ] })).with({ isSuccess: true }, ({ data: { dataModel } }) => {
      const hasChanges = updatedConfig.mappingConfigs.some((mappingConfig) => {
        const table = dataModel.find((table2) => table2.name === mappingConfig.objectType);
        if (!table) return false;
        return Object.entries(mappingConfig.fieldMapping).map(([fieldId, ftmProperty]) => {
          const field = table.fields.find((field2) => field2.id === fieldId);
          return { field, ftmProperty };
        }).filter(({ field, ftmProperty }) => {
          return field && ftmProperty !== null && !field.ftmProperty;
        }).length > 0;
      });
      if (!hasChanges) {
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("continuousScreening:edition.validation.objectMapping.no_changes") }) });
      }
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-md", children: updatedConfig.mappingConfigs.map((mappingConfig) => {
        const table = dataModel.find((table2) => table2.name === mappingConfig.objectType);
        return table ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableValidation, { table, objectMapping: mappingConfig }, mappingConfig.objectType) : null;
      }) });
    }).exhaustive() })
  ] });
};
const TableValidation = ({ table, objectMapping }) => {
  const { t } = useTranslation(["continuousScreening"]);
  const isAddedTable = !table.ftmEntity;
  const fieldsAdded = Object.entries(objectMapping.fieldMapping).map(([fieldId, ftmProperty]) => {
    const field = table.fields.find((field2) => field2.id === fieldId);
    return { field, ftmProperty };
  }).filter(({ field, ftmProperty }) => {
    return field && ftmProperty !== null && !field.ftmProperty;
  });
  if (fieldsAdded.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t(`continuousScreening:edition.validation.objectMapping.${isAddedTable ? "table_added" : "table_modified"}`, {
      tableName: table.name
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-sm border border-grey-border rounded-md p-md max-h-50 overflow-y-auto", children: fieldsAdded.map(({ field, ftmProperty }) => {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DatatypeIcon, { dataType: DatatypeToPrimitiveType(field?.dataType ?? "String") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: field?.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "arrow-forward", className: "size-6 text-purple-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: ftmProperty })
      ] }, field?.id);
    }) })
  ] });
};
const ScoringConfigurationSection = ({ updatedConfig, baseConfig }) => {
  const { t } = useTranslation(["continuousScreening", "screenings"]);
  const hasMatchThresholdChanged = updatedConfig.matchThreshold !== baseConfig.matchThreshold;
  const hasMatchLimitChanged = updatedConfig.matchLimit !== baseConfig.matchLimit;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Collapsible.Container, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible.Title, { children: t("continuousScreening:edition.validation.scoringConfiguration.title") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[140px_1fr] gap-sm items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("screenings:match_threshold") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
          hasMatchThresholdChanged ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-through text-grey-secondary", children: baseConfig.matchThreshold }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "->" })
          ] }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: updatedConfig.matchThreshold })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[140px_1fr] gap-sm items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("screenings:match_limit") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
          hasMatchLimitChanged ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-through text-grey-secondary", children: baseConfig.matchLimit }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "->" })
          ] }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: updatedConfig.matchLimit })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(InboxDiff, { updatedConfig, baseConfig })
    ] }) })
  ] });
};
const InboxDiff = ({
  updatedConfig,
  baseConfig
}) => {
  const { t } = useTranslation(["continuousScreening"]);
  const inboxesQuery = useGetInboxesQuery();
  const hasInboxChanged = updatedConfig.inboxId !== baseConfig.inboxId;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[140px_1fr] gap-sm items-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("continuousScreening:field.inbox.label") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-sm", children: M(inboxesQuery).with({ isPending: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-4" })).with({ isError: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: t("common:generic_fetch_data_error") })).with({ isSuccess: true }, ({ data }) => {
      if (!data) return null;
      const inboxes = data.inboxes;
      const baseInboxName = inboxes.find((inbox) => inbox.id === baseConfig.inboxId)?.name;
      const updatedInboxName = inboxes.find((inbox) => inbox.id === updatedConfig.inboxId)?.name;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        hasInboxChanged ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-through text-grey-secondary", children: baseInboxName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "->" })
        ] }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: updatedConfig.inboxId ? updatedInboxName : updatedConfig.inboxName })
      ] });
    }).exhaustive() })
  ] });
};
const EditionValidationPanel = ({
  baseConfig,
  updatedConfig,
  onCancel,
  datasets
}) => {
  const panelSharp = PanelSharpFactory.useSharp();
  const { t } = useTranslation(["continuousScreening", "common"]);
  const updateConfigurationMutation = useUpdateContinuousScreeningConfigurationMutation(baseConfig.stableId);
  const revalidate = useLoaderRevalidator();
  const handleValidateClick = () => {
    updateConfigurationMutation.mutateAsync({
      ...updatedConfig,
      datasets: sanitizeTruthyDatasets(updatedConfig.datasets)
    }).then(() => {
      zt.success(t("common:success.save"));
      panelSharp.actions.close();
      revalidate();
    }).catch(() => {
      zt.error(t("common:errors.unknown"));
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Container, { size: "medium", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel.Content, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Header, { children: t("continuousScreening:edition.validation.title") }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-lg grow flex flex-col gap-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { bordered: true, className: "bg-surface-card mx-md", children: t("continuousScreening:edition.validation.validation_callout") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(GeneralInfoSection, { updatedConfig, baseConfig }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DatasetSelectionSection, { updatedConfig, baseConfig, datasets }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ScoringConfigurationSection, { updatedConfig, baseConfig }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ObjectMappingSection, { updatedConfig, baseConfig })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel.Footer, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.FooterButton, { variant: "secondary", onClick: () => onCancel(updatedConfig), label: t("common:cancel") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.FooterButton, { variant: "primary", onClick: handleValidateClick, label: t("common:save") })
    ] })
  ] }) });
};
const ConfigurationsPage = ({ canEdit, configurations, datasets }) => {
  const { t } = useTranslation(["common", "continuousScreening", "navigation"]);
  const { formatItemName } = useDatasetTitle();
  const [creationModalOpen, setCreationModalOpen] = reactExports.useState(false);
  const navigate = useAgnosticNavigation();
  const [editingConfig, setEditingConfig] = reactExports.useState(null);
  const [draft, setDraft] = reactExports.useState(null);
  const [updatedConfig, setUpdatedConfig] = reactExports.useState(null);
  const handlePanelOpenChange = () => {
    setEditingConfig(null);
    setDraft(null);
    setUpdatedConfig(null);
  };
  const handleCreationSubmit = (value) => {
    const qs = QueryString.stringify(value, { addQueryPrefix: true });
    navigate({
      pathname: "/continuous-screening/create",
      search: qs
    });
  };
  const handleRowClick = (baseConfig) => {
    const datasetsMap = makeDatasetsMap(baseConfig.datasets);
    const newConfig = {
      name: baseConfig.name,
      description: baseConfig.description ?? "",
      mappingConfigs: baseConfig.objectTypes.map((ot) => ({ objectType: ot, ftmEntity: null, fieldMapping: {} })),
      matchThreshold: baseConfig.matchThreshold,
      matchLimit: baseConfig.matchLimit,
      inboxId: baseConfig.inboxId,
      inboxName: null,
      datasets: datasetsMap
    };
    setEditingConfig(baseConfig);
    setDraft(newConfig);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Page.Main, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Content, { width: "table", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typo, { variant: "title1", children: t("navigation:continuous-screening.configurations") }),
      canEdit ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "primary", onClick: () => setCreationModalOpen(true), children: t("continuousScreening:configurations.add_configuration") }) : null
    ] }),
    M(configurations).with(z.nullish, () => null).with(
      z.array(),
      (configurations2) => configurations2.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm items-center justify-center py-2xl border border-grey-border rounded-lg bg-surface-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "scan-eye", className: "size-10 text-purple-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("continuousScreening:configurations.list.empty") }),
        canEdit ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "primary", onClick: () => setCreationModalOpen(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-4" }),
          t("continuousScreening:configurations.add_configuration")
        ] }) : null
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(GridTable.Table, { className: "grid-cols-[minmax(0,_33.33%)_repeat(3,_1fr)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(GridTable.Row, { className: "font-semibold border-b border-grey-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(GridTable.Cell, { children: t("continuousScreening:configurations.list.column.name") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(GridTable.Cell, { children: t("continuousScreening:configurations.list.column.datasets") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(GridTable.Cell, { children: t("continuousScreening:configurations.list.column.object_types") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(GridTable.Cell, { children: t("continuousScreening:configurations.list.column.target_inbox") })
        ] }),
        configurations2.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          GridTable.Row,
          {
            className: "hover:bg-grey-background-light",
            onClick: () => handleRowClick(item),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(GridTable.Cell, { className: "flex gap-md items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: item.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(CopyToClipboardButton, { toCopy: item.stableId, className: "min-w-40", size: "chip", rounded: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: item.stableId }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(GridTable.Cell, { className: "min-w-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-w-0 w-full max-w-[20vw] overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                ExpandableGroupTagLine,
                {
                  items: item.datasets.map((d) => {
                    const resolvedItem = findDatasetOrTopicByKey(datasets, d);
                    const itemName = resolvedItem ? formatItemName(resolvedItem) : d;
                    return /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "grey", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "max-w-[15ch] truncate", title: itemName, children: itemName }) }, d);
                  })
                }
              ) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(GridTable.Cell, { className: "min-w-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-w-0 w-full max-w-[20vw] overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                ExpandableGroupTagLine,
                {
                  items: item.objectTypes.map((ot) => /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "grey", children: ot }, ot))
                }
              ) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(GridTable.Cell, { children: item.inbox?.name })
            ]
          },
          item.id
        ))
      ] })
    ).exhaustive(),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CreationModal, { open: creationModalOpen, onOpenChange: setCreationModalOpen, onSubmit: handleCreationSubmit }),
    editingConfig && draft ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel.Root, { open: true, onOpenChange: handlePanelOpenChange, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        ConfigurationPanel,
        {
          baseConfig: editingConfig,
          newConfig: draft,
          onUpdate: (config) => {
            setUpdatedConfig(config);
          }
        }
      ),
      updatedConfig ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        EditionValidationPanel,
        {
          baseConfig: editingConfig,
          updatedConfig,
          datasets,
          onCancel: () => setUpdatedConfig(null)
        }
      ) : null
    ] }) : null
  ] }) });
};
function ContinuousScreeningConfigurations() {
  const {
    canEdit,
    configurations,
    datasets
  } = Route.useLoaderData();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ConfigurationsPage, { canEdit, configurations, datasets });
}
export {
  ContinuousScreeningConfigurations as component
};
