import { r as reactExports, R as jsxRuntimeExports } from "../server.js";
import { u as useTranslation, e4 as Modal, B as Button, e as Icon, e8 as MenuCommand, b as clsx, dz as Switch, dZ as SelectV2, en as useTable, d as cn, ek as Table, dD as Tooltip, el as createColumnHelper, ev as getSortedRowModel, em as getCoreRowModel } from "./format-NPGUXq-g.js";
import { w as matchSorter, ad as Route, P as Page } from "./router-vb7i5euz.js";
import { C as CollapsiblePaper } from "./Paper-6W_X6MFt.js";
import { N as Nudge } from "./Nudge-C1ux5IUa.js";
import { F as FormErrorOrDescription } from "./FormErrorOrDescription-DO6Hdfmn.js";
import { F as FormLabel } from "./FormLabel-DeCgtgtj.js";
import { u as useLoaderRevalidator } from "./LoaderRevalidatorContext-C9s56i-l.js";
import { bG as tKeyForInboxUserRole } from "./services-middleware-DR8Hua1Y.js";
import { h as createInboxUserPayloadSchema, u as updateInboxPayloadSchema, k as updateInboxUserPayloadSchema } from "./settings-CEpHMlp5.js";
import { w as createInboxUserFn, x as deleteInboxFn, y as deleteInboxUserFn, z as updateInboxFn, A as updateInboxUserFn, B as editInboxUserAutoAssignFn } from "./settings-CPv2zx4k.js";
import { u as useMutation } from "./useMutation-C5oG90Zs.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { A as isAccessible } from "./feature-access-B8PIS8ad.js";
import { g as getFieldErrors } from "./form-D2XmDKeG.js";
import { u as useForm } from "./useForm-BwABQKAs.js";
import { z as zt } from "./CopyToClipboardButton-CJNJJful.js";
import { F as FormInput } from "./FormInput-S5xzkMXf.js";
import { u as useOrganizationUsers } from "./organization-users-Bxl0ZW8k.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
import "./sharpstate.es-CeF1Mf5b.js";
import "./isNullish-B8pc8Ntu.js";
import "./use-callback-ref-DXzIzfqy.js";
import "./QueryClientProvider-DYTpkCko.js";
import "./security-headers.server-BdP3HrPp.js";
import "./ThemeContext-B40HQxfH.js";
import "./config-ut8rAdyo.js";
import "./short-uuid-MIi3jWzx.js";
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
import "./index-CtZTigeT.js";
import "./index-BF4TC3go.js";
import "./index-C_WgunUr.js";
import "./index-CR1bHmei.js";
import "./index-x7n7VJTa.js";
import "node:crypto";
import "./array-BFSjnO9c.js";
import "./create-context-CYc8deix.js";
const useCreateInboxUserMutation = () => {
  const createInboxUser = useServerFn(createInboxUserFn);
  return useMutation({
    mutationKey: ["settings", "inboxes", "inbox-users", "create"],
    mutationFn: async (payload) => createInboxUser({ data: payload })
  });
};
function CreateInboxUser({
  inboxId,
  users,
  inboxUserRoles,
  access,
  isAutoAssignmentAvailable = false
}) {
  const { t } = useTranslation(["common", "settings"]);
  const [open, setOpen] = reactExports.useState(false);
  const handleOnSuccess = () => {
    setOpen(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { asChild: true, onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-5" }),
      t("settings:inboxes.inbox_details.add_member")
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Content, { onClick: (e) => e.stopPropagation(), "aria-describedby": void 0, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      CreateInboxUserContent,
      {
        currentInboxId: inboxId,
        users,
        inboxUserRoles,
        access,
        isAutoAssignmentAvailable,
        onSuccess: handleOnSuccess
      }
    ) })
  ] });
}
function CreateInboxUserContent({
  currentInboxId,
  users,
  inboxUserRoles,
  access,
  isAutoAssignmentAvailable = false,
  onSuccess
}) {
  const { t } = useTranslation(["common", "settings"]);
  const createInboxUserMutation = useCreateInboxUserMutation();
  const revalidate = useLoaderRevalidator();
  const [searchValue, setSearchValue] = reactExports.useState("");
  const [userMenuOpen, setUserMenuOpen] = reactExports.useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = reactExports.useState(false);
  const deferredSearchValue = reactExports.useDeferredValue(searchValue);
  const filteredUsers = reactExports.useMemo(
    () => matchSorter(users, deferredSearchValue, {
      keys: [(u) => `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim(), "firstName", "lastName"]
    }),
    [deferredSearchValue, users]
  );
  const form = useForm({
    defaultValues: {
      userId: "",
      inboxId: currentInboxId,
      role: "admin",
      autoAssignable: false
    },
    onSubmit: ({ value }) => {
      createInboxUserMutation.mutateAsync(value).then(() => {
        onSuccess();
        revalidate();
      }).catch(() => {
        zt.error(t("common:errors.unknown"));
      });
    },
    validators: {
      onSubmit: createInboxUserPayloadSchema
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
        /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t("settings:inboxes.inbox_details.add_member") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface-card flex flex-col gap-lg p-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            form.Field,
            {
              name: "userId",
              validators: {
                onChange: createInboxUserPayloadSchema.shape.userId
              },
              children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group flex flex-col gap-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { name: field.name, children: t("settings:inboxes.inbox_details.user") }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { open: userMenuOpen, onOpenChange: setUserMenuOpen, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.SelectButton, { hasError: field.state.meta.errors.length > 0, className: "w-full", children: users.find((u) => u.userId === field.state.value) ? `${users.find((u) => u.userId === field.state.value)?.firstName ?? ""} ${users.find((u) => u.userId === field.state.value)?.lastName ?? ""}` : "" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Content, { sameWidth: true, align: "start", className: "min-w-(--radix-popover-trigger-width)", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Combobox, { placeholder: t("common:search"), onValueChange: setSearchValue }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.List, { className: "max-h-60", children: [
                      filteredUsers.map(({ userId, firstName, lastName }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                        MenuCommand.Item,
                        {
                          value: `${firstName ?? ""} ${lastName ?? ""}`.trim(),
                          selected: field.state.value === userId,
                          onSelect: () => {
                            field.handleChange(userId);
                            setUserMenuOpen(false);
                            setSearchValue("");
                          },
                          children: `${firstName} ${lastName}`
                        },
                        userId
                      )),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Empty, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center p-sm", children: t("common:no_results", { defaultValue: "" }) }) })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            form.Field,
            {
              name: "role",
              validators: {
                onChange: createInboxUserPayloadSchema.shape.role
              },
              children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group flex flex-col gap-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(FormLabel, { name: field.name, className: "flex gap-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: clsx({ "text-grey-disabled": access === "restricted" }), children: t("settings:inboxes.inbox_details.role") }),
                  access === "allowed" ? null : /* @__PURE__ */ jsxRuntimeExports.jsx(Nudge, { content: t("settings:users.role.nudge"), className: "size-6", kind: access })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { open: roleMenuOpen, onOpenChange: setRoleMenuOpen, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    MenuCommand.SelectButton,
                    {
                      hasError: field.state.meta.errors.length > 0,
                      className: "w-full",
                      disabled: !isAccessible(access),
                      children: field.state.value ? t(tKeyForInboxUserRole(field.state.value)) : ""
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Content, { sameWidth: true, align: "start", className: "min-w-(--radix-popover-trigger-width)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.List, { children: inboxUserRoles.map((role) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                    MenuCommand.Item,
                    {
                      value: role,
                      selected: field.state.value === role,
                      onSelect: () => {
                        field.handleChange(role);
                        setRoleMenuOpen(false);
                      },
                      children: t(tKeyForInboxUserRole(role))
                    },
                    role
                  )) }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            form.Field,
            {
              name: "autoAssignable",
              validators: {
                onChange: createInboxUserPayloadSchema.shape.autoAssignable
              },
              children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group flex justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { name: field.name, className: "flex items-center gap-sm", children: t("settings:inboxes.inbox_details.auto_assign_enabled.label") }),
                  !isAutoAssignmentAvailable ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Nudge,
                    {
                      className: "size-5",
                      kind: "restricted",
                      content: t("settings:inboxes.auto_assign_queue_limit.nudge", {
                        defaultValue: "N/A"
                      })
                    }
                  ) : null
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Switch,
                  {
                    checked: isAutoAssignmentAvailable ? field.state.value : false,
                    onCheckedChange: field.handleChange,
                    disabled: !isAutoAssignmentAvailable
                  }
                )
              ] })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t("common:cancel") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Modal.FooterButton,
            {
              label: t("settings:inboxes.inbox_details.create_user"),
              type: "submit",
              name: "create",
              leadingIcon: "new-inbox",
              isLoading: createInboxUserMutation.isPending
            }
          )
        ] })
      ]
    }
  );
}
const useDeleteInboxMutation = () => {
  const deleteInbox = useServerFn(deleteInboxFn);
  return useMutation({
    mutationKey: ["settings", "inboxes", "delete"],
    mutationFn: async (payload) => deleteInbox({ data: payload })
  });
};
function DeleteInbox({ inbox, disabled }) {
  const { t } = useTranslation(["common", "settings"]);
  const [open, setOpen] = reactExports.useState(false);
  const handleOnSuccess = () => {
    setOpen(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", name: "delete", disabled, className: "w-fit", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "delete", className: "size-5", "aria-label": t("settings:inboxes.delete_inbox") }),
      t("settings:inboxes.delete_inbox")
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteInboxContent, { inboxId: inbox.id, onSuccess: handleOnSuccess }) })
  ] });
}
const DeleteInboxContent = ({ inboxId, onSuccess }) => {
  const { t } = useTranslation(["common", "settings"]);
  const deleteInboxMutation = useDeleteInboxMutation();
  const revalidate = useLoaderRevalidator();
  const handleDeleteInbox = () => {
    deleteInboxMutation.mutateAsync({ inboxId }).then((res) => {
      if (!res) {
        onSuccess();
      }
      revalidate();
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t("settings:inboxes.delete_inbox") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface-card flex flex-col gap-lg p-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-s flex flex-1 flex-col gap-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { name: "inboxId", value: inboxId, type: "hidden" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center", children: t("settings:inboxes.delete_inbox.content") })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t("common:cancel") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Modal.FooterButton,
        {
          label: t("common:delete"),
          variant: "destructive",
          onClick: handleDeleteInbox,
          disabled: deleteInboxMutation.isPending,
          leadingIcon: "delete"
        }
      )
    ] })
  ] });
};
const useDeleteInboxUserMutation = () => {
  const deleteInboxUser = useServerFn(deleteInboxUserFn);
  return useMutation({
    mutationKey: ["settings", "inboxes", "inbox-users", "delete"],
    mutationFn: async (payload) => deleteInboxUser({ data: payload })
  });
};
function DeleteInboxUser({ inboxUser }) {
  const { t } = useTranslation(["common", "settings"]);
  const [open, setOpen] = reactExports.useState(false);
  const handleOnSuccess = () => {
    setOpen(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { className: "cursor-pointer block hover:text-red-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "delete", className: "size-6 shrink-0", "aria-label": t("settings:inboxes.inbox_user.delete") }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteInboxUserContent, { inboxUser, onSuccess: handleOnSuccess }) })
  ] });
}
const DeleteInboxUserContent = ({ inboxUser, onSuccess }) => {
  const { t } = useTranslation(["common", "settings"]);
  const deleteInboxUserMutation = useDeleteInboxUserMutation();
  const revalidate = useLoaderRevalidator();
  const handleDeleteInboxUser = () => {
    deleteInboxUserMutation.mutateAsync({ inboxId: inboxUser.inboxId, inboxUserId: inboxUser.id }).then((res) => {
      if (!res) {
        onSuccess();
      }
      revalidate();
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t("settings:inboxes.inbox_user.delete") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface-card flex flex-col gap-lg p-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-s flex flex-1 flex-col gap-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { name: "inboxUserId", value: inboxUser.id, type: "hidden" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { name: "inboxId", value: inboxUser.inboxId, type: "hidden" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center", children: t("settings:inboxes.inbox_user.delete.content") })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t("common:cancel") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Modal.FooterButton,
        {
          label: t("common:delete"),
          variant: "destructive",
          onClick: handleDeleteInboxUser,
          disabled: deleteInboxUserMutation.isPending,
          leadingIcon: "delete"
        }
      )
    ] })
  ] });
};
const useUpdateInboxMutation = () => {
  const updateInbox = useServerFn(updateInboxFn);
  return useMutation({
    mutationKey: ["settings", "inboxes", "update"],
    mutationFn: async (payload) => updateInbox({ data: payload })
  });
};
function UpdateInbox({
  inbox,
  escalationInboxes,
  redirectRoutePath,
  isAutoAssignmentAvailable = false
}) {
  const { t } = useTranslation(["common", "settings"]);
  const [open, setOpen] = reactExports.useState(false);
  const handleOnSuccess = () => {
    setOpen(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { asChild: true, onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "w-fit whitespace-nowrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "edit-square", className: "size-5" }),
      t("settings:inboxes.update_inbox")
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Content, { onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      UpdateInboxContent,
      {
        inbox,
        escalationInboxes,
        redirectRoutePath,
        isAutoAssignmentAvailable,
        onSuccess: handleOnSuccess
      }
    ) })
  ] });
}
function UpdateInboxContent({
  inbox,
  escalationInboxes,
  redirectRoutePath,
  isAutoAssignmentAvailable = false,
  onSuccess
}) {
  const { t } = useTranslation(["common", "settings"]);
  const updateInboxMutation = useUpdateInboxMutation();
  const revalidate = useLoaderRevalidator();
  const [isEscalationInboxOpen, setEscalationOpen] = reactExports.useState(false);
  const otherInboxes = escalationInboxes.filter((i) => i.id !== inbox.id);
  const form = useForm({
    defaultValues: {
      ...inbox,
      escalationInboxId: inbox.escalationInboxId ?? null,
      redirectRoute: redirectRoutePath
    },
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        updateInboxMutation.mutateAsync(value).then(() => {
          onSuccess();
          revalidate();
        }).catch(() => {
          zt.error(t("common:errors.unknown"));
        });
      }
    },
    validators: {
      onSubmit: updateInboxPayloadSchema
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
        /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t("settings:inboxes.update_inbox") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface-card flex flex-col gap-lg p-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            form.Field,
            {
              name: "name",
              validators: {
                onChange: updateInboxPayloadSchema.shape.name
              },
              children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group flex flex-col gap-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { name: field.name, children: t("settings:inboxes.name") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  FormInput,
                  {
                    type: "text",
                    name: field.name,
                    onBlur: field.handleBlur,
                    onChange: (e) => field.handleChange(e.currentTarget.value),
                    defaultValue: field.state.value,
                    valid: field.state.meta.errors.length === 0
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            form.Field,
            {
              name: "escalationInboxId",
              validators: {
                onChange: updateInboxPayloadSchema.shape.escalationInboxId
              },
              children: (field) => {
                const selectedInbox = escalationInboxes.find((inbox2) => inbox2.id === field.state.value);
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group flex flex-col gap-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { name: field.name, children: t("settings:inboxes.escalation_inbox") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { open: isEscalationInboxOpen, onOpenChange: setEscalationOpen, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.SelectButton, { children: selectedInbox ? selectedInbox.name : t("settings:inboxes.inbox_details.no_escalation_inbox") }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Content, { align: "start", sameWidth: true, sideOffset: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.List, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Item, { value: "", onSelect: () => field.handleChange(null), children: t("settings:inboxes.inbox_details.no_escalation_inbox") }),
                      otherInboxes.map((inbox2) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Item, { value: inbox2.id, onSelect: field.handleChange, children: inbox2.name }, inbox2.id))
                    ] }) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
                ] });
              }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            form.Field,
            {
              name: "autoAssignEnabled",
              validators: {
                onChange: updateInboxPayloadSchema.shape.autoAssignEnabled
              },
              children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group flex justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { name: field.name, children: t("settings:inboxes.inbox_details.auto_assign_enabled.label") }),
                  !isAutoAssignmentAvailable ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Nudge,
                    {
                      className: "size-5",
                      kind: "restricted",
                      content: t("settings:inboxes.auto_assign_queue_limit.nudge", {
                        defaultValue: "N/A"
                      })
                    }
                  ) : null
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Switch,
                  {
                    checked: isAutoAssignmentAvailable ? field.state.value : false,
                    onCheckedChange: field.handleChange,
                    disabled: !isAutoAssignmentAvailable
                  }
                )
              ] })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t("common:cancel") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Modal.FooterButton,
            {
              label: t("common:save"),
              type: "submit",
              name: "update",
              disabled: updateInboxMutation.isPending
            }
          )
        ] })
      ]
    }
  );
}
const useUpdateInboxUserMutation = () => {
  const updateInboxUser = useServerFn(updateInboxUserFn);
  return useMutation({
    mutationKey: ["settings", "inboxes", "inbox-users", "update"],
    mutationFn: async (payload) => updateInboxUser({ data: payload })
  });
};
function UpdateInboxUser({
  inboxUser,
  inboxUserRoles,
  access
}) {
  const { t } = useTranslation(["common", "settings"]);
  const [open, setOpen] = reactExports.useState(false);
  const handleOnSuccess = () => {
    setOpen(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { className: "cursor-pointer block", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "edit-square", className: "size-6 shrink-0", "aria-label": t("settings:tags.update_tag") }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      UpdateInboxUserContent,
      {
        currentInboxUser: inboxUser,
        inboxUserRoles,
        access,
        onSuccess: handleOnSuccess
      }
    ) })
  ] });
}
function UpdateInboxUserContent({
  currentInboxUser,
  inboxUserRoles,
  access,
  onSuccess
}) {
  const { t } = useTranslation(["common", "settings"]);
  const updateInboxUserMutation = useUpdateInboxUserMutation();
  const revalidate = useLoaderRevalidator();
  const form = useForm({
    defaultValues: currentInboxUser,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        updateInboxUserMutation.mutateAsync(value).then(() => {
          onSuccess();
          revalidate();
        }).catch(() => {
          zt.error(t("common:errors.unknown"));
        });
      }
    },
    validators: {
      onSubmit: updateInboxUserPayloadSchema
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
        /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t("settings:inboxes.inbox_user.update") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface-card flex flex-col gap-lg p-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          form.Field,
          {
            name: "role",
            validators: {
              onChange: updateInboxUserPayloadSchema.shape.role
            },
            children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group flex flex-col gap-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(FormLabel, { name: field.name, className: "flex gap-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: clsx({
                      "text-grey-disabled": access === "restricted"
                    }),
                    children: t("settings:inboxes.inbox_details.role")
                  }
                ),
                access === "allowed" ? null : /* @__PURE__ */ jsxRuntimeExports.jsx(Nudge, { content: t("settings:users.role.nudge"), className: "size-6", kind: access })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                SelectV2,
                {
                  value: field.state.value,
                  onChange: (value) => field.handleChange(value),
                  placeholder: t("settings:inboxes.inbox_details.role"),
                  disabled: !isAccessible(access),
                  options: inboxUserRoles.map((role) => ({
                    label: t(tKeyForInboxUserRole(role)),
                    value: role
                  }))
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
            ] })
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t("common:cancel") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Modal.FooterButton,
            {
              label: t("common:save"),
              type: "submit",
              name: "update",
              disabled: updateInboxUserMutation.isPending
            }
          )
        ] })
      ]
    }
  );
}
function useEditInboxUserAutoAssignMutation() {
  const editInboxUserAutoAssign = useServerFn(editInboxUserAutoAssignFn);
  return useMutation({
    mutationFn: async (payload) => editInboxUserAutoAssign({ data: payload })
  });
}
const columnHelper = createColumnHelper();
function Inbox() {
  const {
    caseCount,
    inbox,
    escalationInboxes,
    escalationInbox,
    inboxUserRoles,
    entitlements,
    isEditInboxAvailable,
    isDeleteInboxAvailable,
    isCreateInboxUserAvailable,
    isEditInboxUserAvailable,
    isDeleteInboxUserAvailable,
    isAutoAssignmentAvailable
  } = Route.useLoaderData();
  const {
    t
  } = useTranslation(["settings", "common"]);
  const {
    orgUsers
  } = useOrganizationUsers();
  const editAutoAssignMutation = useEditInboxUserAutoAssignMutation();
  const columns = reactExports.useMemo(() => {
    return [columnHelper.accessor((row) => row.userId, {
      id: "name",
      header: t("settings:inboxes.name"),
      size: 200,
      cell: ({
        getValue
      }) => {
        const user = orgUsers.find((u) => u.userId === getValue());
        if (!user) return;
        return `${user.firstName} ${user.lastName}`;
      }
    }), columnHelper.accessor((row) => row.role, {
      id: "role",
      header: t("settings:inboxes.inbox_details.role"),
      size: 200,
      cell: ({
        getValue
      }) => t(tKeyForInboxUserRole(getValue()))
    }), ...isAutoAssignmentAvailable ? [columnHelper.accessor((row) => row.autoAssignable, {
      id: "autoAssignable",
      header: t("settings:inboxes.inbox_details.auto_assign_enabled.label"),
      size: 150,
      cell: ({
        getValue,
        row
      }) => {
        const [value, setValue] = reactExports.useState(getValue());
        const handleChange = (checked) => {
          setValue(checked);
          editAutoAssignMutation.mutateAsync({
            id: row.original.id,
            autoAssignable: checked
          });
        };
        return isEditInboxUserAvailable ? /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: value, onCheckedChange: handleChange, disabled: !isEditInboxUserAvailable }) : getValue() ? t("settings:inboxes.inbox_details.auto_assign_enabled") : t("settings:inboxes.inbox_details.auto_assign_disabled");
      }
    })] : [], ...isEditInboxUserAvailable || isDeleteInboxUserAvailable ? [columnHelper.display({
      id: "actions",
      size: 100,
      cell: ({
        cell
      }) => {
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-sm", children: [
          isEditInboxUserAvailable ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "group-hover/row:text-grey-primary focus-within:text-grey-primary text-transparent cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(UpdateInboxUser, { inboxUser: cell.row.original, inboxUserRoles, access: entitlements.userRoles }) }) : null,
          isDeleteInboxUserAvailable ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "group-hover/row:text-grey-primary focus-within:text-grey-primary text-transparent cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteInboxUser, { inboxUser: cell.row.original }) }) : null
        ] });
      }
    })] : []];
  }, [inboxUserRoles, isDeleteInboxUserAvailable, isEditInboxUserAvailable, orgUsers, t, entitlements.userRoles]);
  const {
    table,
    getBodyProps,
    rows,
    getContainerProps
  } = useTable({
    data: inbox.users ?? [],
    columns,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  });
  const nonInboxUsers = orgUsers.filter((user) => !inbox.users?.some((u) => u.userId === user.userId));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Content, { width: "readable", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CollapsiblePaper.Container, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CollapsiblePaper.Title, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1", children: t("settings:inboxes.inbox_details.title") }),
        isEditInboxAvailable ? /* @__PURE__ */ jsxRuntimeExports.jsx(UpdateInbox, { inbox, escalationInboxes, redirectRoutePath: "/settings/inboxes/$inboxId", isAutoAssignmentAvailable }) : null
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CollapsiblePaper.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid auto-rows-fr grid-cols-[max-content_1fr] items-center gap-x-10 gap-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: t("settings:inboxes.name") }),
        inbox.name,
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: t("settings:inboxes.inbox_details.case_count") }),
        caseCount,
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: t("settings:inboxes.inbox_details.escalation_inbox") }),
        escalationInbox?.name ?? t("settings:inboxes.inbox_details.no_escalation_inbox"),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold flex items-center gap-sm", children: [
          t("settings:inboxes.inbox_details.auto_assign_enabled.label"),
          !isAutoAssignmentAvailable ? /* @__PURE__ */ jsxRuntimeExports.jsx(Nudge, { className: "size-5", kind: "restricted", content: t("settings:inboxes.auto_assign_queue_limit.nudge", {
            defaultValue: "N/A"
          }) }) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn({
          "blur-xs": !isAutoAssignmentAvailable
        }), children: inbox.autoAssignEnabled ? t("settings:inboxes.inbox_details.auto_assign_enabled") : t("settings:inboxes.inbox_details.auto_assign_disabled") })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CollapsiblePaper.Container, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CollapsiblePaper.Title, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1", children: t("settings:inboxes.inbox_details.members") }),
        isCreateInboxUserAvailable ? /* @__PURE__ */ jsxRuntimeExports.jsx(CreateInboxUser, { inboxId: inbox.id, users: nonInboxUsers, inboxUserRoles, access: entitlements.userRoles, isAutoAssignmentAvailable }) : null
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CollapsiblePaper.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table.Container, { ...getContainerProps(), className: "max-h-96", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Header, { headerGroups: table.getHeaderGroups() }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Body, { ...getBodyProps(), children: rows.map((row) => {
          return /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Row, { row }, row.id);
        }) })
      ] }) })
    ] }),
    isDeleteInboxAvailable ? caseCount === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteInbox, { inbox }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip.Default, { content: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "p-sm", children: t("settings:inboxes.inbox_details.delete_inbox.tooltip") }), children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-fit", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteInbox, { inbox, disabled: true }) }) }) : null
  ] });
}
export {
  Inbox as component
};
