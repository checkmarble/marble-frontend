import { r as reactExports, R as jsxRuntimeExports } from "../server.js";
import { u as useTranslation, e4 as Modal, B as Button, e as Icon, e8 as MenuCommand, en as useTable, ek as Table, el as createColumnHelper, em as getCoreRowModel } from "./format-NPGUXq-g.js";
import { ae as Route, P as Page } from "./router-vb7i5euz.js";
import { C as CollapsiblePaper } from "./Paper-6W_X6MFt.js";
import { u as useLoaderRevalidator } from "./LoaderRevalidatorContext-C9s56i-l.js";
import { u as useCreateFilterMutation, a as useDeleteFilterMutation } from "./delete-filter-C4u-CT-i.js";
import { h as handleSubmit } from "./form-D2XmDKeG.js";
import { u as useForm } from "./useForm-BwABQKAs.js";
import { z as zt } from "./CopyToClipboardButton-CJNJJful.js";
import { e as exportedFieldSchema } from "./settings-CEpHMlp5.js";
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
import "./settings-CPv2zx4k.js";
import "./useMutation-C5oG90Zs.js";
import "./useServerFn-CrqFKl7V.js";
import "./array-BFSjnO9c.js";
function CreateFilter({
  dataModel,
  triggerFieldItems,
  linkedFieldItems
}) {
  const { t } = useTranslation(["common", "settings"]);
  const [open, setOpen] = reactExports.useState(false);
  const [openUnifiedMenu, setOpenUnifiedMenu] = reactExports.useState(false);
  const [selectedTableId, setSelectedTableId] = reactExports.useState(dataModel[0]?.id ?? "");
  const createFilterMutation = useCreateFilterMutation();
  const selectedTable = dataModel.find((t2) => t2.id === selectedTableId);
  const revalidate = useLoaderRevalidator();
  function summaryLabel() {
    const v = form.state.values;
    if ("ingestedDataField" in v && v.ingestedDataField) {
      return `->${v.ingestedDataField.path.join("->")}.${v.ingestedDataField.name}`;
    }
    if ("triggerObjectField" in v && v.triggerObjectField) {
      const tableName = selectedTable?.name ?? "";
      return tableName ? `${tableName}.${v.triggerObjectField}` : v.triggerObjectField;
    }
    return "Choose a field";
  }
  const form = useForm({
    defaultValues: {},
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        createFilterMutation.mutateAsync({ tableId: selectedTableId, payload: value }).then(() => {
          setOpen(false);
          revalidate();
          form.reset();
        }).catch(() => {
          zt.error(t("common:errors.unknown"));
        });
      }
    },
    validators: {
      onSubmit: exportedFieldSchema
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-4" }),
      t("settings:scenarios.filters.new_filter.create.button.label")
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Content, { onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit(form), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t("settings:scenarios.filters.new_filter.title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-lg p-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { open: openUnifiedMenu, onOpenChange: setOpenUnifiedMenu, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.SelectButton, { children: summaryLabel() }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Content, { align: "start", sameWidth: true, sideOffset: 4, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Combobox, { placeholder: "Search fields" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.List, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Group, { children: triggerFieldItems.map((item) => {
                const v = form.state.values;
                const isSelected = selectedTableId === item.tableId && "triggerObjectField" in v && v.triggerObjectField === item.fieldName;
                return /* @__PURE__ */ jsxRuntimeExports.jsx(
                  MenuCommand.Item,
                  {
                    selected: isSelected,
                    onSelect: () => {
                      setSelectedTableId(item.tableId);
                      form.setFieldValue("ingestedDataField", void 0);
                      form.setFieldValue("triggerObjectField", item.fieldName);
                      setOpenUnifiedMenu(false);
                    },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: item.label })
                  },
                  `trigger-${item.tableId}-${item.fieldName}`
                );
              }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Separator, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Group, { children: linkedFieldItems.map((item) => {
                const v = form.state.values;
                const isSelected = "ingestedDataField" in v && !!v.ingestedDataField && v.ingestedDataField.name === item.fieldName && v.ingestedDataField.path.join(".") === item.pathLinks.join(".") && selectedTableId === item.baseTableId;
                return /* @__PURE__ */ jsxRuntimeExports.jsx(
                  MenuCommand.Item,
                  {
                    selected: isSelected,
                    onSelect: () => {
                      setSelectedTableId(item.baseTableId);
                      form.setFieldValue("triggerObjectField", void 0);
                      form.setFieldValue(
                        "ingestedDataField",
                        {
                          path: item.pathLinks,
                          name: item.fieldName
                        }
                      );
                      setOpenUnifiedMenu(false);
                    },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: item.label })
                  },
                  `pivot-${item.baseTableId}-${item.label}`
                );
              }) })
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 gap-sm justify-end", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Close, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", onClick: () => setOpen(false), children: t("common:cancel") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "primary", type: "submit", className: "align-baseline", children: t("common:save") })
        ] })
      ] })
    ] }) })
  ] });
}
const columnHelper = createColumnHelper();
function Filters() {
  const revalidate = useLoaderRevalidator();
  const {
    t
  } = useTranslation(["settings", "common"]);
  const {
    filters,
    dataModel,
    triggerFieldItems,
    linkedFieldItems
  } = Route.useLoaderData();
  const deleteFilterMutation = useDeleteFilterMutation();
  const [isConfirmOpen, setIsConfirmOpen] = reactExports.useState(false);
  const [itemToDelete, setItemToDelete] = reactExports.useState(null);
  const columns = reactExports.useMemo(() => {
    return [columnHelper.accessor((row) => row.associatedObject, {
      id: "associatedObject",
      header: t("settings:filters.associated-object.row.header.label"),
      size: 240
    }), columnHelper.accessor((row) => row.definition, {
      id: "definition",
      header: t("settings:filters.definition.row.header.label")
    }), columnHelper.display({
      id: "actions",
      size: 80,
      cell: ({
        row
      }) => {
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", mode: "icon", className: "opacity-0 group-hover:opacity-100 transition-opacity", onClick: async (e) => {
          e.stopPropagation();
          setItemToDelete(row.original);
          setIsConfirmOpen(true);
        }, "aria-label": "Delete filter", title: "Delete filter", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "delete", className: "size-4" }) }) });
      }
    })];
  }, [columnHelper, deleteFilterMutation]);
  const {
    table,
    getBodyProps,
    rows: tableRows,
    getContainerProps
  } = useTable({
    data: filters,
    columns,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false
  });
  const handleDeleteFilter = () => {
    if (!itemToDelete) return;
    const payload = itemToDelete.kind === "trigger" ? {
      triggerObjectField: itemToDelete.field
    } : {
      ingestedDataField: {
        path: itemToDelete.path ?? [],
        name: itemToDelete.name
      }
    };
    deleteFilterMutation.mutateAsync({
      tableId: itemToDelete.tableId,
      payload
    }).then(() => {
      setIsConfirmOpen(false);
      setItemToDelete(null);
      revalidate();
    }).catch(() => {
      zt.error(t("common:errors.unknown"));
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Content, { width: "readable", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CollapsiblePaper.Container, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CollapsiblePaper.Title, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1", children: t("settings:filters-settings") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CreateFilter, { dataModel, triggerFieldItems, linkedFieldItems })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CollapsiblePaper.Content, { className: "flex flex-col h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-md flex-1 min-h-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table.Container, { ...getContainerProps(), className: "flex-1 min-h-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Header, { headerGroups: table.getHeaderGroups() }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Body, { ...getBodyProps(), children: tableRows.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Row, { row, className: "hover:bg-purple-background-light group" }, row.id)) })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Root, { open: isConfirmOpen, onOpenChange: setIsConfirmOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Content, { size: "medium", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t("settings:filters.delete_filter.title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Description, { className: "p-lg text-left", children: t("settings:filters.delete_filter.content") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, variant: "secondary", label: t("common:cancel"), onClick: () => setIsConfirmOpen(false) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { variant: "destructive", label: t("settings:filters.delete_filter"), onClick: handleDeleteFilter, leadingIcon: "delete", isLoading: deleteFilterMutation.isPending })
      ] })
    ] }) })
  ] });
}
export {
  Filters as component
};
