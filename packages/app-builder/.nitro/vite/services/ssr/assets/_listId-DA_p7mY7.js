import { r as reactExports, R as jsxRuntimeExports, $ as ClientOnly } from "../server.js";
import { a as CalloutV2 } from "./Callout-DX4NBXlG.js";
import { af as Route, P as Page, B as BreadCrumbs, L as Link } from "./router-vb7i5euz.js";
import { u as useTranslation, e4 as Modal, B as Button, e as Icon, T as Typo, ej as useVirtualTable, ei as SearchInput, ek as Table, el as createColumnHelper, C as CtaV2ClassName, ev as getSortedRowModel, eG as getFilteredRowModel, em as getCoreRowModel, b as clsx } from "./format-NPGUXq-g.js";
import { F as FormError } from "./FormError-B82nKoYh.js";
import { F as FormInput } from "./FormInput-S5xzkMXf.js";
import { F as FormLabel } from "./FormLabel-DeCgtgtj.js";
import { u as useLoaderRevalidator } from "./LoaderRevalidatorContext-C9s56i-l.js";
import { a as addListValueFn, d as deleteListFn, b as deleteListValueFn, e as editListFn } from "./lists-Dee9CNJg.js";
import { u as useMutation } from "./useMutation-C5oG90Zs.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { f as addCidrValuePayloadSchema, a as addValuePayloadSchema, n as normalizeCidr, d as deleteListPayloadSchema, b as deleteValuePayloadSchema, e as editListPayloadSchema } from "./lists-DTaf1grX.js";
import { u as useForm } from "./useForm-BwABQKAs.js";
import { h as handleSubmit, g as getFieldErrors } from "./form-D2XmDKeG.js";
import { H as HiddenInputs } from "./HiddenInputs-DIIDD4dd.js";
import { F as FormErrorOrDescription } from "./FormErrorOrDescription-DO6Hdfmn.js";
import { L as LoadingIcon } from "./Spinner-GK6cEAdR.js";
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
import "./CopyToClipboardButton-CJNJJful.js";
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
const useAddListValueMutation = () => {
  const addListValue = useServerFn(addListValueFn);
  return useMutation({
    mutationKey: ["lists", "addListValue"],
    mutationFn: async (data) => addListValue({ data })
  });
};
function AddListValueModal({ listId, kind }) {
  const { t } = useTranslation(["lists", "navigation", "common"]);
  const addListValueMutation = useAddListValueMutation();
  const revalidate = useLoaderRevalidator();
  const [isOpen, setIsOpen] = reactExports.useState(false);
  const validationSchema = reactExports.useMemo(
    () => kind === "cidrs" ? addCidrValuePayloadSchema : addValuePayloadSchema,
    [kind]
  );
  const form = useForm({
    defaultValues: {
      listId,
      value: "",
      kind
    },
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        const payload = kind === "cidrs" ? { ...value, value: normalizeCidr(value.value) } : value;
        addListValueMutation.mutateAsync(payload).then(() => {
          revalidate();
          setIsOpen(false);
          form.reset();
        });
      }
    },
    validators: {
      onSubmitAsync: validationSchema
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { open: isOpen, onOpenChange: setIsOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "medium", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-5" }),
      t("lists:create_value.title")
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
          /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t("lists:create_value.title") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-lg p-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "value", children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { name: field.name, children: t("lists:detail.value.create.form.label") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              FormInput,
              {
                type: "text",
                name: field.name,
                defaultValue: field.state.value,
                onChange: (e) => field.handleChange(e.currentTarget.value),
                onBlur: field.handleBlur,
                valid: field.state.meta.errors.length === 0,
                placeholder: kind === "cidrs" ? t("lists:create_value.cidr_placeholder") : t("lists:create_value.value_placeholder")
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              FormError,
              {
                field,
                asString: true,
                translations: {
                  invalid_union: t("lists:create_value.cidr_error")
                }
              }
            )
          ] }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Modal.FooterButton,
              {
                isCloseButton: true,
                label: t("common:cancel"),
                onClick: (e) => {
                  e.preventDefault();
                  setIsOpen(false);
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Modal.FooterButton,
              {
                variant: "primary",
                type: "submit",
                label: t("common:save"),
                isLoading: addListValueMutation.isPending
              }
            )
          ] })
        ]
      }
    ) })
  ] });
}
const useDeleteListMutation = () => {
  const deleteList = useServerFn(deleteListFn);
  return useMutation({
    mutationKey: ["lists", "delete"],
    mutationFn: async (data) => deleteList({ data })
  });
};
function DeleteListModal({ listId }) {
  const { t } = useTranslation(["lists", "navigation", "common"]);
  const deleteListMutation = useDeleteListMutation();
  const revalidate = useLoaderRevalidator();
  const form = useForm({
    defaultValues: {
      listId
    },
    validators: {
      onSubmit: deleteListPayloadSchema
    },
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        deleteListMutation.mutateAsync(value).then(() => {
          revalidate();
        });
      }
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", className: "w-fit", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "delete", className: "size-5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: t("lists:delete_list.button") })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit(form), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(HiddenInputs, { listId }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-lg p-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col items-center justify-center gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-red-background mb-lg box-border rounded-[90px] p-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "delete", className: "text-red-primary size-16" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typo, { variant: "title1", children: t("lists:delete_list.title") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center", children: t("lists:delete_list.content") })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t("common:cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Modal.FooterButton,
          {
            label: t("common:delete"),
            type: "submit",
            name: "delete",
            variant: "destructive",
            leadingIcon: "delete"
          }
        )
      ] })
    ] }) })
  ] });
}
const useDeleteListValueMutation = () => {
  const deleteListValue = useServerFn(deleteListValueFn);
  return useMutation({
    mutationKey: ["lists", "deleteListValue"],
    mutationFn: async (data) => deleteListValue({ data })
  });
};
function DeleteListValueModal({
  listId,
  listValueId,
  value,
  children
}) {
  const { t } = useTranslation(["lists", "navigation", "common"]);
  const deleteListValueMutation = useDeleteListValueMutation();
  const revalidate = useLoaderRevalidator();
  const [isOpen, setIsOpen] = reactExports.useState(false);
  const form = useForm({
    defaultValues: {
      listId,
      listValueId
    },
    validators: {
      onSubmit: deleteValuePayloadSchema
    },
    onSubmit: ({ value: value2, formApi }) => {
      if (formApi.state.isValid) {
        deleteListValueMutation.mutateAsync(value2).then(() => {
          revalidate();
          setIsOpen(false);
          form.reset();
        });
      }
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { open: isOpen, onOpenChange: setIsOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { asChild: true, children }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit(form), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(HiddenInputs, { listId, listValueId }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-lg p-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col items-center justify-center gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-red-background mb-lg box-border rounded-[90px] p-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "delete", className: "text-red-primary size-16" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typo, { variant: "title1", children: t("lists:delete_value.title") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "pb-md text-center", children: [
          t("lists:delete_value.value_content"),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: value })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center", children: t("lists:delete_value.no_return") })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t("common:cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Modal.FooterButton,
          {
            label: t("common:delete"),
            type: "submit",
            name: "delete",
            variant: "destructive",
            leadingIcon: "delete"
          }
        )
      ] })
    ] }) })
  ] });
}
const useEditListMutation = () => {
  const editList = useServerFn(editListFn);
  return useMutation({
    mutationKey: ["lists", "edit"],
    mutationFn: async (data) => editList({ data })
  });
};
function EditListModal({ listId, name, description }) {
  const { t } = useTranslation(["lists", "navigation", "common"]);
  const editListMutation = useEditListMutation();
  const revalidate = useLoaderRevalidator();
  const [open, setOpen] = reactExports.useState(false);
  const form = useForm({
    defaultValues: {
      listId,
      name,
      description
    },
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        editListMutation.mutateAsync(value).then(() => {
          revalidate();
          setOpen(false);
        });
      }
    },
    validators: {
      onSubmitAsync: editListPayloadSchema
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", appearance: "stroked", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "edit-square", className: "size-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: t("lists:edit_list.button") })
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
          /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t("lists:edit_list.title") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-lg p-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col gap-md", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              form.Field,
              {
                name: "name",
                validators: {
                  onChange: editListPayloadSchema.shape.name,
                  onBlur: editListPayloadSchema.shape.name
                },
                children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
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
                ] })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              form.Field,
              {
                name: "description",
                validators: {
                  onChange: editListPayloadSchema.shape.description,
                  onBlur: editListPayloadSchema.shape.description
                },
                children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
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
                ] })
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t("common:cancel") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { label: t("common:save"), type: "submit", name: "editList" })
          ] })
        ]
      }
    ) })
  ] });
}
const columnHelper = createColumnHelper();
function Lists() {
  const {
    customList,
    listFeatureAccess
  } = Route.useLoaderData();
  const listValues = customList.values ?? [];
  const {
    t
  } = useTranslation(["lists", "common"]);
  const [searchValue, setSearchValue] = reactExports.useState("");
  const columns = reactExports.useMemo(() => [columnHelper.accessor((row) => row.value, {
    id: "value",
    header: t("lists:detail.values-list.header"),
    size: 500,
    sortingFn: "text",
    enableSorting: true,
    cell: ({
      getValue,
      row
    }) => {
      const value = getValue();
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-grey-primary text-s font-medium", children: value }),
        listFeatureAccess.isDeleteListValueAvailable ? /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteListValueModal, { listId: customList.id, listValueId: row.original.id, value, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { "data-test": "delete-list-value-trigger", className: "group-hover:text-grey-primary text-transparent transition-colors duration-200 ease-in-out", name: "delete", tabIndex: -1, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "delete", className: "size-6 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: t("common:delete") })
        ] }) }) : null
      ] });
    }
  })], [t, listFeatureAccess.isDeleteListValueAvailable, customList.id]);
  const virtualTable = useVirtualTable({
    data: listValues,
    columns,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel()
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Main, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Header, { className: "justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(BreadCrumbs, {}),
      listFeatureAccess.isEditListAvailable ? /* @__PURE__ */ jsxRuntimeExports.jsx(EditListModal, { listId: customList.id, name: customList.name, description: customList.description }) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Page.Container, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Content, { width: "table", children: [
      customList.description ? /* @__PURE__ */ jsxRuntimeExports.jsx(CalloutV2, { children: customList.description }) : null,
      listValues.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(DownloadAsCSV, { listId: customList.id }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsx(UploadAsCsv, { listId: customList.id }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm overflow-hidden lg:gap-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row gap-sm lg:gap-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("form", { className: "flex grow items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SearchInput, { size: "medium", className: "w-100", disabled: listValues.length === 0, "aria-label": t("common:search"), placeholder: t("common:search"), value: searchValue, onChange: (value) => {
            setSearchValue(value);
            virtualTable.table.setGlobalFilter(value);
          } }) }),
          listFeatureAccess.isCreateListValueAvailable ? /* @__PURE__ */ jsxRuntimeExports.jsx(AddListValueModal, { listId: customList.id, kind: customList.kind }) : null
        ] }),
        virtualTable.isEmpty ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface-card border-grey-border flex h-28 flex-col items-center justify-center rounded-lg border border-solid p-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-s font-medium", children: listValues.length > 0 ? t("lists:empty_custom_list_matches") : t("lists:empty_custom_list_values_list") }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Default, { ...virtualTable })
      ] }),
      listFeatureAccess.isDeleteListAvailable ? /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteListModal, { listId: customList.id }) : null
    ] }) })
  ] });
}
function DownloadAsCSV({
  listId
}) {
  const {
    t
  } = useTranslation(["lists", "common"]);
  const downloadUrl = `/ressources/lists/download-csv-file/${fromUUIDtoSUUID(listId)}`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { reloadDocument: true, to: downloadUrl, className: CtaV2ClassName({
    variant: "secondary",
    className: "w-fit"
  }), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "download", className: "size-6" }),
    t("lists:download_values_as_csv")
  ] });
}
const UploadAsCsvDropzone = reactExports.forwardRef(function UploadAsCsvDropzone2({
  className,
  ...props
}, ref) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref, className: clsx("text-s flex h-40 flex-col items-center justify-center gap-md rounded-sm border-2 border-dashed", className), ...props });
});
function UploadAsCsv({
  listId
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ClientOnly, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(UploadAsCsvDropzone, { className: "border-grey-placeholder", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingIcon, { icon: "upload", loading: true, className: "size-6" }) }) });
}
export {
  Lists as component
};
