import { r as reactExports, R as jsxRuntimeExports } from "../server.js";
import { U as Route, L as Link, P as Page } from "./router-vb7i5euz.js";
import { u as useTranslation, e4 as Modal, B as Button, e as Icon, d as cn, en as useTable, ek as Table, el as createColumnHelper, em as getCoreRowModel } from "./format-NPGUXq-g.js";
import { C as CollapsiblePaper } from "./Paper-6W_X6MFt.js";
import { F as FormErrorOrDescription } from "./FormErrorOrDescription-DO6Hdfmn.js";
import { F as FormInput } from "./FormInput-S5xzkMXf.js";
import { F as FormLabel } from "./FormLabel-DeCgtgtj.js";
import { u as useLoaderRevalidator } from "./LoaderRevalidatorContext-C9s56i-l.js";
import { f as createInboxPayloadSchema, m as updateOrganizationPayloadSchema } from "./settings-CEpHMlp5.js";
import { o as createInboxFn, p as updateOrganizationFn } from "./settings-CPv2zx4k.js";
import { u as useMutation } from "./useMutation-C5oG90Zs.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { g as getFieldErrors, h as handleSubmit } from "./form-D2XmDKeG.js";
import { u as useForm } from "./useForm-BwABQKAs.js";
import { y as useQueryClient } from "./QueryClientProvider-DYTpkCko.js";
import { z as zt } from "./CopyToClipboardButton-CJNJJful.js";
import { H as HiddenInputs } from "./HiddenInputs-DIIDD4dd.js";
import { N as Nudge } from "./Nudge-C1ux5IUa.js";
import { n as number, b as fromUUIDtoSUUID } from "./short-uuid-MIi3jWzx.js";
import { C as ColorPreview, U as UpdateTag, D as DeleteTag, a as CreateTag } from "./UpdateTag-DCRbQZKL.js";
import { u as t, o as t$2, bG as tKeyForInboxUserRole, p as t$3, $ as t$4 } from "./services-middleware-DR8Hua1Y.js";
import { t as t$1 } from "./join-BeQTfqAC.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
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
import "./sharpstate.es-CeF1Mf5b.js";
import "./isNullish-B8pc8Ntu.js";
import "./use-callback-ref-DXzIzfqy.js";
import "./index-x7n7VJTa.js";
import "./index-C_WgunUr.js";
import "./array-BFSjnO9c.js";
import "./index-CtZTigeT.js";
import "./index-BF4TC3go.js";
import "./index-CR1bHmei.js";
import "node:crypto";
const useCreateInboxMutation = () => {
  const createInbox = useServerFn(createInboxFn);
  return useMutation({
    mutationKey: ["settings", "inboxes", "create"],
    mutationFn: async (payload) => createInbox({ data: payload })
  });
};
function CreateInbox({
  redirectRoutePath,
  onInboxCreated,
  className,
  size
}) {
  const { t: t2 } = useTranslation(["common", "settings"]);
  const [open, setOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { onClick: (e) => e.stopPropagation(), asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: cn("whitespace-nowrap", className), variant: "secondary", appearance: "stroked", size, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "new-inbox", className: "size-5 shrink-0" }),
      t2("settings:inboxes.new_inbox.create")
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Content, { onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(CreateInboxContent, { setOpen, redirectRoutePath, onInboxCreated }) })
  ] });
}
function CreateInboxContent({
  redirectRoutePath,
  setOpen,
  onInboxCreated
}) {
  const { t: t2 } = useTranslation(["common", "settings"]);
  const createInboxMutation = useCreateInboxMutation();
  const revalidate = useLoaderRevalidator();
  const queryClient = useQueryClient();
  const form = useForm({
    defaultValues: { name: "", redirectRoute: redirectRoutePath },
    validators: {
      onSubmit: createInboxPayloadSchema
    },
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        createInboxMutation.mutateAsync(value).then((result) => {
          zt.success(t2("common:success.save"));
          setOpen(false);
          queryClient.invalidateQueries({ queryKey: ["inboxes"] });
          revalidate();
          if (result?.inboxId) {
            onInboxCreated?.(result.inboxId);
          }
        }).catch(() => {
          zt.error(t2("common:errors.unknown"));
        });
      }
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "form",
    {
      onSubmit: (e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t2("settings:inboxes.new_inbox.explain") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-lg p-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(HiddenInputs, { redirectRoute: redirectRoutePath }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "name", children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group flex flex-col gap-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { name: field.name, children: t2("settings:inboxes.new_inbox.name") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              FormInput,
              {
                name: field.name,
                onBlur: field.handleBlur,
                onChange: (e) => field.handleChange(e.currentTarget.value),
                valid: field.state.meta.errors.length === 0,
                type: "text"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t2("common:cancel") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Modal.FooterButton,
            {
              label: t2("settings:inboxes.new_inbox.create"),
              type: "submit",
              name: "create",
              disabled: createInboxMutation.isPending,
              leadingIcon: "new-inbox"
            }
          )
        ] })
      ]
    }
  );
}
const useUpdateOrganizationMutation = () => {
  const updateOrganization = useServerFn(updateOrganizationFn);
  return useMutation({
    mutationFn: async (payload) => updateOrganization({ data: payload })
  });
};
function UpdateOrganizationSettings({
  organizationId,
  autoAssignQueueLimit,
  isAutoAssignmentAvailable = false
}) {
  const { t: t2 } = useTranslation(["common", "settings"]);
  const [open, setOpen] = reactExports.useState(false);
  if (!isAutoAssignmentAvailable) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "w-fit whitespace-nowrap", disabled: true, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "edit-square", className: "size-5" }),
        t2("common:edit")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Nudge,
        {
          className: "absolute -top-1 -right-1 size-4",
          iconClass: "size-2.5",
          kind: "restricted",
          content: t2("settings:inboxes.auto_assign_queue_limit.nudge", {
            defaultValue: "N/A"
          })
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { asChild: true, onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "w-fit whitespace-nowrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "edit-square", className: "size-5" }),
      t2("common:edit")
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Content, { onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      UpdateOrganizationSettingsContents,
      {
        organizationId,
        autoAssignQueueLimit,
        closeModal: () => setOpen(false)
      }
    ) })
  ] });
}
function UpdateOrganizationSettingsContents({
  organizationId,
  autoAssignQueueLimit,
  closeModal
}) {
  const { t: t2 } = useTranslation(["common", "settings"]);
  const updateOrganizationMutation = useUpdateOrganizationMutation();
  const revalidate = useLoaderRevalidator();
  const form = useForm({
    defaultValues: {
      organizationId,
      autoAssignQueueLimit
    },
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        updateOrganizationMutation.mutateAsync(value).then(() => {
          zt.success(t2("common:success.save"));
          closeModal();
          revalidate();
        }).catch(() => {
          zt.error(t2("common:errors.unknown"));
        });
      }
    },
    validators: {
      onSubmit: updateOrganizationPayloadSchema.pick({ organizationId: true, autoAssignQueueLimit: true }).required({ autoAssignQueueLimit: true })
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit(form), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t2("settings:global_settings.title") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface-card flex flex-col gap-lg p-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      form.Field,
      {
        name: "autoAssignQueueLimit",
        validators: {
          onChange: number().min(0),
          onBlur: number().min(0)
        },
        children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group flex flex-col gap-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { name: field.name, children: t2("settings:global_settings.auto_assign_queue_limit") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            FormInput,
            {
              type: "number",
              min: 0,
              step: 1,
              placeholder: t2("settings:global_settings.auto_assign_queue_limit"),
              max: 1e3,
              name: field.name,
              onBlur: field.handleBlur,
              onChange: (e) => field.handleChange(+e.currentTarget.value),
              defaultValue: field.state.value,
              valid: field.state.meta.errors.length === 0
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
        ] })
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t2("common:cancel") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Modal.FooterButton,
        {
          label: t2("common:save"),
          type: "submit",
          name: "update",
          disabled: updateOrganizationMutation.isPending
        }
      )
    ] })
  ] });
}
const inboxColumnHelper = createColumnHelper();
const tagColumnHelper = createColumnHelper();
function CaseManagerSettings() {
  const {
    t: t$5
  } = useTranslation(["common", "settings"]);
  const {
    isAutoAssignmentAvailable,
    inboxes,
    isCreateInboxAvailable,
    autoAssignQueueLimit,
    organizationId,
    canReadTags,
    tags,
    isCreateTagAvailable,
    isEditTagAvailable,
    isDeleteTagAvailable
  } = Route.useLoaderData();
  const inboxColumns = reactExports.useMemo(() => {
    return [inboxColumnHelper.accessor((row) => row.name, {
      id: "name",
      header: t$5("settings:inboxes.name"),
      size: 100
    }), inboxColumnHelper.accessor((row) => row.users, {
      id: "users",
      header: t$5("settings:inboxes.users"),
      size: 200,
      cell: ({
        getValue
      }) => {
        const users = getValue();
        if (!users) return null;
        return t(users, t$4((u) => u.role), t$3(), t$2(([role, users2]) => {
          return t$5(tKeyForInboxUserRole(role), {
            count: users2.length
          });
        }), t$1(", "));
      }
    }), inboxColumnHelper.accessor((row) => row.casesCount, {
      id: "cases",
      header: t$5("settings:inboxes.cases"),
      size: 100
    })];
  }, [t$5]);
  const inboxTable = useTable({
    data: inboxes,
    columns: inboxColumns,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false,
    rowLink: ({
      id
    }) => /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/settings/inboxes/$inboxId", params: {
      inboxId: fromUUIDtoSUUID(id)
    } })
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Content, { width: "readable", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CollapsiblePaper.Container, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CollapsiblePaper.Title, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1", children: t$5("settings:inboxes") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(UpdateOrganizationSettings, { isAutoAssignmentAvailable, organizationId, autoAssignQueueLimit }),
        isCreateInboxAvailable ? /* @__PURE__ */ jsxRuntimeExports.jsx(CreateInbox, { redirectRoutePath: "/settings/inboxes/$inboxId" }) : null
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CollapsiblePaper.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table.Container, { ...inboxTable.getContainerProps(), className: "max-h-96", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Header, { headerGroups: inboxTable.table.getHeaderGroups() }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Body, { ...inboxTable.getBodyProps(), children: inboxTable.rows.map((row) => {
          return /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Row, { row }, row.id);
        }) })
      ] }) })
    ] }),
    canReadTags ? /* @__PURE__ */ jsxRuntimeExports.jsx(TagsSection, { tags, isCreateTagAvailable, isEditTagAvailable, isDeleteTagAvailable }) : null
  ] });
}
function TagsSection({
  tags,
  isCreateTagAvailable,
  isEditTagAvailable,
  isDeleteTagAvailable
}) {
  const {
    t: t2
  } = useTranslation(["settings"]);
  const columns = reactExports.useMemo(() => {
    return [tagColumnHelper.accessor((row) => row.name, {
      id: "name",
      header: t2("settings:tags.name"),
      size: 200
    }), tagColumnHelper.accessor((row) => row.color, {
      id: "color",
      header: t2("settings:tags.color"),
      size: 100,
      cell: ({
        getValue
      }) => /* @__PURE__ */ jsxRuntimeExports.jsx(ColorPreview, { color: getValue() })
    }), tagColumnHelper.accessor((row) => row.cases_count, {
      id: "cases",
      header: t2("settings:tags.cases"),
      size: 200
    }), tagColumnHelper.accessor((row) => row.target, {
      id: "target",
      header: t2("settings:tags.target"),
      cell: ({
        cell
      }) => {
        return t2(`settings:tags.target.${cell.getValue()}`);
      },
      size: 100
    }), ...isEditTagAvailable || isDeleteTagAvailable ? [tagColumnHelper.display({
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
  }, [isDeleteTagAvailable, isEditTagAvailable, t2]);
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(CollapsiblePaper.Container, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CollapsiblePaper.Title, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1", children: t2("settings:tags") }),
      isCreateTagAvailable ? /* @__PURE__ */ jsxRuntimeExports.jsx(CreateTag, {}) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CollapsiblePaper.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table.Container, { ...getContainerProps(), className: "max-h-96", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Header, { headerGroups: table.getHeaderGroups() }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Body, { ...getBodyProps(), children: rows.map((row) => {
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Row, { className: "hover:bg-surface-row-hover group", row }, row.id);
      }) })
    ] }) })
  ] });
}
export {
  CaseManagerSettings as component
};
