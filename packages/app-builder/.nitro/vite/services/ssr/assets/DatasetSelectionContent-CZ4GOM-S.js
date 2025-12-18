import { R as jsxRuntimeExports, r as reactExports } from "../server.js";
import { bj as SCREENING_CATEGORY_COLORS, M, bb as applyAliveDeceasedDefaults, bk as applyUniqueLexisNexisSectionDefault, bl as isSectionEnabled, b0 as buildDatasetKey, bm as selectAllInSection, bn as isUniqueLexisNexisList, bo as buildTopicKey, bp as syncSectionEnabledFromLeaves, bq as setDatasetKey, br as isDatasetKeySelected, bs as isTopicKeySelected, bt as setTopicKey } from "./services-middleware-DR8Hua1Y.js";
import { j as Tag, u as useTranslation, ef as ScrollAreaV2, B as Button, e9 as Popover, eb as Collapsible, eg as Checkbox, e as Icon, d as cn, dz as Switch, e1 as Input, ee as ExpandableGroupTagLine, e8 as MenuCommand } from "./format-NPGUXq-g.js";
import { S as Spinner } from "./Spinner-GK6cEAdR.js";
import { u as useListConfigQuery } from "./lists-config-CsQWGvXL.js";
import { t } from "./capitalize-CzwYzf_g.js";
import { B } from "./sharpstate.es-CeF1Mf5b.js";
import { b as getDatasetNames, u as useDatasetTitle, s as sortTopicGroupEntries, i as isSpecialTopic, c as getSpecialTopicValue, d as getSpecialTopicLabel } from "./dataset-utils-C1Lb7jdi.js";
const ListAndTopicDatasetConfiguration = B({
  name: "ListAndTopicDatasetConfiguration",
  initializer: (params) => ({
    datasets: params.datasets,
    mode: params.mode,
    provider: params.provider,
    variant: params.variant ?? "default"
  })
}).withActions({
  setMode(api, mode) {
    api.value.mode = mode;
  }
});
const DatasetTag = ({ category }) => {
  const { getLaTagLabel } = useDatasetTag();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: SCREENING_CATEGORY_COLORS[category], children: getLaTagLabel(category) });
};
function useDatasetTag() {
  const { t: t2 } = useTranslation(["scenarios"]);
  function getLaTagLabel(category) {
    return M(category).with("peps", () => t2(`scenarios:sanction.lists.peps`)).with("third-parties", () => t2(`scenarios:sanction.lists.third_parties`)).with("sanctions", () => t2(`scenarios:sanction.lists.sanctions`)).with("adverse-media", () => t2(`scenarios:sanction.lists.adverse_media`)).with("custom", () => t2(`scenarios:sanction.lists.custom`)).with("global", () => t2(`scenarios:sanction.lists.global`)).otherwise(() => t2(`scenarios:sanction.lists.other`));
  }
  return { getLaTagLabel };
}
function groupCheckState(keys, datasetsMap) {
  if (keys.length === 0) return false;
  const selected = keys.filter((k) => datasetsMap[k]).length;
  if (selected === 0) return false;
  if (selected === keys.length) return true;
  return "indeterminate";
}
function DatasetSelectionContent({ useCase, onApply, onCancel }) {
  const listConfigQuery = useListConfigQuery(useCase);
  const listConfig = ListAndTopicDatasetConfiguration.useSharp();
  const variant = ListAndTopicDatasetConfiguration.select((state) => state.variant);
  const { t: t2 } = useTranslation(["common", "continuousScreening", "screenings"]);
  const [activeSectionKey, setActiveSectionKey] = reactExports.useState(null);
  reactExports.useEffect(() => {
    const data = listConfigQuery.data;
    if (!data) return;
    listConfig.update((state) => {
      applyAliveDeceasedDefaults(state.datasets, data.filters, useCase);
      applyUniqueLexisNexisSectionDefault(state.datasets, data.filters, state.provider);
    });
  }, [listConfigQuery.data, useCase, listConfig]);
  const renderSections = (data) => {
    const sections = Object.entries(data).filter(
      ([key, section]) => key !== "global" && (section?.datasets?.length || section?.topics)
    );
    return M(variant).with("default", () => {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col", children: sections.map(
        ([key, section]) => section ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          Section,
          {
            sectionKey: key,
            section,
            sectionCount: sections.length
          },
          key
        ) : null
      ) });
    }).with("popover", () => {
      const activeSection = activeSectionKey ? data[activeSectionKey] : null;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Popover.Root,
        {
          open: !!activeSectionKey,
          onOpenChange: (open) => {
            if (!open) setActiveSectionKey(null);
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Popover.Anchor, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col", children: sections.map(
              ([key, section]) => section ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                Section,
                {
                  sectionKey: key,
                  section,
                  isActive: activeSectionKey === key,
                  onSelect: () => setActiveSectionKey(key),
                  sectionCount: sections.length
                },
                key
              ) : null
            ) }) }),
            activeSectionKey && activeSection && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Popover.Content,
              {
                side: "right",
                align: "start",
                sideOffset: 24,
                alignOffset: -18,
                onOpenAutoFocus: (e) => e.preventDefault(),
                className: "w-fit min-w-[500px] max-w-[60vw] p-0",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SectionPanel, { sectionKey: activeSectionKey, section: activeSection, sectionCount: sections.length }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover.Footer, { className: "flex gap-sm p-md", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        type: "button",
                        variant: "secondary",
                        size: "large",
                        onClick: () => {
                          setActiveSectionKey(null);
                          onCancel?.();
                        },
                        children: t2("common:cancel")
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        type: "button",
                        variant: "primary",
                        size: "large",
                        onClick: () => {
                          onApply?.();
                          setActiveSectionKey(null);
                        },
                        children: t2("screenings:freeform_search.apply")
                      }
                    )
                  ] })
                ]
              }
            )
          ]
        }
      );
    }).exhaustive();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    variant === "default" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-grey-border p-md flex justify-between items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s font-semibold", children: t2("continuousScreening:creation.datasetSelection.list.title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectedListsCount, { listConfigQuery })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollAreaV2, { className: "p-md", orientation: "vertical", children: M(listConfigQuery).with({ isPending: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-10" }) })).with({ isError: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md items-center justify-center h-50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "", children: t2("common:generic_fetch_data_error") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", onClick: () => listConfigQuery.refetch(), children: t2("common:retry") })
    ] })).with({ isSuccess: true }, ({ data }) => data ? renderSections(data.filters) : null).exhaustive() })
  ] });
}
const SelectedListsCount = ({ listConfigQuery }) => {
  const { t: t2 } = useTranslation(["continuousScreening"]);
  const datasets = ListAndTopicDatasetConfiguration.select((state) => state.datasets);
  const sectionCount = Object.keys(listConfigQuery.data?.filters ?? {}).filter((k) => !!datasets[k]).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t2("continuousScreening:creation.datasetSelection.list.count", { count: sectionCount }) });
};
const Section = ({ sectionKey, section, isActive, onSelect, sectionCount }) => {
  const listConfig = ListAndTopicDatasetConfiguration.useSharp();
  const mode = ListAndTopicDatasetConfiguration.select((state) => state.mode);
  const variant = ListAndTopicDatasetConfiguration.select((state) => state.variant);
  const provider = ListAndTopicDatasetConfiguration.select((state) => state.provider);
  const { t: t2 } = useTranslation(["common", "continuousScreening", "scenarios", "screenings"]);
  const datasetNames = getDatasetNames(section);
  const isEnabled = ListAndTopicDatasetConfiguration.select(
    (state) => isSectionEnabled(state.datasets, sectionKey, state.provider, sectionCount)
  );
  const selectedCount = ListAndTopicDatasetConfiguration.select(
    (state) => datasetNames.filter((n) => state.datasets[buildDatasetKey(sectionKey, n)]).length
  );
  const isUniqueListForLN = isUniqueLexisNexisList(provider, sectionCount);
  return M(variant).with("default", () => /* @__PURE__ */ jsxRuntimeExports.jsxs(Collapsible.Container, { className: "border-none px-md py-sm h-fit", defaultOpen: false, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible.Title, { iconPosition: "hidden", asChild: true, size: "null", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-md items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { onClick: (e) => e.stopPropagation(), className: "inline-flex", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Checkbox,
          {
            stopPropagation: true,
            size: "small",
            checked: isEnabled,
            disabled: mode === "view" || isUniqueListForLN,
            onCheckedChange: () => {
              listConfig.update((state) => {
                const nextValue = !state.datasets[sectionKey];
                state.datasets[sectionKey] = nextValue;
                if (provider === "opensanctions" || sectionKey === "custom")
                  selectAllInSection(state.datasets, sectionKey, section, nextValue);
              });
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Icon,
          {
            icon: "caret-down",
            className: "size-4 shrink-0 transition-transform duration-200 group-radix-state-open:rotate-180"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DatasetTag, { category: sectionKey })
      ] }),
      datasetNames.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-grey-50 pl-md", children: [
        selectedCount,
        " / ",
        datasetNames.length
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible.Content, { className: "flex flex-col overflow-hidden border-none bg-surface-card radix-state-open:animate-slide-down radix-state-closed:animate-slide-up", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SectionContent, { sectionKey, section }) })
  ] })).with("popover", () => /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      type: "button",
      onClick: () => onSelect?.(),
      className: cn(
        "flex h-10 w-full flex-row items-center justify-between gap-sm rounded-xs p-sm outline-hidden",
        "hover:bg-purple-background-light cursor-pointer",
        isActive && "bg-purple-background-light"
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DatasetTag, { category: sectionKey }),
        datasetNames.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-grey-50", children: t2("continuousScreening:creation.datasetSelection.lists", { count: datasetNames.length }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "arrow-right", className: "size-4 text-grey-50" })
        ] })
      ]
    }
  )).exhaustive();
};
const SectionPanel = ({ sectionKey, section, sectionCount }) => {
  const listConfig = ListAndTopicDatasetConfiguration.useSharp();
  const mode = ListAndTopicDatasetConfiguration.select((state) => state.mode);
  const provider = ListAndTopicDatasetConfiguration.select((state) => state.provider);
  const isEnabled = ListAndTopicDatasetConfiguration.select(
    (state) => isSectionEnabled(state.datasets, sectionKey, state.provider, sectionCount)
  );
  const isUniqueListForLN = isUniqueLexisNexisList(provider, sectionCount);
  const { t: t2 } = useTranslation(["common", "continuousScreening", "scenarios", "screenings"]);
  const { getLaTagLabel } = useDatasetTag();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-md px-md py-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Switch,
        {
          id: `section-switch-${sectionKey}`,
          checked: isEnabled,
          disabled: mode === "view" || isUniqueListForLN,
          onCheckedChange: (checked) => {
            listConfig.update((state) => {
              state.datasets[sectionKey] = checked;
              if (provider === "opensanctions" || sectionKey === "custom")
                selectAllInSection(state.datasets, sectionKey, section, checked);
            });
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "label",
        {
          htmlFor: `section-switch-${sectionKey}`,
          className: cn("text-s font-semibold", isEnabled ? "text-purple-primary" : "text-grey-primary"),
          children: t2("continuousScreening:creation.datasetSelection.section.activate", {
            category: getLaTagLabel(sectionKey)
          })
        }
      )
    ] }),
    isEnabled && /* @__PURE__ */ jsxRuntimeExports.jsx(SectionContent, { sectionKey, section })
  ] });
};
const SectionContent = ({ sectionKey, section }) => {
  const { datasets, topics, conditionalTopics } = section;
  const listConfig = ListAndTopicDatasetConfiguration.useSharp();
  const provider = ListAndTopicDatasetConfiguration.select((state) => state.provider);
  const [searchTerm, setSearchTerm] = reactExports.useState("");
  const { formatDatasetTitle, t: t2 } = useDatasetTitle();
  if (!datasets?.length && !topics && !conditionalTopics) return null;
  function makeResetHandler(dependsOnKey) {
    if (!conditionalTopics) return void 0;
    const dependents = Object.entries(conditionalTopics).filter(([, ct]) => ct.dependsOn === dependsOnKey);
    const dependsOnTopics = topics?.[dependsOnKey] ?? [];
    if (dependents.length === 0) return void 0;
    return () => {
      const selectedPrefixes = dependsOnTopics.filter((t22) => listConfig.value.datasets[buildTopicKey(sectionKey, dependsOnKey, t22.name)]).map((t22) => t22.name);
      if (selectedPrefixes.length === 0) return;
      listConfig.update((state) => {
        for (const [conditionalGroup, ct] of dependents) {
          for (const item of ct.items) {
            const prefix = item.key.split(".")[0];
            if (!selectedPrefixes.some((sel) => sel === prefix)) {
              state.datasets[buildTopicKey(sectionKey, conditionalGroup, item.name)] = false;
            }
          }
        }
        if (provider === "opensanctions" || sectionKey === "custom")
          syncSectionEnabledFromLeaves(state.datasets, sectionKey, section);
      });
    };
  }
  const hasDatasets = !!datasets?.length;
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const hasSearch = normalizedSearch.length > 0;
  const itemMatches = (name, title) => (title ? formatDatasetTitle(title) : name).toLowerCase().includes(normalizedSearch) || name.toLowerCase().includes(normalizedSearch);
  const filteredDatasets = !hasSearch ? datasets : datasets?.map((group) => ({
    ...group,
    datasets: group.datasets.filter((item) => itemMatches(item.name, item.title))
  })).filter((group) => group.datasets.length > 0);
  const isDatasetsEmpty = hasSearch && (!filteredDatasets || filteredDatasets.length === 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full", children: [
    hasDatasets && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-md py-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Input,
      {
        placeholder: t2("continuousScreening:creation.datasetSelection.search_placeholder"),
        value: searchTerm,
        onChange: (e) => setSearchTerm(e.target.value),
        endAdornment: hasSearch ? "cross" : void 0,
        onEndAdornmentClick: hasSearch ? () => setSearchTerm("") : void 0
      }
    ) }),
    isDatasetsEmpty ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-s text-grey-50 px-md py-md", children: t2("continuousScreening:creation.datasetSelection.search_empty") }) : filteredDatasets?.map((group) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      ItemGroup,
      {
        title: group.title,
        items: group.datasets,
        sectionKey,
        section,
        forceOpen: hasSearch
      },
      group.name
    )),
    topics && sortTopicGroupEntries(sectionKey, Object.entries(topics)).map(([key, items]) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      FilterGroupRow,
      {
        sectionKey,
        section,
        groupKey: key,
        items,
        onAfterChange: makeResetHandler(key)
      },
      key
    )),
    conditionalTopics && Object.entries(conditionalTopics).map(([name, { items, dependsOn }]) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConditionalFilterGroupRow,
      {
        sectionKey,
        section,
        groupKey: name,
        allItems: items,
        dependsOnGroup: dependsOn,
        dependsOnItems: section.topics?.[dependsOn]?.map((t22) => t22.name) ?? []
      },
      name
    ))
  ] });
};
const ItemGroup = ({
  title,
  items,
  sectionKey,
  section,
  forceOpen = false
}) => {
  const { formatDatasetTitle, t: t2 } = useDatasetTitle();
  const listConfig = ListAndTopicDatasetConfiguration.useSharp();
  const mode = ListAndTopicDatasetConfiguration.select((state) => state.mode);
  const provider = ListAndTopicDatasetConfiguration.select((state) => state.provider);
  const names = items.map((i) => i.name);
  const keys = names.map((n) => buildDatasetKey(sectionKey, n));
  const checkState = ListAndTopicDatasetConfiguration.select(
    (state) => groupCheckState(keys, state.datasets)
  );
  const selectedCount = ListAndTopicDatasetConfiguration.select(
    (state) => keys.filter((k) => state.datasets[k]).length
  );
  const handleSelectAll = () => {
    const datasetsMap = listConfig.value.datasets;
    const selected = keys.filter((k) => datasetsMap[k]).length;
    const nextValue = selected < keys.length;
    listConfig.update((state) => {
      for (const name of names) {
        setDatasetKey(state.datasets, sectionKey, name, nextValue);
      }
      if (provider === "opensanctions" || sectionKey === "custom")
        syncSectionEnabledFromLeaves(state.datasets, sectionKey, section);
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Collapsible.Container,
    {
      className: "border-none px-md py-sm h-fit",
      defaultOpen: forceOpen,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible.Title, { iconPosition: "left", asChild: true, size: "null", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-md justify-between w-full", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-md", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s font-semibold", children: formatDatasetTitle(title) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-grey-secondary", children: [
              selectedCount,
              " / ",
              names.length
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { onClick: (e) => e.stopPropagation(), className: "flex items-center gap-md font-normal", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: `select-all-checkbox-${title}`, className: "text-s text-grey-50", children: t2(
              `continuousScreening:creation.datasetSelection.list.section.${checkState === true ? "unselect_all" : "select_all"}`
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Checkbox,
              {
                id: `select-all-checkbox-${title}`,
                size: "small",
                checked: checkState,
                disabled: mode === "view",
                onCheckedChange: handleSelectAll,
                stopPropagation: true
              }
            )
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible.Content, { className: "flex flex-col overflow-hidden border-none bg-surface-card radix-state-open:animate-slide-down radix-state-closed:animate-slide-up", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col overflow-hidden border border-grey-border rounded-md ", children: items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          ItemRow,
          {
            name: item.name,
            label: item.title ?? item.name,
            sectionKey,
            section
          },
          item.name
        )) }) }) })
      ]
    },
    forceOpen ? "open" : "closed"
  );
};
const ItemRow = ({
  name,
  label,
  sectionKey,
  section
}) => {
  const listConfig = ListAndTopicDatasetConfiguration.useSharp();
  const mode = ListAndTopicDatasetConfiguration.select((state) => state.mode);
  const provider = ListAndTopicDatasetConfiguration.select((state) => state.provider);
  const isSelected = ListAndTopicDatasetConfiguration.select(
    (state) => isDatasetKeySelected(state.datasets, sectionKey, name)
  );
  const onClickItem = () => {
    if (mode === "view") return;
    listConfig.update((state) => {
      const nextValue = !isDatasetKeySelected(state.datasets, sectionKey, name);
      setDatasetKey(state.datasets, sectionKey, name, nextValue);
      if (provider === "opensanctions" || sectionKey === "custom")
        syncSectionEnabledFromLeaves(state.datasets, sectionKey, section);
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "label",
    {
      htmlFor: `item-checkbox-${name}`,
      className: cn(
        "flex flex-row items-center gap-sm p-md even:bg-grey-background-light text-s",
        mode !== "view" && "cursor-pointer"
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Checkbox,
          {
            id: `item-checkbox-${name}`,
            size: "small",
            checked: isSelected,
            disabled: mode === "view",
            onClick: onClickItem,
            className: "cursor-pointer",
            stopPropagation: true
          }
        ),
        label
      ]
    }
  );
};
const RemovableTag = ({ label, onRemove }) => {
  const { formatTopicLabel } = useDatasetTitle();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Tag,
    {
      color: "purple",
      size: "small",
      className: "group cursor-pointer hover:bg-purple-primary/20 transition-colors",
      onClick: onRemove,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "max-w-[20ch] truncate text-center flex-1 translate-x-[9px] group-hover:translate-x-0 transition-transform duration-150", children: formatTopicLabel(label) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center justify-center w-4 ms-xs opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-[opacity,transform] duration-150", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "cross", className: "size-3" }) })
      ] })
    }
  );
};
const ViewTag = ({ label }) => {
  const { formatTopicLabel } = useDatasetTitle();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "purple", size: "small", className: "max-w-[150px] overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate block", children: formatTopicLabel(label) }) });
};
const ConditionalFilterGroupRow = ({
  sectionKey,
  section,
  groupKey,
  allItems,
  dependsOnGroup,
  dependsOnItems
}) => {
  const selectedPrefixes = ListAndTopicDatasetConfiguration.select(
    (state) => dependsOnItems.filter((t2) => state.datasets[buildTopicKey(sectionKey, dependsOnGroup, t2)])
  );
  const filteredItems = selectedPrefixes.length === 0 ? allItems : allItems.filter((item) => {
    const prefix = item.key.split(".")[0];
    return selectedPrefixes.some((sel) => sel === prefix);
  });
  if (filteredItems.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(FilterGroupRow, { sectionKey, section, groupKey, items: filteredItems });
};
const FilterGroupRow = ({
  sectionKey,
  section,
  groupKey,
  items,
  onAfterChange
}) => {
  const mode = ListAndTopicDatasetConfiguration.select((state) => state.mode);
  const label = t(groupKey);
  const singleItem = items.length === 1 ? items[0] : void 0;
  const { formatDatasetTitle } = useDatasetTitle();
  if (sectionKey === "global") return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: isSpecialTopic(sectionKey, groupKey) ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-md py-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    SpecialTopicSwitch,
    {
      sectionKey,
      section,
      topicGroup: groupKey,
      mode,
      onAfterChange
    }
  ) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-md px-md py-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-s font-semibold shrink-0", children: [
      formatDatasetTitle(label),
      ":"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-w-0 flex-1 items-center gap-sm", children: singleItem ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      SingleItemToggle,
      {
        item: singleItem,
        sectionKey,
        section,
        topicGroup: groupKey,
        mode,
        onAfterChange
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      FilterGroupTags,
      {
        items,
        sectionKey,
        section,
        topicGroup: groupKey,
        onAfterChange
      }
    ) })
  ] }) });
};
const SpecialTopicSwitch = ({
  sectionKey,
  section,
  topicGroup,
  mode,
  onAfterChange
}) => {
  const listConfig = ListAndTopicDatasetConfiguration.useSharp();
  const provider = ListAndTopicDatasetConfiguration.select((state) => state.provider);
  const topicValue = getSpecialTopicValue(sectionKey, topicGroup);
  const labelKey = getSpecialTopicLabel(sectionKey, topicGroup);
  const switchId = `special-topic-${sectionKey}-${topicGroup}-${topicValue}`;
  const isSelected = ListAndTopicDatasetConfiguration.select(
    (state) => isTopicKeySelected(state.datasets, sectionKey, topicGroup, topicValue)
  );
  const { t: t2 } = useTranslation(["continuousScreening"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Switch,
      {
        id: switchId,
        checked: isSelected,
        disabled: mode === "view",
        onCheckedChange: (checked) => {
          listConfig.update((state) => {
            setTopicKey(state.datasets, sectionKey, topicGroup, topicValue, checked);
            if (provider === "opensanctions" || sectionKey === "custom")
              syncSectionEnabledFromLeaves(state.datasets, sectionKey, section);
          });
          onAfterChange?.();
        }
      }
    ),
    labelKey ? /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: switchId, className: "text-s text-grey-primary cursor-pointer", children: t2(labelKey) }) : null
  ] });
};
const SingleItemToggle = ({
  item,
  sectionKey,
  section,
  topicGroup,
  mode,
  onAfterChange
}) => {
  const listConfig = ListAndTopicDatasetConfiguration.useSharp();
  const provider = ListAndTopicDatasetConfiguration.select((state) => state.provider);
  const isSelected = ListAndTopicDatasetConfiguration.select(
    (state) => isTopicKeySelected(state.datasets, sectionKey, topicGroup, item.name)
  );
  const { formatItemName, t: t2 } = useDatasetTitle();
  if (isSelected) {
    if (mode !== "view") {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        RemovableTag,
        {
          label: formatItemName(item),
          onRemove: () => {
            listConfig.update((state) => {
              setTopicKey(state.datasets, sectionKey, topicGroup, item.name, false);
              if (provider === "opensanctions" || sectionKey === "custom")
                syncSectionEnabledFromLeaves(state.datasets, sectionKey, section);
            });
            onAfterChange?.();
          }
        }
      );
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "purple", size: "small", className: "max-w-[150px] overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate block", children: formatItemName(item) }) });
  }
  if (mode === "view") return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      type: "button",
      className: "flex items-center justify-center size-6 rounded-full border border-grey-border hover:bg-grey-background-light shrink-0",
      onClick: () => {
        listConfig.update((state) => {
          setTopicKey(state.datasets, sectionKey, topicGroup, item.name, true);
          if (provider === "opensanctions" || sectionKey === "custom")
            syncSectionEnabledFromLeaves(state.datasets, sectionKey, section);
        });
        onAfterChange?.();
      },
      "aria-label": t2("continuousScreening:creation.datasetSelection.filter.add"),
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-3" })
    }
  );
};
const FilterGroupTags = ({
  items,
  sectionKey,
  section,
  topicGroup,
  onAfterChange
}) => {
  const { formatItemName, t: t2 } = useDatasetTitle();
  const listConfig = ListAndTopicDatasetConfiguration.useSharp();
  const mode = ListAndTopicDatasetConfiguration.select((state) => state.mode);
  const provider = ListAndTopicDatasetConfiguration.select((state) => state.provider);
  const variant = ListAndTopicDatasetConfiguration.select((state) => state.variant);
  const selectedItems = ListAndTopicDatasetConfiguration.select(
    (state) => items.filter((i) => isTopicKeySelected(state.datasets, sectionKey, topicGroup, i.name))
  );
  const [isMenuOpen, setIsMenuOpen] = reactExports.useState(false);
  const useAnchoredMenu = mode !== "view" && variant !== "popover";
  const selectedKey = selectedItems.map((i) => i.name).join(",");
  const tagItems = reactExports.useMemo(
    () => selectedItems.map((item) => {
      const label = formatItemName(item);
      return mode !== "view" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        RemovableTag,
        {
          label,
          onRemove: () => {
            listConfig.update((state) => {
              setTopicKey(state.datasets, sectionKey, topicGroup, item.name, false);
              if (provider === "opensanctions" || sectionKey === "custom")
                syncSectionEnabledFromLeaves(state.datasets, sectionKey, section);
            });
            onAfterChange?.();
          }
        },
        item.name
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx(ViewTag, { label }, item.name);
    }),
    [selectedItems, selectedKey, mode, listConfig, sectionKey, topicGroup, onAfterChange]
  );
  const isAllSelected = selectedItems.length === items.length && items.length > 1;
  const trailingTrigger = mode !== "view" && (variant === "popover" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      type: "button",
      className: cn(
        "flex size-6 shrink-0 items-center justify-center rounded-full hover:bg-grey-background-light",
        isMenuOpen && "bg-purple-background-light text-purple-primary"
      ),
      onClick: () => setIsMenuOpen((open) => !open),
      "aria-expanded": isMenuOpen,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: isMenuOpen ? "minus" : "plus", className: "size-3" })
    }
  ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
    FilterGroupMenu,
    {
      anchored: true,
      items,
      sectionKey,
      section,
      topicGroup,
      onAfterChange
    }
  ));
  const tagsContent = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("flex min-w-0 w-full flex-1", variant === "popover" && "flex-col gap-sm overflow-x-hidden"), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-w-0 w-full items-center gap-xs flex-1", children: isAllSelected ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "purple", size: "small", children: t2("continuousScreening:creation.datasetSelection.filter.all") }),
      trailingTrigger
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ExpandableGroupTagLine, { items: tagItems, trailing: trailingTrigger }) }),
    mode !== "view" && variant === "popover" && isMenuOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(
      FilterGroupMenu,
      {
        items,
        sectionKey,
        section,
        topicGroup,
        onAfterChange
      }
    )
  ] });
  if (useAnchoredMenu) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Menu, { persistOnSelect: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Anchor, { asChild: true, children: tagsContent }) });
  }
  return tagsContent;
};
const FilterGroupMenu = ({
  items,
  sectionKey,
  section,
  topicGroup,
  onAfterChange,
  anchored = false
}) => {
  const { formatItemName, t: t2 } = useDatasetTitle();
  const variant = ListAndTopicDatasetConfiguration.select((state) => state.variant);
  const listConfig = ListAndTopicDatasetConfiguration.useSharp();
  const provider = ListAndTopicDatasetConfiguration.select((state) => state.provider);
  const datasets = ListAndTopicDatasetConfiguration.select((state) => state.datasets);
  const mode = ListAndTopicDatasetConfiguration.select((state) => state.mode);
  const allSelected = items.length > 0 && items.every((i) => isTopicKeySelected(datasets, sectionKey, topicGroup, i.name));
  function handleClickItem(item) {
    if (mode === "view") return;
    listConfig.update((state) => {
      const nextValue = !isTopicKeySelected(state.datasets, sectionKey, topicGroup, item.name);
      setTopicKey(state.datasets, sectionKey, topicGroup, item.name, nextValue);
      if (provider === "opensanctions" || sectionKey === "custom")
        syncSectionEnabledFromLeaves(state.datasets, sectionKey, section);
    });
    onAfterChange?.();
  }
  const toggleAll = () => {
    const nextValue = !allSelected;
    listConfig.update((state) => {
      for (const item of items) {
        setTopicKey(state.datasets, sectionKey, topicGroup, item.name, nextValue);
      }
      if (provider === "opensanctions" || sectionKey === "custom")
        syncSectionEnabledFromLeaves(state.datasets, sectionKey, section);
    });
    onAfterChange?.();
  };
  if (variant === "popover") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-grey-border bg-grey-background-light p-sm flex flex-col gap-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: toggleAll,
          className: "flex h-10 items-center justify-between gap-sm rounded-xs p-sm hover:bg-purple-background-light cursor-pointer",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-purple-primary", children: t2(`continuousScreening:creation.datasetSelection.filter.${allSelected ? "unselect_all" : "select_all"}`) }),
            allSelected && /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "tick", className: "size-4 text-purple-primary" })
          ]
        }
      ),
      items.map((item) => {
        const isSelected = isTopicKeySelected(datasets, sectionKey, topicGroup, item.name);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "label",
          {
            htmlFor: `filter-group-menu-item-${item.name}`,
            className: cn(
              "flex h-10 flex-row items-center gap-sm rounded-xs p-sm cursor-pointer text-s hover:bg-purple-background-light",
              mode === "view" && "cursor-not-allowed",
              isSelected && "bg-purple-background-light"
            ),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Checkbox,
                {
                  id: `filter-group-menu-item-${item.name}`,
                  checked: isSelected,
                  size: "small",
                  onClick: () => handleClickItem(item),
                  disabled: mode === "view",
                  stopPropagation: true
                }
              ),
              formatItemName(item)
            ]
          },
          item.name
        );
      })
    ] });
  }
  const itemsList = /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.List, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      MenuCommand.Item,
      {
        value: "__all__",
        selected: allSelected,
        onSelect: toggleAll,
        className: "border-b border-purple-primary",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-purple-primary ", children: t2(`continuousScreening:creation.datasetSelection.filter.${allSelected ? "unselect_all" : "select_all"}`) }),
          allSelected && /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "tick", className: "size-4 text-purple-primary" })
        ]
      },
      "__all__"
    ),
    items.map((item) => {
      const isSelected = isTopicKeySelected(datasets, sectionKey, topicGroup, item.name);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        MenuCommand.Item,
        {
          value: item.name,
          selected: isSelected,
          onSelect: () => handleClickItem(item),
          disabled: mode === "view",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatItemName(item) }),
            isSelected && /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "tick", className: "size-4 text-purple-primary" })
          ]
        },
        item.name
      );
    })
  ] });
  const menuTriggerAndContent = /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        className: "flex items-center justify-center size-6 rounded-full hover:bg-grey-background-light shrink-0",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-3" })
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Content, { align: "start", sideOffset: 4, children: itemsList })
  ] });
  if (anchored) {
    return menuTriggerAndContent;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Menu, { persistOnSelect: true, children: menuTriggerAndContent });
};
export {
  DatasetSelectionContent as D,
  ListAndTopicDatasetConfiguration as L,
  DatasetTag as a
};
