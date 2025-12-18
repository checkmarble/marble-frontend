import { R as jsxRuntimeExports, r as reactExports } from "../server.js";
import { U as UpsellCard } from "./UpsellCard-TgF0jFAp.js";
import { C as CasesNavigationTabs } from "./Tabs-efS13r24.js";
import { P as Page, T as Route } from "./router-vb7i5euz.js";
import { S as Spinner } from "./Spinner-GK6cEAdR.js";
import { bC as toPeriodAverage, T as Temporal, bD as aggregatePeriodDuration, bE as aggregateFalsePositiveRate, bF as aggregatePeriodCount, M, aq as subMonths, aC as add } from "./services-middleware-DR8Hua1Y.js";
import { b as getCaseAnalyticsFn, X as Xe } from "./nivo-bar-A7O08vfo.js";
import { B as keepPreviousData } from "./QueryClientProvider-DYTpkCko.js";
import { u as useQuery } from "./useQuery-B7mL_evE.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { u as useTranslation, e as Icon, q as useFormatLanguage, t as useFormatDateTime, e8 as MenuCommand, B as Button, ea as formatDuration, dZ as SelectV2, d as cn } from "./format-NPGUXq-g.js";
import { i as isSamePeriodYear, g as getXTickValues, c as getNiceYAxisTicks, n as nivoTheme, B as BAR_BORDER_WIDTH, a as BAR_BORDER_RADIUS, C as CASE_ANALYTICS_COLORS, t as tooltipStyle, f as formatPeriodTooltip, d as formatChartNumber, e as formatPeriodTick, b as buildBarGradient, h as formatBracket } from "./chart-theme-FZz34P1P.js";
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
import "./CopyToClipboardButton-CJNJJful.js";
import "./case-detail-middleware-C3JS8Yme.js";
import "./input-validation-CU_reV2S.js";
import "./async-C3pYACua.js";
import "./decisions-B-2DmJW1.js";
import "./unique-CBeBxAXx.js";
import "./scenarios-8U74nJp4.js";
import "node:crypto";
import "./nivo-legends-6l5H9E2i.js";
import "./useBaseQuery-CMboOtTR.js";
import "./sharpstate.es-CeF1Mf5b.js";
import "./isNullish-B8pc8Ntu.js";
import "./use-callback-ref-DXzIzfqy.js";
import "./create-context-CYc8deix.js";
const caseAnalyticsQueryKey = (filters) => ["case-analytics", filters];
const useCaseAnalytics = (filters) => {
  const getCaseAnalytics = useServerFn(getCaseAnalyticsFn);
  return useQuery({
    queryKey: caseAnalyticsQueryKey(filters),
    queryFn: async () => {
      const result = await getCaseAnalytics({
        data: {
          startDate: filters.startDate,
          endDate: filters.endDate,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          inboxId: filters.inboxId,
          userId: filters.userId
        }
      });
      return result.caseAnalytics;
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1e3,
    // 5 minutes — avoid refetching on tab switches
    refetchOnWindowFocus: false
  });
};
function ChartEmptyState() {
  const { t } = useTranslation(["cases"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-grey-border bg-grey-background-light flex h-full min-h-48 flex-col items-center justify-center gap-xs rounded-md border border-dashed p-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "analytics", className: "text-grey-secondary size-6" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-secondary text-center", children: t("cases:analytics.chart.empty_state") })
  ] });
}
function AlertMetricsChart({ alertCountByPeriod, falsePositiveRateByPeriod }) {
  const { t } = useTranslation(["cases"]);
  const language = useFormatLanguage();
  const alertSameYear = reactExports.useMemo(() => isSamePeriodYear(alertCountByPeriod.map((d) => d.period)), [alertCountByPeriod]);
  const alertXTickValues = reactExports.useMemo(() => getXTickValues(alertCountByPeriod, "period"), [alertCountByPeriod]);
  const alertYTicks = reactExports.useMemo(() => getNiceYAxisTicks(alertCountByPeriod.map((d) => d.count)), [alertCountByPeriod]);
  const fpSameYear = reactExports.useMemo(
    () => isSamePeriodYear(falsePositiveRateByPeriod.map((d) => d.period)),
    [falsePositiveRateByPeriod]
  );
  const fpXTickValues = reactExports.useMemo(() => getXTickValues(falsePositiveRateByPeriod, "period"), [falsePositiveRateByPeriod]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface-card border-grey-border flex flex-col gap-md rounded-lg border p-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s font-medium", children: t("cases:analytics.alerts.title") }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-lg xl:flex-row", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-64 flex-1 flex-col gap-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-grey-secondary", children: t("cases:analytics.alerts.count_by_period") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1", children: alertCountByPeriod.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChartEmptyState, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          Xe,
          {
            data: alertCountByPeriod,
            keys: ["count"],
            indexBy: "period",
            enableLabel: false,
            padding: 0.3,
            margin: { top: 5, right: 5, bottom: 40, left: 50 },
            colors: [CASE_ANALYTICS_COLORS.red],
            borderRadius: BAR_BORDER_RADIUS,
            borderWidth: BAR_BORDER_WIDTH,
            borderColor: { from: "color" },
            defs: [buildBarGradient(CASE_ANALYTICS_COLORS.red, "grad-alert-count")],
            fill: [{ match: { id: "count" }, id: "grad-alert-count" }],
            valueScale: { type: "linear", min: 0, max: alertYTicks[alertYTicks.length - 1] },
            axisBottom: {
              tickRotation: 0,
              tickValues: alertXTickValues,
              format: (value) => formatPeriodTick(value, language, alertSameYear)
            },
            axisLeft: {
              tickValues: alertYTicks,
              format: (v) => formatChartNumber(v, language)
            },
            tooltip: ({ indexValue, value }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: tooltipStyle, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-primary font-semibold", children: formatPeriodTooltip(String(indexValue), language) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-md", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-secondary", children: t("cases:analytics.alerts.count_label") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-primary font-semibold", children: formatChartNumber(value, language) })
              ] })
            ] }),
            theme: nivoTheme
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-64 flex-1 flex-col gap-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-grey-secondary", children: t("cases:analytics.alerts.fp_rate_by_period") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1", children: falsePositiveRateByPeriod.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChartEmptyState, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          Xe,
          {
            data: falsePositiveRateByPeriod,
            keys: ["rate"],
            indexBy: "period",
            enableLabel: false,
            padding: 0.3,
            margin: { top: 5, right: 5, bottom: 40, left: 40 },
            colors: [CASE_ANALYTICS_COLORS.green],
            borderRadius: BAR_BORDER_RADIUS,
            borderWidth: BAR_BORDER_WIDTH,
            borderColor: { from: "color" },
            defs: [buildBarGradient(CASE_ANALYTICS_COLORS.green, "grad-fp-rate")],
            fill: [{ match: { id: "rate" }, id: "grad-fp-rate" }],
            valueScale: { type: "linear", min: 0, max: 100 },
            gridYValues: [0, 25, 50, 75, 100],
            axisBottom: {
              tickRotation: 0,
              tickValues: fpXTickValues,
              format: (value) => formatPeriodTick(value, language, fpSameYear)
            },
            axisLeft: {
              tickValues: [0, 25, 50, 75, 100],
              format: (v) => `${v}%`
            },
            tooltip: ({ data }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: tooltipStyle, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-primary font-semibold", children: formatPeriodTooltip(data.period, language) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-md", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-secondary", children: t("cases:analytics.alerts.fp_rate") }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-s text-grey-primary font-semibold", children: [
                  formatChartNumber(data.rate, language),
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-grey-secondary", children: [
                formatChartNumber(data.fpCount, language),
                " / ",
                formatChartNumber(data.closedCount, language),
                " ",
                t("cases:analytics.alerts.closed")
              ] })
            ] }),
            theme: nivoTheme
          }
        ) })
      ] })
    ] })
  ] });
}
function AlertProcessingChart({ caseDurationByPeriod, openCasesByAge }) {
  const { t } = useTranslation(["cases"]);
  const language = useFormatLanguage();
  const chartData = reactExports.useMemo(() => caseDurationByPeriod.map(toPeriodAverage), [caseDurationByPeriod]);
  const sameYear = reactExports.useMemo(() => isSamePeriodYear(chartData.map((d) => d.period)), [chartData]);
  const xTickValues = reactExports.useMemo(() => getXTickValues(chartData, "period"), [chartData]);
  const yTicks = reactExports.useMemo(() => getNiceYAxisTicks(chartData.flatMap((d) => [d.avgDays, d.maxDays])), [chartData]);
  const openCasesYTicks = reactExports.useMemo(() => getNiceYAxisTicks(openCasesByAge.map((d) => d.count)), [openCasesByAge]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface-card border-grey-border flex flex-col gap-md rounded-lg border p-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s font-medium", children: t("cases:analytics.processing.title") }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-lg xl:flex-row", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-64 flex-1 flex-col gap-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-grey-secondary", children: t("cases:analytics.processing.duration_by_period") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1", children: chartData.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChartEmptyState, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          Xe,
          {
            data: chartData,
            keys: ["avgDays", "maxDays"],
            indexBy: "period",
            groupMode: "grouped",
            enableLabel: false,
            padding: 0.3,
            innerPadding: 2,
            margin: { top: 5, right: 5, bottom: 60, left: 50 },
            colors: [CASE_ANALYTICS_COLORS.success, CASE_ANALYTICS_COLORS.secondary],
            borderRadius: BAR_BORDER_RADIUS,
            borderWidth: BAR_BORDER_WIDTH,
            borderColor: { from: "color" },
            defs: [
              buildBarGradient(CASE_ANALYTICS_COLORS.success, "grad-duration-avg"),
              buildBarGradient(CASE_ANALYTICS_COLORS.secondary, "grad-duration-max")
            ],
            fill: [
              { match: { id: "avgDays" }, id: "grad-duration-avg" },
              { match: { id: "maxDays" }, id: "grad-duration-max" }
            ],
            valueScale: { type: "linear", min: 0, max: yTicks[yTicks.length - 1] },
            axisBottom: {
              tickRotation: 0,
              tickValues: xTickValues,
              format: (value) => formatPeriodTick(value, language, sameYear)
            },
            axisLeft: {
              tickValues: yTicks,
              format: (v) => formatChartNumber(v, language)
            },
            legendLabel: (datum) => t(`cases:analytics.chart.${String(datum.id)}`),
            legends: [
              {
                dataFrom: "keys",
                anchor: "bottom",
                direction: "row",
                itemWidth: 110,
                itemHeight: 20,
                translateY: 56,
                symbolShape: "circle",
                symbolSize: 10
              }
            ],
            tooltip: ({ id, value, indexValue, data }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: tooltipStyle, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-primary font-semibold", children: formatPeriodTooltip(String(indexValue), language) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-md", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-secondary", children: t(`cases:analytics.chart.${String(id)}`) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-s text-grey-primary font-semibold", children: [
                  formatChartNumber(value, language),
                  " ",
                  t("cases:analytics.chart.days")
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-grey-secondary", children: [
                formatChartNumber(data.count, language),
                " ",
                t("cases:analytics.chart.cases_lower")
              ] })
            ] }),
            theme: nivoTheme
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-64 flex-1 flex-col gap-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-grey-secondary", children: t("cases:analytics.processing.open_by_age") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1", children: openCasesByAge.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChartEmptyState, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          Xe,
          {
            data: openCasesByAge,
            keys: ["count"],
            indexBy: "bucket",
            layout: "horizontal",
            enableLabel: false,
            padding: 0.4,
            margin: { top: 5, right: 20, bottom: 40, left: 90 },
            colors: [CASE_ANALYTICS_COLORS.secondary],
            borderRadius: BAR_BORDER_RADIUS,
            borderWidth: BAR_BORDER_WIDTH,
            borderColor: { from: "color" },
            defs: [buildBarGradient(CASE_ANALYTICS_COLORS.secondary, "grad-open-cases")],
            fill: [{ match: { id: "count" }, id: "grad-open-cases" }],
            valueScale: { type: "linear", min: 0, max: openCasesYTicks[openCasesYTicks.length - 1] },
            axisBottom: {
              tickValues: openCasesYTicks,
              format: (v) => formatChartNumber(v, language)
            },
            axisLeft: {
              format: (v) => formatBracket(v, t)
            },
            tooltip: ({ indexValue, value }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: tooltipStyle, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-primary font-semibold", children: formatBracket(String(indexValue), t) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-md", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-secondary", children: t("cases:analytics.chart.cases_lower") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-primary font-semibold", children: formatChartNumber(value, language) })
              ] })
            ] }),
            theme: nivoTheme
          }
        ) })
      ] })
    ] })
  ] });
}
function CaseAnalyticsDateRangeMenu({ value, onChange }) {
  const { t } = useTranslation(["cases", "common", "filters"]);
  const formatDateTime = useFormatDateTime();
  const language = useFormatLanguage();
  const [open, setOpen] = reactExports.useState(false);
  const [draft, setDraft] = reactExports.useState(value);
  const label = formatLabel(value, formatDateTime, language, t);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    MenuCommand.Menu,
    {
      open,
      onOpenChange: (nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) setDraft(value);
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.SelectButton, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "calendar-month", className: "size-5 me-xs" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 text-left", children: label })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Content, { align: "start", sideOffset: 4, className: "max-h-[600px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.List, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DateRangeFilter.Root, { dateRangeFilter: draft, setDateRangeFilter: setDraft, className: "grid", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DateRangeFilter.FromNowPicker, { title: t("cases:analytics.filters.date_range_title") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { className: "bg-grey-border", decorative: true, orientation: "vertical" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DateRangeFilter.Calendar, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { className: "bg-grey-border col-span-3", decorative: true, orientation: "horizontal" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DateRangeFilter.Summary, { className: "col-span-3 row-span-1" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-grey-border flex justify-center gap-sm overflow-x-auto border-t p-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            MenuCommand.HeadlessItem,
            {
              onSelect: () => {
                if (draft) {
                  onChange(draft);
                  setOpen(false);
                }
              },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !draft, size: "medium", children: t("common:save") })
            }
          ) })
        ] })
      ]
    }
  );
}
function formatLabel(value, formatDateTime, language, t) {
  if (!value) return t("cases:analytics.filters.select_date_range");
  if (value.type === "dynamic") {
    return t("filters:up_to", { duration: formatDuration(value.fromNow, language) });
  }
  const { startDate, endDate } = value;
  if (!startDate && !endDate) return t("cases:analytics.filters.select_date_range");
  const from = startDate ? formatDateTime(startDate, { dateStyle: "short" }) : "...";
  const to = endDate ? formatDateTime(endDate, { dateStyle: "short" }) : "...";
  return `${from} → ${to}`;
}
const ALL_VALUE = "__all__";
function CaseAnalyticsFilters({
  dateRange,
  onDateRangeChange,
  inboxId,
  onInboxIdChange,
  inboxes,
  userId,
  onUserIdChange,
  users
}) {
  const { t } = useTranslation(["cases"]);
  const inboxOptions = reactExports.useMemo(
    () => [
      { label: t("cases:analytics.filters.all_inboxes"), value: ALL_VALUE },
      ...inboxes.map((inbox) => ({ label: inbox.name, value: inbox.id }))
    ],
    [inboxes, t]
  );
  const userOptions = reactExports.useMemo(() => {
    const selectedInbox = inboxId ? inboxes.find((i) => i.id === inboxId) : void 0;
    const inboxUserIds = selectedInbox ? new Set(selectedInbox.users.map((u) => u.userId)) : null;
    const filteredUsers = inboxUserIds ? users.filter((u) => inboxUserIds.has(u.userId)) : users;
    return [
      { label: t("cases:analytics.filters.all_users"), value: ALL_VALUE },
      ...filteredUsers.map((user) => ({
        label: `${user.firstName} ${user.lastName}`,
        value: user.userId
      }))
    ];
  }, [users, inboxes, inboxId, t]);
  const handleInboxChange = (val) => {
    onInboxIdChange(val === ALL_VALUE ? void 0 : val);
    onUserIdChange(void 0);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CaseAnalyticsDateRangeMenu, { value: dateRange, onChange: onDateRangeChange }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      SelectV2,
      {
        options: inboxOptions,
        value: inboxId ?? ALL_VALUE,
        onChange: handleInboxChange,
        placeholder: t("cases:analytics.filters.all_inboxes"),
        className: "w-48"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      SelectV2,
      {
        options: userOptions,
        value: userId ?? ALL_VALUE,
        onChange: (val) => onUserIdChange(val === ALL_VALUE ? void 0 : val),
        placeholder: t("cases:analytics.filters.all_users"),
        className: "w-48"
      }
    )
  ] });
}
function SarDelayChart({ delayByPeriod, delayDistribution }) {
  const { t } = useTranslation(["cases"]);
  const language = useFormatLanguage();
  const chartData = reactExports.useMemo(() => delayByPeriod.map(toPeriodAverage), [delayByPeriod]);
  const sameYear = reactExports.useMemo(() => isSamePeriodYear(chartData.map((d) => d.period)), [chartData]);
  const xTickValues = reactExports.useMemo(() => getXTickValues(chartData, "period"), [chartData]);
  const yTicks = reactExports.useMemo(() => getNiceYAxisTicks(chartData.flatMap((d) => [d.avgDays, d.maxDays])), [chartData]);
  const distributionYTicks = reactExports.useMemo(
    () => getNiceYAxisTicks(delayDistribution.map((d) => d.count)),
    [delayDistribution]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface-card border-grey-border flex flex-col gap-md rounded-lg border p-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s font-medium", children: t("cases:analytics.sar.delay_title") }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-lg xl:flex-row", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-64 flex-1 flex-col gap-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-grey-secondary", children: t("cases:analytics.sar.delay_by_period") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1", children: chartData.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChartEmptyState, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          Xe,
          {
            data: chartData,
            keys: ["avgDays", "maxDays"],
            indexBy: "period",
            groupMode: "grouped",
            enableLabel: false,
            padding: 0.3,
            innerPadding: 2,
            margin: { top: 5, right: 5, bottom: 60, left: 50 },
            colors: [CASE_ANALYTICS_COLORS.yellow, CASE_ANALYTICS_COLORS.orange],
            borderRadius: BAR_BORDER_RADIUS,
            borderWidth: BAR_BORDER_WIDTH,
            borderColor: { from: "color" },
            defs: [
              buildBarGradient(CASE_ANALYTICS_COLORS.yellow, "grad-sar-avg"),
              buildBarGradient(CASE_ANALYTICS_COLORS.orange, "grad-sar-max")
            ],
            fill: [
              { match: { id: "avgDays" }, id: "grad-sar-avg" },
              { match: { id: "maxDays" }, id: "grad-sar-max" }
            ],
            valueScale: { type: "linear", min: 0, max: yTicks[yTicks.length - 1] },
            axisBottom: {
              tickRotation: 0,
              tickValues: xTickValues,
              format: (value) => formatPeriodTick(value, language, sameYear)
            },
            axisLeft: {
              tickValues: yTicks,
              format: (v) => formatChartNumber(v, language)
            },
            legendLabel: (datum) => t(`cases:analytics.chart.${String(datum.id)}`),
            legends: [
              {
                dataFrom: "keys",
                anchor: "bottom",
                direction: "row",
                itemWidth: 110,
                itemHeight: 20,
                translateY: 56,
                symbolShape: "circle",
                symbolSize: 10
              }
            ],
            tooltip: ({ id, value, indexValue, data }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: tooltipStyle, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-primary font-semibold", children: formatPeriodTooltip(String(indexValue), language) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-md", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-secondary", children: t(`cases:analytics.chart.${String(id)}`) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-s text-grey-primary font-semibold", children: [
                  formatChartNumber(value, language),
                  " ",
                  t("cases:analytics.chart.days")
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-grey-secondary", children: [
                formatChartNumber(data.count, language),
                " ",
                t("cases:analytics.sar.reports")
              ] })
            ] }),
            theme: nivoTheme
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-64 flex-1 flex-col gap-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-grey-secondary", children: t("cases:analytics.sar.delay_distribution") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1", children: delayDistribution.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChartEmptyState, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          Xe,
          {
            data: delayDistribution,
            keys: ["count"],
            indexBy: "bucket",
            layout: "horizontal",
            enableLabel: false,
            padding: 0.4,
            margin: { top: 5, right: 20, bottom: 40, left: 90 },
            colors: [CASE_ANALYTICS_COLORS.purpleLight],
            borderRadius: BAR_BORDER_RADIUS,
            borderWidth: BAR_BORDER_WIDTH,
            borderColor: { from: "color" },
            defs: [buildBarGradient(CASE_ANALYTICS_COLORS.purpleLight, "grad-sar-distribution")],
            fill: [{ match: { id: "count" }, id: "grad-sar-distribution" }],
            valueScale: { type: "linear", min: 0, max: distributionYTicks[distributionYTicks.length - 1] },
            axisBottom: {
              tickValues: distributionYTicks,
              format: (v) => formatChartNumber(v, language)
            },
            axisLeft: {
              format: (v) => formatBracket(v, t)
            },
            tooltip: ({ indexValue, value }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: tooltipStyle, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-primary font-semibold", children: formatBracket(String(indexValue), t) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-md", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-secondary", children: t("cases:analytics.sar.reports") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-primary font-semibold", children: formatChartNumber(value, language) })
              ] })
            ] }),
            theme: nivoTheme
          }
        ) })
      ] })
    ] })
  ] });
}
function SarReportsGauge({ total }) {
  const { t } = useTranslation(["cases"]);
  const language = useFormatLanguage();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface-card border-grey-border flex h-full flex-col items-center justify-center gap-xs rounded-lg border p-lg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-secondary", children: t("cases:analytics.sar.completed_title") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-6xl font-bold tracking-tight text-purple-primary", children: formatChartNumber(total, language) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s font-medium text-grey-secondary", children: t("cases:analytics.sar.reports") })
  ] });
}
const timeBuckets = ["day", "month", "quarter"];
function TimeBucketToggle({ value, onChange }) {
  const { t } = useTranslation(["cases"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-xs", children: timeBuckets.map((bucket) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    Button,
    {
      variant: "secondary",
      onClick: () => onChange(bucket),
      className: cn(value === bucket && "bg-purple-background-light border-purple-primary text-purple-primary"),
      children: t(`cases:analytics.time_bucket.${bucket}`)
    },
    bucket
  )) });
}
function resolveDateRange(range) {
  const now = /* @__PURE__ */ new Date();
  const today = now.toISOString().slice(0, 10);
  if (!range) {
    return { startDate: subMonths(now, 6).toISOString().slice(0, 10), endDate: today };
  }
  if (range.type === "static") {
    return {
      startDate: range.startDate ? range.startDate.slice(0, 10) : subMonths(now, 6).toISOString().slice(0, 10),
      endDate: range.endDate ? range.endDate.slice(0, 10) : today
    };
  }
  const duration = Temporal.Duration.from(range.fromNow);
  const start = add(now, {
    years: duration.years,
    months: duration.months,
    weeks: duration.weeks,
    days: duration.days,
    hours: duration.hours,
    minutes: duration.minutes,
    seconds: duration.seconds
  });
  return { startDate: start.toISOString().slice(0, 10), endDate: today };
}
function AnalyticsPage({ inboxes, users, isAnalyticsAvailable }) {
  const { t } = useTranslation(["cases", "common"]);
  const [dateRange, setDateRange] = reactExports.useState({
    type: "dynamic",
    fromNow: Temporal.Duration.from({ months: -6 }).toString()
  });
  const [inboxId, setInboxId] = reactExports.useState(void 0);
  const [userId, setUserId] = reactExports.useState(void 0);
  const [timeBucket, setTimeBucket] = reactExports.useState("month");
  const { startDate, endDate } = reactExports.useMemo(() => resolveDateRange(dateRange), [dateRange]);
  const query = useCaseAnalytics({
    startDate,
    endDate,
    inboxId,
    userId
  });
  const aggregated = reactExports.useMemo(() => {
    if (!query.data) return null;
    return {
      sarTotalCompleted: query.data.sarTotalCompleted,
      sarDelayByPeriod: aggregatePeriodDuration(query.data.sarDelayByPeriod, timeBucket),
      sarDelayDistribution: query.data.sarDelayDistribution,
      alertCountByPeriod: aggregatePeriodCount(query.data.alertCountByPeriod, timeBucket),
      falsePositiveRateByPeriod: aggregateFalsePositiveRate(query.data.falsePositiveRateByPeriod, timeBucket),
      caseDurationByPeriod: aggregatePeriodDuration(query.data.caseDurationByPeriod, timeBucket),
      openCasesByAge: query.data.openCasesByAge
    };
  }, [query.data, timeBucket]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Page.Main, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Content, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CasesNavigationTabs, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        CaseAnalyticsFilters,
        {
          dateRange,
          onDateRangeChange: setDateRange,
          inboxId,
          onInboxIdChange: setInboxId,
          inboxes,
          userId,
          onUserIdChange: setUserId,
          users
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TimeBucketToggle, { value: timeBucket, onChange: setTimeBucket })
    ] }),
    M(query).with({ isPending: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-96 place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-12" }) })).with({ isError: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-96 place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-center text-grey-secondary", children: t("common:generic_fetch_data_error") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", onClick: () => query.refetch(), children: t("common:retry") })
    ] }) })).with({ isSuccess: true }, () => {
      if (!aggregated) {
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-96 place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-12" }) });
      }
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-md xl:grid-cols-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SarReportsGauge, { total: aggregated.sarTotalCompleted }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "xl:col-span-2", children: isAnalyticsAvailable ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            SarDelayChart,
            {
              delayByPeriod: aggregated.sarDelayByPeriod,
              delayDistribution: aggregated.sarDelayDistribution
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
            UpsellCard,
            {
              className: "h-full",
              title: t("cases:analytics.upsell.title"),
              description: t("cases:analytics.upsell.description"),
              benefits: [
                t("cases:analytics.upsell.benefit_1"),
                t("cases:analytics.upsell.benefit_2"),
                t("cases:analytics.upsell.benefit_3")
              ]
            }
          ) })
        ] }),
        isAnalyticsAvailable ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            AlertMetricsChart,
            {
              alertCountByPeriod: aggregated.alertCountByPeriod,
              falsePositiveRateByPeriod: aggregated.falsePositiveRateByPeriod
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            AlertProcessingChart,
            {
              caseDurationByPeriod: aggregated.caseDurationByPeriod,
              openCasesByAge: aggregated.openCasesByAge
            }
          )
        ] }) : null
      ] });
    }).exhaustive()
  ] }) });
}
function CasesAnalytics() {
  const {
    inboxes,
    users,
    isAnalyticsAvailable
  } = Route.useLoaderData();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AnalyticsPage, { inboxes, users, isAnalyticsAvailable });
}
export {
  CasesAnalytics as component
};
