import { r as reactExports, R as jsxRuntimeExports } from "../server.js";
import { eo as SelectWithCombobox, e1 as Input, q as useFormatLanguage, e5 as Calendar, u as useTranslation, e as Icon, b as clsx, B as Button } from "./format-NPGUXq-g.js";
import { t as t$4 } from "./allPass-LKKfzhYC.js";
import { M, u as t, J as protectArray, d9 as testRunStatuses, aE as getDateFnsLocale, v as n } from "./services-middleware-DR8Hua1Y.js";
import { t as t$2 } from "./mapToObj-wQ-uHOuD.js";
import { T as TestRunStatus, a as TestRunVersions, b as TestRunPeriod, t as t$3 } from "./TestRunVersions-Czzs22SA.js";
import { a2 as e$2, w as matchSorter, L as Link, aw as Route, aq as useDetectionScenarioData, P as Page, B as BreadCrumbs } from "./router-vb7i5euz.js";
import { F as FiltersButton } from "./index-BAiW6m4Z.js";
import { C as CreateTestRun } from "./CreateTestRun-BzDhNj0P.js";
import { t as t$1, e as e$1, F as FiltersDropdownMenu, a as FilterPopover, b as FilterItem, A as AddNewFilterButton, c as ClearAllFiltersButton } from "./FiltersDropdownMenu-9sj02fro.js";
import { S as Separator } from "./Separator-L7vdY7xf.js";
import { c as createSimpleContext } from "./create-context-CYc8deix.js";
import { u as useCallbackRef } from "./use-callback-ref-AfyBSz95.js";
import { u as useForm, a as useStore } from "./useForm-BwABQKAs.js";
import { e } from "./isArray-gJc74O_I.js";
import { e as e$3 } from "./isNullish-B8pc8Ntu.js";
import { o as object, k as array, s as string, fa as date, _ as _enum, b as fromUUIDtoSUUID } from "./short-uuid-MIi3jWzx.js";
import { u as useOrganizationUsers } from "./organization-users-Bxl0ZW8k.js";
import { A as Avatar } from "./Avatar-DpA4jY60.js";
import { t as toggle } from "./array-BFSjnO9c.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
import "./sharpstate.es-CeF1Mf5b.js";
import "./use-callback-ref-DXzIzfqy.js";
import "node:crypto";
import "./Spinner-GK6cEAdR.js";
import "./CopyToClipboardButton-CJNJJful.js";
import "./QueryClientProvider-DYTpkCko.js";
import "./security-headers.server-BdP3HrPp.js";
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
import "./index-C_WgunUr.js";
import "./index-BsFKI8Kt.js";
import "./index-BF4TC3go.js";
import "./index-CR1bHmei.js";
import "./Callout-DX4NBXlG.js";
import "./ExternalLink-CG_77QdX.js";
import "./FormErrorOrDescription-DO6Hdfmn.js";
import "./FormLabel-DeCgtgtj.js";
import "./index-x7n7VJTa.js";
import "./LoaderRevalidatorContext-C9s56i-l.js";
import "./useMutation-C5oG90Zs.js";
import "./useServerFn-CrqFKl7V.js";
import "./documentation-href-uAe88WFl.js";
import "./form-D2XmDKeG.js";
const testRunsFilterNames = ["startedAfter", "statuses", "creators", "ref_versions", "test_versions"];
const getFilterIcon = (filterName) => M(filterName).with("startedAfter", () => "calendar-month").with("statuses", () => "category").with("creators", () => "person").with("ref_versions", () => "version").with("test_versions", () => "version").exhaustive();
const getFilterTKey = (filterName) => M(filterName).with("startedAfter", () => "scenarios:testrun.filters.started_after").with("statuses", () => "scenarios:testrun.filters.status").with("creators", () => "scenarios:testrun.filters.creator").with("ref_versions", () => "scenarios:testrun.filters.ref_version").with("test_versions", () => "scenarios:testrun.filters.test_version").exhaustive();
object({
  statuses: protectArray(array(_enum(testRunStatuses))).optional(),
  startedAfter: date().optional(),
  creators: protectArray(array(string())).optional(),
  ref_versions: protectArray(array(string())).optional(),
  test_versions: protectArray(array(string())).optional()
});
const emptyTestRunsFilters = {
  statuses: [],
  creators: [],
  ref_versions: [],
  test_versions: []
};
const TestRunsFiltersContext = createSimpleContext("TestRunsFiltersContext");
function adaptFilterValues({ ...otherFilters }) {
  return {
    ...emptyTestRunsFilters,
    ...otherFilters
  };
}
function TestRunsFiltersProvider({
  filterValues,
  submitTestRunsFilters: _submitTestRunsFilters,
  children
}) {
  const form = useForm({
    defaultValues: adaptFilterValues(filterValues)
  });
  reactExports.useEffect(() => {
    form.reset(adaptFilterValues(filterValues));
  }, [filterValues]);
  const submitTestRunsFilters = useCallbackRef(() => {
    _submitTestRunsFilters(form.state.values);
  });
  const onTestRunsFilterClose = useCallbackRef(() => {
    if (form.state.isDirty) {
      submitTestRunsFilters();
    }
  });
  const value = reactExports.useMemo(
    () => ({
      submitTestRunsFilters,
      onTestRunsFilterClose,
      filterValues,
      form
    }),
    [filterValues, onTestRunsFilterClose, submitTestRunsFilters, form]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TestRunsFiltersContext.Provider, { value, children });
}
const useTestRunsFiltersContext = TestRunsFiltersContext.useValue;
function useStatusesFilter() {
  const { form } = useTestRunsFiltersContext();
  const selectedStatuses = useStore(form.store, (state) => state.values.statuses);
  const setSelectedStatuses = (value) => form.setFieldValue("statuses", value);
  return { selectedStatuses, setSelectedStatuses };
}
function useStartedAfterFilter() {
  const { form } = useTestRunsFiltersContext();
  const startedAfter = useStore(form.store, (state) => state.values.startedAfter);
  const setStartedAfter = (value) => form.setFieldValue("startedAfter", value);
  return { startedAfter, setStartedAfter };
}
const useCreatorFilter = () => {
  const { form } = useTestRunsFiltersContext();
  const creator = useStore(form.store, (state) => state.values.creators);
  const setCreator = (value) => form.setFieldValue("creators", value);
  return { creator, setCreator };
};
const useRefVersionFilter = () => {
  const { form } = useTestRunsFiltersContext();
  const refVersion = useStore(form.store, (state) => state.values.ref_versions);
  const setRefVersion = (value) => form.setFieldValue("ref_versions", value);
  return { refVersion, setRefVersion };
};
const useTestVersionFilter = () => {
  const { form } = useTestRunsFiltersContext();
  const testVersion = useStore(form.store, (state) => state.values.test_versions);
  const setTestVersion = (value) => form.setFieldValue("test_versions", value);
  return { testVersion, setTestVersion };
};
function useTestRunsFiltersPartition() {
  const { filterValues } = useTestRunsFiltersContext();
  const [undefinedTestRunsFilterNames, definedTestRunsFilterNames] = t(
    testRunsFilterNames,
    t$1((filterName) => {
      const value = filterValues[filterName];
      if (e(value)) return value.length === 0;
      if (e$1(value)) return e$2(value);
      return e$3(value);
    })
  );
  return {
    undefinedTestRunsFilterNames,
    definedTestRunsFilterNames
  };
}
function useClearFilter() {
  const { submitTestRunsFilters, form } = useTestRunsFiltersContext();
  return reactExports.useCallback(
    (filterName) => {
      form.setFieldValue(filterName, emptyTestRunsFilters[filterName]);
      submitTestRunsFilters();
    },
    [form, submitTestRunsFilters]
  );
}
const useClearAllFilters = () => {
  const { submitTestRunsFilters, form } = useTestRunsFiltersContext();
  return reactExports.useCallback(() => {
    form.reset(emptyTestRunsFilters);
    submitTestRunsFilters();
  }, [form, submitTestRunsFilters]);
};
function CreatorsFilter() {
  const [value, setSearchValue] = reactExports.useState("");
  const { creator, setCreator } = useCreatorFilter();
  const deferredValue = reactExports.useDeferredValue(value);
  const { orgUsers } = useOrganizationUsers();
  const matches = reactExports.useMemo(
    () => matchSorter(orgUsers, deferredValue, { keys: ["firstName", "lastName"] }),
    [deferredValue, orgUsers]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-sm p-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    SelectWithCombobox.Root,
    {
      open: true,
      onSearchValueChange: setSearchValue,
      selectedValue: creator,
      onSelectedValueChange: setCreator,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectWithCombobox.Combobox, { render: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, {}), autoSelect: true, autoFocus: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectWithCombobox.ComboboxList, { className: "max-h-40", children: matches.map((user) => {
          return /* @__PURE__ */ jsxRuntimeExports.jsx(SelectWithCombobox.ComboboxItem, { value: user.userId, className: "align-baseline", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row items-center gap-md", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { firstName: user.firstName, lastName: user.lastName, size: "m" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-grey-primary text-s", children: [
              user.firstName,
              " ",
              user.lastName
            ] })
          ] }) }, user.userId);
        }) })
      ]
    }
  ) });
}
function StartedAfterFilter() {
  const { startedAfter, setStartedAfter } = useStartedAfterFilter();
  const language = useFormatLanguage();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { mode: "single", selected: startedAfter, onSelect: setStartedAfter, locale: getDateFnsLocale(language) }) });
}
function StatusesFilter() {
  const [value, setSearchValue] = reactExports.useState("");
  const { selectedStatuses, setSelectedStatuses } = useStatusesFilter();
  const deferredValue = reactExports.useDeferredValue(value);
  const matches = reactExports.useMemo(() => matchSorter(toggle(testRunStatuses, "unknown"), deferredValue), [deferredValue]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-sm p-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    SelectWithCombobox.Root,
    {
      open: true,
      onSearchValueChange: setSearchValue,
      selectedValue: selectedStatuses,
      onSelectedValueChange: setSelectedStatuses,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectWithCombobox.Combobox, { render: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, {}), autoSelect: true, autoFocus: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectWithCombobox.ComboboxList, { className: "max-h-40", children: matches.map((status) => {
          return /* @__PURE__ */ jsxRuntimeExports.jsx(SelectWithCombobox.ComboboxItem, { value: status, className: "align-baseline", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TestRunStatus, { status }) }, status);
        }) })
      ]
    }
  ) });
}
function VersionsFilter({
  type,
  scenarioIterations
}) {
  const [value, setSearchValue] = reactExports.useState("");
  const { refVersion, setRefVersion } = useRefVersionFilter();
  const { testVersion, setTestVersion } = useTestVersionFilter();
  const deferredValue = reactExports.useDeferredValue(value);
  const filteredIterations = scenarioIterations.filter(({ type: type2 }) => type2 !== "draft");
  const matches = reactExports.useMemo(
    () => matchSorter(filteredIterations, deferredValue, { keys: ["version"] }),
    [deferredValue, filteredIterations]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-sm p-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    SelectWithCombobox.Root,
    {
      open: true,
      onSearchValueChange: setSearchValue,
      selectedValue: type === "ref" ? refVersion : testVersion,
      onSelectedValueChange: type === "ref" ? setRefVersion : setTestVersion,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectWithCombobox.Combobox, { render: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, {}), autoSelect: true, autoFocus: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectWithCombobox.ComboboxList, { className: "max-h-40", children: matches.map((iteration) => {
          return /* @__PURE__ */ jsxRuntimeExports.jsx(SelectWithCombobox.ComboboxItem, { value: iteration.id, className: "align-baseline", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary text-s", children: `V${iteration.version}` }) }, iteration.id);
        }) })
      ]
    }
  ) });
}
function FilterDetail({
  filterName,
  scenarioIterations
}) {
  return M(filterName).with("startedAfter", () => /* @__PURE__ */ jsxRuntimeExports.jsx(StartedAfterFilter, {})).with("statuses", () => /* @__PURE__ */ jsxRuntimeExports.jsx(StatusesFilter, {})).with("creators", () => /* @__PURE__ */ jsxRuntimeExports.jsx(CreatorsFilter, {})).with("ref_versions", () => /* @__PURE__ */ jsxRuntimeExports.jsx(VersionsFilter, { type: "ref", scenarioIterations })).with("test_versions", () => /* @__PURE__ */ jsxRuntimeExports.jsx(VersionsFilter, { type: "test", scenarioIterations })).exhaustive();
}
function TestRunsFiltersMenu({
  children,
  filterNames,
  scenarioIterations
}) {
  const { onTestRunsFilterClose: onCasesFilterClose } = useTestRunsFiltersContext();
  const onOpenChange = reactExports.useCallback(
    (open) => {
      if (!open) {
        onCasesFilterClose();
      }
    },
    [onCasesFilterClose]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(FiltersDropdownMenu.Root, { onOpenChange, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(FiltersDropdownMenu.Trigger, { asChild: true, children }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(FiltersDropdownMenu.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(FilterContent, { filterNames, scenarioIterations }) })
  ] });
}
const FiltersMenuItem = reactExports.forwardRef(({ filterName, ...props }, ref) => {
  const { t: t2 } = useTranslation(["scenarios", "common"]);
  const icon = getFilterIcon(filterName);
  const tKey = getFilterTKey(filterName);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(FiltersDropdownMenu.Item, { ...props, ref, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon, className: "size-5" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-primary font-normal first-letter:capitalize", children: t2(tKey) })
  ] });
});
FiltersMenuItem.displayName = "FiltersMenuItem";
function FilterContent({
  filterNames,
  scenarioIterations
}) {
  const [selectedFilter, setSelectedFilter] = reactExports.useState();
  if (selectedFilter) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(FilterDetail, { filterName: selectedFilter, scenarioIterations });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-xs p-sm", children: filterNames.map((filterName) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    FiltersMenuItem,
    {
      filterName,
      onClick: (e2) => {
        e2.preventDefault();
        setSelectedFilter(filterName);
      }
    },
    filterName
  )) });
}
function TestRunsFiltersBar({ scenarioIterations }) {
  const { t: t2 } = useTranslation(["scenarios", "common"]);
  const { onTestRunsFilterClose } = useTestRunsFiltersContext();
  const onOpenChange = reactExports.useCallback(
    (open) => {
      if (!open) {
        onTestRunsFilterClose();
      }
    },
    [onTestRunsFilterClose]
  );
  const { undefinedTestRunsFilterNames, definedTestRunsFilterNames } = useTestRunsFiltersPartition();
  const clearFilter = useClearFilter();
  const clearAllFilters = useClearAllFilters();
  if (definedTestRunsFilterNames.length === 0) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { className: "bg-grey-border", decorative: true }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row items-center justify-between gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row flex-wrap gap-sm", children: [
        definedTestRunsFilterNames.map((filterName) => {
          const icon = getFilterIcon(filterName);
          const tKey = getFilterTKey(filterName);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(FilterPopover.Root, { onOpenChange, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(FilterItem.Root, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(FilterItem.Trigger, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon, className: "size-5" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s font-semibold first-letter:capitalize", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t2(tKey) }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                FilterItem.Clear,
                {
                  onClick: () => {
                    clearFilter(filterName);
                  }
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FilterPopover.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(FilterDetail, { filterName, scenarioIterations }) })
          ] }, filterName);
        }),
        undefinedTestRunsFilterNames.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TestRunsFiltersMenu, { filterNames: undefinedTestRunsFilterNames, scenarioIterations, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AddNewFilterButton, {}) }) : null
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ClearAllFiltersButton, { onClick: clearAllFilters })
    ] })
  ] });
}
const TestRunSelector = ({
  id,
  status,
  refIterationId,
  testIterationId,
  creatorId,
  startDate,
  endDate,
  users,
  iterations,
  scenario
}) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Link,
    {
      to: "/detection/scenarios/$scenarioId/test-run/$testRunId",
      params: {
        scenarioId: fromUUIDtoSUUID(scenario.id),
        testRunId: fromUUIDtoSUUID(id)
      },
      className: clsx(
        "grid cursor-pointer grid-cols-[30%_30%_8%_auto] items-center rounded-lg border py-sm transition-colors",
        {
          "bg-surface-card hover:bg-grey-background border-grey-border": status !== "up",
          "bg-purple-background-light hover:bg-purple-background border-purple-primary": status === "up"
        }
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TestRunVersions, { iterations, refIterationId, testIterationId }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TestRunPeriod, { startDate, endDate }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-row items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { firstName: users[creatorId]?.firstName, lastName: users[creatorId]?.lastName }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TestRunStatus, { status }) })
      ]
    }
  );
};
function TestRuns() {
  const {
    t: t2
  } = useTranslation(["scenarios"]);
  const {
    runs
  } = Route.useLoaderData();
  const {
    currentScenario,
    scenarioIterations
  } = useDetectionScenarioData();
  const {
    orgUsers
  } = useOrganizationUsers();
  const [filters, setFilters] = reactExports.useState({});
  const iterations = reactExports.useMemo(() => t$2(scenarioIterations, (i) => [i.id, t$3(i, ["version", "type"])]), [scenarioIterations]);
  const atLeastOneActiveTestRun = runs.some((run) => run.status === "up");
  const filteredRuns = reactExports.useMemo(() => {
    const {
      statuses,
      startedAfter,
      creators,
      ref_versions,
      test_versions
    } = filters;
    return n(runs, (r) => t$4(r, [(r2) => !statuses || !statuses.length || statuses.includes(r2.status), (r2) => !startedAfter || new Date(r2.startDate).getTime() > startedAfter.getTime(), (r2) => !creators || !creators.length || creators.includes(r2.creatorId), (r2) => !ref_versions || !ref_versions.length || ref_versions.includes(r2.refIterationId), (r2) => !test_versions || !test_versions.length || test_versions.includes(r2.testIterationId)]));
  }, [runs, filters]);
  const users = reactExports.useMemo(() => orgUsers.reduce((acc, curr) => {
    acc[curr.userId] = {
      firstName: curr.firstName,
      lastName: curr.lastName
    };
    return acc;
  }, {}), [orgUsers]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Main, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Page.Header, { className: "gap-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BreadCrumbs, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Page.Content, { width: "form", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TestRunsFiltersProvider, { submitTestRunsFilters: setFilters, filterValues: filters, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary text-l font-semibold", children: t2("scenarios:testrun.home") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row gap-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TestRunsFiltersMenu, { filterNames: testRunsFilterNames, scenarioIterations, children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiltersButton, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CreateTestRun, { currentScenario, scenarioIterations, atLeastOneActiveTestRun, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "primary", className: "isolate h-10 w-fit", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-5", "aria-hidden": true }),
            t2("scenarios:create_testrun.title")
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TestRunsFiltersBar, { scenarioIterations }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-s grid grid-cols-[30%_30%_8%_auto] font-semibold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-sm", children: t2("scenarios:testrun.filters.version") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-sm", children: t2("scenarios:testrun.filters.started_after") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-center", children: t2("scenarios:testrun.filters.creator") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-sm", children: t2("scenarios:testrun.filters.status") })
        ] }),
        filteredRuns.map((run) => /* @__PURE__ */ reactExports.createElement(TestRunSelector, { ...run, key: run.id, users, iterations, scenario: currentScenario }))
      ] })
    ] }) })
  ] });
}
export {
  TestRuns as component
};
