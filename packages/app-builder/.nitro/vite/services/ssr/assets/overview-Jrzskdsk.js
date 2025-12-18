import { r as reactExports, R as jsxRuntimeExports } from "../server.js";
import { C as CasesNavigationTabs } from "./Tabs-efS13r24.js";
import { Q as CaseStatusBadgeV2, P as Page, S as Route } from "./router-vb7i5euz.js";
import { u as useTranslation, t as useFormatDateTime, q as useFormatLanguage, B as Button, e8 as MenuCommand, e as Icon, dD as Tooltip, s as Trans, dz as Switch, e1 as Input, e4 as Modal, j as Tag, T as Typo, d as cn } from "./format-NPGUXq-g.js";
import { S as Spinner } from "./Spinner-GK6cEAdR.js";
import { g as getCaseStatusByDateFn, X as Xe, a as getCaseStatusByInboxFn } from "./nivo-bar-A7O08vfo.js";
import { B as keepPreviousData, y as useQueryClient } from "./QueryClientProvider-DYTpkCko.js";
import { u as useQuery } from "./useQuery-B7mL_evE.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { M, bA as languages, bB as aiSettingSchema } from "./services-middleware-DR8Hua1Y.js";
import { n as nivoTheme, B as BAR_BORDER_WIDTH, a as BAR_BORDER_RADIUS, b as buildBarGradient } from "./chart-theme-FZz34P1P.js";
import { P as Panel, a as PanelSharpFactory } from "./Panel-kj8Z2GDk.js";
import { u as useLoaderRevalidator } from "./LoaderRevalidatorContext-C9s56i-l.js";
import { a as getAiSettingsFn, u as updateAiSettingsFn, b as updateAutoAssignFn, c as updateInboxEscalationFn, d as updateInboxWorkflowFn } from "./cases-DJ9ABIdo.js";
import { A as isAccessible, a1 as isRestricted } from "./feature-access-B8PIS8ad.js";
import { a as CalloutV2 } from "./Callout-DX4NBXlG.js";
import { E as ExternalLink } from "./ExternalLink-CG_77QdX.js";
import { F as FormErrorOrDescription } from "./FormErrorOrDescription-DO6Hdfmn.js";
import { F as FormLabel } from "./FormLabel-DeCgtgtj.js";
import { F as FormTextArea } from "./FormTextArea-BlK7vs_g.js";
import { u as useMutation } from "./useMutation-C5oG90Zs.js";
import { g as getFieldErrors, h as handleSubmit } from "./form-D2XmDKeG.js";
import { u as useForm } from "./useForm-BwABQKAs.js";
import { z as zt } from "./CopyToClipboardButton-CJNJJful.js";
import { u as useGetInboxesQuery } from "./get-inboxes-6fSfvled.js";
import { u as useOrganizationUsers } from "./organization-users-Bxl0ZW8k.js";
import { g as getFullName } from "./user-C_y5ayGi.js";
import "./cases-PZYcTUxr.js";
import { R as Root, T as Trigger, C as Content } from "./index-DhVP5FgH.js";
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
import "./use-callback-ref-DXzIzfqy.js";
import "./nivo-legends-6l5H9E2i.js";
import "./useBaseQuery-CMboOtTR.js";
import "node:crypto";
import "./index-x7n7VJTa.js";
import "./index-C_WgunUr.js";
import "./array-BFSjnO9c.js";
import "./create-context-CYc8deix.js";
import "./join-BeQTfqAC.js";
import "./index-CR1bHmei.js";
function buildCaseStatusDateRange$1() {
  const now = /* @__PURE__ */ new Date();
  const todayMidnight = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const tenDaysAgo = new Date(todayMidnight.getTime() - 10 * 24 * 60 * 60 * 1e3);
  const tomorrowMidnight = new Date(todayMidnight.getTime() + 24 * 60 * 60 * 1e3);
  return {
    start: tenDaysAgo.toISOString(),
    end: tomorrowMidnight.toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
}
const useCaseStatusByDate = () => {
  const getCaseStatusByDate = useServerFn(getCaseStatusByDateFn);
  return useQuery({
    queryKey: ["case-status-by-date"],
    queryFn: async () => {
      const result = await getCaseStatusByDate({ data: buildCaseStatusDateRange$1() });
      return result.casesStatusByDate;
    },
    placeholderData: keepPreviousData
  });
};
const INBOX_USER_ROW_VARIANTS = {
  default: "default",
  panel: "panel"
};
const graphCaseStatuses = ["snoozed", "pending", "investigating", "closed"];
const graphStatusesColors = {
  snoozed: "#C1C0C8",
  pending: "#FFD57E",
  investigating: "#ADA7FD",
  closed: "#89D4AD"
};
const DEFAULT_TICKS_VALUES = [0, 200, 400, 600, 800, 1e3];
function getTotalValue(data) {
  return graphCaseStatuses.reduce((acc, status) => acc + data[status], 0);
}
function getLastTickValue(maxValue) {
  const highestPow10Divider = Math.max(10, Math.pow(10, Math.floor(Math.log10(maxValue))));
  return Math.ceil(maxValue / highestPow10Divider) * highestPow10Divider;
}
function getYAxisTicksValues(data) {
  if (!data.length) {
    return DEFAULT_TICKS_VALUES;
  }
  const maxValue = Math.max(...data.map(getTotalValue));
  if (maxValue === 0) {
    return DEFAULT_TICKS_VALUES;
  }
  const lastTickValue = getLastTickValue(maxValue);
  const ticksValues = Array.from({ length: 6 }, (_, i) => lastTickValue / 5 * i);
  return ticksValues;
}
const CaseByDateGraph = () => {
  const { t } = useTranslation(["cases", "common"]);
  const caseStatusByDateQuery = useCaseStatusByDate();
  const formatDateTime = useFormatDateTime();
  const language = useFormatLanguage();
  const [hovering, setHovering] = reactExports.useState(null);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-100 bg-surface-card rounded-lg p-md flex flex-col gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-s", children: t("cases:overview.graph.cases_by_status.title") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-grey-border rounded-lg p-sm bg-surface-card h-full flex flex-col gap-xs", children: M(caseStatusByDateQuery).with({ isPending: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid place-items-center h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-12" }) })).with({ isError: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid place-items-center h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-60 text-center", children: t("common:generic_fetch_data_error") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", onClick: () => caseStatusByDateQuery.refetch(), children: t("common:retry") })
    ] }) })).with({ isSuccess: true }, (query) => {
      if (!query.data) return null;
      const yAxisTicksValues = getYAxisTicksValues(query.data);
      const maxValue = yAxisTicksValues[yAxisTicksValues.length - 1];
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-grey-60", children: t("cases:overview.graph.count") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Xe,
          {
            enableLabel: false,
            data: query.data,
            keys: graphCaseStatuses,
            indexBy: "date",
            valueScale: { type: "linear", min: 0, max: maxValue },
            gridYValues: yAxisTicksValues,
            axisLeft: {
              legend: t("cases:overview.graph.count"),
              legendOffset: -70,
              tickValues: yAxisTicksValues,
              format: (value) => {
                return Intl.NumberFormat(language, { notation: "compact" }).format(value);
              }
            },
            axisBottom: {
              tickValues: query.data.filter((_, i, arr) => i === 0 || i === arr.length - 1 || i === Math.ceil(arr.length / 2)).map((d) => d.date),
              format: (value) => {
                return formatDateTime(value, {
                  month: "short",
                  day: "numeric"
                });
              }
            },
            margin: { top: 5, right: 5, bottom: 54, left: 50 },
            borderRadius: BAR_BORDER_RADIUS,
            borderWidth: BAR_BORDER_WIDTH,
            borderColor: { from: "color" },
            defs: [
              ...graphCaseStatuses.map(
                (status) => buildBarGradient(graphStatusesColors[status], `grad-${status}`)
              ),
              {
                id: "unhoverOpacity",
                type: "linearGradient",
                colors: [
                  { offset: 0, color: "inherit", opacity: 0.5 },
                  { offset: 100, color: "inherit", opacity: 0.5 }
                ]
              }
            ],
            fill: [
              ...graphCaseStatuses.map((status) => ({
                match: { id: status },
                id: `grad-${status}`
              })),
              ...hovering !== null ? [
                {
                  match: (n) => n.data.indexValue !== hovering,
                  id: "unhoverOpacity"
                }
              ] : []
            ],
            colorBy: "id",
            colors: ({ id }) => graphStatusesColors[id],
            padding: 0.3,
            layout: "vertical",
            onMouseEnter: (d) => setHovering(d.indexValue),
            onMouseLeave: () => setHovering(null),
            legends: [
              {
                dataFrom: "keys",
                anchor: "bottom",
                direction: "row",
                itemWidth: 100,
                itemHeight: 25,
                translateY: 54,
                symbolShape: "circle",
                symbolSize: 10,
                data: graphCaseStatuses.map((status) => ({
                  id: status,
                  label: t(`cases:case.status.${status}`),
                  color: graphStatusesColors[status]
                }))
              }
            ],
            tooltip: ({ data }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm w-auto max-w-max bg-surface-card p-sm rounded-lg border border-grey-border shadow-sm whitespace-nowrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-s text-grey-60", children: formatDateTime(data.date, { dateStyle: "medium" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-[calc(var(--spacing)_*_10)_1fr] gap-xs", children: graphCaseStatuses.map((caseStatus) => /* @__PURE__ */ jsxRuntimeExports.jsxs(reactExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: data[caseStatus] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(CaseStatusBadgeV2, { status: caseStatus, variant: "semi-full" })
              ] }, caseStatus)) })
            ] }),
            theme: nivoTheme
          }
        ) })
      ] });
    }).exhaustive() })
  ] });
};
function buildCaseStatusDateRange() {
  const now = /* @__PURE__ */ new Date();
  const todayMidnight = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const tenDaysAgo = new Date(todayMidnight.getTime() - 10 * 24 * 60 * 60 * 1e3);
  const tomorrowMidnight = new Date(todayMidnight.getTime() + 24 * 60 * 60 * 1e3);
  return {
    start: tenDaysAgo.toISOString(),
    end: tomorrowMidnight.toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
}
const useCaseStatusByInbox = () => {
  const getCaseStatusByInbox = useServerFn(getCaseStatusByInboxFn);
  return useQuery({
    queryKey: ["case-status-by-inbox"],
    queryFn: async () => {
      const result = await getCaseStatusByInbox({ data: buildCaseStatusDateRange() });
      return result.caseStatusByInbox;
    },
    placeholderData: keepPreviousData
  });
};
const CaseByInboxGraph = () => {
  const { t } = useTranslation(["cases", "common"]);
  const caseStatusByInboxQuery = useCaseStatusByInbox();
  const language = useFormatLanguage();
  const [hovering, setHovering] = reactExports.useState(null);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-100 bg-surface-card rounded-lg p-md flex flex-col gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-s", children: t("cases:overview.graph.cases_by_inbox.title") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-grey-border rounded-lg p-sm bg-surface-card h-full flex flex-col gap-xs", children: M(caseStatusByInboxQuery).with({ isPending: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid place-items-center h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-12" }) })).with({ isError: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid place-items-center h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-60 text-center", children: t("common:generic_fetch_data_error") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", onClick: () => caseStatusByInboxQuery.refetch(), children: t("common:retry") })
    ] }) })).with({ isSuccess: true }, (query) => {
      if (!query.data) return null;
      const yAxisTicksValues = getYAxisTicksValues(query.data);
      const maxValue = yAxisTicksValues[yAxisTicksValues.length - 1];
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-grey-60", children: t("cases:overview.graph.count") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Xe,
          {
            enableLabel: false,
            data: query.data,
            keys: graphCaseStatuses,
            indexBy: "inbox",
            valueScale: { type: "linear", min: 0, max: maxValue },
            gridYValues: yAxisTicksValues,
            axisLeft: {
              legend: t("cases:overview.graph.count"),
              legendOffset: -70,
              tickValues: yAxisTicksValues,
              format: (value) => {
                return Intl.NumberFormat(language, { notation: "compact" }).format(value);
              }
            },
            axisBottom: {
              tickRotation: -45,
              truncateTickAt: 10
            },
            margin: { top: 5, right: 5, bottom: 100, left: 50 },
            borderRadius: BAR_BORDER_RADIUS,
            borderWidth: BAR_BORDER_WIDTH,
            borderColor: { from: "color" },
            defs: [
              ...graphCaseStatuses.map(
                (status) => buildBarGradient(graphStatusesColors[status], `grad-${status}`)
              ),
              {
                id: "unhoverOpacity",
                type: "linearGradient",
                colors: [
                  { offset: 0, color: "inherit", opacity: 0.5 },
                  { offset: 100, color: "inherit", opacity: 0.5 }
                ]
              }
            ],
            fill: [
              ...graphCaseStatuses.map((status) => ({
                match: { id: status },
                id: `grad-${status}`
              })),
              ...hovering !== null ? [
                {
                  match: (n) => n.data.indexValue !== hovering,
                  id: "unhoverOpacity"
                }
              ] : []
            ],
            colorBy: "id",
            colors: ({ id }) => graphStatusesColors[id],
            padding: 0.3,
            layout: "vertical",
            onMouseEnter: (d) => setHovering(d.indexValue),
            onMouseLeave: () => setHovering(null),
            legends: [
              {
                dataFrom: "keys",
                anchor: "bottom",
                direction: "row",
                itemWidth: 100,
                itemHeight: 25,
                translateY: 100,
                symbolShape: "circle",
                symbolSize: 10,
                data: graphCaseStatuses.map((status) => ({
                  id: status,
                  label: t(`cases:case.status.${status}`),
                  color: graphStatusesColors[status]
                }))
              }
            ],
            tooltip: ({ id, value, data }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm w-auto max-w-max bg-surface-card p-sm rounded-lg border border-grey-border shadow-sm whitespace-nowrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-s text-grey-60", children: data.inbox }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-[calc(var(--spacing)_*_10)_1fr] gap-xs", children: graphCaseStatuses.map((caseStatus) => /* @__PURE__ */ jsxRuntimeExports.jsxs(reactExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: data[caseStatus] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(CaseStatusBadgeV2, { status: caseStatus, variant: "semi-full" })
              ] }, caseStatus)) })
            ] }),
            theme: nivoTheme
          }
        ) })
      ] });
    }).exhaustive() })
  ] });
};
const useGetAiSettingsQuery = () => {
  const getAiSettings = useServerFn(getAiSettingsFn);
  return useQuery({
    queryKey: ["cases", "ai-settings"],
    queryFn: async () => {
      const result = await getAiSettings();
      return result;
    }
  });
};
const useUpdateAiSettings = () => {
  const updateAiSettings = useServerFn(updateAiSettingsFn);
  return useMutation({
    mutationKey: ["cases", "ai-review", "update"],
    mutationFn: async (payload) => updateAiSettings({ data: payload })
  });
};
function LanguageDropdown({ value, onChange, disabled }) {
  const [open, setOpen] = reactExports.useState(false);
  const currentLanguage = languages.get(value) ?? "English";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { open: disabled ? false : open, onOpenChange: disabled ? void 0 : setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        disabled,
        className: "bg-purple-background text-purple-primary text-xs font-medium px-sm py-xs rounded-sm flex items-center gap-xs w-fit border border-transparent dark:bg-transparent dark:border-purple-primary disabled:opacity-50 disabled:cursor-not-allowed",
        children: [
          "Output language: ",
          currentLanguage,
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "caret-down", className: "size-4" })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Content, { sameWidth: true, sideOffset: 4, align: "start", className: "min-w-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.List, { children: Array.from(languages.entries()).map(([code, language]) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Item, { value: code, onSelect: () => onChange(code), children: language }, code)) }) })
  ] });
}
function AIConfigPanelContent({ settings, onSuccess, readOnly }) {
  const { t } = useTranslation(["cases", "common"]);
  const updateMutation = useUpdateAiSettings();
  const form = useForm({
    defaultValues: {
      caseReviewSetting: {
        language: settings.caseReviewSetting.language || "en",
        structure: settings.caseReviewSetting.structure || "",
        orgDescription: settings.caseReviewSetting.orgDescription || "",
        additionalCaseReviewInstruction: settings.caseReviewSetting.additionalCaseReviewInstruction || ""
      },
      kycEnrichmentSetting: {
        enabled: settings.kycEnrichmentSetting.enabled,
        customInstructions: settings.kycEnrichmentSetting.customInstructions || "",
        domainsFilter: settings.kycEnrichmentSetting.domainsFilter || []
      }
    },
    validators: {
      onSubmit: aiSettingSchema
    },
    onSubmit: ({ value }) => {
      return updateMutation.mutateAsync(value).then(() => {
        zt.success(t("common:success.save"));
        onSuccess?.();
      }).catch(() => {
        zt.error(t("common:errors.unknown"));
      });
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Container, { size: "small", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel.Content, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Header, { children: t("cases:overview.panel.ai_config.title") }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { id: "ai-config-panel-form", className: "flex flex-col gap-sm", onSubmit: handleSubmit(form), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-grey-background-light dark:bg-surface-card border border-grey-border rounded-lg p-md flex flex-col gap-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s font-medium", children: t("cases:ai_settings.general.title") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "caseReviewSetting.orgDescription", children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(FormLabel, { name: field.name, className: "text-xs flex items-center gap-sm", children: [
            t("cases:ai_settings.general.org_description.field.label"),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Tooltip.Default,
              {
                delayDuration: 300,
                className: "max-w-96",
                content: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-normal text-pretty", children: t("cases:ai_settings.general.org_description.field.tooltip") }),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "tip", className: "size-4 shrink-0 cursor-pointer text-purple-primary" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            FormTextArea,
            {
              name: field.name,
              onChange: (e) => field.handleChange(e.currentTarget.value),
              onBlur: field.handleBlur,
              defaultValue: field.state.value,
              valid: field.state.meta.errors.length === 0,
              resize: "vertical",
              className: "min-h-[140px] disabled:cursor-not-allowed",
              placeholder: t("cases:ai_settings.general.org_description.field.placeholder"),
              disabled: readOnly
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "caseReviewSetting.structure", children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(FormLabel, { name: field.name, className: "text-xs flex items-center gap-sm", children: [
            t("cases:ai_settings.general.structure.field.label"),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Tooltip.Default,
              {
                delayDuration: 300,
                className: "max-w-96",
                content: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-normal", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Trans,
                  {
                    t,
                    i18nKey: "cases:ai_settings.general.structure.field.tooltip",
                    components: {
                      DocLink: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { href: "https://www.markdownguide.org/basic-syntax/" })
                    }
                  }
                ) }),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "tip", className: "size-4 shrink-0 cursor-pointer text-purple-primary" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            FormTextArea,
            {
              name: field.name,
              onChange: (e) => field.handleChange(e.currentTarget.value),
              onBlur: field.handleBlur,
              defaultValue: field.state.value,
              valid: field.state.meta.errors.length === 0,
              resize: "vertical",
              className: "min-h-[140px] disabled:cursor-not-allowed",
              placeholder: t("cases:ai_settings.general.structure.field.placeholder"),
              disabled: readOnly
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "caseReviewSetting.language", children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(FormLabel, { name: field.name, className: "text-xs flex items-center gap-sm", children: [
            t("cases:ai_settings.general.language.field.label"),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Tooltip.Default,
              {
                delayDuration: 300,
                className: "max-w-96",
                content: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-normal", children: t("cases:ai_settings.general.language.field.tooltip") }),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "tip", className: "size-4 shrink-0 cursor-pointer text-purple-primary" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            LanguageDropdown,
            {
              value: field.state.value,
              onChange: (value) => field.handleChange(value),
              disabled: readOnly
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "caseReviewSetting.additionalCaseReviewInstruction", children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(FormLabel, { name: field.name, className: "text-xs flex items-center gap-sm", children: [
            t("cases:ai_settings.general.additional_instruction.field.label"),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Tooltip.Default,
              {
                delayDuration: 300,
                className: "max-w-96",
                content: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-normal text-pretty", children: t("cases:ai_settings.general.additional_instruction.field.tooltip") }),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "tip", className: "size-4 shrink-0 cursor-pointer text-purple-primary" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            FormTextArea,
            {
              name: field.name,
              onChange: (e) => field.handleChange(e.currentTarget.value),
              onBlur: field.handleBlur,
              defaultValue: field.state.value,
              valid: field.state.meta.errors.length === 0,
              resize: "vertical",
              className: "min-h-[140px] disabled:cursor-not-allowed",
              placeholder: t("cases:ai_settings.general.additional_instruction.field.placeholder"),
              disabled: readOnly
            }
          )
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-grey-background-light dark:bg-surface-card border border-grey-border rounded-lg p-md flex flex-col gap-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s font-medium", children: t("cases:overview.panel.ai_config.kyc_enrichment") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "kycEnrichmentSetting.enabled", children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-sm text-pretty", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Switch,
            {
              className: "shrink-0",
              checked: field.state.value,
              onCheckedChange: (val) => field.handleChange(val),
              disabled: readOnly
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-s text-grey-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Trans,
            {
              t,
              i18nKey: "cases:ai_settings.kyc_enrichment.enabled.field.label",
              ns: "cases",
              components: {
                bold: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-grey-primary" })
              }
            }
          ) }) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "kycEnrichmentSetting.customInstructions", children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(FormLabel, { name: field.name, className: "text-xs flex items-center gap-sm", children: [
            t("cases:ai_settings.kyc_enrichment.custom_instructions.field.label"),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Tooltip.Default,
              {
                delayDuration: 300,
                className: "max-w-96",
                content: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-normal", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Trans,
                  {
                    t,
                    i18nKey: "cases:ai_settings.kyc_enrichment.custom_instructions.field.tooltip",
                    components: {
                      DocLink: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { href: "https://www.markdownguide.org/basic-syntax/" })
                    }
                  }
                ) }),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "tip", className: "size-4 shrink-0 cursor-pointer text-purple-primary" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            FormTextArea,
            {
              name: field.name,
              onChange: (e) => field.handleChange(e.currentTarget.value),
              onBlur: field.handleBlur,
              defaultValue: field.state.value,
              valid: field.state.meta.errors.length === 0,
              resize: "vertical",
              className: "min-h-[140px] disabled:cursor-not-allowed",
              placeholder: t("cases:ai_settings.kyc_enrichment.custom_instructions.field.placeholder"),
              disabled: readOnly
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CalloutV2, { children: t("cases:ai_settings.kyc_enrichment_callout") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "kycEnrichmentSetting.domainsFilter", mode: "array", children: (domainsField) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
          domainsField.state.value.map((_, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: `kycEnrichmentSetting.domainsFilter[${idx}]`, children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-sm items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  className: "flex-1 [&>input]:disabled:cursor-not-allowed",
                  value: field.state.value,
                  onChange: (e) => {
                    field.handleChange(e.target.value);
                    domainsField.validate("change");
                  },
                  placeholder: t("cases:ai_settings.domains_filter.placeholder"),
                  disabled: readOnly
                }
              ),
              !readOnly && /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  mode: "icon",
                  variant: "secondary",
                  type: "button",
                  onClick: () => domainsField.removeValue(idx),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "delete", className: "size-4 text-purple-primary" })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
          ] }) }, idx)),
          !readOnly && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "primary",
              appearance: "stroked",
              disabled: domainsField.state.value.length >= 10,
              onClick: () => domainsField.pushValue(""),
              className: "w-fit",
              children: t("cases:ai_settings.kyc_enrichment.add_new.button")
            }
          )
        ] }) })
      ] })
    ] }),
    !readOnly && /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Footer, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(form.Subscribe, { selector: (state) => state.isSubmitting, children: (isSubmitting) => {
      const isPending = isSubmitting || updateMutation.isPending;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        Panel.FooterButton,
        {
          type: "submit",
          form: "ai-config-panel-form",
          variant: "primary",
          label: t("cases:overview.validate_config"),
          isLoading: isPending
        }
      );
    } }) })
  ] }) });
}
function UpsaleModal({ title, description, benefits = [], showWand = false }) {
  const { t } = useTranslation(["cases", "common"]);
  const [open, setOpen] = reactExports.useState(false);
  const displayTitle = title ?? t("cases:overview.upsale.title");
  const displayDescription = description ?? t("cases:overview.upsale.description");
  const handleContact = () => {
    window.open("https://checkmarble.com/upgrade", "_blank", "noopener,noreferrer");
    setOpen(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-xs cursor-pointer", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Tag,
        {
          color: "yellow",
          size: "small",
          className: "border border-[#fde9af] bg-[#fef6df] text-[#eea200] rounded-full flex items-center gap-xs",
          children: [
            t("cases:overview.upsale.discover"),
            showWand && /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "wand", className: "size-3" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "arrow-right", className: "size-5 text-purple-primary" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Content, { size: "small", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md p-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typo, { variant: "title2", children: displayTitle }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Tag,
            {
              color: "yellow",
              size: "small",
              className: "border border-[#fde9af] bg-[#fef6df] text-[#eea200] rounded-full flex items-center gap-xs",
              children: [
                t("cases:overview.upsale.discover"),
                showWand && /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "wand", className: "size-3" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-s text-grey-secondary", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-sm", children: displayDescription }),
          benefits.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "list-disc list-inside", children: benefits.map((benefit) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: benefit }, benefit)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-grey-border flex items-center justify-end gap-sm p-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Close, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", type: "button", children: t("common:cancel") }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "primary", onClick: handleContact, children: t("cases:overview.upsale.contact") })
      ] })
    ] })
  ] });
}
function ConfigRow({
  isRestricted: isRestricted2,
  canEdit,
  label,
  statusTag,
  editIcon = "edit",
  showWand,
  upsaleTitle,
  upsaleDescription,
  onClick
}) {
  const { t } = useTranslation(["cases"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: cn("border rounded-lg p-md flex flex-col gap-md", {
        "border-purple-secondary bg-purple-background-light": isRestricted2,
        "border-grey-border bg-surface-card": !isRestricted2
      }),
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex items-center gap-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s font-medium", children: label }),
          M({ isRestricted: isRestricted2, canEdit }).with({ isRestricted: true }, () => null).with({ canEdit: true }, () => statusTag).otherwise(() => /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "purple", size: "small", children: t("cases:overview.config.view_only") }))
        ] }),
        M({ isRestricted: isRestricted2, canEdit }).with({ isRestricted: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx(UpsaleModal, { title: upsaleTitle, description: upsaleDescription, showWand })).with({ canEdit: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx(
          Icon,
          {
            icon: editIcon,
            className: "size-5 cursor-pointer text-purple-primary hover:text-purple-hover",
            onClick
          }
        )).otherwise(() => /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "eye", className: "size-5 cursor-pointer text-purple-primary", onClick }))
      ] })
    }
  );
}
function AIConfigSection({ isGlobalAdmin, access }) {
  const { t } = useTranslation(["cases"]);
  const [aiConfigPanelOpen, setAiConfigPanelOpen] = reactExports.useState(false);
  const aiSettingsQuery = useGetAiSettingsQuery();
  const revalidate = useLoaderRevalidator();
  const restricted = isRestricted(access);
  const hasAccess = isAccessible(access);
  const canEdit = hasAccess && isGlobalAdmin;
  const handleOpenPanel = () => {
    if (!aiSettingsQuery.data) return;
    setAiConfigPanelOpen(true);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-sm h-7", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 text-s font-medium", children: t("cases:overview.config.ai_title") }) }),
    M(aiSettingsQuery).with({ isPending: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-grey-border rounded-lg p-md bg-surface-card flex items-center justify-center min-h-[100px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-6" }) })).with({ isError: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-grey-border rounded-lg p-md bg-surface-card flex items-center justify-center min-h-[100px] text-red-primary", children: t("cases:overview.config.error_loading") })).with({ isSuccess: true }, ({ data }) => {
      if (!data?.settings) return null;
      const settings = data.settings;
      const isGeneralConfigured = settings.caseReviewSetting.orgDescription || settings.caseReviewSetting.structure;
      const isKycEnabled = settings.kycEnrichmentSetting.enabled;
      const isKycConfigured = isKycEnabled && (settings.kycEnrichmentSetting.customInstructions || settings.kycEnrichmentSetting.domainsFilter.length > 0);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          ConfigRow,
          {
            isRestricted: restricted,
            canEdit,
            label: t("cases:overview.config.ai_review"),
            statusTag: /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: isGeneralConfigured ? "green" : "orange", size: "small", children: isGeneralConfigured ? t("cases:overview.config.configured") : t("cases:overview.config.not_configured") }),
            editIcon: "edit",
            upsaleTitle: t("cases:overview.upsale.ai_config.title"),
            upsaleDescription: t("cases:overview.upsale.ai_config.description"),
            onClick: handleOpenPanel
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          ConfigRow,
          {
            isRestricted: restricted,
            canEdit,
            label: t("cases:ai_settings.kyc_enrichment.title"),
            showWand: true,
            statusTag: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: isKycEnabled ? "green" : "grey", size: "small", children: isKycEnabled ? t("cases:overview.config.active") : t("cases:overview.config.inactive") }),
              isKycEnabled && !isKycConfigured && /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "orange", size: "small", className: "whitespace-nowrap", children: t("cases:overview.config.not_configured") })
            ] }),
            editIcon: "arrow-right",
            upsaleTitle: t("cases:overview.upsale.ai_config.title"),
            upsaleDescription: t("cases:overview.upsale.ai_config.description"),
            onClick: handleOpenPanel
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Root, { open: aiConfigPanelOpen, onOpenChange: setAiConfigPanelOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          AIConfigPanelContent,
          {
            settings: data.settings,
            readOnly: !canEdit,
            onSuccess: () => {
              revalidate();
              setAiConfigPanelOpen(false);
              aiSettingsQuery.refetch();
            }
          }
        ) })
      ] });
    }).exhaustive()
  ] });
}
const InboxUserRow = ({
  user,
  checked,
  onToggle,
  variant = INBOX_USER_ROW_VARIANTS.default
}) => {
  const { t } = useTranslation(["cases"]);
  const { getOrgUserById } = useOrganizationUsers();
  const orgUser = getOrgUserById(user.userId);
  const userName = getFullName(orgUser) ?? t("cases:overview.inbox.unknown_user");
  const roleLabel = user.role === "admin" ? t("cases:overview.inbox.role.admin") : user.role === "member" ? t("cases:overview.inbox.role.member") : user.role;
  const isChecked = checked ?? user.autoAssignable;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("flex items-center gap-sm", { "ps-3xl": variant === INBOX_USER_ROW_VARIANTS.default }), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex items-center gap-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: userName }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "purple", size: "small", children: roleLabel })
    ] }),
    variant === INBOX_USER_ROW_VARIANTS.default && /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: isChecked ? "green" : "grey", size: "small", children: isChecked ? t("cases:overview.config.active") : t("cases:overview.config.inactive") }),
    variant === INBOX_USER_ROW_VARIANTS.panel && /* @__PURE__ */ jsxRuntimeExports.jsx(
      Switch,
      {
        checked: isChecked,
        disabled: !onToggle,
        onCheckedChange: (newChecked) => onToggle?.(user.id, newChecked)
      }
    )
  ] });
};
function useUpdateAutoAssignMutation() {
  const updateAutoAssign = useServerFn(updateAutoAssignFn);
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["cases", "update-auto-assign"],
    mutationFn: async (payload) => updateAutoAssign({ data: payload }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["cases", "inboxes"] });
    }
  });
}
const InboxCard = ({
  inbox,
  inboxChecked,
  userCheckedMap,
  onToggleInbox,
  onToggleUser,
  disabled
}) => {
  const { t } = useTranslation(["cases"]);
  const hasUsers = inbox.users?.length > 0;
  const isInboxChecked = inboxChecked ?? inbox.autoAssignEnabled;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-grey-border rounded-lg p-md bg-grey-background-light dark:bg-surface-card flex flex-col gap-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex items-center gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s font-medium", children: inbox.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "purple", size: "small", children: t("cases:overview.inbox.cases_count", { count: inbox.casesCount }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Switch,
        {
          checked: isInboxChecked,
          disabled,
          onCheckedChange: (checked) => onToggleInbox?.(inbox.id, checked)
        }
      )
    ] }),
    hasUsers && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-sm", children: inbox.users.map((user) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      InboxUserRow,
      {
        user,
        checked: userCheckedMap?.[user.id],
        onToggle: disabled ? void 0 : onToggleUser,
        variant: INBOX_USER_ROW_VARIANTS.panel
      },
      user.id
    )) })
  ] });
};
const AutoAssignmentPanelContent = ({
  currentUserId,
  isGlobalAdmin,
  hasEntitlement
}) => {
  const panelSharp = PanelSharpFactory.useSharp();
  const { t } = useTranslation(["cases", "common"]);
  const inboxesQuery = useGetInboxesQuery();
  const updateAutoAssignMutation = useUpdateAutoAssignMutation();
  const revalidate = useLoaderRevalidator();
  const [changes, setChanges] = reactExports.useState({
    inboxes: {},
    users: {}
  });
  const allInboxes = inboxesQuery.data?.inboxes ?? [];
  const isInboxMember = (inbox) => inbox.users.some((u) => u.userId === currentUserId);
  const isInboxAdmin = (inbox) => inbox.users.some((u) => u.userId === currentUserId && u.role === "admin");
  const canEditInbox = (inbox) => hasEntitlement && (isGlobalAdmin || isInboxAdmin(inbox));
  const inboxes = isGlobalAdmin ? allInboxes : allInboxes.filter(isInboxMember);
  const canSave = hasEntitlement && (isGlobalAdmin || inboxes.some(isInboxAdmin));
  const handleToggleInbox = (inboxId, checked) => {
    const inbox = inboxes.find((i) => i.id === inboxId);
    const originalValue = inbox?.autoAssignEnabled ?? false;
    setChanges((prev) => {
      const newInboxes = { ...prev.inboxes };
      if (checked === originalValue) {
        delete newInboxes[inboxId];
      } else {
        newInboxes[inboxId] = checked;
      }
      return { ...prev, inboxes: newInboxes };
    });
  };
  const handleToggleUser = (userId, checked) => {
    const user = inboxes.flatMap((i) => i.users).find((u) => u.id === userId);
    const originalValue = user?.autoAssignable ?? false;
    setChanges((prev) => {
      const newUsers = { ...prev.users };
      if (checked === originalValue) {
        delete newUsers[userId];
      } else {
        newUsers[userId] = checked;
      }
      return { ...prev, users: newUsers };
    });
  };
  const handleSave = () => {
    updateAutoAssignMutation.mutate(
      { inboxes: changes.inboxes, users: changes.users },
      {
        onSuccess: () => {
          zt.success(t("cases:overview.panel.auto_assignment.saved"));
          revalidate();
          panelSharp.actions.close();
        },
        onError: () => {
          zt.error(t("common:errors.unknown"));
        }
      }
    );
  };
  const hasChanges = Object.keys(changes.inboxes).length > 0 || Object.keys(changes.users).length > 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Container, { size: "small", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel.Content, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Header, { children: t("cases:overview.panel.auto_assignment.title") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grow", children: M(inboxesQuery).with({ isPending: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-8" }) })).with({ isError: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-s text-grey-secondary py-sm", children: t("cases:overview.config.error_loading") })).with({ isSuccess: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-md", children: inboxes.map((inbox) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      InboxCard,
      {
        inbox,
        inboxChecked: changes.inboxes[inbox.id],
        userCheckedMap: changes.users,
        onToggleInbox: handleToggleInbox,
        onToggleUser: handleToggleUser,
        disabled: !canEditInbox(inbox)
      },
      inbox.id
    )) })).exhaustive() }),
    canSave ? /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Footer, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Panel.FooterButton,
      {
        onClick: handleSave,
        disabled: !hasChanges,
        isLoading: updateAutoAssignMutation.isPending,
        label: t("cases:overview.validate")
      }
    ) }) : null
  ] }) });
};
const MAX_DISPLAYED_INBOXES = 3;
const AutoAssignmentSection = ({ currentUserId, isGlobalAdmin, access }) => {
  const { t } = useTranslation(["cases"]);
  const inboxesQuery = useGetInboxesQuery();
  const [autoAssignPanelOpen, setAutoAssignPanelOpen] = reactExports.useState(false);
  const [expandedInboxIds, setExpandedInboxIds] = reactExports.useState([]);
  const restricted = isRestricted(access);
  const hasAccess = isAccessible(access);
  const canEdit = hasAccess && isGlobalAdmin;
  const isInboxMember = (inbox) => inbox.users.some((u) => u.userId === currentUserId);
  const handleOpenPanel = () => {
    setAutoAssignPanelOpen(true);
  };
  const toggleInbox = (inboxId) => {
    setExpandedInboxIds((prev) => prev.includes(inboxId) ? prev.filter((id) => id !== inboxId) : [...prev, inboxId]);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn("border rounded-lg p-md flex flex-col gap-md", {
        "border-purple-secondary bg-purple-background-light": restricted,
        "border-grey-border bg-surface-card": !restricted
      }),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 font-medium text-s", children: t("cases:overview.panel.auto_assignment.title") }),
          M({ restricted, canEdit }).with({ restricted: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx(
            UpsaleModal,
            {
              title: t("cases:overview.upsale.auto_assignment.title"),
              description: t("cases:overview.upsale.auto_assignment.description")
            }
          )).with({ canEdit: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx(
            Icon,
            {
              icon: "edit",
              className: "size-5 cursor-pointer text-purple-primary hover:text-purple-50",
              onClick: handleOpenPanel
            }
          )).otherwise(() => /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "eye", className: "size-5 cursor-pointer text-purple-primary", onClick: handleOpenPanel }))
        ] }),
        !restricted ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-sm", children: M(inboxesQuery).with({ isPending: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-6" }) })).with({ isError: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-s text-grey-secondary", children: t("cases:overview.config.error_loading") })).with({ isSuccess: true }, ({ data }) => {
          const allInboxes = data?.inboxes ?? [];
          const inboxes = isGlobalAdmin ? allInboxes : allInboxes.filter(isInboxMember);
          const displayedInboxes = inboxes.slice(0, MAX_DISPLAYED_INBOXES);
          const hasMore = inboxes.length > MAX_DISPLAYED_INBOXES;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            displayedInboxes.map((inbox) => {
              const isExpanded = expandedInboxIds.includes(inbox.id);
              const hasUsers = inbox.users?.length > 0;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Icon,
                    {
                      icon: "arrow-down",
                      className: cn("size-5 text-purple-primary", {
                        "-rotate-90": !isExpanded,
                        "cursor-pointer": hasUsers,
                        invisible: !hasUsers
                      }),
                      onClick: hasUsers ? () => toggleInbox(inbox.id) : void 0
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex items-center gap-xs min-w-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s line-clamp-2", children: inbox.name }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "purple", size: "small", children: t("cases:overview.inbox.cases_count", { count: inbox.casesCount }) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: inbox.autoAssignEnabled ? "green" : "grey", size: "small", children: inbox.autoAssignEnabled ? t("cases:overview.config.active") : t("cases:overview.config.inactive") })
                ] }),
                isExpanded && hasUsers ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-sm", children: inbox.users.map((user) => /* @__PURE__ */ jsxRuntimeExports.jsx(InboxUserRow, { user }, user.id)) }) : null
              ] }, inbox.id);
            }),
            hasMore ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", appearance: "link", onClick: handleOpenPanel, children: t("cases:overview.config.view_more") }) : null
          ] });
        }).exhaustive() }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Root, { open: autoAssignPanelOpen, onOpenChange: setAutoAssignPanelOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          AutoAssignmentPanelContent,
          {
            currentUserId,
            isGlobalAdmin,
            hasEntitlement: hasAccess
          }
        ) })
      ]
    }
  );
};
const useUpdateInboxEscalationMutation = () => {
  const updateInboxEscalation = useServerFn(updateInboxEscalationFn);
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["cases", "inboxes", "update-escalation"],
    mutationFn: async (payload) => updateInboxEscalation({ data: payload }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["cases", "inboxes"] });
    }
  });
};
const EscalationConditionRow = ({
  condition,
  allInboxesMetadata,
  usedSourceIds,
  onUpdate,
  onRemove,
  disabled
}) => {
  const { t } = useTranslation(["cases"]);
  const [sourceOpen, setSourceOpen] = reactExports.useState(false);
  const [targetOpen, setTargetOpen] = reactExports.useState(false);
  const sourceInbox = allInboxesMetadata.find((i) => i.id === condition.sourceInboxId);
  const targetInbox = allInboxesMetadata.find((i) => i.id === condition.targetInboxId);
  const availableSourceInboxes = allInboxesMetadata.filter(
    (i) => !usedSourceIds.includes(i.id) && i.id !== condition.targetInboxId
  );
  const availableTargetInboxes = allInboxesMetadata.filter((i) => i.id !== condition.sourceInboxId);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-secondary px-xs", children: t("cases:overview.panel.escalation.from") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { open: disabled ? false : sourceOpen, onOpenChange: disabled ? void 0 : setSourceOpen, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.SelectButton, { className: "w-full", disabled, children: sourceInbox?.name ?? t("cases:overview.panel.escalation.select_inbox") }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Content, { align: "start", sameWidth: true, sideOffset: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.List, { children: availableSourceInboxes.map((inbox) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        MenuCommand.Item,
        {
          value: inbox.id,
          onSelect: () => {
            onUpdate("sourceInboxId", inbox.id);
            setSourceOpen(false);
          },
          children: inbox.name
        },
        inbox.id
      )) }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-secondary px-xs", children: t("cases:overview.panel.escalation.escalate_to") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { open: disabled ? false : targetOpen, onOpenChange: disabled ? void 0 : setTargetOpen, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.SelectButton, { className: "w-full", disabled, children: targetInbox?.name ?? t("cases:overview.panel.escalation.select_inbox") }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Content, { align: "start", sameWidth: true, sideOffset: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.List, { children: availableTargetInboxes.map((inbox) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        MenuCommand.Item,
        {
          value: inbox.id,
          onSelect: () => {
            onUpdate("targetInboxId", inbox.id);
            setTargetOpen(false);
          },
          children: inbox.name
        },
        inbox.id
      )) }) })
    ] }) }),
    !disabled && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { mode: "icon", variant: "secondary", onClick: onRemove, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "delete", className: "size-4 text-purple-primary" }) })
  ] });
};
const EscalationConditionsPanelContent = ({
  readOnly,
  allInboxesMetadata
}) => {
  const panelSharp = PanelSharpFactory.useSharp();
  const { t } = useTranslation(["cases", "common"]);
  const inboxesQuery = useGetInboxesQuery();
  const updateEscalationMutation = useUpdateInboxEscalationMutation();
  const revalidate = useLoaderRevalidator();
  const baseId = reactExports.useId();
  const [conditions, setConditions] = reactExports.useState([]);
  const conditionCounterRef = reactExports.useRef(0);
  const inboxes = inboxesQuery.data?.inboxes ?? [];
  reactExports.useEffect(() => {
    if (inboxesQuery.isSuccess) {
      const existingConditions = (inboxesQuery.data?.inboxes ?? []).filter((inbox) => inbox.escalationInboxId).map((inbox, idx) => ({
        id: `existing-${inbox.id}-${idx}`,
        sourceInboxId: inbox.id,
        targetInboxId: inbox.escalationInboxId ?? null
      }));
      setConditions(existingConditions);
    }
  }, [inboxesQuery.data]);
  const handleAddCondition = reactExports.useCallback(() => {
    const counter = conditionCounterRef.current++;
    setConditions((prev) => [...prev, { id: `${baseId}-new-${counter}`, sourceInboxId: "", targetInboxId: null }]);
  }, [baseId]);
  const handleRemoveCondition = reactExports.useCallback((id) => {
    setConditions((prev) => prev.filter((c) => c.id !== id));
  }, []);
  const handleUpdateCondition = reactExports.useCallback(
    (id, field, value) => {
      setConditions((prev) => prev.map((cond) => cond.id === id ? { ...cond, [field]: value } : cond));
    },
    []
  );
  const handleSave = () => {
    const originalConditions = new Map(
      inboxes.filter((inbox) => inbox.escalationInboxId).map((inbox) => [inbox.id, inbox.escalationInboxId])
    );
    const currentConditions = new Map(
      conditions.filter((c) => c.sourceInboxId && c.targetInboxId).map((c) => [c.sourceInboxId, c.targetInboxId])
    );
    const updates = [];
    for (const [sourceId] of originalConditions) {
      if (!currentConditions.has(sourceId)) {
        updates.push({ inboxId: sourceId, escalationInboxId: null });
      }
    }
    for (const [sourceId, targetId] of currentConditions) {
      const originalTarget = originalConditions.get(sourceId);
      if (originalTarget !== targetId) {
        updates.push({ inboxId: sourceId, escalationInboxId: targetId });
      }
    }
    updateEscalationMutation.mutate(
      { updates },
      {
        onSuccess: () => {
          zt.success(t("cases:overview.panel.escalation.saved"));
          revalidate();
          panelSharp.actions.close();
        },
        onError: () => {
          zt.error(t("common:errors.unknown"));
        }
      }
    );
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Container, { size: "small", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel.Content, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Header, { children: t("cases:overview.panel.escalation.title") }),
    M(inboxesQuery).with({ isPending: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-8" }) })).with({ isError: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-s text-grey-secondary py-sm", children: t("cases:overview.config.error_loading") })).with({ isSuccess: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-grey-border rounded-lg p-md bg-grey-background-light dark:bg-surface-card flex flex-col gap-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-s font-medium", children: t("cases:overview.panel.escalation.conditions_title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md", children: [
        conditions.map((condition) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          EscalationConditionRow,
          {
            condition,
            allInboxesMetadata,
            usedSourceIds: conditions.filter((c) => c.id !== condition.id).map((c) => c.sourceInboxId),
            onUpdate: (field, value) => handleUpdateCondition(condition.id, field, value),
            onRemove: () => handleRemoveCondition(condition.id),
            disabled: readOnly
          },
          condition.id
        )),
        readOnly || conditions.length === inboxes.length ? null : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "primary", appearance: "stroked", onClick: handleAddCondition, children: t("cases:overview.panel.escalation.add_condition") }) })
      ] })
    ] }) })).exhaustive(),
    readOnly ? null : /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Footer, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Panel.FooterButton,
      {
        onClick: handleSave,
        isLoading: updateEscalationMutation.isPending,
        label: t("cases:overview.validate_config")
      }
    ) })
  ] }) });
};
const useUpdateInboxWorkflowMutation = () => {
  const updateInboxWorkflow = useServerFn(updateInboxWorkflowFn);
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["cases", "inboxes", "update-workflow"],
    mutationFn: async (payload) => updateInboxWorkflow({ data: payload }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["cases", "inboxes"] });
    }
  });
};
const WorkflowInboxCard = ({ inbox, settings, onToggle, disabled, defaultOpen }) => {
  const { t } = useTranslation(["cases"]);
  const [isOpen, setIsOpen] = reactExports.useState(defaultOpen ?? false);
  const isConfigured = settings.caseReviewManual || settings.caseReviewOnCaseCreated || settings.caseReviewOnEscalate;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Root, { open: isOpen, onOpenChange: setIsOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-grey-border rounded-lg bg-grey-background-light flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Trigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        className: "flex items-center gap-sm p-md w-full text-left hover:bg-grey-background-light rounded-lg transition-colors",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Icon,
            {
              icon: "caret-down",
              className: cn("size-5 text-grey-secondary transition-transform", { "-rotate-90": !isOpen })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 text-m font-semibold", children: inbox.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: isConfigured ? "green" : "grey", size: "small", children: isConfigured ? t("cases:overview.config.configured") : t("cases:overview.config.inactive") })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm px-md pb-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: `${inbox.id}-caseReviewOnCaseCreated`, className: "flex items-center gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Switch,
          {
            id: `${inbox.id}-caseReviewOnCaseCreated`,
            checked: settings.caseReviewOnCaseCreated,
            onCheckedChange: (checked) => onToggle("caseReviewOnCaseCreated", checked),
            disabled
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s", children: t("cases:overview.workflow.case_created") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: `${inbox.id}-caseReviewOnEscalate`, className: "flex items-center gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Switch,
          {
            id: `${inbox.id}-caseReviewOnEscalate`,
            checked: settings.caseReviewOnEscalate,
            onCheckedChange: (checked) => onToggle("caseReviewOnEscalate", checked),
            disabled
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s", children: t("cases:overview.workflow.case_escalated") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: `${inbox.id}-caseReviewManual`, className: "flex items-center gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Switch,
          {
            id: `${inbox.id}-caseReviewManual`,
            checked: settings.caseReviewManual,
            onCheckedChange: (checked) => onToggle("caseReviewManual", checked),
            disabled
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s", children: t("cases:overview.workflow.manual_request") })
      ] })
    ] }) })
  ] }) });
};
const WorkflowConfigPanelContent = ({ readOnly }) => {
  const panelSharp = PanelSharpFactory.useSharp();
  const { t } = useTranslation(["cases", "common"]);
  const inboxesQuery = useGetInboxesQuery();
  const updateWorkflowMutation = useUpdateInboxWorkflowMutation();
  const revalidate = useLoaderRevalidator();
  const [workflowState, setWorkflowState] = reactExports.useState(/* @__PURE__ */ new Map());
  const inboxes = inboxesQuery.data?.inboxes ?? [];
  reactExports.useEffect(() => {
    if (inboxesQuery.isSuccess) {
      const initialState = /* @__PURE__ */ new Map();
      for (const inbox of inboxesQuery.data?.inboxes ?? []) {
        initialState.set(inbox.id, {
          caseReviewManual: inbox.caseReviewManual,
          caseReviewOnCaseCreated: inbox.caseReviewOnCaseCreated,
          caseReviewOnEscalate: inbox.caseReviewOnEscalate
        });
      }
      setWorkflowState(initialState);
    }
  }, [inboxesQuery.data]);
  const handleToggle = (inboxId, field, value) => {
    setWorkflowState((prev) => {
      const newState = new Map(prev);
      const current = newState.get(inboxId);
      if (current) {
        newState.set(inboxId, { ...current, [field]: value });
      }
      return newState;
    });
  };
  const handleSave = () => {
    const updates = [];
    for (const inbox of inboxes) {
      const currentSettings = workflowState.get(inbox.id);
      if (!currentSettings) continue;
      const hasChanged = currentSettings.caseReviewManual !== inbox.caseReviewManual || currentSettings.caseReviewOnCaseCreated !== inbox.caseReviewOnCaseCreated || currentSettings.caseReviewOnEscalate !== inbox.caseReviewOnEscalate;
      if (hasChanged) {
        updates.push({
          inboxId: inbox.id,
          caseReviewManual: currentSettings.caseReviewManual,
          caseReviewOnCaseCreated: currentSettings.caseReviewOnCaseCreated,
          caseReviewOnEscalate: currentSettings.caseReviewOnEscalate
        });
      }
    }
    if (updates.length > 0) {
      updateWorkflowMutation.mutate(
        { updates },
        {
          onSuccess: () => {
            zt.success(t("cases:overview.panel.workflow.saved"));
            revalidate();
            panelSharp.actions.close();
          },
          onError: () => {
            zt.error(t("common:errors.unknown"));
          }
        }
      );
    } else {
      panelSharp.actions.close();
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Container, { size: "small", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel.Content, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Header, { children: t("cases:overview.panel.workflow.title") }),
    M(inboxesQuery).with({ isPending: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-8" }) })).with({ isError: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-s text-grey-secondary py-sm", children: t("cases:overview.config.error_loading") })).with({ isSuccess: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-md", children: inboxes.map((inbox) => {
      const settings = workflowState.get(inbox.id);
      if (!settings) return null;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        WorkflowInboxCard,
        {
          inbox,
          settings,
          onToggle: (field, value) => handleToggle(inbox.id, field, value),
          disabled: readOnly,
          defaultOpen: inboxes.length < 6
        },
        inbox.id
      );
    }) })).exhaustive(),
    readOnly ? null : /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Footer, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Panel.FooterButton,
      {
        onClick: handleSave,
        isLoading: updateWorkflowMutation.isPending,
        label: t("cases:overview.validate_config")
      }
    ) })
  ] }) });
};
const WorkflowConfigSection = ({
  isGlobalAdmin,
  aiAssistAccess,
  allInboxesMetadata
}) => {
  const { t } = useTranslation(["cases"]);
  const [escalationPanelOpen, setEscalationPanelOpen] = reactExports.useState(false);
  const [workflowPanelOpen, setWorkflowPanelOpen] = reactExports.useState(false);
  const inboxesQuery = useGetInboxesQuery();
  const aiAssistHasAccess = isAccessible(aiAssistAccess);
  const handleOpenEscalationPanel = () => {
    setEscalationPanelOpen(true);
  };
  const canEditAiReview = aiAssistHasAccess && isGlobalAdmin;
  const handleOpenWorkflowPanel = () => {
    setWorkflowPanelOpen(true);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-sm h-7", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 text-s font-medium", children: t("cases:overview.config.workflow_title") }) }),
    M(inboxesQuery).with({ isPending: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-grey-border rounded-lg p-md bg-surface-card flex items-center justify-center min-h-[100px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-6" }) })).with({ isError: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-grey-border rounded-lg p-md bg-surface-card flex items-center justify-center min-h-[100px] text-red-primary", children: t("cases:overview.config.error_loading") })).with({ isSuccess: true }, ({ data }) => {
      const inboxes = data?.inboxes ?? [];
      const escalationConfigured = inboxes.filter((i) => i.escalationInboxId).length;
      const escalationTotal = inboxes.length;
      const hasEscalationConfig = escalationConfigured > 0;
      const workflowConfigured = inboxes.filter(
        (i) => i.caseReviewManual || i.caseReviewOnCaseCreated || i.caseReviewOnEscalate
      ).length;
      const hasWorkflowConfig = workflowConfigured > 0;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          ConfigRow,
          {
            isRestricted: false,
            canEdit: isGlobalAdmin,
            label: t("cases:overview.config.escalation_conditions"),
            statusTag: /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: hasEscalationConfig ? "green" : "orange", size: "small", children: hasEscalationConfig ? t("cases:overview.config.x_of_y_configured", {
              configured: escalationConfigured,
              total: escalationTotal
            }) : t("cases:overview.config.not_configured") }),
            editIcon: "edit",
            upsaleTitle: t("cases:overview.upsale.workflow_config.title"),
            upsaleDescription: t("cases:overview.upsale.workflow_config.description"),
            onClick: handleOpenEscalationPanel
          }
        ),
        isGlobalAdmin ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          ConfigRow,
          {
            isRestricted: !aiAssistHasAccess,
            canEdit: canEditAiReview,
            label: t("cases:overview.config.ai_review_trigger"),
            statusTag: /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: hasWorkflowConfig ? "green" : "orange", size: "small", children: hasWorkflowConfig ? t("cases:overview.config.x_of_y_configured", {
              configured: workflowConfigured,
              total: escalationTotal
            }) : t("cases:overview.config.not_configured") }),
            editIcon: "arrow-right",
            upsaleTitle: t("cases:overview.upsale.workflow_config.title"),
            upsaleDescription: t("cases:overview.upsale.workflow_config.description"),
            onClick: handleOpenWorkflowPanel
          }
        ) : null
      ] });
    }).exhaustive(),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Root, { open: escalationPanelOpen, onOpenChange: setEscalationPanelOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsx(EscalationConditionsPanelContent, { readOnly: !isGlobalAdmin, allInboxesMetadata }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Root, { open: workflowPanelOpen, onOpenChange: setWorkflowPanelOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsx(WorkflowConfigPanelContent, { readOnly: !canEditAiReview }) })
  ] });
};
const OverviewPage = ({
  currentUserId,
  isGlobalAdmin,
  canViewAdminSections,
  allInboxesMetadata,
  entitlements
}) => {
  const { t } = useTranslation(["cases"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Page.Main, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Page.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[1fr_calc(var(--spacing-xs)_*_90)] gap-lg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CasesNavigationTabs, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-2 gap-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CaseByDateGraph, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CaseByInboxGraph, {})
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typo, { variant: "title2", children: t("cases:overview.general_config.title") }),
      canViewAdminSections ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        AutoAssignmentSection,
        {
          currentUserId,
          isGlobalAdmin,
          access: entitlements.autoAssignment
        }
      ) : null,
      canViewAdminSections ? /* @__PURE__ */ jsxRuntimeExports.jsx(AIConfigSection, { isGlobalAdmin, access: entitlements.aiAssist }) : null,
      canViewAdminSections ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        WorkflowConfigSection,
        {
          isGlobalAdmin,
          aiAssistAccess: entitlements.aiAssist,
          allInboxesMetadata
        }
      ) : null
    ] })
  ] }) }) });
};
function CasesOverview() {
  const loaderData = Route.useLoaderData();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewPage, { ...loaderData });
}
export {
  CasesOverview as component
};
