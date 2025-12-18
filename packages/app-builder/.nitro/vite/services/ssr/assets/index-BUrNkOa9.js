import { U as useHydrated, R as jsxRuntimeExports, r as reactExports, O as useRouter } from "../server.js";
import { C as Callout } from "./Callout-DX4NBXlG.js";
import { V as archiveScenarioFn, W as copyScenarioFn, X as createScenarioFn, Y as unarchiveScenarioFn, Z as Route, _ as getFormattedVersion, L as Link, P as Page } from "./router-vb7i5euz.js";
import { u as useTranslation, B as Button, e as Icon, e4 as Modal, s as Trans, et as HovercardAnchor, eu as Hovercard, dZ as SelectV2, t as useFormatDateTime, j as Tag, en as useTable, ek as Table, b as clsx, el as createColumnHelper, ev as getSortedRowModel, em as getCoreRowModel } from "./format-NPGUXq-g.js";
import { D as DetectionNavigationTabs } from "./Tabs-CwLwDEXt.js";
import { u as useLoaderRevalidator } from "./LoaderRevalidatorContext-C9s56i-l.js";
import { c as createScenarioPayloadSchema, a as updateScenarioPayloadSchema } from "./scenarios-8U74nJp4.js";
import { u as useMutation } from "./useMutation-C5oG90Zs.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { z as zt } from "./CopyToClipboardButton-CJNJJful.js";
import { F as FormErrorOrDescription } from "./FormErrorOrDescription-DO6Hdfmn.js";
import { F as FormInput } from "./FormInput-S5xzkMXf.js";
import { F as FormLabel } from "./FormLabel-DeCgtgtj.js";
import { g as getFieldErrors, h as handleSubmit } from "./form-D2XmDKeG.js";
import { u as useForm } from "./useForm-BwABQKAs.js";
import { o as object, s as string, b as fromUUIDtoSUUID } from "./short-uuid-MIi3jWzx.js";
import { E as ExternalLink } from "./ExternalLink-CG_77QdX.js";
import { u as useDataModelQuery } from "./get-data-model-CAY4ZWaH.js";
import { s as scenarioObjectDocHref } from "./documentation-href-uAe88WFl.js";
import { H as HovercardProvider } from "./hovercard-provider-BchUL2eY.js";
import { u as useUpdateScenarioMutation } from "./update-scenario-BLeSCsGD.js";
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
import "./sharpstate.es-CeF1Mf5b.js";
import "./isNullish-B8pc8Ntu.js";
import "./use-callback-ref-DXzIzfqy.js";
import "./index-x7n7VJTa.js";
import "./index-C_WgunUr.js";
import "./array-BFSjnO9c.js";
import "./data-BFm2FCTm.js";
import "./data-fdG1PpsD.js";
import "./useQuery-B7mL_evE.js";
import "./useBaseQuery-CMboOtTR.js";
const useArchiveScenarioMutation = () => {
  const archiveScenario = useServerFn(archiveScenarioFn);
  return useMutation({
    mutationKey: ["scenarios", "archive"],
    mutationFn: async (data) => archiveScenario({ data })
  });
};
function ArchiveScenario({
  children,
  scenarioId,
  scenarioName
}) {
  const [open, setOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { asChild: true, children }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Content, { children: open ? /* @__PURE__ */ jsxRuntimeExports.jsx(ArchiveScenarioContent, { scenarioId, scenarioName, onClose: () => setOpen(false) }) : null })
  ] });
}
function ArchiveScenarioContent({
  scenarioId,
  scenarioName,
  onClose
}) {
  const { t } = useTranslation(["scenarios", "common"]);
  const archiveScenarioMutation = useArchiveScenarioMutation();
  const revalidate = useLoaderRevalidator();
  const handleArchiveScenario = () => {
    archiveScenarioMutation.mutateAsync({ scenarioId }).then(() => {
      revalidate();
      onClose();
    }).catch(() => {
      zt.error(t("common:errors.unknown"));
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t("scenarios:archive_scenario.title") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-lg p-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-s text-grey-secondary", children: t("scenarios:archive_scenario.description", { name: scenarioName }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t("common:cancel") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Modal.FooterButton,
        {
          label: t("scenarios:archive_scenario.button"),
          variant: "destructive",
          onClick: handleArchiveScenario,
          isLoading: archiveScenarioMutation.isPending
        }
      )
    ] })
  ] });
}
function ArchiveScenarioButton({
  scenarioId,
  scenarioName,
  disabled
}) {
  const { t } = useTranslation(["scenarios"]);
  const hydrated = useHydrated();
  const title = disabled ? t("scenarios:archive_scenario.cannot_archive") : t("scenarios:archive_scenario.title");
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ArchiveScenario, { scenarioId, scenarioName, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", mode: "icon", disabled: !hydrated || disabled, "aria-label": title, title, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "inbox", className: "size-6" }) }) });
}
const useCopyScenarioMutation = () => {
  const copyScenario = useServerFn(copyScenarioFn);
  return useMutation({
    mutationKey: ["scenarios", "copy"],
    mutationFn: async (data) => copyScenario({ data })
  });
};
const copyScenarioFormSchema = object({
  name: string()
});
function CopyScenario({
  children,
  scenarioId,
  scenarioName
}) {
  const [open, setOpen] = reactExports.useState(false);
  const handleSuccess = () => {
    setOpen(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { asChild: true, children }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CopyScenarioContent, { scenarioId, scenarioName, onSuccess: handleSuccess }) })
  ] });
}
function CopyScenarioContent({ scenarioId, scenarioName, onSuccess }) {
  const { t } = useTranslation(["scenarios", "common"]);
  const copyScenarioMutation = useCopyScenarioMutation();
  const router = useRouter();
  const form = useForm({
    defaultValues: {
      name: ""
    },
    onSubmit: async ({ value }) => {
      try {
        await copyScenarioMutation.mutateAsync({
          scenarioId,
          name: value.name || t("scenarios:copy_scenario.name_placeholder", { name: scenarioName })
        });
        zt.success(t("common:success.save"));
        onSuccess();
        router.invalidate();
      } catch {
        zt.error(t("common:errors.unknown"));
      }
    },
    validators: {
      onSubmitAsync: copyScenarioFormSchema
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit(form), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t("scenarios:copy_scenario.title") }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-lg p-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-s text-grey-secondary", children: t("scenarios:copy_scenario.description", { name: scenarioName }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "name", children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group flex w-full flex-col gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { name: field.name, children: t("scenarios:copy_scenario.name") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          FormInput,
          {
            type: "text",
            name: field.name,
            defaultValue: field.state.value,
            onChange: (e) => field.handleChange(e.currentTarget.value),
            onBlur: field.handleBlur,
            valid: field.state.meta.errors.length === 0,
            placeholder: t("scenarios:copy_scenario.name_placeholder", { name: scenarioName })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t("common:cancel") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Modal.FooterButton,
        {
          label: t("scenarios:copy_scenario.button"),
          type: "submit",
          isLoading: copyScenarioMutation.isPending
        }
      )
    ] })
  ] });
}
function CopyScenarioButton({ scenarioId, scenarioName }) {
  const { t } = useTranslation(["scenarios"]);
  const hydrated = useHydrated();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(CopyScenario, { scenarioId, scenarioName, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    Button,
    {
      variant: "secondary",
      mode: "icon",
      disabled: !hydrated,
      "aria-label": t("scenarios:copy_scenario.title"),
      title: t("scenarios:copy_scenario.title"),
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "copy", className: "size-6" })
    }
  ) });
}
const useCreateScenarioMutation = () => {
  const createScenario = useServerFn(createScenarioFn);
  return useMutation({
    mutationKey: ["scenarios", "create"],
    mutationFn: async (data) => createScenario({ data })
  });
};
function CreateScenario({ children }) {
  const hydrated = useHydrated();
  const dataModelQuery = useDataModelQuery();
  const [open, setOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { asChild: true, disabled: hydrated && !dataModelQuery.isSuccess, children }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Content, { children: dataModelQuery.isSuccess ? /* @__PURE__ */ jsxRuntimeExports.jsx(CreateScenarioContent, { dataModel: dataModelQuery.data.dataModel, onCreateSuccess: () => setOpen(false) }) : null })
  ] });
}
function CreateScenarioContent({ dataModel, onCreateSuccess }) {
  const { t, i18n } = useTranslation(["common", "scenarios"]);
  const createScenarioMutation = useCreateScenarioMutation();
  const revalidate = useLoaderRevalidator();
  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      triggerObjectType: ""
    },
    onSubmit: ({ value }) => {
      createScenarioMutation.mutateAsync(value).then(() => {
        onCreateSuccess();
        revalidate();
      }).catch(() => {
        zt.error(t("common:errors.unknown"));
      });
    },
    validators: {
      onSubmit: createScenarioPayloadSchema
    }
  });
  const isSubmitting = createScenarioMutation.isPending || form.state.isSubmitting;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit(form), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t("scenarios:create_scenario.title") }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-lg p-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Description, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { variant: "outlined", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Trans,
        {
          t,
          i18nKey: "scenarios:create_scenario.callout",
          components: {
            DocLink: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { href: scenarioObjectDocHref })
          }
        }
      ) }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col gap-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          form.Field,
          {
            name: "name",
            validators: {
              onChange: createScenarioPayloadSchema.shape.name
            },
            children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group flex w-full flex-col gap-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { name: field.name, children: t("scenarios:create_scenario.name") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                FormInput,
                {
                  type: "text",
                  name: field.name,
                  defaultValue: field.state.value,
                  onChange: (e) => field.handleChange(e.currentTarget.value),
                  valid: field.state.meta.errors.length === 0,
                  placeholder: t("scenarios:create_scenario.name_placeholder")
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "description", children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group flex w-full flex-col gap-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { name: field.name, children: t("scenarios:create_scenario.description") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            FormInput,
            {
              type: "text",
              name: field.name,
              defaultValue: field.state.value,
              onChange: (e) => field.handleChange(e.currentTarget.value),
              valid: field.state.meta.errors.length === 0,
              placeholder: t("scenarios:create_scenario.description_placeholder")
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          form.Field,
          {
            name: "triggerObjectType",
            validators: {
              onChange: createScenarioPayloadSchema.shape.triggerObjectType
            },
            children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group flex w-full flex-col gap-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(FormLabel, { name: field.name, className: "flex flex-row items-center gap-xs", children: [
                t("scenarios:create_scenario.trigger_object_title"),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  HovercardProvider,
                  {
                    showTimeout: 0,
                    hideTimeout: 0,
                    placement: i18n.dir() === "ltr" ? "right" : "left",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        HovercardAnchor,
                        {
                          tabIndex: -1,
                          className: "text-grey-disabled hover:text-grey-secondary cursor-pointer transition-colors",
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "tip", className: "size-5" })
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Hovercard,
                        {
                          portal: true,
                          gutter: 4,
                          className: "bg-surface-card border-grey-border flex w-fit max-w-80 rounded-sm border p-sm shadow-md",
                          children: t("scenarios:trigger_object.description")
                        }
                      )
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                SelectV2,
                {
                  placeholder: t("scenarios:create_scenario.trigger_object_placeholder"),
                  value: field.state.value,
                  onChange: (value) => {
                    field.handleChange(value);
                    field.handleBlur();
                  },
                  options: dataModel.map((tableName) => ({
                    label: tableName.name,
                    value: tableName.name
                  }))
                }
              ),
              dataModel.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: t("scenarios:create_scenario.no_trigger_object") }) : null,
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
            ] })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t("common:cancel") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { label: t("common:save"), type: "submit", isLoading: isSubmitting })
    ] })
  ] });
}
const useUnarchiveScenarioMutation = () => {
  const unarchiveScenario = useServerFn(unarchiveScenarioFn);
  const revalidate = useLoaderRevalidator();
  return useMutation({
    mutationKey: ["scenarios", "unarchive"],
    mutationFn: async (data) => unarchiveScenario({ data }),
    onSuccess: () => {
      revalidate();
    }
  });
};
function UnarchiveScenarioButton({
  scenarioId,
  disabled,
  iconOnly = false
}) {
  const { t } = useTranslation(["scenarios", "common"]);
  const unarchiveScenarioMutation = useUnarchiveScenarioMutation();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Button,
    {
      variant: "secondary",
      mode: iconOnly ? "icon" : "normal",
      disabled: disabled || unarchiveScenarioMutation.isPending,
      "aria-label": iconOnly ? t("scenarios:unarchive_scenario.button") : void 0,
      title: iconOnly ? t("scenarios:unarchive_scenario.button") : void 0,
      onClick: () => {
        unarchiveScenarioMutation.mutate(
          { scenarioId },
          {
            onSuccess: () => zt.success(t("common:success.save")),
            onError: () => zt.error(t("common:errors.unknown"))
          }
        );
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "restart-alt", className: "size-6" }),
        !iconOnly ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: t("scenarios:unarchive_scenario.button") }) : null
      ]
    }
  );
}
function UpdateScenario({
  children,
  defaultValue
}) {
  const [open, setOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { asChild: true, children }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(UpdateScenarioContent, { defaultValue, onUpdateSuccess: () => setOpen(false) }) })
  ] });
}
function UpdateScenarioContent({
  defaultValue,
  onUpdateSuccess
}) {
  const { t } = useTranslation(["scenarios", "common"]);
  const updateScenarioMutation = useUpdateScenarioMutation();
  const revalidate = useLoaderRevalidator();
  const form = useForm({
    defaultValues: defaultValue,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        updateScenarioMutation.mutateAsync(value).then(() => {
          onUpdateSuccess();
          revalidate();
        }).catch(() => {
          zt.error(t("common:errors.unknown"));
        });
      }
    },
    validators: {
      onSubmitAsync: updateScenarioPayloadSchema
    }
  });
  const isSubmitting = updateScenarioMutation.isPending || form.state.isSubmitting;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit(form), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t("scenarios:update_scenario.title") }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-lg p-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        form.Field,
        {
          name: "name",
          validators: {
            onBlur: updateScenarioPayloadSchema.shape.name,
            onChange: updateScenarioPayloadSchema.shape.name
          },
          children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group flex w-full flex-col gap-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { name: field.name, children: t("scenarios:create_scenario.name") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              FormInput,
              {
                type: "text",
                name: field.name,
                defaultValue: field.state.value,
                onChange: (e) => field.handleChange(e.currentTarget.value),
                onBlur: field.handleBlur,
                valid: field.state.meta.errors.length === 0,
                placeholder: t("scenarios:create_scenario.name_placeholder")
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
            onBlur: updateScenarioPayloadSchema.shape.description,
            onChange: updateScenarioPayloadSchema.shape.description
          },
          children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group flex w-full flex-col gap-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { name: field.name, children: t("scenarios:create_scenario.description") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              FormInput,
              {
                type: "text",
                name: field.name,
                defaultValue: field.state.value,
                onChange: (e) => field.handleChange(e.currentTarget.value),
                onBlur: field.handleBlur,
                valid: field.state.meta.errors.length === 0,
                placeholder: t("scenarios:create_scenario.description_placeholder")
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
          ] })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t("common:cancel") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { label: t("common:save"), type: "submit", isLoading: isSubmitting })
    ] })
  ] });
}
function UpdateScenarioButton({ defaultValue }) {
  const { t } = useTranslation(["scenarios"]);
  const hydrated = useHydrated();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(UpdateScenario, { defaultValue, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    Button,
    {
      variant: "secondary",
      mode: "icon",
      disabled: !hydrated,
      "aria-label": t("scenarios:update_scenario.edit_name_description"),
      title: t("scenarios:update_scenario.edit_name_description"),
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "edit-square", className: "size-6" })
    }
  ) });
}
function getBreakpointValue(breakpoint) {
  if (typeof window === "undefined") return null;
  const value = getComputedStyle(document.documentElement).getPropertyValue(`--breakpoint-${breakpoint}`).trim();
  return value || null;
}
function useMediaQuery(breakpoint) {
  const [matches, setMatches] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const breakpointValue = getBreakpointValue(breakpoint);
    if (!breakpointValue) return;
    const mediaQuery = window.matchMedia(`(min-width: ${breakpointValue})`);
    const handleChange = () => {
      setMatches(mediaQuery.matches);
    };
    handleChange();
    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [breakpoint]);
  return matches;
}
const columnHelper = createColumnHelper();
function DetectionScenariosPage() {
  const {
    t
  } = useTranslation(["scenarios", "navigation"]);
  const {
    scenarios,
    isEditScenarioAvailable,
    scenarioMetadataMap
  } = Route.useLoaderData();
  const hydrated = useHydrated();
  const formatDateTime = useFormatDateTime();
  const isLargeScreen = useMediaQuery("xl");
  const columns = reactExports.useMemo(() => [columnHelper.accessor((row) => ({
    liveVersionId: row.liveVersionId,
    archived: row.archived,
    id: row.id
  }), {
    id: "status",
    header: t("scenarios:list.column.status"),
    size: 100,
    cell: ({
      getValue
    }) => {
      const {
        liveVersionId,
        archived,
        id
      } = getValue();
      if (archived) {
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { size: "small", color: "grey", className: "capitalize", children: t("scenarios:archived") });
      }
      if (liveVersionId) {
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { size: "small", color: "purple", className: "capitalize", children: t("scenarios:live") });
      }
      const latestVersion = getLatestVersion(scenarioMetadataMap[id]?.versions);
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { size: "small", color: "grey", className: "capitalize", children: getFormattedVersion({
        version: latestVersion
      }, t) });
    }
  }), columnHelper.accessor("name", {
    id: "name",
    header: t("scenarios:list.column.name"),
    size: 250,
    sortingFn: "text",
    enableSorting: true
  }), columnHelper.accessor("description", {
    id: "description",
    header: t("scenarios:list.column.description"),
    size: 250
  }), columnHelper.accessor("triggerObjectType", {
    id: "triggerObjectType",
    header: t("scenarios:list.column.trigger_object"),
    size: 140,
    cell: ({
      getValue
    }) => {
      const triggerObjectType = getValue();
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "purple", size: "small", children: triggerObjectType });
    }
  }), columnHelper.accessor("createdAt", {
    id: "createdAt",
    header: t("scenarios:list.column.created_at"),
    size: 200,
    cell: ({
      getValue
    }) => {
      const createdAt = getValue();
      return formatDateTime(createdAt, {
        dateStyle: "short",
        timeStyle: "short"
      });
    }
  }), columnHelper.display({
    id: "actions",
    header: "",
    size: 144,
    cell: ({
      row
    }) => {
      if (!isEditScenarioAvailable) return null;
      if (row.original.archived) {
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-sm", onClick: (event) => event.stopPropagation(), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(UpdateScenarioButton, { defaultValue: {
            name: row.original.name,
            scenarioId: row.original.id,
            description: row.original.description
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(UnarchiveScenarioButton, { scenarioId: row.original.id, disabled: !hydrated, iconOnly: true })
        ] });
      }
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-sm", onClick: (event) => event.stopPropagation(), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(UpdateScenarioButton, { defaultValue: {
          name: row.original.name,
          scenarioId: row.original.id,
          description: row.original.description
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CopyScenarioButton, { scenarioId: row.original.id, scenarioName: row.original.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArchiveScenarioButton, { scenarioId: row.original.id, scenarioName: row.original.name, disabled: !!row.original.liveVersionId })
      ] });
    }
  })], [t, formatDateTime, hydrated, isEditScenarioAvailable]);
  const {
    table,
    getBodyProps,
    rows,
    getContainerProps
  } = useTable({
    data: scenarios,
    columns,
    state: {
      columnVisibility: {
        createdAt: isLargeScreen,
        description: isLargeScreen
      }
    },
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    rowLink: ({
      id
    }) => /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/detection/scenarios/$scenarioId", params: {
      scenarioId: fromUUIDtoSUUID(id)
    } })
  });
  const isEmpty = rows.length === 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Page.Main, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Content, { width: "table", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DetectionNavigationTabs, { actions: /* @__PURE__ */ jsxRuntimeExports.jsx(CreateScenario, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "medium", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-6", "aria-hidden": true }),
      t("scenarios:create_scenario.title")
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { variant: "outlined", children: t("scenarios:list.callout") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-md", children: isEmpty ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface-card border-grey-border flex h-28 max-w-3xl flex-col items-center justify-center rounded-lg border border-solid p-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-s font-medium", children: t("scenarios:empty_scenario_list") }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table.Container, { ...getContainerProps(), className: "bg-surface-card max-h-[70dvh]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Header, { headerGroups: table.getHeaderGroups() }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Body, { ...getBodyProps(), children: rows.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Row, { row, className: clsx(row.original.archived && "opacity-50") }, row.id)) })
    ] }) })
  ] }) });
}
function getLatestVersion(versions = []) {
  if (versions.length === 0) return null;
  const latestVersion = versions.reduce((max, v) => v !== null && (max === null || v > max) ? v : max, null);
  return latestVersion;
}
export {
  DetectionScenariosPage as component
};
