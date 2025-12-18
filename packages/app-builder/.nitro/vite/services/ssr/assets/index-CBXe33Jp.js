import { R as jsxRuntimeExports, r as reactExports } from "../server.js";
import { a0 as Route, L as Link, P as Page } from "./router-vb7i5euz.js";
import { u as useTranslation, e4 as Modal, B as Button, e as Icon, dZ as SelectV2, j as Tag, ej as useVirtualTable, ek as Table, el as createColumnHelper, ev as getSortedRowModel, em as getCoreRowModel } from "./format-NPGUXq-g.js";
import { D as DetectionNavigationTabs } from "./Tabs-CwLwDEXt.js";
import { F as FormErrorOrDescription } from "./FormErrorOrDescription-DO6Hdfmn.js";
import { F as FormInput } from "./FormInput-S5xzkMXf.js";
import { F as FormLabel } from "./FormLabel-DeCgtgtj.js";
import { c as createListFn } from "./lists-Dee9CNJg.js";
import { u as useMutation } from "./useMutation-C5oG90Zs.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { c as createListPayloadSchema } from "./lists-DTaf1grX.js";
import { g as getFieldErrors } from "./form-D2XmDKeG.js";
import { u as useForm } from "./useForm-BwABQKAs.js";
import { z as zt } from "./CopyToClipboardButton-CJNJJful.js";
import { N as Nudge } from "./Nudge-C1ux5IUa.js";
import { b as fromUUIDtoSUUID } from "./short-uuid-MIi3jWzx.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
import "./QueryClientProvider-DYTpkCko.js";
import "./security-headers.server-BdP3HrPp.js";
import "./services-middleware-DR8Hua1Y.js";
import "node:crypto";
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
import "./sharpstate.es-CeF1Mf5b.js";
import "./isNullish-B8pc8Ntu.js";
import "./use-callback-ref-DXzIzfqy.js";
import "./index-x7n7VJTa.js";
import "./index-C_WgunUr.js";
import "./array-BFSjnO9c.js";
import "./index-CtZTigeT.js";
import "./index-BF4TC3go.js";
import "./index-CR1bHmei.js";
const useCreateListMutation = () => {
  const createList = useServerFn(createListFn);
  return useMutation({
    mutationKey: ["lists", "create"],
    mutationFn: async (data) => createList({ data })
  });
};
function CreateListModal({ isIpGpsAvailable }) {
  const { t } = useTranslation(["lists", "navigation", "common"]);
  const createListMutation = useCreateListMutation();
  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      kind: "text"
    },
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        createListMutation.mutateAsync(value).then((res) => {
          if (res && "error" in res) {
            zt.error(t("common:errors.list.duplicate_list_name"));
            return;
          }
        }).catch(() => {
          zt.error(t("common:errors.unknown"));
        });
      }
    },
    validators: {
      onSubmitAsync: createListPayloadSchema
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "medium", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-5" }),
      t("lists:create_list.title")
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "form",
      {
        onSubmit: (e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t("lists:create_list.title") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-lg p-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col gap-md", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "name", children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { name: field.name, children: t("lists:name") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                FormInput,
                {
                  type: "text",
                  name: field.name,
                  defaultValue: field.state.value,
                  onChange: (e) => field.handleChange(e.currentTarget.value),
                  onBlur: field.handleBlur,
                  valid: field.state.meta.errors.length === 0,
                  placeholder: t("lists:create_list.name_placeholder")
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "description", children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { name: field.name, children: t("lists:description") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                FormInput,
                {
                  type: "text",
                  name: field.name,
                  defaultValue: field.state.value,
                  onChange: (e) => field.handleChange(e.currentTarget.value),
                  onBlur: field.handleBlur,
                  valid: field.state.meta.errors.length === 0,
                  placeholder: t("lists:create_list.description_placeholder")
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "kind", children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col gap-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { name: field.name, children: t("lists:kind") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                SelectV2,
                {
                  className: "w-full overflow-hidden",
                  value: field.state.value,
                  onChange: (value) => field.handleChange(value),
                  placeholder: t("lists:kind"),
                  options: [
                    {
                      label: t("lists:kind.text"),
                      value: "text"
                    },
                    {
                      label: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex w-full items-center gap-sm", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("lists:kind.cidrs") }),
                        !isIpGpsAvailable ? /* @__PURE__ */ jsxRuntimeExports.jsx(Nudge, { kind: "restricted", content: t("common:premium") }) : null
                      ] }),
                      value: "cidrs"
                    }
                  ].filter((option) => isIpGpsAvailable || option.value !== "cidrs")
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
            ] }) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t("common:cancel") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Modal.FooterButton,
              {
                label: t("lists:create_list.button_accept"),
                type: "submit",
                name: "create",
                isLoading: createListMutation.isPending
              }
            )
          ] })
        ]
      }
    ) })
  ] });
}
const columnHelper = createColumnHelper();
function DetectionListsPage() {
  const {
    t
  } = useTranslation(["lists", "navigation"]);
  const {
    customLists,
    isCreateListAvailable,
    isIpGpsAvailable
  } = Route.useLoaderData();
  const columns = reactExports.useMemo(() => [columnHelper.accessor("name", {
    id: "name",
    header: t("lists:name"),
    size: 200,
    sortingFn: "text",
    enableSorting: true
  }), columnHelper.accessor("description", {
    id: "description",
    header: t("lists:description"),
    size: 400
  }), columnHelper.accessor("kind", {
    id: "kind",
    header: t("lists:kind"),
    size: 180,
    cell: ({
      getValue
    }) => {
      const kind = getValue();
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "purple", children: t(`lists:kind.${kind}`) });
    }
  }), columnHelper.accessor("ValuesCount", {
    id: "valuesCount",
    header: t("lists:values_count"),
    size: 80,
    cell: ({
      getValue
    }) => {
      const {
        count,
        hasMore
      } = getValue();
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        count,
        hasMore ? "+" : null,
        " ",
        t("lists:list.row.values_count", {
          count
        })
      ] });
    }
  })], [t]);
  const {
    table,
    isEmpty,
    getBodyProps,
    rows,
    getContainerProps
  } = useVirtualTable({
    data: customLists,
    columns,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    rowLink: ({
      id
    }) => /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/detection/lists/$listId", params: {
      listId: fromUUIDtoSUUID(id)
    } })
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Page.Main, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Content, { width: "table", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DetectionNavigationTabs, { actions: isCreateListAvailable ? /* @__PURE__ */ jsxRuntimeExports.jsx(CreateListModal, { isIpGpsAvailable }) : void 0 }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-md", children: isEmpty ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface-card border-grey-border flex h-28 max-w-3xl flex-col items-center justify-center rounded-lg border border-solid p-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-s font-medium", children: t("lists:empty_custom_lists_list") }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table.Container, { ...getContainerProps(), className: "bg-surface-card max-h-[70dvh]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Header, { headerGroups: table.getHeaderGroups() }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Body, { ...getBodyProps(), children: rows.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Row, { row }, row.id)) })
    ] }) })
  ] }) });
}
export {
  DetectionListsPage as component
};
