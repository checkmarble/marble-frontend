import { r as reactExports, R as jsxRuntimeExports } from "../server.js";
import { w as matchSorter, H as Highlight, P as Page, b as useNavigate, G as Route, I as DEFAULT_LIMIT } from "./router-vb7i5euz.js";
import { u as useTranslation, b as clsx, q as useFormatLanguage, w as formatDateTimeWithoutPresets, en as useTable, em as getCoreRowModel, ek as Table, el as createColumnHelper, e8 as MenuCommand, B as Button, e as Icon, ea as formatDuration, e1 as Input, d as cn, T as Typo, S as StickyComponent } from "./format-NPGUXq-g.js";
import { M, bv as differenceInDays } from "./services-middleware-DR8Hua1Y.js";
import { S as Spinner } from "./Spinner-GK6cEAdR.js";
import { u as useBase64Query } from "./useBase64Query-Cu-e5hVR.js";
import { l as getAuditEventsFn } from "./settings-CPv2zx4k.js";
import { B as keepPreviousData } from "./QueryClientProvider-DYTpkCko.js";
import { u as useInfiniteQuery } from "./useInfiniteQuery-D2tvMYRf.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { a as auditEventsFiltersSchema } from "./settings-CEpHMlp5.js";
import { C as CopyToClipboardButton } from "./CopyToClipboardButton-CJNJJful.js";
import { P as Panel } from "./Panel-kj8Z2GDk.js";
import { u as useOrganizationUsers } from "./organization-users-Bxl0ZW8k.js";
import { u as useCallbackRef } from "./use-callback-ref-DXzIzfqy.js";
import { D as DateRangeFilter } from "./DateRangeFilter-CSuOawhN.js";
import { S as Separator } from "./Separator-L7vdY7xf.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
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
import "node:crypto";
import "./useBaseQuery-CMboOtTR.js";
import "./create-context-CYc8deix.js";
const auditEventsFilterNames = ["dateRange", "userId", "apiKeyId", "entityId"];
const useGetAuditEventsQuery = (filters, limit) => {
  const getAuditEvents = useServerFn(getAuditEventsFn);
  return useInfiniteQuery({
    queryKey: ["audit-events", "list", filters, limit],
    queryFn: async ({ pageParam }) => {
      return getAuditEvents({
        data: {
          ...filters,
          limit,
          after: pageParam ?? void 0
        }
      });
    },
    initialPageParam: null,
    getNextPageParam: (page) => {
      return page?.hasNextPage ? page.events[page.events.length - 1]?.id : null;
    },
    placeholderData: keepPreviousData,
    staleTime: 0
  });
};
const JsonDiff = ({ oldData, newData }) => {
  const allKeys = reactExports.useMemo(() => {
    const keys = /* @__PURE__ */ new Set();
    if (oldData) Object.keys(oldData).forEach((k) => keys.add(k));
    if (newData) Object.keys(newData).forEach((k) => keys.add(k));
    return Array.from(keys).sort();
  }, [oldData, newData]);
  if (allKeys.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary text-sm", children: "No data" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-grey-background-light border-grey-border overflow-auto rounded-sm border p-md font-mono text-xs", children: allKeys.map((key) => {
    const oldValue = oldData?.[key];
    const newValue = newData?.[key];
    const oldStr = oldValue !== void 0 ? JSON.stringify(oldValue) : void 0;
    const newStr = newValue !== void 0 ? JSON.stringify(newValue) : void 0;
    const isAdded = oldStr === void 0 && newStr !== void 0;
    const isRemoved = oldStr !== void 0 && newStr === void 0;
    const isChanged = oldStr !== void 0 && newStr !== void 0 && oldStr !== newStr;
    const isUnchanged = oldStr === newStr;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
      isUnchanged && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-grey-secondary", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-grey-secondary", children: [
          key,
          ":"
        ] }),
        " ",
        newStr
      ] }),
      isAdded && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-background-light text-green-primary dark:border-l-2 dark:border-green-primary dark:bg-transparent dark:ps-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
          "+ ",
          key,
          ":"
        ] }),
        " ",
        newStr
      ] }),
      isRemoved && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-red-background text-red-primary line-through dark:border-l-2 dark:border-red-primary dark:bg-transparent dark:ps-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
          "- ",
          key,
          ":"
        ] }),
        " ",
        oldStr
      ] }),
      isChanged && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-red-background text-red-primary line-through dark:border-l-2 dark:border-red-primary dark:bg-transparent dark:ps-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
            "- ",
            key,
            ":"
          ] }),
          " ",
          oldStr
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-background-light text-green-primary dark:border-l-2 dark:border-green-primary dark:bg-transparent dark:ps-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
            "+ ",
            key,
            ":"
          ] }),
          " ",
          newStr
        ] })
      ] })
    ] }, key);
  }) });
};
const operationToTranslationKey = {
  INSERT: "settings:audit.operation.insert",
  UPDATE: "settings:audit.operation.update",
  DELETE: "settings:audit.operation.delete"
};
const OperationBadge = ({ operation }) => {
  const { t } = useTranslation(["settings"]);
  if (!operation) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary", children: "-" });
  const colorClass = {
    INSERT: "bg-green-background-light text-green-primary dark:bg-transparent dark:border-green-light dark:text-green-light",
    UPDATE: "bg-yellow-background-light text-yellow-primary dark:bg-transparent dark:border-yellow-light dark:text-yellow-light",
    DELETE: "bg-red-background-light text-red-primary dark:bg-transparent dark:border-red-light dark:text-red-light"
  }[operation];
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: clsx("rounded-sm px-xs py-0.5 text-xs font-medium dark:border", colorClass), children: t(operationToTranslationKey[operation]) });
};
const AuditEventDetailPanel = ({ event }) => {
  const { t } = useTranslation(["settings"]);
  const language = useFormatLanguage();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Container, { size: "medium", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel.Content, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Header, { children: t("settings:audit.detail.title") }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary text-xs", children: t("settings:audit.table.timestamp") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary text-sm", children: event.createdAt ? formatDateTimeWithoutPresets(event.createdAt, {
            language,
            dateStyle: "medium",
            timeStyle: "medium"
          }) : "-" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary text-xs", children: t("settings:audit.table.operation") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(OperationBadge, { operation: event.operation })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary text-xs", children: event.actor?.type === "api_key" ? t("settings:audit.detail.api_key") : t("settings:audit.detail.user_email") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-00 text-sm", children: event.actor?.type === "api_key" ? `${event.actor.name}***********` : event.actor?.name ?? "-" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary text-sm", children: event.actor?.name ?? "-" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary text-xs", children: t("settings:audit.table.table") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary text-sm", children: event.table ?? "-" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex flex-col gap-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary text-xs", children: t("settings:audit.table.entity_id") }),
          event.entityId ? /* @__PURE__ */ jsxRuntimeExports.jsx(CopyToClipboardButton, { toCopy: event.entityId, size: "sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary font-mono text-sm", children: event.entityId }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary text-sm", children: "-" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary text-sm font-semibold", children: t("settings:audit.detail.data") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(JsonDiff, { oldData: event.oldData, newData: event.newData })
      ] })
    ] })
  ] }) });
};
const columnHelper = createColumnHelper();
const AuditEventsTable = ({ auditEvents, apiKeys }) => {
  const { t } = useTranslation(["settings"]);
  const language = useFormatLanguage();
  const [currentAuditEvent, setCurrentAuditEvent] = reactExports.useState(null);
  const { getOrgUserById } = useOrganizationUsers();
  const columns = reactExports.useMemo(
    () => [
      columnHelper.accessor("createdAt", {
        id: "timestamp",
        header: t("settings:audit.table.timestamp"),
        size: 180,
        cell: ({ getValue }) => {
          const value = getValue();
          return value ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary text-sm", children: formatDateTimeWithoutPresets(value, {
            language,
            dateStyle: "short",
            timeStyle: "medium"
          }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary", children: "-" });
        }
      }),
      columnHelper.accessor("actor", {
        id: "object_id",
        header: t("settings:audit.table.actor"),
        size: 200,
        cell: ({ getValue }) => {
          const actor = getValue();
          if (!actor) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-50", children: "-" });
          let displayName;
          let secondaryText;
          if (actor.type === "api_key") {
            const key = apiKeys.find((key2) => key2.id === actor.id);
            displayName = key ? `${t("settings:audit.filter.api_key")}: ${key.description}` : t("settings:audit.detail.api_key");
            secondaryText = `${key?.prefix ?? ""}***********`;
          } else {
            displayName = actor.name;
            const user = getOrgUserById(actor.id);
            secondaryText = user?.email ?? actor.name;
          }
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary text-sm", children: displayName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary text-xs", children: secondaryText })
          ] });
        }
      }),
      columnHelper.accessor("operation", {
        id: "operation",
        header: t("settings:audit.table.operation"),
        size: 100,
        cell: ({ getValue }) => /* @__PURE__ */ jsxRuntimeExports.jsx(OperationBadge, { operation: getValue() })
      }),
      columnHelper.accessor("table", {
        id: "table",
        header: t("settings:audit.table.table"),
        size: 150,
        cell: ({ getValue }) => {
          const value = getValue();
          return value ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary text-sm", children: value }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary", children: "-" });
        }
      }),
      columnHelper.accessor("entityId", {
        id: "entity_id",
        header: t("settings:audit.table.entity_id"),
        size: 250,
        cell: ({ getValue }) => {
          const value = getValue();
          if (!value) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary", children: "-" });
          return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(CopyToClipboardButton, { toCopy: value, size: "sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary max-w-[200px] truncate font-mono text-xs", children: value }) }) });
        }
      })
    ],
    [getOrgUserById, language, t]
  );
  const { table, getBodyProps, rows, getContainerProps } = useTable({
    data: auditEvents,
    columns,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false
  });
  const handleRowClick = reactExports.useCallback((event) => {
    setCurrentAuditEvent(event);
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Table.Container, { ...getContainerProps(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Header, { headerGroups: table.getHeaderGroups() }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Body, { ...getBodyProps(), children: rows.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      Table.Row,
      {
        className: "hover:bg-purple-background-light group cursor-pointer",
        row,
        onClick: () => handleRowClick(row.original)
      },
      row.id
    )) }),
    currentAuditEvent ? /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Root, { open: true, onOpenChange: () => setCurrentAuditEvent(null), children: /* @__PURE__ */ jsxRuntimeExports.jsx(AuditEventDetailPanel, { event: currentAuditEvent }) }) : null
  ] });
};
const AuditEventsFilterLabel = ({ name }) => {
  const { t } = useTranslation(["settings"]);
  return M(name).with("dateRange", () => t("settings:audit.filter.date_range")).with("userId", () => t("settings:audit.filter.user")).with("apiKeyId", () => t("settings:audit.filter.api_key")).with("entityId", () => t("settings:audit.table.entity_id")).exhaustive();
};
const DateRangeFilterMenu = ({ onSelect }) => {
  const { t } = useTranslation(["common", "settings"]);
  const [value, setValue] = reactExports.useState(null);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.List, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DateRangeFilter.Root, { dateRangeFilter: value, setDateRangeFilter: setValue, className: "grid", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DateRangeFilter.FromNowPicker, { title: t("settings:audit.filter.presets") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { className: "bg-grey-border", decorative: true, orientation: "vertical" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DateRangeFilter.Calendar, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { className: "bg-grey-border col-span-3", decorative: true, orientation: "horizontal" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DateRangeFilter.Summary, { className: "col-span-3 row-span-1" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-grey-border flex justify-center gap-sm overflow-x-auto border-t p-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      MenuCommand.HeadlessItem,
      {
        onSelect: () => {
          if (value) {
            onSelect(value);
          }
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !value, size: "medium", children: t("common:save") })
      }
    ) })
  ] });
};
const EDITABLE_FILTERS = ["dateRange"];
const ActivatedAuditFilterItem = ({ filter, onUpdate, onClear, apiKeys }) => {
  const [open, setOpen] = reactExports.useState(false);
  const isEditable = EDITABLE_FILTERS.includes(filter[0]);
  const handleClearClick = useCallbackRef((e) => {
    e.stopPropagation();
    onClear();
  });
  const getApiKeyById = reactExports.useMemo(() => {
    const apiKeyMap = new Map(apiKeys.map((key) => [key.id, key]));
    return (id) => apiKeyMap.get(id);
  }, [apiKeys]);
  const button = /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex h-10 items-center gap-xs rounded-md border border-purple-border bg-purple-background-light p-sm text-default", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DisplayFilterValue, { filter, getApiKeyById }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleClearClick, className: "cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "cross", className: "size-4" }) })
  ] });
  if (isEditable) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { open, onOpenChange: setOpen, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: button }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Content, { sameWidth: true, align: "start", sideOffset: 4, className: "max-h-[600px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.List, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(EditFilterContent, { filter, onUpdate, onClose: () => setOpen(false) }) }) })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex h-10 items-center gap-xs rounded-md border border-purple-border bg-purple-background-light p-sm text-default", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DisplayFilterValue, { filter, getApiKeyById }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onClear, className: "cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "cross", className: "size-4" }) })
  ] });
};
const DisplayFilterValue = ({ filter, getApiKeyById }) => {
  const {
    t,
    i18n: { language }
  } = useTranslation(["filters", "settings"]);
  const { getOrgUserById } = useOrganizationUsers();
  const [filterName, filterValue] = filter;
  switch (filterName) {
    case "dateRange": {
      if (filterValue.type === "static") {
        const startDate = formatDateTimeWithoutPresets(filterValue.startDate, { language });
        const endDate = formatDateTimeWithoutPresets(filterValue.endDate, { language });
        const diff = differenceInDays(new Date(filterValue.endDate), new Date(filterValue.startDate));
        const dateDisplay = diff <= 1 ? startDate : t("filters:date_range.range_value", { startDate, endDate });
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AuditEventsFilterLabel, { name: filterName }),
          ": ",
          dateDisplay
        ] });
      } else {
        const duration = formatDuration(filterValue.fromNow, language);
        const dateDisplay = t("filters:date_range.duration", { duration });
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AuditEventsFilterLabel, { name: filterName }),
          ": ",
          dateDisplay
        ] });
      }
    }
    case "userId": {
      const user = getOrgUserById(filterValue);
      const displayValue = user?.email ?? filterValue;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AuditEventsFilterLabel, { name: filterName }),
        ": ",
        displayValue
      ] });
    }
    case "apiKeyId": {
      const apiKey = getApiKeyById(filterValue);
      const displayValue = apiKey?.description ?? filterValue;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AuditEventsFilterLabel, { name: filterName }),
        ": ",
        displayValue
      ] });
    }
    // TODO: Add 'table' case when we have an endpoint to list available tables
    case "entityId":
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AuditEventsFilterLabel, { name: filterName }),
        ": ",
        filterValue
      ] });
  }
};
const EditFilterContent = ({ filter, onUpdate, onClose }) => {
  const [filterName] = filter;
  switch (filterName) {
    case "dateRange":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        DateRangeFilterMenu,
        {
          onSelect: (value) => {
            onUpdate({ dateRange: value });
            onClose();
          }
        }
      );
    // TODO: Add 'table' case when we have an endpoint to list available tables
    case "userId":
    case "apiKeyId":
    case "entityId":
      return null;
  }
};
const ApiKeyFilterMenu = ({ apiKeys, onSelect }) => {
  const { t } = useTranslation(["common"]);
  const [searchValue, setSearchValue] = reactExports.useState("");
  const deferredValue = reactExports.useDeferredValue(searchValue);
  const matches = reactExports.useMemo(
    () => matchSorter(apiKeys, deferredValue, { keys: ["description", "prefix"] }),
    [deferredValue, apiKeys]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm p-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Combobox, { placeholder: t("common:search"), onValueChange: setSearchValue }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.List, { className: "max-h-40", children: matches.map((apiKey) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      MenuCommand.Item,
      {
        value: `${apiKey.description} ${apiKey.prefix}`.trim(),
        onSelect: () => onSelect(apiKey.id),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Highlight, { text: apiKey.description, query: deferredValue, className: "text-grey-primary text-s" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-grey-secondary text-xs", children: [
            apiKey.prefix,
            "*************"
          ] })
        ] })
      },
      apiKey.id
    )) })
  ] });
};
const UserFilterMenu = ({ onSelect }) => {
  const { t } = useTranslation(["common"]);
  const [searchValue, setSearchValue] = reactExports.useState("");
  const deferredValue = reactExports.useDeferredValue(searchValue);
  const { orgUsers } = useOrganizationUsers();
  const matches = reactExports.useMemo(
    () => matchSorter(orgUsers, deferredValue, { keys: ["email", "firstName", "lastName"] }),
    [deferredValue, orgUsers]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm p-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Combobox, { placeholder: t("common:search"), onValueChange: setSearchValue }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.List, { className: "max-h-40", children: matches.map((user) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      MenuCommand.Item,
      {
        value: `${user.firstName ?? ""} ${user.lastName ?? ""} ${user.email}`.trim(),
        onSelect: () => onSelect(user.userId),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-grey-primary text-s", children: [
            user.firstName,
            " ",
            user.lastName
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Highlight, { text: user.email, query: deferredValue, className: "text-grey-secondary text-xs" })
        ] })
      },
      user.userId
    )) })
  ] });
};
const DisplayAuditFilterMenuItem = ({ filterName, onSelect, apiKeys }) => {
  return M(filterName).with("dateRange", () => /* @__PURE__ */ jsxRuntimeExports.jsx(
    MenuCommand.SubMenu,
    {
      arrow: false,
      hover: false,
      trigger: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(AuditEventsFilterLabel, { name: filterName }) }),
      className: "max-h-[600px]",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(DateRangeFilterMenu, { onSelect: (value) => onSelect({ [filterName]: value }) })
    }
  )).with("userId", () => /* @__PURE__ */ jsxRuntimeExports.jsx(
    MenuCommand.SubMenu,
    {
      arrow: false,
      hover: false,
      trigger: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(AuditEventsFilterLabel, { name: filterName }) }),
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(UserFilterMenu, { onSelect: (value) => onSelect({ [filterName]: value }) })
    }
  )).with("apiKeyId", () => /* @__PURE__ */ jsxRuntimeExports.jsx(
    MenuCommand.SubMenu,
    {
      arrow: false,
      hover: false,
      trigger: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(AuditEventsFilterLabel, { name: filterName }) }),
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(ApiKeyFilterMenu, { apiKeys, onSelect: (value) => onSelect({ [filterName]: value }) })
    }
  )).with("entityId", () => /* @__PURE__ */ jsxRuntimeExports.jsx(
    MenuCommand.SubMenu,
    {
      arrow: false,
      hover: false,
      trigger: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(AuditEventsFilterLabel, { name: filterName }) }),
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInputFilterMenu, { placeholder: "abc123...", onSelect: (value) => onSelect({ [filterName]: value }) })
    }
  )).exhaustive();
};
const TextInputFilterMenu = ({ placeholder, onSelect }) => {
  const { t } = useTranslation(["common"]);
  const [value, setValue] = reactExports.useState("");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm p-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Input,
      {
        placeholder,
        value,
        onChange: (e) => setValue(e.target.value),
        onKeyDown: (e) => {
          if (e.key === "Enter" && value.trim()) {
            onSelect(value.trim());
          }
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      MenuCommand.HeadlessItem,
      {
        onSelect: () => {
          if (value.trim()) {
            onSelect(value.trim());
          }
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !value.trim(), size: "medium", className: "w-full", children: t("common:save") })
      }
    )
  ] });
};
const AuditEventsFiltersBar = ({
  filters,
  availableFilters,
  updateFilters,
  apiKeys
}) => {
  const { t } = useTranslation(["filters"]);
  const [open, setOpen] = reactExports.useState(false);
  const activeFilterNames = filters.map(([name]) => name);
  const remainingFilters = availableFilters.filter((name) => !activeFilterNames.includes(name));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row flex-wrap items-center gap-sm", children: [
    filters.map((filter) => {
      const [filterName] = filter;
      const handleClear = () => updateFilters({ [filterName]: void 0 });
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        ActivatedAuditFilterItem,
        {
          filter,
          onUpdate: updateFilters,
          onClear: handleClear,
          apiKeys
        },
        filterName
      );
    }),
    remainingFilters.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { open, onOpenChange: setOpen, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", size: "medium", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("filters:ds.addNewFilter.label") })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Content, { sameWidth: true, align: "start", sideOffset: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.List, { children: remainingFilters.map((filterName) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        DisplayAuditFilterMenuItem,
        {
          filterName,
          onSelect: (filterValue) => {
            updateFilters(filterValue);
            setOpen(false);
          },
          apiKeys
        },
        filterName
      )) }) })
    ] })
  ] });
};
const PaginationRow = ({
  hasNextPage,
  hasPreviousPage,
  currentLimit,
  onNextPage,
  onPreviousPage,
  setLimit,
  className
}) => {
  const { t } = useTranslation(["settings"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.StickyFooter, { surface: "card", className, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("settings:audit.pagination.per_page") }),
      [25, 50, 100].map((limit) => {
        const isActive = limit === currentLimit;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "secondary",
            appearance: "stroked",
            size: "medium",
            className: cn(isActive && "border-purple-primary text-purple-primary"),
            onClick: () => {
              if (!isActive) {
                setLimit(limit);
              }
            },
            children: limit
          },
          `pagination-limit-${limit}`
        );
      })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          mode: "icon",
          size: "medium",
          variant: "secondary",
          appearance: "stroked",
          disabled: !hasPreviousPage,
          onClick: onPreviousPage,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "arrow-left", className: "size-5" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          mode: "icon",
          size: "medium",
          variant: "secondary",
          appearance: "stroked",
          disabled: !hasNextPage,
          onClick: onNextPage,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "arrow-right", className: "size-5" })
        }
      )
    ] })
  ] });
};
const ActivityFollowUpPage = ({
  query,
  limit,
  updatePage,
  apiKeys
}) => {
  const { t } = useTranslation(["settings", "filters", "common"]);
  const parsedQuery = useBase64Query(auditEventsFiltersSchema, query, {
    onUpdate(newQuery) {
      updatePage(newQuery, limit);
    }
  });
  const auditEventsQuery = useGetAuditEventsQuery(parsedQuery.data, limit);
  const auditEvents = reactExports.useMemo(() => {
    return auditEventsQuery.data?.pages.flatMap((page) => page.events) ?? [];
  }, [auditEventsQuery.data?.pages]);
  const availableFilters = reactExports.useMemo(() => {
    const hasUserId = parsedQuery.data?.userId !== void 0;
    const hasApiKeyId = parsedQuery.data?.apiKeyId !== void 0;
    return auditEventsFilterNames.filter((name) => {
      if (name === "apiKeyId" && hasUserId) return false;
      if (name === "userId" && hasApiKeyId) return false;
      return true;
    });
  }, [parsedQuery.data?.userId, parsedQuery.data?.apiKeyId]);
  const activeFilters = reactExports.useMemo(() => {
    return parsedQuery.asArray.filter(([name]) => name !== "table");
  }, [parsedQuery.asArray]);
  const handleSetLimit = reactExports.useCallback(
    (newLimit) => {
      updatePage(query, newLimit);
    },
    [query, updatePage]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Page.Content, { width: "table", className: "bg-surface-page", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-between items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typo, { variant: "title1", children: t("settings:audit.audit_logs_section") }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      AuditEventsFiltersBar,
      {
        filters: activeFilters,
        availableFilters,
        updateFilters: parsedQuery.update,
        apiKeys
      }
    ) }),
    M(auditEventsQuery).with({ isPending: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-grey-border rounded-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-13 border-b border-grey-border" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-30 bg-grey-background animate-pulse flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-12" }) })
    ] })).with({ isError: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-red-disabled bg-red-background text-red-primary mt-md rounded-sm border p-lg flex flex-col gap-sm items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("common:errors.unknown") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", onClick: () => auditEventsQuery.refetch(), children: t("common:retry") })
    ] })).with({ isSuccess: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx(AuditEventsTable, { auditEvents, apiKeys })).exhaustive(),
    /* @__PURE__ */ jsxRuntimeExports.jsx(StickyComponent, { sentinelClassName: "bottom-0 h-px", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      PaginationRow,
      {
        hasNextPage: auditEventsQuery.hasNextPage ?? false,
        hasPreviousPage: false,
        currentLimit: limit,
        onNextPage: () => auditEventsQuery.fetchNextPage(),
        onPreviousPage: () => void 0,
        setLimit: handleSetLimit,
        className: "sentinel-intersect:shadow-sticky-bottom sentinel-intersect:border-grey-border"
      }
    ) })
  ] }) });
};
function ActivityFollowUp() {
  const navigate = useNavigate();
  const {
    query,
    limit,
    apiKeys
  } = Route.useLoaderData();
  const updatePage = (newQuery, newLimit) => {
    navigate({
      to: ".",
      search: {
        q: newQuery !== "" ? newQuery : void 0,
        limit: newLimit !== DEFAULT_LIMIT ? newLimit : void 0
      },
      replace: true
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ActivityFollowUpPage, { query, limit, updatePage, apiKeys });
}
export {
  ActivityFollowUp as component
};
