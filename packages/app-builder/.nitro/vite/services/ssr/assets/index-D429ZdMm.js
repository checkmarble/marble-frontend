import { R as jsxRuntimeExports, r as reactExports } from "../server.js";
import { u as useTranslation, t as useFormatDateTime, T as Typo, b as clsx, dX as reactDomExports, e8 as MenuCommand, j as Tag, e as Icon, e9 as Popover, B as Button, dz as Switch, e1 as Input, q as useFormatLanguage, w as formatDateTimeWithoutPresets, ea as formatDuration, d as cn, eb as Collapsible } from "./format-NPGUXq-g.js";
import { s as screeningsI18n, n as Route, P as Page } from "./router-vb7i5euz.js";
import { L as ListAndTopicDatasetConfiguration, D as DatasetSelectionContent } from "./DatasetSelectionContent-CZ4GOM-S.js";
import { b6 as makeDatasetsMap, b7 as syncSharpDatasets, b8 as getCanonicalSelectedKeys, b9 as isGlobalTopicSwitchSelected, ba as setGlobalTopicSwitch, M, bb as applyAliveDeceasedDefaults, aX as z, T as Temporal } from "./services-middleware-DR8Hua1Y.js";
import { T as ThresholdRange, S as ScreeningThreshold } from "./ScreeningThreshold-6mmbXp7u.js";
import { S as Spinner } from "./Spinner-GK6cEAdR.js";
import { S as SEARCH_ENTITIES } from "./screening-entity-DVQtf50p.js";
import { s as saveFreeformSearchFn, l as listSavedFreeformSearchesFn, a as getFreeformSearchFn, f as freeformSearchFn } from "./screenings-CS8peAlI.js";
import { u as useQuery } from "./useQuery-B7mL_evE.js";
import { y as useQueryClient } from "./QueryClientProvider-DYTpkCko.js";
import { u as useMutation } from "./useMutation-C5oG90Zs.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { u as useListConfigQuery } from "./lists-config-CsQWGvXL.js";
import { u as useOrganizationDetails } from "./organization-detail-YGkE0F4y.js";
import { a as useStore, u as useForm } from "./useForm-BwABQKAs.js";
import { z as zt } from "./CopyToClipboardButton-CJNJJful.js";
import { s as setAdditionalFields } from "./set-additional-fields-BAjwURJS.js";
import { g as getSectionLeafKeys, a as getAvailableGlobalTopicConfigs } from "./dataset-utils-C1Lb7jdi.js";
import { E as EntitySearchFormProvider, a as EntityTypePopover } from "./EntityTypePopover-CRaDLSH9.js";
import { C as Callout } from "./Callout-DX4NBXlG.js";
import { g as getSortedPayloadByTopics } from "./match-sorting-Cy-ZyfsJ.js";
import { F as FreeformMatchCard, T as TopicsDisplay, E as EntityDatasetsList, M as MatchDetails, I as IconDot } from "./FreeformMatchCard-JGOBIPO0.js";
import { u as usePaginationsButton, C as CursorPaginationButtons } from "./decisions-B-2DmJW1.js";
import { D as DateRangeFilter } from "./DateRangeFilter-CSuOawhN.js";
import { P as Panel } from "./Panel-kj8Z2GDk.js";
import { u as useOrganizationUsers } from "./organization-users-Bxl0ZW8k.js";
import { o as omitUndefined } from "./omit-undefined-_jZUo5xa.js";
import { A as Avatar } from "./Avatar-DpA4jY60.js";
import { S as Separator } from "./Separator-L7vdY7xf.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
import "./sharpstate.es-CeF1Mf5b.js";
import "./isNullish-B8pc8Ntu.js";
import "./use-callback-ref-DXzIzfqy.js";
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
import "./unique-CBeBxAXx.js";
import "./scenarios-8U74nJp4.js";
import "./capitalize-CzwYzf_g.js";
import "node:crypto";
import "./DataField-vckdVtrg.js";
import "./data-BFm2FCTm.js";
import "./data-fdG1PpsD.js";
import "./isNonNullish-DgEqPJBU.js";
import "./data-model-B-Bz1o1P.js";
import "./create-context-CYc8deix.js";
import "./dataTypeSchema-DvqJgdgd.js";
import "./mapToObj-wQ-uHOuD.js";
import "./omit-ZO4dmkWK.js";
import "./ExternalLink-CG_77QdX.js";
import "./useBaseQuery-CMboOtTR.js";
import "./keys-CPbIGTB1.js";
const PrintHeader = ({
  title,
  subtitle,
  showTimestamp = true,
  userName,
  children
}) => {
  const { t } = useTranslation(["common"]);
  const formatDateTime = useFormatDateTime();
  const timestamp = formatDateTime(/* @__PURE__ */ new Date(), { dateStyle: "short", timeStyle: "short" });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-md border-b border-grey-border pb-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typo, { variant: "title1", children: title }),
    subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-s text-grey-placeholder mt-xs", children: subtitle }),
    showTimestamp && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-grey-placeholder mt-xs", children: t("common:print.generated_at_by", {
      date: timestamp,
      user: userName,
      defaultValue: `Generated on ${timestamp}${userName ? ` by ${userName}` : ""}`
    }) }),
    children
  ] });
};
const PrintSection = ({ title, children, className }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: clsx("mb-md break-inside-avoid", className), children: [
    title && /* @__PURE__ */ jsxRuntimeExports.jsx(Typo, { variant: "title2", children: title }),
    children
  ] });
};
function copyStylesToWindow(printWindow) {
  const styleSheets = Array.from(document.styleSheets);
  styleSheets.forEach((sheet) => {
    try {
      if (sheet.href) {
        const link = printWindow.document.createElement("link");
        link.rel = "stylesheet";
        link.href = sheet.href;
        printWindow.document.head.appendChild(link);
      } else if (sheet.cssRules) {
        const style = printWindow.document.createElement("style");
        const cssRules = Array.from(sheet.cssRules).map((rule) => rule.cssText).join("\n");
        style.textContent = cssRules;
        printWindow.document.head.appendChild(style);
      }
    } catch {
      if (sheet.href) {
        const link = printWindow.document.createElement("link");
        link.rel = "stylesheet";
        link.href = sheet.href;
        printWindow.document.head.appendChild(link);
      }
    }
  });
  const printStyles = printWindow.document.createElement("style");
  printStyles.textContent = `
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .no-print {
        display: none !important;
      }
    }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: white;
      margin: 0;
      padding: 1rem;
    }
    .print-container {
      width: 100%;
    }
    @media print {
      body {
        padding: 0;
      }
    }
  `;
  printWindow.document.head.appendChild(printStyles);
}
const PrintView = ({ children, trigger, title = "Print", onBeforePrint }) => {
  const [printWindow, setPrintWindow] = reactExports.useState(null);
  const [container, setContainer] = reactExports.useState(null);
  const isInitializedRef = reactExports.useRef(false);
  const handlePrint = reactExports.useCallback(() => {
    onBeforePrint?.();
    const newWindow = window.open("", "_blank", "width=800,height=600");
    if (!newWindow) {
      console.error("Failed to open print window. Check popup blocker settings.");
      return;
    }
    newWindow.document.title = title;
    const charset = newWindow.document.createElement("meta");
    charset.setAttribute("charset", "utf-8");
    newWindow.document.head.appendChild(charset);
    const viewport = newWindow.document.createElement("meta");
    viewport.name = "viewport";
    viewport.content = "width=device-width, initial-scale=1";
    newWindow.document.head.appendChild(viewport);
    copyStylesToWindow(newWindow);
    const printRoot = newWindow.document.createElement("div");
    printRoot.id = "print-root";
    printRoot.className = "print-container";
    newWindow.document.body.appendChild(printRoot);
    setPrintWindow(newWindow);
    setContainer(printRoot);
    isInitializedRef.current = true;
  }, [title, onBeforePrint]);
  reactExports.useEffect(() => {
    if (printWindow && container && isInitializedRef.current) {
      const timeoutId = setTimeout(() => {
        printWindow.print();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [printWindow, container]);
  reactExports.useEffect(() => {
    return () => {
      if (printWindow && !printWindow.closed) {
        printWindow.close();
      }
    };
  }, [printWindow]);
  const triggerWithHandler = reactExports.cloneElement(trigger, {
    onClick: (e) => {
      trigger.props.onClick?.(e);
      handlePrint();
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    triggerWithHandler,
    container && printWindow && !printWindow.closed && reactDomExports.createPortal(children, container)
  ] });
};
const useFreeformSearchMutation = () => {
  const freeformSearch = useServerFn(freeformSearchFn);
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["screening", "freeform-search"],
    mutationFn: async (input) => {
      const datasets = input.entityType !== "Person" ? input.datasets?.filter(
        (dataset) => dataset !== "global:topic:liveness:filter.alive" && dataset !== "global:topic:liveness:filter.deceased"
      ) : input.datasets;
      return freeformSearch({ data: { ...input, datasets } });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["screening", "saved-searches"] });
    }
  });
};
const useSaveFreeformSearchMutation = () => {
  const queryClient = useQueryClient();
  const saveFreeformSearch = useServerFn(saveFreeformSearchFn);
  return useMutation({
    mutationKey: ["screening", "save-freeform-search"],
    mutationFn: async (input) => {
      await saveFreeformSearch({ data: input });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["screening", "saved-searches"] });
    }
  });
};
const useSavedFreeformSearchesQuery = (filters = {}) => {
  const listSavedSearches = useServerFn(listSavedFreeformSearchesFn);
  return useQuery({
    queryKey: ["screening", "saved-searches", filters],
    queryFn: async () => {
      return listSavedSearches({ data: filters });
    }
  });
};
const useGetFreeformSearchQuery = (id) => {
  const getFreeformSearch = useServerFn(getFreeformSearchFn);
  return useQuery({
    queryKey: ["screening", "freeform-search", id],
    queryFn: async () => {
      return getFreeformSearch({ data: { id } });
    }
  });
};
const SECTION_I18N_KEYS = {
  sanctions: "sanctions",
  peps: "peps",
  "adverse-media": "adverse_media",
  "third-parties": "third_parties",
  custom: "custom",
  global: "global"
};
const DatasetsPopover = ({ selectedDatasets, onApply, disabled }) => {
  const { t } = useTranslation([...screeningsI18n, "scenarios"]);
  const listConfigQuery = useListConfigQuery("manual_search");
  const listSharp = ListAndTopicDatasetConfiguration.useSharp();
  const [open, setOpen] = reactExports.useState(false);
  const tagRef = reactExports.useRef(null);
  const handleOpenChange = (isOpen) => {
    if (disabled) return;
    if (isOpen) {
      listSharp.update((state) => {
        syncSharpDatasets(state.datasets, selectedDatasets);
      });
    }
    setOpen(isOpen);
  };
  const handleApply = () => {
    onApply(getCanonicalSelectedKeys(listSharp.value.datasets));
    setOpen(false);
  };
  const handleCancel = () => {
    listSharp.update((state) => {
      syncSharpDatasets(state.datasets, selectedDatasets);
    });
    setOpen(false);
  };
  const hasSelection = selectedDatasets.filter((d) => !d.startsWith("global")).length > 0;
  const selectionMap = reactExports.useMemo(() => makeDatasetsMap(selectedDatasets), [selectedDatasets]);
  const sectionTags = reactExports.useMemo(() => {
    const data = listConfigQuery.data;
    if (!data || !hasSelection) return [];
    return Object.entries(data.filters).filter(([key]) => key !== "global").flatMap(([key, section]) => {
      if (!section) return [];
      const sectionKey = key;
      const isSectionEnabled = !!selectionMap[sectionKey];
      const count = getSectionLeafKeys(section, sectionKey).filter((k) => selectionMap[k]).length;
      if (!isSectionEnabled && count === 0) return [];
      return [{ key: sectionKey, count, isEmpty: isSectionEnabled && count === 0 }];
    });
  }, [listConfigQuery.data, selectionMap, hasSelection]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-sm relative", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { open, onOpenChange: handleOpenChange, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", disabled, className: "flex items-center gap-sm flex-wrap", ref: tagRef, children: hasSelection ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      sectionTags.map(({ key, count, isEmpty }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        Tag,
        {
          color: disabled ? "grey" : "purple",
          className: "cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium capitalize", children: [
            t(`scenarios:sanction.lists.${SECTION_I18N_KEYS[key]}`),
            isEmpty ? ` (${t("scenarios:sanction.lists.no_lists_selected")})` : ` (${count})`
          ] })
        },
        key
      )),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-4 text-grey-secondary" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-xs text-grey-placeholder cursor-pointer", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-4  " }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("screenings:freeform_search.filter_by_list") })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Content, { align: "start", sideOffset: 4, className: "w-[280px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DatasetSelectionContent, { useCase: "manual_search", onApply: handleApply, onCancel: handleCancel }) })
  ] }) });
};
const LIMIT_OPTIONS = [10, 20, 30, 40, 50];
const DEFAULT_LIMIT = 10;
const LimitPopover = ({
  disabled,
  originalValue,
  onApply,
  onApplyDatasets,
  selectedDatasets
}) => {
  const { t } = useTranslation(screeningsI18n);
  const listConfigQuery = useListConfigQuery("manual_search");
  const listSharp = ListAndTopicDatasetConfiguration.useSharp();
  const [open, setOpen] = reactExports.useState(false);
  const [draftLimit, setDraftLimit] = reactExports.useState(void 0);
  const form = useFormManuallSearch();
  const committedLimit = useStore(form.store, (state) => state.values.limit);
  const value = draftLimit ?? committedLimit;
  const tagRef = reactExports.useRef(null);
  const listConfig = listConfigQuery.data;
  const availableGlobalTopicConfigs = listConfig ? getAvailableGlobalTopicConfigs(listConfig.filters) : [];
  const includeDeceasedSelected = listConfig != null && availableGlobalTopicConfigs.some((config) => isGlobalTopicSwitchSelected(listSharp.value.datasets, config));
  const hasCustomValue = committedLimit !== void 0 && committedLimit !== DEFAULT_LIMIT || !!includeDeceasedSelected;
  const handleOpenChange = (isOpen) => {
    if (disabled) return;
    if (isOpen) {
      setDraftLimit(committedLimit ?? DEFAULT_LIMIT);
      listSharp.update((state) => {
        syncSharpDatasets(state.datasets, selectedDatasets);
      });
    } else {
      setDraftLimit(void 0);
    }
    setOpen(isOpen);
  };
  const handleCancel = () => {
    form.setFieldValue("limit", originalValue);
    listSharp.update((state) => {
      syncSharpDatasets(state.datasets, selectedDatasets);
    });
    setDraftLimit(void 0);
    setOpen(false);
  };
  const handleApply = () => {
    const nextLimit = value ?? DEFAULT_LIMIT;
    if (listConfig) {
      onApplyDatasets(getCanonicalSelectedKeys(listSharp.value.datasets));
    }
    form.setFieldValue("limit", nextLimit);
    onApply(nextLimit);
    setDraftLimit(void 0);
    setOpen(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover.Root, { open, onOpenChange: handleOpenChange, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Popover.Trigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: "flex items-center gap-sm cursor-pointer", disabled, children: [
      includeDeceasedSelected && /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: disabled ? "grey" : "purple", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: t("screenings:freeform_search.global.liveness") }) }),
      committedLimit !== DEFAULT_LIMIT && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Tag,
        {
          color: disabled ? "grey" : "purple",
          className: "cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
          ref: tagRef,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: t("screenings:freeform_search.limit_label", { limit: committedLimit }) })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-xs text-grey-placeholder", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-4  " }),
        !hasCustomValue && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("screenings:freeform_search.advanced_filters") })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Popover.Content,
      {
        className: "bg-surface-card border-grey-border z-50 flex w-[300px] flex-col rounded-lg border shadow-lg",
        sideOffset: 4,
        align: "start",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm p-md", children: [
            availableGlobalTopicConfigs.map((config) => /* @__PURE__ */ jsxRuntimeExports.jsx(GlobalTopicSwitch, { config }, config.groupKey)),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ThresholdRange,
              {
                defaultDescription: t("screenings:freeform_search.limit_description"),
                value,
                onChange: (nextValue) => setDraftLimit(nextValue),
                values: LIMIT_OPTIONS.map((option) => ({
                  value: option,
                  color: "var(--color-purple-primary)"
                })),
                initialColor: "var(--color-purple-primary)",
                max: LIMIT_OPTIONS.at(-1)
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover.Footer, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "secondary", size: "large", onClick: handleCancel, children: t("common:cancel") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "primary", size: "large", onClick: handleApply, children: t("screenings:freeform_search.apply") })
          ] })
        ]
      }
    )
  ] });
};
function GlobalTopicSwitch({ config }) {
  const listSharp = ListAndTopicDatasetConfiguration.useSharp();
  const { t } = useTranslation(screeningsI18n);
  const switchId = `global-topic-${config.groupKey}`;
  const isSelected = ListAndTopicDatasetConfiguration.select(
    (state) => isGlobalTopicSwitchSelected(state.datasets, config)
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Switch,
      {
        id: switchId,
        checked: isSelected,
        onCheckedChange: (checked) => {
          listSharp.update((state) => {
            setGlobalTopicSwitch(state.datasets, config, checked);
          });
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: switchId, className: "text-s text-grey-primary cursor-pointer", children: t(config.label) })
  ] });
}
function useManualSearchForm({ onSubmit }) {
  const { org } = useOrganizationDetails();
  return useForm({
    defaultValues: {
      entityType: "Thing",
      fields: setAdditionalFields(SEARCH_ENTITIES["Thing"].fields, {}),
      limit: DEFAULT_LIMIT,
      threshold: org.sanctionThreshold ?? 70
    },
    onSubmit: ({ value }) => onSubmit(value)
  });
}
const ManualSearchFormContext = reactExports.createContext(null);
function useFormManuallSearch() {
  const form = reactExports.useContext(ManualSearchFormContext);
  if (!form) throw new Error("useFormManuallSearch must be used within FreeformSearchForm");
  return form;
}
const FreeformSearchForm = ({ onSearchComplete }) => {
  const listConfigQuery = useListConfigQuery("manual_search");
  const { t } = useTranslation("common");
  return M(listConfigQuery).with({ isPending: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-10" }) })).with({ isError: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-md items-center justify-center h-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "", children: t("common:generic_fetch_data_error") }) })).otherwise(({ data }) => /* @__PURE__ */ jsxRuntimeExports.jsx(FreeformSearchFormInner, { provider: data.provider, listConfig: data.filters, onSearchComplete }));
};
const FreeformSearchFormInner = ({
  provider,
  onSearchComplete,
  listConfig
}) => {
  const { t } = useTranslation(screeningsI18n);
  const searchMutation = useFreeformSearchMutation();
  const [selectedDatasets, setSelectedDatasets] = reactExports.useState(() => {
    const initial = {};
    applyAliveDeceasedDefaults(initial, listConfig, "manual_search");
    return getCanonicalSelectedKeys(initial);
  });
  const selectedDatasetsKey = reactExports.useMemo(() => selectedDatasets.toSorted().join(","), [selectedDatasets]);
  const listSharp = ListAndTopicDatasetConfiguration.createSharp({
    datasets: makeDatasetsMap(selectedDatasets),
    mode: "edit",
    variant: "popover",
    provider
  });
  reactExports.useEffect(() => {
    listSharp.update((state) => {
      syncSharpDatasets(state.datasets, selectedDatasets);
    });
  }, [listSharp, selectedDatasetsKey, selectedDatasets]);
  const form = useManualSearchForm({
    onSubmit: async (value) => {
      const datasets = getCanonicalSelectedKeys(listSharp.value.datasets);
      const submitValue = {
        ...value,
        datasets: datasets.length > 0 ? datasets : void 0,
        limit: value.limit ?? DEFAULT_LIMIT
      };
      searchMutation.mutateAsync(submitValue).then((result) => {
        onSearchComplete(result, submitValue);
      }).catch(() => {
        zt.error(t("common:errors.unknown"));
      });
    }
  });
  const threshold = useStore(form.store, (state) => state.values.threshold);
  const entityType = useStore(form.store, (state) => state.values.entityType);
  const limit = useStore(form.store, (state) => state.values.limit);
  const originalLimit = reactExports.useRef(limit ?? DEFAULT_LIMIT);
  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    form.handleSubmit();
  };
  const handleClearFilters = () => {
    form.reset();
    setSelectedDatasets([]);
    originalLimit.current = DEFAULT_LIMIT;
  };
  const hasActiveFilters = selectedDatasets.length > 0 || entityType && entityType !== "Thing" || limit !== void 0 && limit !== DEFAULT_LIMIT;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ManualSearchFormContext.Provider, { value: form, children: /* @__PURE__ */ jsxRuntimeExports.jsx(EntitySearchFormProvider, { form, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface-card border-grey-border rounded-lg border p-md space-y-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("form", { onSubmit: handleSubmit, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        form.Field,
        {
          name: "fields.name",
          validators: {
            onSubmit: ({ value }) => {
              const v = value ?? "";
              return v.trim().length >= 1 ? void 0 : t("screenings:freeform_search.name_required");
            }
          },
          children: (formField) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col gap-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                name: formField.name,
                value: formField.state.value ?? "",
                onChange: (e) => formField.handleChange(e.target.value),
                className: "w-full",
                borderColor: formField.state.meta.errors.length > 0 ? "redfigma-47" : "greyfigma-90",
                placeholder: t("screenings:freeform_search.name_placeholder")
              }
            ),
            formField.state.meta.errors.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-primary text-xs", children: formField.state.meta.errors[0] })
          ] })
        }
      ) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(EntityTypePopover, { disabled: searchMutation.isPending })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ListAndTopicDatasetConfiguration.Provider, { value: listSharp, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface-card border-grey-border rounded-lg border p-md space-y-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        ScreeningThreshold,
        {
          threshold,
          onChange: (value) => {
            form.setFieldValue("threshold", value);
          },
          title: t("screenings:freeform_search.threshold_label")
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        DatasetsPopover,
        {
          selectedDatasets,
          onApply: setSelectedDatasets,
          disabled: searchMutation.isPending
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        LimitPopover,
        {
          disabled: searchMutation.isPending,
          originalValue: originalLimit.current,
          selectedDatasets,
          onApply: (value) => {
            originalLimit.current = value;
          },
          onApplyDatasets: setSelectedDatasets
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-sm justify-end", children: [
      hasActiveFilters && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", appearance: "stroked", size: "medium", onClick: handleClearFilters, children: t("screenings:freeform_search.clear_filters") }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(form.Subscribe, { selector: (state) => [state.canSubmit, state.isSubmitting], children: ([canSubmit, isSubmitting]) => {
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "primary",
            size: "medium",
            type: "submit",
            disabled: !canSubmit || isSubmitting,
            onClick: handleSubmit,
            className: "flex items-center gap-xs",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("screenings:freeform_search.submit") }),
              isSubmitting && /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "spinner", className: "size-5 animate-spin" })
            ]
          }
        );
      } })
    ] })
  ] }) }) });
};
const FreeformSearchResults = ({
  results,
  limit,
  searchTerm
}) => {
  const { t } = useTranslation(screeningsI18n);
  const effectiveLimit = limit ?? DEFAULT_LIMIT;
  const mayHaveMoreResults = results !== null && results.length === effectiveLimit;
  return M(results).with(null, () => (
    // Initial state - no search performed yet
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface-card border-grey-border rounded-lg border p-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-s text-grey-secondary", children: t("screenings:freeform_search.initial_state") }) })
  )).with([], () => (
    // No results found
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface-card border-grey-border rounded-lg border p-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-s text-grey-secondary", children: t("screenings:freeform_search.no_results_title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-s text-grey-placeholder mt-xs", children: t("screenings:freeform_search.no_results_description") })
    ] })
  )).with(z.array(), (data) => (
    // Results found
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface-card border-grey-border flex flex-col gap-sm rounded-md border px-sm py-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-s flex items-center gap-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary font-semibold", children: t("screenings:freeform_search.results_title") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-placeholder", children: t("screenings:freeform_search.results_count", { count: data.length }) })
        ] }),
        mayHaveMoreResults && /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { color: "orange", icon: "warning", children: t("screenings:freeform_search.limit_warning") })
      ] }),
      getSortedPayloadByTopics(data).map((entity) => /* @__PURE__ */ jsxRuntimeExports.jsx(FreeformMatchCard, { entity, defaultOpen: data.length === 1, searchTerm }, entity.id))
    ] })
  )).exhaustive();
};
const FreeformSearchPage = ({ onSearchComplete, listConfig }) => {
  const [results, setResults] = reactExports.useState(null);
  const [currentLimit, setCurrentLimit] = reactExports.useState(void 0);
  const [searchTerm, setSearchTerm] = reactExports.useState(void 0);
  const handleSearchComplete = reactExports.useCallback(
    (result, inputs) => {
      setResults(result.matches);
      setCurrentLimit(inputs.limit);
      setSearchTerm(inputs.fields.name);
      onSearchComplete?.({
        searchId: result.id,
        results: result.matches,
        inputs: {
          entityType: inputs.entityType,
          fields: inputs.fields,
          datasets: inputs.datasets ?? [],
          threshold: inputs.threshold,
          limit: inputs.limit
        }
      });
    },
    [onSearchComplete]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full flex-col gap-lg lg:flex-row", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full shrink-0 overflow-y-auto lg:w-1/4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FreeformSearchForm, { onSearchComplete: handleSearchComplete, listConfig }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-0 min-w-0 flex-1 overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FreeformSearchResults, { results, limit: currentLimit, searchTerm }) })
  ] });
};
const PrintResultCard = ({ entity }) => {
  const { t } = useTranslation(screeningsI18n);
  const entitySchema = entity.schema.toLowerCase();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-grey-border rounded-md break-inside-avoid mb-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-sm px-md py-xs border-b border-grey-border bg-grey-background-light/30", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s font-semibold text-grey-primary", children: entity.caption }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-placeholder", children: t(`screenings:entity.schema.${entitySchema}`, {
        defaultValue: entitySchema
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "grey", children: t("screenings:match.similarity", {
        percent: Math.round(entity.score * 100)
      }) })
    ] }),
    entity.properties?.["topics"]?.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b border-grey-border px-md py-2xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TopicsDisplay, { entity, containerClassName: "flex flex-wrap gap-xs" }) }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-s p-md", children: [
      entitySchema === "person" && entity.datasets?.length ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[140px_1fr] gap-sm mb-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold", children: t("screenings:match.datasets.title") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          EntityDatasetsList,
          {
            datasets: entity.datasets,
            useCase: "manual_search",
            listClassName: "list-disc list-inside",
            itemClassName: "break-all"
          }
        ) })
      ] }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsx(MatchDetails, { entity })
    ] })
  ] });
};
const PrintResults = ({ results }) => {
  const { t } = useTranslation(screeningsI18n);
  return M(results).with([], () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-grey-border rounded-md border p-xl text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-s text-grey-placeholder", children: t("screenings:freeform_search.no_results_title") }) })).with(z.array(), (data) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Typo, { variant: "title2", className: "  mb-sm", children: [
      t("screenings:freeform_search.results_title"),
      " (",
      t("screenings:freeform_search.results_count", { count: data.length }),
      ")"
    ] }),
    data.map((entity) => /* @__PURE__ */ jsxRuntimeExports.jsx(PrintResultCard, { entity }, entity.id))
  ] })).exhaustive();
};
const PrintSearchSummary = ({ searchInputs }) => {
  const { t } = useTranslation(screeningsI18n);
  const entityTypeKey = searchInputs.entityType.toLowerCase();
  const activeFields = Object.entries(searchInputs.fields).filter(([, value]) => value && value.trim() !== "");
  return /* @__PURE__ */ jsxRuntimeExports.jsx(PrintSection, { title: t("screenings:print.search_summary"), children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-grey-border rounded-md p-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-md text-s", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-grey-placeholder", children: t("screenings:freeform_search.entity_type_label") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-grey-primary", children: t(`screenings:refine_modal.schema.${entityTypeKey}`) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-grey-placeholder", children: t("screenings:freeform_search.threshold_label") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-grey-primary", children: searchInputs.threshold !== void 0 ? `${searchInputs.threshold}%` : t("screenings:print.default_threshold") })
    ] }),
    activeFields.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-grey-placeholder", children: t("screenings:print.search_fields") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-sm mt-sm", children: activeFields.map(([field, value]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Tag, { color: "grey", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
          t(`screenings:entity.property.${field}`),
          ":"
        ] }),
        " ",
        value
      ] }, field)) })
    ] }),
    searchInputs.datasets.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-grey-placeholder", children: t("screenings:freeform_search.datasets_label") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-s text-grey-primary mt-xs", children: searchInputs.datasets.join(", ") })
    ] })
  ] }) }) });
};
function toIsoRange(value) {
  if (!value) return {};
  if (value.type === "static") {
    return { createdAfter: value.startDate || void 0, createdBefore: value.endDate || void 0 };
  }
  const now = Temporal.Now.zonedDateTimeISO();
  return {
    createdAfter: now.add(value.fromNow).toInstant().toString(),
    createdBefore: now.toInstant().toString()
  };
}
const PAGE_SIZES = [25, 50, 100];
const ViewSavedResults = () => {
  const { t } = useTranslation(["screenings", "common"]);
  const [open, setOpen] = reactExports.useState(false);
  const [isSaved, setIsSaved] = reactExports.useState(true);
  const [dateRange, setDateRange] = reactExports.useState(null);
  const [ownerId, setOwnerId] = reactExports.useState(void 0);
  const [paginationParams, setPaginationParams] = reactExports.useState({ limit: 25 });
  const { createdAfter, createdBefore } = reactExports.useMemo(() => toIsoRange(dateRange), [dateRange]);
  const filterValues = reactExports.useMemo(
    () => omitUndefined({
      userId: ownerId,
      isSaved,
      createdAfter,
      createdBefore
    }),
    [ownerId, isSaved, createdAfter, createdBefore]
  );
  const resetPagination = () => {
    setPaginationParams((prev) => ({ limit: prev.limit ?? 25 }));
  };
  const query = useSavedFreeformSearchesQuery(
    omitUndefined({
      ...filterValues,
      ...paginationParams
    })
  );
  const data = query.data;
  const items = data?.data ?? [];
  const hasNextPage = data?.has_next_page ?? false;
  const limit = paginationParams.limit ?? 25;
  const paginationItems = reactExports.useMemo(() => items.map((item) => ({ id: item.id, createdAt: item.created_at })), [items]);
  const paginationState = usePaginationsButton({
    filterValues,
    items: paginationItems,
    initialOffsetId: paginationParams.offsetId
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "primary", appearance: "stroked", onClick: () => setOpen(true), children: t("screenings:freeform_search.saved_results.button") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Root, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Container, { size: "medium", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel.Content, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Header, { children: t("screenings:freeform_search.saved_results.title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-md pb-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          PeriodFilter,
          {
            value: dateRange,
            onChange: (v) => {
              setDateRange(v);
              resetPagination();
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          OwnerFilter,
          {
            value: ownerId,
            onChange: (v) => {
              setOwnerId(v);
              resetPagination();
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-10 items-center gap-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Switch,
            {
              id: "saved-only",
              checked: isSaved,
              onCheckedChange: (value) => {
                setIsSaved(value);
                resetPagination();
              }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "saved-only", className: "text-s text-grey-primary", children: t("screenings:freeform_search.saved_results.saved_only") })
        ] })
      ] }),
      query.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-s text-grey-secondary p-md", children: t("screenings:freeform_search.saved_results.loading") }) : query.isError ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-s text-red-primary p-md", children: t("screenings:freeform_search.saved_results.error") }) : items.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-s text-grey-secondary p-md", children: t("screenings:freeform_search.saved_results.empty") }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "flex flex-col gap-sm", children: items.map((search) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SavedSearchRow, { search }) }, search.id)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Footer, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SavedResultsPageSizeSelector,
          {
            limit,
            onLimitChange: (pageSize) => setPaginationParams({ limit: pageSize })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          CursorPaginationButtons,
          {
            items: paginationItems,
            onPaginationChange: (newPaginationParams) => setPaginationParams((prev) => ({
              limit: prev.limit ?? 25,
              ...newPaginationParams
            })),
            paginationState,
            boundariesDisplay: "dates",
            hasNextPage,
            itemsPerPage: limit
          }
        )
      ] }) })
    ] }) }) })
  ] });
};
function SavedSearchRow({ search }) {
  const { t } = useTranslation(["screenings", "common"]);
  const language = useFormatLanguage();
  const { currentUser } = useOrganizationDetails();
  const { getOrgUserById } = useOrganizationUsers();
  const owner = search.user_id ? getOrgUserById(search.user_id) : void 0;
  const isYou = currentUser.actorIdentity.userId === search.user_id;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Collapsible.Container, { defaultOpen: false, className: "bg-grey-background-light", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Collapsible.Title, { size: "small", iconPosition: "left", className: "grid", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-1 flex-wrap items-center gap-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary", children: search.search_input.query?.["name"]?.join(", ") }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-xs text-s text-grey-secondary font-normal", children: [
        owner ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { size: "xs", firstName: owner.firstName, lastName: owner.lastName }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-grey-primary", children: [
            `${owner.firstName} ${owner.lastName}`.trim(),
            isYou ? ` (${t("screenings:freeform_search.saved_results.you")})` : null
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: search.user_id }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(IconDot, { spaced: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatDateTimeWithoutPresets(search.created_at, { language, dateStyle: "short" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(IconDot, { spaced: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("screenings:freeform_search.saved_results.hits", { count: search.nb_hits }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(IconDot, { spaced: true }),
        search.is_saved ? /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "star", className: "size-5 fill-none text-purple-secondary" }) : null
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Collapsible.Content, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FilterValues, { filter: search.search_config }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(QueryValues, { query: search.search_input, type: search.search_input.type }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SavedResults, { id: search.id })
    ] })
  ] });
}
function FilterValues({ filter }) {
  const { t } = useTranslation(["screenings"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-xs", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Tag, { color: "white", appearance: "monospace", className: "gap-xs", children: [
        t("screenings:freeform_search.threshold_label"),
        ": ",
        filter.threshold
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "white", appearance: "monospace", className: "gap-xs", children: t("screenings:freeform_search.limit_label", { limit: filter.limit }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap items-center gap-xs", children: Object.entries(filter.filters).filter(([, value]) => value.enabled).map(([key, value], index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(reactExports.Fragment, { children: [
      value?.datasets?.length && /* @__PURE__ */ jsxRuntimeExports.jsxs(Tag, { color: "white", appearance: "monospace", className: "gap-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          key,
          ":"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: value?.datasets?.length ?? 0 })
      ] }),
      value?.topics && /* @__PURE__ */ jsxRuntimeExports.jsx(TopicTag, { topics: value.topics })
    ] }, `filter-${key}-${index}`)) })
  ] });
}
function TopicTag({ topics }) {
  const { t } = useTranslation(["screeningTopics"]);
  function getKey(v) {
    if (v.startsWith("filter.")) return `lexis.${v.slice(7)}`;
    return `lexis.${v}`;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: Object.entries(topics).map(([key, value]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Tag, { color: "white", appearance: "monospace", className: "gap-xs h-auto text-wrap items-start break-words", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
      key,
      ":"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: value.map((v) => t(`screeningTopics:${getKey(v)}`)).join(", ") })
  ] }, key)) });
}
function QueryValues({ query, type }) {
  const { t } = useTranslation(["screenings"]);
  const entityType = query.type;
  const entityTypeFields = entityType && entityType in SEARCH_ENTITIES ? SEARCH_ENTITIES[entityType].fields.filter((f) => f !== "name") : [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-xs", children: [
    type !== "Thing" && /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "white", appearance: "monospace", className: "gap-xs", children: t(`screenings:entity.schema.${type.toLocaleLowerCase()}`) }),
    entityTypeFields.map(
      (field) => query.query[field] ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Tag, { color: "white", appearance: "monospace", className: "gap-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t(`screenings:entity.property.${field}`) }),
        ":",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: query.query[field].join(", ") })
      ] }, field) : null
    )
  ] });
}
function PeriodFilter({
  value,
  onChange
}) {
  const { t } = useTranslation(["screenings", "common"]);
  const language = useFormatLanguage();
  const [open, setOpen] = reactExports.useState(false);
  const [draft, setDraft] = reactExports.useState(value);
  const selectedLabel = (() => {
    if (!value) return null;
    if (value.type === "static") {
      const from = value.startDate ? formatDateTimeWithoutPresets(value.startDate, { language, dateStyle: "short" }) : "…";
      const to = value.endDate ? formatDateTimeWithoutPresets(value.endDate, { language, dateStyle: "short" }) : "…";
      return `${from} → ${to}`;
    }
    return formatDuration(value.fromNow, language);
  })();
  if (selectedLabel)
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      FilterPill,
      {
        icon: "calendar-month",
        label: selectedLabel,
        onClear: () => onChange(null),
        clearAriaLabel: t("screenings:freeform_search.clear")
      }
    );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    MenuCommand.Menu,
    {
      open,
      onOpenChange: (o) => {
        setOpen(o);
        if (o) setDraft(value);
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", appearance: "stroked", className: "w-full justify-between h-10", size: "medium", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "calendar-month", className: "size-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: t("screenings:freeform_search.saved_results.select_period") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Icon,
            {
              icon: "smallarrow-up",
              className: cn("size-4 transition-transform duration-200 rotate-180", open && "rotate-0")
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Content, { className: "min-w-[28rem]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.List, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            DateRangeFilter.Root,
            {
              dateRangeFilter: draft,
              setDateRangeFilter: (v) => setDraft(v ?? null),
              className: "grid",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(DateRangeFilter.FromNowPicker, { title: t("screenings:freeform_search.saved_results.select_period") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { className: "bg-grey-border", decorative: true, orientation: "vertical" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(DateRangeFilter.Calendar, {}),
                /* @__PURE__ */ jsxRuntimeExports.jsx(DateRangeFilter.Summary, { className: "col-span-3 row-span-1" })
              ]
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-grey-border flex justify-end gap-sm border-t p-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "secondary",
                appearance: "stroked",
                size: "large",
                onClick: () => {
                  setDraft(null);
                  onChange(null);
                  setOpen(false);
                },
                children: t("screenings:freeform_search.clear")
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "large",
                onClick: () => {
                  onChange(draft);
                  setOpen(false);
                },
                children: t("screenings:freeform_search.apply")
              }
            )
          ] })
        ] })
      ]
    }
  );
}
function getOwnerLabel(owner) {
  return `${owner.firstName} ${owner.lastName}`.trim() || owner.email;
}
function OwnerFilter({
  value,
  onChange
}) {
  const { t } = useTranslation(["screenings", "common"]);
  const { orgUsers, getOrgUserById } = useOrganizationUsers();
  const [open, setOpen] = reactExports.useState(false);
  const owner = value ? getOrgUserById(value) : void 0;
  const ownerLabel = owner ? getOwnerLabel(owner) : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: ownerLabel ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FilterPill, { icon: "user", label: ownerLabel }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", appearance: "stroked", className: "w-full justify-between h-10", size: "medium", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: t("screenings:freeform_search.saved_results.select_owner") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Icon,
        {
          icon: "smallarrow-up",
          className: cn("size-4 transition-transform duration-200 rotate-180", open && "rotate-0")
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Content, { sameWidth: true, className: "mt-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Combobox, { placeholder: t("screenings:freeform_search.saved_results.select_owner") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.List, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          MenuCommand.Item,
          {
            value: "",
            onSelect: () => {
              onChange(void 0);
              setOpen(false);
            },
            children: t("screenings:freeform_search.saved_results.all_owners")
          }
        ),
        orgUsers.map((user) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          MenuCommand.Item,
          {
            value: user.userId,
            onSelect: () => {
              onChange(user.userId === value ? void 0 : user.userId);
              setOpen(false);
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex w-full justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: getOwnerLabel(user) }),
              user.userId === value ? /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "tick", className: "text-purple-primary size-5" }) : null
            ] })
          },
          user.userId
        ))
      ] })
    ] })
  ] });
}
function SavedResultsPageSizeSelector({
  limit,
  onLimitChange
}) {
  const { t } = useTranslation(["screenings"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-xs", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-secondary", children: t("screenings:freeform_search.saved_results.results_per_page") }),
    PAGE_SIZES.map((size) => {
      const active = size === limit;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "secondary",
          appearance: "stroked",
          size: "medium",
          className: cn(active && "border-purple-primary text-purple-primary"),
          onClick: () => {
            if (!active) onLimitChange(size);
          },
          children: size
        },
        size
      );
    })
  ] });
}
function FilterPill({
  icon,
  label,
  onClear,
  clearAriaLabel
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Tag, { color: "purple", size: "big", className: "w-full justify-between bg-purple-primary/20", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-xs truncate", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon, className: "size-4 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-medium", children: label })
    ] }),
    onClear ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        role: "button",
        appearance: "link",
        "aria-label": clearAriaLabel,
        className: "hover:text-purple-hover shrink-0 cursor-pointer",
        onClick: onClear,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "cross", className: "size-4" })
      }
    ) : null
  ] });
}
function SavedResults({ id }) {
  const query = useGetFreeformSearchQuery(id);
  return query.isSuccess && query.data && query.data.matches ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-sm mt-sm", children: query.data.matches?.map((match) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(FreeformMatchCard, { entity: match, background: "card" }, match.id);
  }) }) : null;
}
function ScreeningSearchIndexPage() {
  const {
    t
  } = useTranslation(["screenings"]);
  const {
    currentUser
  } = useOrganizationDetails();
  const {
    listConfig
  } = Route.useLoaderData();
  const [searchState, setSearchState] = reactExports.useState(null);
  const saveSearchMutation = useSaveFreeformSearchMutation();
  const userName = [currentUser.actorIdentity.firstName, currentUser.actorIdentity.lastName].filter(Boolean).join(" ");
  const handleSearchComplete = reactExports.useCallback((state) => {
    setSearchState(state);
  }, []);
  function handleSaveSearch() {
    if (!searchState?.inputs) return;
    saveSearchMutation.mutateAsync({
      id: searchState.searchId
    }).then(() => zt.success(t("screenings:freeform_search.save.success"))).catch(() => zt.error(t("common:errors.unknown")));
  }
  const hasResults = searchState !== null && searchState.results.length > 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Page.Main, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Content, { className: "h-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typo, { variant: "title1", children: t("navigation:screening_search") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
        hasResults && /* @__PURE__ */ jsxRuntimeExports.jsxs(PrintView, { title: t("screenings:print.title"), trigger: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "download", className: "size-4" }),
          t("screenings:print.open_print_view")
        ] }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(PrintHeader, { title: t("screenings:print.title"), userName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(PrintSearchSummary, { searchInputs: searchState.inputs }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(PrintResults, { results: searchState.results })
        ] }),
        searchState?.searchId && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", onClick: handleSaveSearch, disabled: saveSearchMutation.isPending, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "save", className: "size-4" }),
          t("screenings:freeform_search.save.button")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ViewSavedResults, {})
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(FreeformSearchPage, { onSearchComplete: handleSearchComplete, listConfig: listConfig.filters })
  ] }) });
}
export {
  ScreeningSearchIndexPage as component
};
