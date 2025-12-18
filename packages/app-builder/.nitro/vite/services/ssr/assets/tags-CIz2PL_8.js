import { r as reactExports, R as jsxRuntimeExports } from "../server.js";
import { u as useTranslation, en as useTable, ek as Table, el as createColumnHelper, em as getCoreRowModel } from "./format-NPGUXq-g.js";
import { z as Route, P as Page } from "./router-vb7i5euz.js";
import { C as CollapsiblePaper } from "./Paper-6W_X6MFt.js";
import { C as ColorPreview, U as UpdateTag, D as DeleteTag, a as CreateTag } from "./UpdateTag-DCRbQZKL.js";
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
import "./FormErrorOrDescription-DO6Hdfmn.js";
import "./FormInput-S5xzkMXf.js";
import "./FormLabel-DeCgtgtj.js";
import "./index-x7n7VJTa.js";
import "./index-C_WgunUr.js";
import "./LoaderRevalidatorContext-C9s56i-l.js";
import "./settings-CEpHMlp5.js";
import "./settings-CPv2zx4k.js";
import "./useMutation-C5oG90Zs.js";
import "./useServerFn-CrqFKl7V.js";
import "./form-D2XmDKeG.js";
import "./array-BFSjnO9c.js";
import "./useForm-BwABQKAs.js";
const columnHelper = createColumnHelper();
function Tags() {
  const {
    t
  } = useTranslation(["settings"]);
  const {
    tags,
    isCreateTagAvailable,
    isEditTagAvailable,
    isDeleteTagAvailable
  } = Route.useLoaderData();
  const columns = reactExports.useMemo(() => {
    return [columnHelper.accessor((row) => row.name, {
      id: "name",
      header: t("settings:tags.name"),
      size: 200
    }), columnHelper.accessor((row) => row.color, {
      id: "color",
      header: t("settings:tags.color"),
      size: 100,
      cell: ({
        getValue
      }) => /* @__PURE__ */ jsxRuntimeExports.jsx(ColorPreview, { color: getValue() })
    }), columnHelper.accessor((row) => row.cases_count, {
      id: "cases",
      header: t("settings:tags.cases"),
      size: 200
    }), columnHelper.accessor((row) => row.target, {
      id: "target",
      header: t("settings:tags.target"),
      cell: ({
        cell
      }) => {
        return t(`settings:tags.target.${cell.getValue()}`);
      },
      size: 100
    }), ...isEditTagAvailable || isDeleteTagAvailable ? [columnHelper.display({
      id: "actions",
      size: 100,
      cell: ({
        cell
      }) => {
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-sm", children: [
          isEditTagAvailable ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "group-hover:text-grey-primary focus-within:text-grey-primary text-transparent", children: /* @__PURE__ */ jsxRuntimeExports.jsx(UpdateTag, { tag: cell.row.original }) }) : null,
          isDeleteTagAvailable ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "group-hover:text-grey-primary focus-within:text-grey-primary text-transparent", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteTag, { tag: cell.row.original }) }) : null
        ] });
      }
    })] : []];
  }, [isDeleteTagAvailable, isEditTagAvailable, t]);
  const {
    table,
    getBodyProps,
    rows,
    getContainerProps
  } = useTable({
    data: tags,
    columns,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Page.Content, { width: "readable", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CollapsiblePaper.Container, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CollapsiblePaper.Title, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1", children: t("settings:tags") }),
      isCreateTagAvailable ? /* @__PURE__ */ jsxRuntimeExports.jsx(CreateTag, {}) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CollapsiblePaper.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table.Container, { ...getContainerProps(), className: "max-h-96", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Header, { headerGroups: table.getHeaderGroups() }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Body, { ...getBodyProps(), children: rows.map((row) => {
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Row, { className: "hover:bg-surface-row-hover group", row }, row.id);
      }) })
    ] }) })
  ] }) });
}
export {
  Tags as component
};
