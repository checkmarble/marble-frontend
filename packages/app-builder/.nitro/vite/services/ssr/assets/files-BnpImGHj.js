import { R as jsxRuntimeExports, r as reactExports } from "../server.js";
import { u as useDownloadFile, A as AlreadyDownloadingError, a as AuthRequestError } from "./DownloadFilesService-BW-xJtj3.js";
import { u as useTranslation, s as Trans, t as useFormatDateTime, ej as useVirtualTable, em as getCoreRowModel, ek as Table, el as createColumnHelper, B as Button } from "./format-NPGUXq-g.js";
import { z as zt } from "./CopyToClipboardButton-CJNJJful.js";
import { U as UploadFile, u as useUploadScreeningFile } from "./upload-screening-file-BMRNTnx5.js";
import { t as t$1 } from "./services-middleware-DR8Hua1Y.js";
import { b8 as Route } from "./router-vb7i5euz.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
import "./download-file-C533i5xX.js";
import "./short-uuid-MIi3jWzx.js";
import "./sharpstate.es-CeF1Mf5b.js";
import "./isNullish-B8pc8Ntu.js";
import "./use-callback-ref-DXzIzfqy.js";
import "./LoaderRevalidatorContext-C9s56i-l.js";
import "./useFormDropzone-BjTKexsf.js";
import "./screenings-CS8peAlI.js";
import "./createSsrRpc-ZXUHv2Er.js";
import "./auth-middleware-C4ap47rJ.js";
import "./useMutation-C5oG90Zs.js";
import "./QueryClientProvider-DYTpkCko.js";
import "./useServerFn-CrqFKl7V.js";
import "node:crypto";
import "./security-headers.server-BdP3HrPp.js";
import "./ThemeContext-B40HQxfH.js";
import "./config-ut8rAdyo.js";
import "./i18n-instance-store-UssbGYOM.js";
import "./inboxes-D556s0BB.js";
import "./files-fO9wUXBf.js";
import "./case-detail-middleware-C3JS8Yme.js";
import "./input-validation-CU_reV2S.js";
import "./async-C3pYACua.js";
import "./decisions-B-2DmJW1.js";
import "./unique-CBeBxAXx.js";
import "./scenarios-8U74nJp4.js";
function t(...t2) {
  return t$1(n, t2);
}
const n = (e) => e.at(-1);
function AddYourFirstFile({
  children,
  uploadFileEndpoint
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(UploadFile, { uploadFileEndpoint, children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "hover:text-purple-primary text-purple-disabled hover:underline", children }) });
}
const columnHelper = createColumnHelper();
function FilesList({ files, downloadEndpoint, uploadEndpoint }) {
  const { t: t2 } = useTranslation(["cases"]);
  if (files.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface-card border-grey-border rounded-lg border p-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary text-s whitespace-pre", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Trans,
      {
        t: t2,
        i18nKey: "cases:case_detail.no_files",
        components: {
          Button: /* @__PURE__ */ jsxRuntimeExports.jsx(AddYourFirstFile, { uploadFileEndpoint: uploadEndpoint })
        }
      }
    ) }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(FilesListTable, { downloadEndpoint, files });
}
function FilesListTable({ files, downloadEndpoint }) {
  const { t: t$12 } = useTranslation(["cases"]);
  const formatDateTime = useFormatDateTime();
  const columns = reactExports.useMemo(() => {
    const columns2 = [
      columnHelper.accessor((row) => row.fileName, {
        id: "file_name",
        header: t$12("cases:case.file.name"),
        size: 100
      }),
      columnHelper.accessor((row) => row.fileName, {
        id: "extension",
        size: 40,
        header: t$12("cases:case.file.extension"),
        cell: ({ getValue }) => {
          return t(getValue().split("."))?.toUpperCase();
        }
      }),
      columnHelper.accessor((row) => row.createdAt, {
        id: "created_at",
        header: t$12("cases:case.file.added_date"),
        size: 40,
        cell: ({ getValue }) => {
          const dateTime = getValue();
          return /* @__PURE__ */ jsxRuntimeExports.jsx("time", { dateTime, children: formatDateTime(dateTime, { dateStyle: "short" }) });
        }
      }),
      columnHelper.accessor((row) => row.id, {
        id: "link",
        header: t$12("cases:case.file.download"),
        size: 40,
        cell: ({ getValue }) => {
          return /* @__PURE__ */ jsxRuntimeExports.jsx(FileLink, { endpoint: downloadEndpoint(getValue()) });
        }
      })
    ];
    return columns2;
  }, [formatDateTime, t$12, downloadEndpoint]);
  const { table, getBodyProps, rows, getContainerProps } = useVirtualTable({
    data: files,
    columns,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Table.Container, { ...getContainerProps(), className: "bg-surface-card max-h-96", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Header, { headerGroups: table.getHeaderGroups() }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Body, { ...getBodyProps(), children: rows.map((row) => {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Row, { row }, row.id);
    }) })
  ] });
}
function FileLink({ endpoint }) {
  const { downloadCaseFile, downloadingCaseFile } = useDownloadFile(endpoint, {
    onError: (e) => {
      if (e instanceof AlreadyDownloadingError) {
        return;
      } else if (e instanceof AuthRequestError) {
        zt.error(t2("cases:case.file.errors.downloading_link.auth_error"));
      } else {
        zt.error(t2("cases:case.file.errors.downloading_link.unknown"));
      }
    }
  });
  const { t: t2 } = useTranslation(["cases"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Button,
    {
      variant: "secondary",
      onClick: () => {
        void downloadCaseFile();
      },
      name: "download",
      disabled: downloadingCaseFile,
      children: downloadingCaseFile ? t2("cases:case.file.downloading") : t2("cases:case.file.download")
    }
  );
}
function ScreeningFilesPage() {
  const {
    files,
    screening
  } = Route.useLoaderData();
  const {
    mutateAsync: uploadScreeningFile
  } = useUploadScreeningFile(screening.id);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(FilesList, { files, downloadEndpoint: (fileId) => `/ressources/screenings/download/${screening.id}/${fileId}`, uploadEndpoint: uploadScreeningFile });
}
export {
  ScreeningFilesPage as component
};
