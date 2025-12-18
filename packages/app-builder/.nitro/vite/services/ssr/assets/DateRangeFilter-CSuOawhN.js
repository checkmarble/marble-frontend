import { r as reactExports, R as jsxRuntimeExports } from "../server.js";
import { aE as getDateFnsLocale, aC as add, T as Temporal } from "./services-middleware-DR8Hua1Y.js";
import { c as createSimpleContext } from "./create-context-CYc8deix.js";
import { q as useFormatLanguage, ea as formatDuration, b as clsx, e5 as Calendar, u as useTranslation, ec as sub, t as useFormatDateTime } from "./format-NPGUXq-g.js";
import { o as filtersI18n } from "./router-vb7i5euz.js";
function adaptStaticDateRangeFilterType({ from, to }) {
  const startDate = from?.toISOString() ?? "";
  const endDate = to ? add(to, { days: 1 }).toISOString() : "";
  return {
    type: "static",
    startDate,
    endDate
  };
}
function adaptDateRange({ startDate, endDate }) {
  const from = startDate ? new Date(startDate) : void 0;
  const to = endDate ? sub(new Date(endDate), { days: 1 }) : void 0;
  return from || to ? { from, to } : void 0;
}
const DateRangeFilterContext = createSimpleContext("DateRangeFilterContext");
const useDateRangeFilterContext = DateRangeFilterContext.useValue;
function DateRangeFilterRoot({
  dateRangeFilter,
  setDateRangeFilter,
  children,
  className
}) {
  const calendarSelected = dateRangeFilter?.type === "static" ? adaptDateRange(dateRangeFilter) : void 0;
  const onCalendarSelect = reactExports.useCallback(
    (range) => {
      setDateRangeFilter(adaptStaticDateRangeFilterType(range ?? { from: void 0 }));
    },
    [setDateRangeFilter]
  );
  const fromNow = dateRangeFilter?.type === "dynamic" ? dateRangeFilter.fromNow : void 0;
  const onFromNowSelect = reactExports.useCallback(
    (fromNow2) => {
      setDateRangeFilter({
        type: "dynamic",
        fromNow: fromNow2
      });
    },
    [setDateRangeFilter]
  );
  const value = {
    fromNow,
    calendarSelected,
    onCalendarSelect,
    onFromNowSelect
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DateRangeFilterContext.Provider, { value, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className, children }) });
}
const fromNowDurations = [
  Temporal.Duration.from({ days: -7 }).toString(),
  Temporal.Duration.from({ days: -14 }).toString(),
  Temporal.Duration.from({ days: -30 }).toString(),
  Temporal.Duration.from({ months: -3 }).toString(),
  Temporal.Duration.from({ months: -6 }).toString(),
  Temporal.Duration.from({ months: -12 }).toString()
];
function DateRangeFilterFromNowPicker({ title, className }) {
  const language = useFormatLanguage();
  const { onFromNowSelect } = useDateRangeFilterContext();
  const { fromNow } = useDateRangeFilterContext();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: clsx("flex flex-col gap-md p-md", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-grey-primary text-s font-normal first-letter:capitalize", children: title }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-xs", children: fromNowDurations.map((duration) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => {
          onFromNowSelect(duration);
        },
        className: clsx(
          "text-s bg-surface-card text-grey-primary border-grey-white dark:border-grey-border flex h-10 items-center rounded-sm border p-sm outline-hidden",
          "hover:bg-purple-background-light active:bg-purple-background hover:text-purple-primary dark:hover:bg-grey-background-light dark:hover:text-purple-hover",
          fromNow === duration && "bg-purple-background border-purple-primary text-purple-primary dark:bg-grey-background-light dark:text-purple-hover"
          // highlight the currently selected
        ),
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("time", { dateTime: duration, children: formatDuration(duration, language) })
      },
      duration
    )) })
  ] });
}
function DateRangeFilterCalendar({ className }) {
  const language = useFormatLanguage();
  const { calendarSelected, onCalendarSelect } = useDateRangeFilterContext();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: clsx("p-md", className), children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    Calendar,
    {
      mode: "range",
      selected: calendarSelected,
      onSelect: onCalendarSelect,
      defaultMonth: calendarSelected?.from,
      locale: getDateFnsLocale(language)
    }
  ) });
}
function DateRangeFilterSummary({ className }) {
  const language = useFormatLanguage();
  const { t } = useTranslation(filtersI18n);
  const { fromNow, calendarSelected } = useDateRangeFilterContext();
  if (fromNow) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: clsx("m-md flex h-10 w-full items-center justify-center", className), children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "time",
      {
        className: "text-s text-grey-primary flex h-10 items-center rounded-sm p-sm outline-hidden",
        dateTime: fromNow,
        children: t("filters:up_to", {
          duration: formatDuration(fromNow, language)
        })
      }
    ) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: clsx("grid grid-cols-[1fr_max-content_1fr] gap-xs p-md", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(FormatStaticDate, { className: "justify-self-end", date: calendarSelected?.from }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-l self-center", children: "→" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(FormatStaticDate, { date: calendarSelected?.to })
  ] });
}
function FormatStaticDate({ date, className }) {
  const formatDateTime = useFormatDateTime();
  const dateTime = typeof date === "string" ? date : date?.toDateString();
  const formattedDate = date ? formatDateTime(date, { dateStyle: "short" }) : "--/--/----";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "time",
    {
      dateTime,
      className: clsx(
        "border-grey-border h-10 w-fit rounded-sm border p-sm",
        date ? "text-grey-primary" : "text-grey-secondary",
        className
      ),
      children: formattedDate
    }
  );
}
const DateRangeFilter = {
  Root: DateRangeFilterRoot,
  FromNowPicker: DateRangeFilterFromNowPicker,
  Calendar: DateRangeFilterCalendar,
  Summary: DateRangeFilterSummary
};
export {
  DateRangeFilter as D
};
