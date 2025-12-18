import { R as jsxRuntimeExports, r as reactExports } from "../server.js";
import { u as useCallbackRef } from "./use-callback-ref-DXzIzfqy.js";
import { u as useTranslation, S as StickyComponent, B as Button, e as Icon, d as cn, s as Trans, e8 as MenuCommand, T as Typo, e1 as Input } from "./format-NPGUXq-g.js";
import { C as ContinuousScreeningConfigurationStepper, F as FTM_ENTITIES, a as FTM_ENTITIES_PROPERTIES, g as getFtmEntitySuggestion } from "./continuous-screenings-DX2ib6rI.js";
import { L as ListAndTopicDatasetConfiguration, D as DatasetSelectionContent } from "./DatasetSelectionContent-CZ4GOM-S.js";
import { M, b8 as getCanonicalSelectedKeys } from "./services-middleware-DR8Hua1Y.js";
import { S as Spinner } from "./Spinner-GK6cEAdR.js";
import { u as useListConfigQuery } from "./lists-config-CsQWGvXL.js";
import { C as Callout } from "./Callout-DX4NBXlG.js";
import { D as DatatypeIcon, a as DatatypeToPrimitiveType } from "./DatatypeOption-Csn4su3e.js";
import { u as useDataModelQuery } from "./get-data-model-CAY4ZWaH.js";
import { g } from "./sharpstate.es-CeF1Mf5b.js";
import { R as Root, T as Trigger, C as Content } from "./index-DhVP5FgH.js";
import { S as ScreeningThreshold } from "./ScreeningThreshold-6mmbXp7u.js";
import { u as useGetInboxesQuery } from "./get-inboxes-6fSfvled.js";
const FormPagination = ({ finalButtonText, className }) => {
  const { t } = useTranslation(["common", "continuousScreening"]);
  const creationStepper = ContinuousScreeningConfigurationStepper.useSharp();
  const currentStep = creationStepper.computed.currentStep.value;
  const mode = ContinuousScreeningConfigurationStepper.select((state) => state.__internals.mode);
  const handleNext = useCallbackRef(() => {
    if (!creationStepper.computed.canGoNext.value) return;
    if (creationStepper.computed.hasNext.value) {
      creationStepper.actions.setCurrentStep(currentStep + 1);
    } else {
      creationStepper.actions.submit();
    }
  });
  const handlePrevious = useCallbackRef(() => {
    if (creationStepper.computed.hasPrevious.value) {
      creationStepper.actions.setCurrentStep(currentStep - 1);
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(StickyComponent, { inFlow: "after", sentinelClassName: "top-lg -translate-y-2xs", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn(
        "sticky flex justify-end gap-md bottom-0 bg-surface-page -m-lg mt-auto p-lg border-t border-transparent sentinel-intersect:border-grey-border sentinel-intersect:shadow-sticky-bottom",
        className
      ),
      children: [
        creationStepper.computed.hasPrevious.value ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", size: "large", onClick: handlePrevious, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "arrow-left", className: "size-4" }),
          t("common:previous")
        ] }) : null,
        creationStepper.computed.hasNext.value || mode !== "view" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "primary",
            size: "large",
            disabled: !creationStepper.computed.canGoNext.value,
            onClick: handleNext,
            children: [
              creationStepper.computed.hasNext.value ? t("common:next") : finalButtonText,
              /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: creationStepper.computed.hasNext.value ? "arrow-right" : "tick", className: "size-4" })
            ]
          }
        ) : null
      ]
    }
  ) });
};
function getDatasetsMapKey(datasets) {
  return getCanonicalSelectedKeys(datasets).join(",");
}
function ListAndTopicDatasetConfigurationBridge({
  useCase,
  children
}) {
  const listConfigQuery = useListConfigQuery(useCase);
  return M(listConfigQuery).with({ isError: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-50 flex-col items-center justify-center gap-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-text-secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trans, { i18nKey: "common:generic_fetch_data_error" }) }) })).with({ isPending: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-10" }) })).otherwise(({ data }) => /* @__PURE__ */ jsxRuntimeExports.jsx(ListAndTopicDatasetConfigurationBridgeInner, { provider: data.provider, children }));
}
function ListAndTopicDatasetConfigurationBridgeInner({
  provider,
  children
}) {
  const wizard = ContinuousScreeningConfigurationStepper.useSharp();
  const wizardMode = ContinuousScreeningConfigurationStepper.select((s) => s.__internals.mode);
  const datasetsMap = wizard.value.data.datasets;
  const datasetsMapKey = reactExports.useMemo(() => getDatasetsMapKey(datasetsMap), [datasetsMap]);
  const listSharp = ListAndTopicDatasetConfiguration.createSharp({
    datasets: datasetsMap,
    mode: wizardMode,
    provider
  });
  reactExports.useEffect(() => {
    listSharp.actions.setMode(wizardMode);
  }, [listSharp, wizardMode]);
  reactExports.useEffect(() => {
    const currentKey = getDatasetsMapKey(listSharp.value.datasets);
    if (currentKey === datasetsMapKey) return;
    const nextDatasets = { ...datasetsMap };
    listSharp.update((state) => {
      for (const key of Object.keys(state.datasets)) {
        delete state.datasets[key];
      }
      for (const key of Object.keys(nextDatasets)) {
        state.datasets[key] = !!nextDatasets[key];
      }
    });
  }, [listSharp, datasetsMap, datasetsMapKey]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ListAndTopicDatasetConfiguration.Provider, { value: listSharp, children });
}
const Stepper = ({
  fromZero = false,
  getStepLabel
}) => {
  const creationStepper = ContinuousScreeningConfigurationStepper.useSharp();
  const steps = creationStepper.select((state) => state.__internals.steps);
  const initialStep = creationStepper.select((state) => state.__internals.initialStep);
  const currentStep = creationStepper.computed.currentStep.value;
  const mode = creationStepper.select((state) => state.__internals.mode);
  const handleStepChange = useCallbackRef((stepIndex) => {
    if (mode !== "view") return;
    creationStepper.actions.setCurrentStep(stepIndex);
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    StepperComponent,
    {
      fromZero,
      steps: steps.map((step) => ({ name: step.name })),
      startAt: initialStep,
      currentStep,
      onStepChange: handleStepChange,
      getStepLabel
    }
  );
};
const StepperComponent = ({
  steps,
  startAt,
  currentStep,
  onStepChange,
  getStepLabel,
  fromZero = false
}) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-row gap-sm text-default font-normal items-center", children: steps.map((step, index) => {
    if (index < startAt) return null;
    const isCurrentStep = currentStep === index;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(reactExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: cn("size-5 flex items-center justify-center rounded-full bg-grey-background text-small", {
            "bg-purple-background text-purple-primary": isCurrentStep
          }),
          children: index + (fromZero ? 0 : 1)
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "span",
        {
          "aria-selected": isCurrentStep,
          className: "aria-selected:text-purple-primary",
          onClick: () => onStepChange(index),
          children: getStepLabel(step.name)
        }
      ),
      index < steps.length - 1 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1 w-10 border-b border-dashed border-grey-border" }) : null
    ] }, step.name);
  }) });
};
const DatasetSelection = ({ useCase }) => {
  const { t } = useTranslation(["common", "continuousScreening"]);
  const mode = ListAndTopicDatasetConfiguration.select((state) => state.mode);
  const tKey = mode === "view" ? "view" : "creation";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { bordered: true, className: "bg-surface-card mx-md", children: t(`continuousScreening:${tKey}.datasetSelection.callout`) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface-card rounded-lg border border-grey-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DatasetSelectionContent, { useCase }) })
  ] });
};
const Field = ({ title, description, children, callout, titleClassName, required = false }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface-card rounded-lg border border-grey-border p-md flex flex-col gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("text-h2 font-semibold", titleClassName), children: title }),
      required ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-primary text-s", children: "*" }) : null
    ] }),
    description ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-grey-secondary", children: description }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-md items-center", children }),
    callout ? /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { bordered: true, children: callout }) : null
  ] });
};
const newMappingConfigFromTable = (table) => {
  const fieldMappingEntries = table.fields.map((field) => {
    return [field.id, field.ftmProperty ?? null];
  });
  return {
    objectType: table.name,
    ftmEntity: table.ftmEntity ?? null,
    fieldMapping: Object.fromEntries(fieldMappingEntries)
  };
};
const ObjectMapping = ({ baseConfig }) => {
  const { t } = useTranslation(["continuousScreening"]);
  const dataModelQuery = useDataModelQuery();
  const mappingConfigs = ContinuousScreeningConfigurationStepper.select((state) => state.data.$mappingConfigs);
  const mode = ContinuousScreeningConfigurationStepper.select((state) => state.__internals.mode);
  const [isEditingNewObject, setIsEditingNewObject] = reactExports.useState(mappingConfigs.value.length === 0);
  const tKey = mode === "view" ? "view" : "creation";
  const availableTables = g(() => {
    if (!dataModelQuery.isSuccess) return [];
    const dataModel = dataModelQuery.data.dataModel;
    return dataModel.filter(
      (table) => !mappingConfigs.value.some((mappingConfig) => mappingConfig.objectType === table.name)
    );
  });
  reactExports.useEffect(() => {
    if (!dataModelQuery.isSuccess) return;
    for (let i = 0; i < mappingConfigs.value.length; i++) {
      const mappingConfig = mappingConfigs.value[i];
      const table = dataModelQuery.data.dataModel.find((table2) => table2.name === mappingConfig.objectType);
      if (table && table.ftmEntity && table.ftmEntity !== mappingConfig.ftmEntity) {
        mappingConfigs.value[i] = newMappingConfigFromTable(table);
      }
    }
  }, [dataModelQuery]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { bordered: true, className: "bg-surface-card mx-md", children: t(`continuousScreening:${tKey}.objectMapping.callout`) }),
    mappingConfigs.value.map((mappingConfig, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      ObjectMappingConfigurator,
      {
        availableTables: availableTables.value,
        mappingConfig,
        baseConfig,
        onUpdate: (updatedMappingConfig) => {
          mappingConfigs.value[index] = updatedMappingConfig;
        }
      },
      index
    )),
    isEditingNewObject ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      ObjectMappingConfigurator,
      {
        availableTables: availableTables.value,
        mappingConfig: null,
        onUpdate: (mappingConfig) => {
          mappingConfigs.value.push(mappingConfig);
          setIsEditingNewObject(false);
        }
      }
    ) : null,
    mode === "view" ? null : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        variant: "primary",
        appearance: "stroked",
        disabled: isEditingNewObject || mappingConfigs.value.length === 0,
        onClick: () => setIsEditingNewObject(true),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-4" }),
          t("continuousScreening:creation.objectMapping.addTable")
        ]
      }
    ) })
  ] });
};
const ObjectMappingConfigurator = ({
  availableTables,
  mappingConfig,
  baseConfig,
  onUpdate
}) => {
  const { t } = useTranslation(["continuousScreening"]);
  const dataModelQuery = useDataModelQuery();
  const [isTableOpen, setIsTableOpen] = reactExports.useState(false);
  const mode = ContinuousScreeningConfigurationStepper.select((state) => state.__internals.mode);
  if (!dataModelQuery.isSuccess) return null;
  const dataModel = dataModelQuery.data.dataModel;
  const currentTable = dataModel.find((table) => table.name === mappingConfig?.objectType);
  const isTableEditing = mappingConfig?.objectType ? baseConfig?.objectTypes.includes(mappingConfig.objectType) : false;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Root,
    {
      defaultOpen: true,
      className: "bg-surface-card rounded-lg border border-grey-border p-md flex flex-col gap-sm",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Icon,
            {
              icon: "caret-down",
              className: "size-6 group-radix-state-open:rotate-180 transition-transform duration-200"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-h2 font-semibold", children: mappingConfig?.objectType ?? t("continuousScreening:creation.objectMapping.configurator.title_placeholder") }),
          mappingConfig?.ftmEntity ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-secondary", children: mappingConfig.ftmEntity }) : null
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Content, { className: "flex flex-col gap-sm mt-sm radix-state-open:animate-slide-down radix-state-closed:animate-slide-up", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { open: isTableOpen, onOpenChange: setIsTableOpen, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: mode === "view" ? null : /* @__PURE__ */ jsxRuntimeExports.jsx(
              MenuCommand.SelectButton,
              {
                className: "w-full shrink-0",
                readOnly: currentTable?.ftmEntity !== void 0 && isTableEditing,
                children: mappingConfig?.objectType ?? t("continuousScreening:creation.objectMapping.configurator.tableName.placeholder")
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Content, { side: "bottom", align: "start", sideOffset: 4, sameWidth: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.List, { children: availableTables.map((table) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              MenuCommand.Item,
              {
                value: table.id,
                onSelect: () => {
                  onUpdate(newMappingConfigFromTable(table));
                },
                children: table.name
              },
              table.id
            )) }) })
          ] }),
          mappingConfig ? /* @__PURE__ */ jsxRuntimeExports.jsx(ObjectMappingFtmContent, { mappingConfig, onUpdate }) : null
        ] })
      ]
    }
  );
};
const ObjectMappingFtmContent = ({
  mappingConfig,
  onUpdate
}) => {
  const { t } = useTranslation(["continuousScreening"]);
  const mode = ContinuousScreeningConfigurationStepper.select((state) => state.__internals.mode);
  const dataModelQuery = useDataModelQuery();
  const table = dataModelQuery.data?.dataModel.find((table2) => table2.name === mappingConfig.objectType);
  if (!table) return null;
  const ftmEntity = table.ftmEntity ?? mappingConfig.ftmEntity;
  const availableProperties = ftmEntity ? FTM_ENTITIES_PROPERTIES[ftmEntity] : [];
  const handleSuggest = () => {
    if (!ftmEntity) return;
    const updatedFieldMapping = { ...mappingConfig.fieldMapping };
    for (const property of availableProperties) {
      const key = `${ftmEntity}.${property}`;
      const suggestion = getFtmEntitySuggestion(key);
      if (!suggestion) continue;
      const field = table.fields.find(
        (f) => f.semanticType === suggestion.semanticType && (suggestion.semanticSubType ? f.semanticSubType === suggestion.semanticSubType : true)
      );
      if (field && !field.ftmProperty && !updatedFieldMapping[field.id]) updatedFieldMapping[field.id] = property;
    }
    onUpdate({ ...mappingConfig, fieldMapping: updatedFieldMapping });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      FTMEntitySelector,
      {
        ftmEntity,
        availableEntities: FTM_ENTITIES,
        readOnly: table.ftmEntity !== void 0 || mode === "view",
        onChange: (ftmEntity2) => {
          onUpdate({
            ...mappingConfig,
            ftmEntity: ftmEntity2
          });
        },
        table
      }
    ),
    ftmEntity ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm border border-grey-border rounded-lg bg-surface-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-md p-md border-b border-grey-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typo, { variant: "subtitle1", className: "text-h3 font-semibold", children: t("continuousScreening:creation.objectMapping.configurator.fieldMapping.title") }),
        mode !== "view" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "primary", appearance: "stroked", onClick: handleSuggest, children: t("continuousScreening:creation.objectMapping.configurator.fieldMapping.suggest") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-[auto_40px_1fr] gap-sm p-md", children: table.fields.filter((f) => ["String", "Timestamp"].includes(f.dataType) && f.name != "updated_at").map((field) => {
        const ftmProperty = field.ftmProperty ?? mappingConfig.fieldMapping[field.id] ?? null;
        const hasSavedMapping = field.ftmProperty !== void 0;
        if (mode === "view" && !hasSavedMapping) return null;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-subgrid col-span-full items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center px-sm h-10 gap-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DatatypeIcon, { dataType: DatatypeToPrimitiveType(field.dataType) }),
            mappingConfig.objectType,
            ".",
            field.name
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("p-sm", { "opacity-50": hasSavedMapping }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "arrow-forward", className: "size-6 text-purple-primary" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            FtmFieldSelector,
            {
              readOnly: hasSavedMapping,
              ftmEntity,
              ftmProperty,
              availableProperties,
              onChange: (ftmProperty2) => {
                onUpdate({
                  ...mappingConfig,
                  fieldMapping: { ...mappingConfig.fieldMapping, [field.id]: ftmProperty2 }
                });
              }
            }
          )
        ] }, field.id);
      }) })
    ] }) : null
  ] });
};
const FTMEntitySelector = ({
  ftmEntity,
  availableEntities,
  readOnly,
  onChange,
  table
}) => {
  const { t } = useTranslation(["continuousScreening"]);
  const [isOpen, setOpen] = reactExports.useState(false);
  const mode = ContinuousScreeningConfigurationStepper.select((state) => state.__internals.mode);
  const tKey = mode === "view" || readOnly ? "view" : "creation";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Field,
    {
      title: t("continuousScreening:creation.objectMapping.configurator.ftmEntity.title"),
      description: t(`continuousScreening:${tKey}.objectMapping.configurator.ftmEntity.subtitle`, {
        list_type: ftmEntity,
        marble_type: table.name
      }),
      titleClassName: "text-default",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { open: isOpen, onOpenChange: setOpen, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.SelectButton, { readOnly, className: "w-full", children: ftmEntity ?? t("continuousScreening:creation.objectMapping.configurator.ftmEntity.placeholder") }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Content, { side: "bottom", align: "start", sideOffset: 4, sameWidth: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.List, { children: availableEntities.map((schema) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Item, { value: schema, onSelect: () => onChange(schema), children: schema }, schema)) }) })
      ] })
    }
  );
};
const FtmFieldSelector = ({
  ftmEntity,
  ftmProperty,
  availableProperties,
  readOnly,
  onChange
}) => {
  const { t } = useTranslation(["continuousScreening"]);
  const [isOpen, setIsOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { open: isOpen, onOpenChange: setIsOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.SelectButton, { readOnly, children: ftmProperty ? `${ftmEntity}.${ftmProperty}` : t("continuousScreening:creation.objectMapping.configurator.fieldMapping.placeholder") }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Content, { side: "bottom", align: "start", sideOffset: 4, sameWidth: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.List, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Item, { onSelect: () => onChange(null), children: t("continuousScreening:creation.objectMapping.configurator.fieldMapping.none") }, "none"),
      availableProperties.map((availableProperty) => /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Item, { onSelect: () => onChange(availableProperty), children: [
        ftmEntity,
        ".",
        availableProperty
      ] }, availableProperty))
    ] }) })
  ] });
};
const ScoringConfiguration = () => {
  const { t } = useTranslation(["continuousScreening"]);
  const matchThreshold = ContinuousScreeningConfigurationStepper.select((state) => state.data.$matchThreshold);
  const matchLimit = ContinuousScreeningConfigurationStepper.select((state) => state.data.$matchLimit);
  const mode = ContinuousScreeningConfigurationStepper.select((state) => state.__internals.mode);
  const tKey = mode === "view" ? "view" : "creation";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { bordered: true, className: "bg-surface-card mx-md", children: t(`continuousScreening:${tKey}.scoringConfiguration.callout`) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { title: t("continuousScreening:creation.scoringConfiguration.matchThreshold.title"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      ScreeningThreshold,
      {
        threshold: matchThreshold.value,
        onChange: (value) => matchThreshold.value = value,
        title: t(`continuousScreening:creation.scoringConfiguration.matchThreshold.subtitle`),
        className: "flex-1 w-full",
        disabled: mode === "view"
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Field,
      {
        title: t("continuousScreening:creation.scoringConfiguration.matchLimit.title"),
        description: t(`continuousScreening:creation.scoringConfiguration.matchLimit.subtitle`),
        callout: t("continuousScreening:creation.scoringConfiguration.matchLimit.callout"),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              value: matchLimit.value,
              readOnly: mode === "view",
              onChange: (e) => matchLimit.value = e.target.valueAsNumber
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("continuousScreening:creation.scoringConfiguration.matchLimit.text") })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Field,
      {
        required: mode === "create",
        title: t("continuousScreening:creation.scoringConfiguration.alertAutomation.title"),
        description: t(`continuousScreening:creation.scoringConfiguration.alertAutomation.subtitle`),
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(InboxSelector, {})
      }
    ) })
  ] });
};
const InboxSelector = () => {
  const { t } = useTranslation(["common", "continuousScreening"]);
  const [isOpen, setIsOpen] = reactExports.useState(false);
  const inboxesQuery = useGetInboxesQuery();
  const creationStepper = ContinuousScreeningConfigurationStepper.useSharp();
  const inboxId = ContinuousScreeningConfigurationStepper.select((state) => state.data.$inboxId);
  const inboxName = ContinuousScreeningConfigurationStepper.select((state) => state.data.$inboxName);
  const mode = ContinuousScreeningConfigurationStepper.select((state) => state.__internals.mode);
  const handleInboxSelect = (inboxId2) => {
    creationStepper.update((state) => {
      if (state.data.inboxName !== null) {
        state.data.inboxName = null;
      }
      state.data.inboxId = inboxId2;
    });
  };
  return M(inboxesQuery).with({ isPending: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-6" }) })).with({ isError: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-md items-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "", children: t("common:generic_fetch_data_error") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", onClick: () => inboxesQuery.refetch(), children: t("common:retry") })
  ] })).with({ isSuccess: true }, ({ data }) => {
    const inboxes = data?.inboxes ?? [];
    const currentInboxName = inboxes.find((inbox) => inbox.id === inboxId.value)?.name;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { open: isOpen, onOpenChange: setIsOpen, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          MenuCommand.SelectButton,
          {
            disabled: !inboxesQuery.isSuccess,
            readOnly: mode === "view",
            className: "min-w-50",
            children: currentInboxName ?? t("continuousScreening:creation.scoringConfiguration.alertAutomation.placeholder")
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Content, { side: "bottom", align: "start", sideOffset: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.List, { children: inboxes.map((inbox) => /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Item, { onSelect: () => handleInboxSelect(inbox.id), value: inbox.id, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: inbox.name }),
          inbox.id === inboxId.value ? /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "tick", className: "size-4" }) : null
        ] }, inbox.id)) }) })
      ] }),
      mode === "create" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("continuousScreening:creation.scoringConfiguration.alertAutomation.create_new_inbox") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "text",
            value: inboxName.value ?? "",
            onChange: (e) => {
              creationStepper.update((state) => {
                if (state.data.inboxId !== null) {
                  state.data.inboxId = null;
                }
                state.data.inboxName = e.target.value.length > 0 ? e.target.value : null;
              });
            }
          }
        )
      ] }) : null
    ] });
  }).exhaustive();
};
export {
  DatasetSelection as D,
  FormPagination as F,
  ListAndTopicDatasetConfigurationBridge as L,
  ObjectMapping as O,
  ScoringConfiguration as S,
  Stepper as a
};
