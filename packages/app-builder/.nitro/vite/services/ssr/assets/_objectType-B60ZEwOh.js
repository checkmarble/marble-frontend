import { r as reactExports, R as jsxRuntimeExports, $ as ClientOnly } from "../server.js";
import { u as useTranslation, e as Icon, s as Trans, B as Button, b as clsx, q as useFormatLanguage, t as useFormatDateTime, dA as formatNumber, ej as useVirtualTable, ek as Table, el as createColumnHelper, em as getCoreRowModel } from "./format-NPGUXq-g.js";
import { v as Route, P as Page } from "./router-vb7i5euz.js";
import { P as Paper } from "./Paper-6W_X6MFt.js";
import { E as ExternalLink } from "./ExternalLink-CG_77QdX.js";
import { L as LoadingIcon } from "./Spinner-GK6cEAdR.js";
import { c as getUploadLogsFn } from "./data-BFm2FCTm.js";
import { u as useQuery } from "./useQuery-B7mL_evE.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { i as ingestingDataByCsvDocHref } from "./documentation-href-uAe88WFl.js";
import { z as zt } from "./CopyToClipboardButton-CJNJJful.js";
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
import "./case-detail-middleware-C3JS8Yme.js";
import "./input-validation-CU_reV2S.js";
import "./async-C3pYACua.js";
import "./decisions-B-2DmJW1.js";
import "./unique-CBeBxAXx.js";
import "./scenarios-8U74nJp4.js";
import "./data-fdG1PpsD.js";
import "./useBaseQuery-CMboOtTR.js";
const useUploadTableQuery = (tableName, enabled) => {
  const getUploadLogs = useServerFn(getUploadLogsFn);
  return useQuery({
    queryKey: ["ingestion", "upload-logs", tableName],
    queryFn: async () => getUploadLogs({ data: { objectType: tableName } }),
    enabled
  });
};
const columnHelper = createColumnHelper();
const PastUploads = ({
  uploadLogs,
  onRefresh,
  isFetching
}) => {
  const {
    t
  } = useTranslation(["upload"]);
  const language = useFormatLanguage();
  const formatDateTime = useFormatDateTime();
  const columns = reactExports.useMemo(() => [columnHelper.accessor((row) => row.started_at, {
    id: "upload.started_at",
    header: t("upload:started_at"),
    size: 200,
    cell: ({
      getValue
    }) => {
      const dateTime = getValue();
      return /* @__PURE__ */ jsxRuntimeExports.jsx("time", { dateTime, children: formatDateTime(dateTime, {
        dateStyle: "short",
        timeStyle: "short"
      }) });
    }
  }), columnHelper.accessor((row) => row.finished_at, {
    id: "upload.finished_at",
    header: t("upload:finished_at"),
    size: 200,
    cell: ({
      getValue
    }) => {
      const dateTime = getValue();
      if (!dateTime) return "";
      return /* @__PURE__ */ jsxRuntimeExports.jsx("time", { dateTime, children: formatDateTime(dateTime, {
        dateStyle: "short",
        timeStyle: "short"
      }) });
    }
  }), columnHelper.accessor((row) => row.lines_processed, {
    id: "upload.lines_processed",
    cell: ({
      getValue
    }) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatNumber(getValue(), {
      language
    }) }),
    header: t("upload:lines_processed"),
    size: 200
  }), columnHelper.accessor((row) => row.num_rows_ingested, {
    id: "upload.num_rows_ingested",
    cell: ({
      getValue
    }) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatNumber(getValue(), {
      language
    }) }),
    header: t("upload:num_rows_ingested"),
    size: 200
  }), columnHelper.accessor((row) => row.status, {
    id: "upload.status",
    cell: ({
      getValue
    }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row items-center gap-sm", children: [
      getStatusIcon(getValue()),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "capitalize", children: t(getStatusTKey(getValue())) })
    ] }),
    header: t("upload:upload_status"),
    size: 200
  })], [formatDateTime, language, t]);
  const {
    getBodyProps,
    getContainerProps,
    table,
    rows
  } = useVirtualTable({
    data: uploadLogs,
    columns,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Paper.Container, { className: "bg-surface-card mb-2xl w-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Paper.Title, { children: t("upload:past_uploads") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", size: "small", onClick: onRefresh, disabled: isFetching, "aria-label": t("upload:refresh"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingIcon, { icon: "restart-alt", loading: isFetching, className: "size-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Table.Container, { ...getContainerProps(), className: "max-h-96", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Header, { headerGroups: table.getHeaderGroups() }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Body, { ...getBodyProps(), children: rows.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Row, { row }, row.id)) })
    ] })
  ] });
};
const getStatusIcon = (status) => {
  if (status === "success") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "tick", className: "text-green-primary size-6" });
  }
  if (status === "failure") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "cross", className: "text-red-primary size-6" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "restart-alt", className: "text-grey-secondary size-6" });
};
const getStatusTKey = (status) => {
  if (status === "success") {
    return "upload:status_success";
  }
  if (status === "failure") {
    return "upload:status_failure";
  }
  if (status === "processing") {
    return "upload:status_processing";
  }
  return "upload:status_pending";
};
function Upload() {
  const {
    t
  } = useTranslation(["common", "upload"]);
  const {
    objectType,
    uploadLogs: initialUploadLogs
  } = Route.useLoaderData();
  const {
    data: uploadLogs = initialUploadLogs,
    refetch,
    isFetching
  } = useUploadTableQuery(objectType, true);
  const handleRefresh = reactExports.useCallback(() => {
    void refetch().then((result) => {
      if (result.isError) zt.error(t("common:errors.unknown"));
    });
  }, [refetch, t]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Main, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Header, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "upload", className: "me-sm size-6" }),
      t("upload:upload_cta", {
        replace: {
          objectType
        }
      })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Container, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Page.Description, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "whitespace-pre-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trans, { t, i18nKey: "upload:upload_callout_1", components: {
          DocLink: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { href: ingestingDataByCsvDocHref })
        }, values: {
          objectType
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        t("upload:upload_callout_2")
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Content, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClientOnly, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingButton, {}) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ClientOnly, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(Loading, {}) }),
        uploadLogs.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(PastUploads, { uploadLogs, onRefresh: handleRefresh, isFetching }) : null
      ] })
    ] })
  ] });
}
const Loading = ({
  className
}) => {
  const {
    t
  } = useTranslation(["common"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: clsx(className, "border-grey-placeholder flex h-60 flex-col items-center justify-center gap-md rounded-sm border-2 border-dashed"), children: t("common:loading") });
};
const LoadingButton = () => {
  const {
    t
  } = useTranslation(["upload"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", className: "cursor-wait", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "helpcenter", className: "me-sm size-5" }),
    t("upload:download_template_cta")
  ] });
};
export {
  Upload as component
};
