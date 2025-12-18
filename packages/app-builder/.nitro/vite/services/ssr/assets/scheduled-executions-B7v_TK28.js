import { r as reactExports, R as jsxRuntimeExports } from "../server.js";
import { u as useTranslation, q as useFormatLanguage, t as useFormatDateTime, dA as formatNumber, ej as useVirtualTable, em as getCoreRowModel, ek as Table, el as createColumnHelper, e as Icon, T as Typo } from "./format-NPGUXq-g.js";
import { ab as scenarioI18n, L as Link, ao as Route, P as Page, B as BreadCrumbs } from "./router-vb7i5euz.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
import "./services-middleware-DR8Hua1Y.js";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "./sharpstate.es-CeF1Mf5b.js";
import "./isNullish-B8pc8Ntu.js";
import "./use-callback-ref-DXzIzfqy.js";
import "./QueryClientProvider-DYTpkCko.js";
import "./security-headers.server-BdP3HrPp.js";
import "./ThemeContext-B40HQxfH.js";
import "./config-ut8rAdyo.js";
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
const columnHelper = createColumnHelper();
function ScheduledExecutionsList({ scheduledExecutions }) {
  const { t } = useTranslation(scenarioI18n);
  const language = useFormatLanguage();
  const formatDateTime = useFormatDateTime();
  const columns = reactExports.useMemo(
    () => [
      columnHelper.accessor((s) => s.numberOfCreatedDecisions, {
        id: "number-of-created-decisions",
        cell: ({ row, getValue }) => {
          const numberOfCreatedDecisions = getValue();
          const formattedNumber = formatNumber(numberOfCreatedDecisions, {
            language
          });
          if (numberOfCreatedDecisions > 0) {
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              Link,
              {
                to: "/detection/decisions",
                search: { scheduledExecutionId: [row.original.id] },
                className: "hover:text-purple-hover focus:text-purple-hover text-purple-primary relative font-semibold hover:underline focus:underline",
                children: formattedNumber
              }
            );
          }
          return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formattedNumber });
        },
        header: t("scenarios:scheduled_execution.number_of_created_decisions"),
        size: 100
      }),
      columnHelper.accessor((s) => s.numberOfEvaluatedDecisions, {
        id: "number-of-evaluated-decisions",
        cell: ({ getValue }) => {
          const numberOfEvaluatedDecisions = getValue();
          return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatNumber(numberOfEvaluatedDecisions, {
            language
          }) });
        },
        header: t("scenarios:scheduled_execution.number_of_evaluated_decisions"),
        size: 100
      }),
      columnHelper.accessor((s) => s.numberOfPlannedDecisions, {
        id: "number-of-planned-decisions",
        cell: ({ getValue }) => {
          const numberOfPlannedDecisions = getValue();
          if (numberOfPlannedDecisions === null) {
            return null;
          }
          return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatNumber(numberOfPlannedDecisions, {
            language
          }) });
        },
        header: t("scenarios:scheduled_execution.number_of_planned_decisions"),
        size: 100
      }),
      columnHelper.accessor((s) => s.status, {
        id: "status",
        cell: ({ getValue }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row items-center gap-sm", children: [
          getStatusIcon(getValue()),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "capitalize", children: t(getStatusTKey(getValue())) })
        ] }),
        header: t("scenarios:scheduled_execution.status"),
        size: 100
      }),
      columnHelper.accessor((s) => formatDateTime(s.startedAt, { dateStyle: "short", timeStyle: "short" }), {
        id: "created_at",
        header: t("scenarios:scheduled_execution.created_at"),
        size: 100,
        cell: ({ getValue, cell }) => {
          return /* @__PURE__ */ jsxRuntimeExports.jsx("time", { dateTime: cell.row.original.startedAt, children: getValue() });
        }
      })
    ],
    [formatDateTime, language, t]
  );
  const { table, getBodyProps, rows, getContainerProps } = useVirtualTable({
    data: scheduledExecutions,
    columns,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Table.Container, { ...getContainerProps(), className: "bg-surface-card max-h-[70dvh]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Header, { headerGroups: table.getHeaderGroups() }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Body, { ...getBodyProps(), children: rows.map((row) => {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Row, { row }, row.id);
    }) })
  ] });
}
const getStatusIcon = (status) => {
  if (status === "success") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "tick", className: "text-green-primary size-6 shrink-0" });
  }
  if (status === "failure" || status === "partial_failure") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "cross", className: "text-red-primary size-6 shrink-0" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "restart-alt", className: "text-grey-secondary size-6 shrink-0" });
};
const getStatusTKey = (status) => {
  if (status === "success") {
    return "scenarios:scheduled_execution.status_success";
  }
  if (status === "failure") {
    return "scenarios:scheduled_execution.status_failure";
  }
  if (status === "partial_failure") {
    return "scenarios:scheduled_execution.status_partial_failure";
  }
  if (status === "processing") {
    return "scenarios:scheduled_execution.status_processing";
  }
  return "scenarios:scheduled_execution.status_pending";
};
function ScheduledExecutions() {
  const {
    t
  } = useTranslation(scenarioI18n);
  const {
    scheduledExecutions
  } = Route.useLoaderData();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Main, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Page.Header, { className: "gap-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BreadCrumbs, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Content, { width: "form", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typo, { variant: "title1", className: "text-grey-primary text-m", children: t("scenarios:home.execution.batch.scheduled_execution", {
        count: scheduledExecutions.length
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ScheduledExecutionsList, { scheduledExecutions })
    ] })
  ] });
}
export {
  ScheduledExecutions as component
};
