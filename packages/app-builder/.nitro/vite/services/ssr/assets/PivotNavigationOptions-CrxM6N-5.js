import { G as getPivotRelatedCasesFn } from "./cases-DJ9ABIdo.js";
import { u as useQuery } from "./useQuery-B7mL_evE.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { r as reactExports, R as jsxRuntimeExports } from "../server.js";
import { F as FormErrorOrDescription } from "./FormErrorOrDescription-DO6Hdfmn.js";
import { u as useLoaderRevalidator } from "./LoaderRevalidatorContext-C9s56i-l.js";
import { a as useCreateNavigationOptionMutation } from "./create-navigation-option-DrtWhyLE.js";
import { g as getFieldErrors, h as handleSubmit } from "./form-D2XmDKeG.js";
import { u as useCallbackRef } from "./use-callback-ref-DXzIzfqy.js";
import { u as useForm } from "./useForm-BwABQKAs.js";
import { z as zt } from "./CopyToClipboardButton-CJNJJful.js";
import { u as useTranslation, e4 as Modal, B as Button, e as Icon, e8 as MenuCommand, d as cn } from "./format-NPGUXq-g.js";
import { a as createNavigationOptionSchema } from "./data-fdG1PpsD.js";
import { D as DataModelExplorerContext } from "./DataModelExplorer-gjwcxdcr.js";
import { u as t, v as n$1, B as isAdmin } from "./services-middleware-DR8Hua1Y.js";
import { n } from "./uniqueBy-Tn1hUkKJ.js";
import { t as t$1 } from "./flatMap-CbF5uMEQ.js";
function usePivotRelatedCasesQuery(pivotValue) {
  const getPivotRelatedCases = useServerFn(getPivotRelatedCasesFn);
  return useQuery({
    queryKey: ["pivot", "relatedCases", pivotValue],
    queryFn: async () => {
      return getPivotRelatedCases({ data: { pivotValue } });
    }
  });
}
function CreateNavigationOptionModal({ label, dataModel, link }) {
  const { t: t2 } = useTranslation(["common", "data"]);
  const targetTable = dataModel.find((table) => {
    return table.name === link.childTableName;
  });
  const [open, setOpen] = reactExports.useState(false);
  const createNavigationOptionMutation = useCreateNavigationOptionMutation(link.parentTableId);
  const revalidate = useLoaderRevalidator();
  const handleOpenChange = useCallbackRef((open2) => {
    if (!open2) {
      form.resetField("orderingFieldId");
      setOpen(false);
    }
  });
  const form = useForm({
    defaultValues: {
      sourceFieldId: link.parentFieldId,
      targetTableId: link.childTableId,
      filterFieldId: link.childFieldId,
      orderingFieldId: ""
    },
    validators: {
      onChange: createNavigationOptionSchema
    },
    onSubmit({ value, formApi }) {
      if (formApi.state.isValid) {
        createNavigationOptionMutation.mutateAsync(value).then((res) => {
          if ("error" in res && res.error === "duplicate_pivot_value") {
            zt.error(t2("data:create_navigation_option.errors.duplicate_pivot_value"));
            return;
          }
          zt.success(t2("common:success.save"));
          revalidate();
        }).catch(() => {
          zt.error(t2("common:errors.unknown"));
        });
      }
    }
  });
  if (!targetTable) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { onOpenChange: handleOpenChange, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "small", variant: "secondary", children: [
      label,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-4" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Content, { size: "medium", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t2("data:create_navigation_option.title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "form",
        {
          id: `create_navigation_option_form_${link.parentTableId}_${link.childTableId}`,
          className: "grid grid-cols-[auto_1fr] items-center gap-sm p-xl",
          onSubmit: handleSubmit(form),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t2("data:create_navigation_option.labels.from") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.SelectButton, { disabled: true, noArrow: true, children: link.parentTableName }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t2("data:create_navigation_option.labels.to") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.SelectButton, { disabled: true, noArrow: true, children: link.childTableName }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-10 place-self-start leading-10", children: t2("data:create_navigation_option.labels.ordered_by") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              form.Field,
              {
                name: "orderingFieldId",
                validators: {
                  onChange: createNavigationOptionSchema.shape.orderingFieldId,
                  onBlur: createNavigationOptionSchema.shape.orderingFieldId
                },
                children: (formField) => {
                  const selectedField = targetTable.fields.find((tableField) => tableField.id === formField.state.value);
                  const fieldErrors = formField.state.meta.errors;
                  const targetFields = targetTable.fields.filter((tableField) => tableField.id !== link.childFieldId);
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { open, onOpenChange: setOpen, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        MenuCommand.SelectButton,
                        {
                          className: "inline-flex min-w-[264px]",
                          hasError: fieldErrors.length > 0,
                          children: selectedField ? selectedField.name : t2("data:create_navigation_option.placeholders.ordered_by")
                        }
                      ) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Content, { align: "start", sameWidth: true, sideOffset: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.List, { children: targetFields.map((field) => /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Item, { value: field.id, onSelect: formField.handleChange, children: [
                        field.name,
                        selectedField?.name === field.name ? /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "tick", className: "text-purple-primary size-6" }) : null
                      ] }, field.id)) }) })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(fieldErrors) })
                  ] });
                }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-full mt-md", children: t2("data:create_navigation_option.explanation_text") })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t2("common:cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Modal.FooterButton,
          {
            label: t2("common:save"),
            type: "submit",
            form: `create_navigation_option_form_${link.parentTableId}_${link.childTableId}`
          }
        )
      ] })
    ] })
  ] });
}
function PivotNavigationOptions({
  currentUser,
  pivotObject,
  table,
  dataModel,
  onExplore,
  options,
  className
}) {
  const { t: t$2 } = useTranslation(["cases"]);
  const linksToTable = reactExports.useMemo(() => {
    return t(
      dataModel,
      n$1((dataModelTable) => dataModelTable.name !== table.name),
      t$1((dataModelTable) => dataModelTable.linksToSingle),
      n$1((dataModelTable) => dataModelTable.parentTableName === table.name),
      // Several links can point at the same child table; the nav options are filtered by
      // child table name below, so keep one entry per child table to avoid rendering the
      // same options twice.
      n((link) => link.childTableName)
    );
  }, [table, dataModel]);
  const dataModelExplorerContext = DataModelExplorerContext.useValue();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: linksToTable.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: cn(
        "grid auto-rows-[minmax(2rem,auto)] gap-x-4 gap-y-2 break-all items-center",
        options?.layout === "2-columns" && "grid-cols-[repeat(2,max-content_minmax(0,1fr))]",
        options?.layout === "3-columns" && "grid-cols-[repeat(3,max-content_minmax(0,1fr))]",
        (options?.layout === "1-column" || !options?.layout) && "grid-cols-[max-content_minmax(0,1fr)]",
        className
      ),
      children: linksToTable.map((linkToTable, idx) => {
        const navigationOptions = table.navigationOptions?.filter(
          (navOption) => navOption.targetTableName === linkToTable.childTableName
        ) ?? [];
        return navigationOptions.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Fragment, { children: navigationOptions.map((navOption, idx2) => /* @__PURE__ */ jsxRuntimeExports.jsxs(reactExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-grey-secondary", children: [
            navOption.targetTableName,
            navigationOptions.length > 1 ? ` (${navOption.orderingFieldName})` : null
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              disabled: navOption.status === "pending",
              variant: "secondary",
              onClick: () => {
                dataModelExplorerContext.startNavigation({
                  pivotObject,
                  sourceObject: pivotObject.pivotObjectData.data,
                  navigationOptionId: navOption.id,
                  sourceTableName: table.name,
                  sourceFieldName: navOption.sourceFieldName,
                  targetTableName: navOption.targetTableName,
                  filterFieldName: navOption.filterFieldName,
                  orderingFieldName: navOption.orderingFieldName
                });
                onExplore();
              },
              children: [
                navOption.status === "pending" ? t$2("cases:case_detail.pivot_panel.explore_waiting_creation") : t$2("cases:case_detail.pivot_panel.explore"),
                navOption.status === "pending" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "spinner", className: "size-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "arrow-up-right", className: "size-3.5" })
              ]
            }
          )
        ] }, `${navOption.id}-${idx2}`)) }, `${linkToTable.childTableName}-${idx}`) : isAdmin(currentUser) ? /* @__PURE__ */ jsxRuntimeExports.jsxs(reactExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: linkToTable.childTableName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            CreateNavigationOptionModal,
            {
              label: t$2("cases:case_detail.pivot_panel.create_navigation_option"),
              dataModel,
              link: linkToTable
            }
          )
        ] }, linkToTable.childTableName) : null;
      })
    }
  ) : null });
}
export {
  PivotNavigationOptions as P,
  usePivotRelatedCasesQuery as u
};
