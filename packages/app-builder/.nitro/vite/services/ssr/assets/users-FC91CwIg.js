import { O as useRouter, r as reactExports, R as jsxRuntimeExports } from "../server.js";
import { u as useTranslation, e4 as Modal, B as Button, e as Icon, e1 as Input, b as clsx, dZ as SelectV2, en as useTable, ek as Table, el as createColumnHelper, em as getCoreRowModel } from "./format-NPGUXq-g.js";
import { y as Route, P as Page } from "./router-vb7i5euz.js";
import { C as CollapsiblePaper } from "./Paper-6W_X6MFt.js";
import { F as FormErrorOrDescription } from "./FormErrorOrDescription-DO6Hdfmn.js";
import { N as Nudge } from "./Nudge-C1ux5IUa.js";
import { u as useLoaderRevalidator } from "./LoaderRevalidatorContext-C9s56i-l.js";
import { b5 as tKeyForUserRole } from "./services-middleware-DR8Hua1Y.js";
import { s as createUserPayloadSchema, v as updateUserPayloadSchema } from "./settings-CEpHMlp5.js";
import { b as createUserFn, d as deleteUserFn, u as updateUserFn } from "./settings-CPv2zx4k.js";
import { u as useMutation } from "./useMutation-C5oG90Zs.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { A as isAccessible } from "./feature-access-B8PIS8ad.js";
import { g as getFieldErrors } from "./form-D2XmDKeG.js";
import { u as useForm } from "./useForm-BwABQKAs.js";
import { z as zt } from "./CopyToClipboardButton-CJNJJful.js";
import { F as FormInput } from "./FormInput-S5xzkMXf.js";
import { F as FormLabel } from "./FormLabel-DeCgtgtj.js";
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
import "node:crypto";
import "./array-BFSjnO9c.js";
import "./index-x7n7VJTa.js";
import "./create-context-CYc8deix.js";
function useRouterState(opts) {
  const contextRouter = useRouter({ warn: opts?.router === void 0 });
  const router = opts?.router || contextRouter;
  {
    const state = router.stores.__store.get();
    return opts?.select ? opts.select(state) : state;
  }
}
const useCreateUserMutation = () => {
  const createUser = useServerFn(createUserFn);
  return useMutation({
    mutationFn: async (payload) => createUser({ data: payload })
  });
};
function CreateUser({
  orgId,
  userRoles,
  access
}) {
  const { t } = useTranslation(["common", "settings"]);
  const isLoading = useRouterState({ select: (s) => s.status === "pending" });
  const [open, setOpen] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (isLoading) {
      setOpen(false);
    }
  }, [isLoading]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-5" }),
      t("settings:users.new_user")
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Content, { onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(CreateUserContent, { orgId, access, userRoles, onSuccess: () => setOpen(false) }) })
  ] });
}
function CreateUserContent({
  orgId,
  userRoles,
  access,
  onSuccess
}) {
  const { t } = useTranslation(["common", "settings"]);
  const createUserMutation = useCreateUserMutation();
  const revalidate = useLoaderRevalidator();
  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "ADMIN",
      organizationId: orgId
    },
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        createUserMutation.mutateAsync(value).then((res) => {
          if (res && "error" in res) {
            zt.error(t("common:errors.list.duplicate_email"));
            return;
          }
          onSuccess();
          revalidate();
        }).catch(() => {
          zt.error(t("common:errors.unknown"));
        });
      }
    },
    validators: {
      onSubmit: createUserPayloadSchema
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
        /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t("settings:users.new_user") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-lg p-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col gap-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              form.Field,
              {
                name: "firstName",
                validators: {
                  onBlur: createUserPayloadSchema.shape.firstName,
                  onChange: createUserPayloadSchema.shape.firstName
                },
                children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full flex-col gap-xs", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: field.name, className: "text-s text-grey-secondary", children: t("settings:users.first_name") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      id: field.name,
                      type: "text",
                      name: field.name,
                      value: field.state.value,
                      onChange: (e) => field.handleChange(e.currentTarget.value),
                      onBlur: field.handleBlur,
                      borderColor: field.state.meta.errors.length === 0 ? "greyfigma-90" : "redfigma-47"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
                ] })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "lastName", validators: { onChange: createUserPayloadSchema.shape.lastName }, children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full flex-col gap-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: field.name, className: "text-s text-grey-secondary", children: t("settings:users.last_name") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: field.name,
                  type: "text",
                  name: field.name,
                  value: field.state.value,
                  onChange: (e) => field.handleChange(e.currentTarget.value),
                  onBlur: field.handleBlur,
                  borderColor: field.state.meta.errors.length === 0 ? "greyfigma-90" : "redfigma-47"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "email", validators: { onChange: createUserPayloadSchema.shape.email }, children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: field.name, className: "text-s text-grey-secondary", children: t("settings:users.email") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: field.name,
                type: "email",
                name: field.name,
                value: field.state.value,
                onChange: (e) => field.handleChange(e.currentTarget.value),
                onBlur: field.handleBlur,
                borderColor: field.state.meta.errors.length === 0 ? "greyfigma-90" : "redfigma-47"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "role", validators: { onChange: createUserPayloadSchema.shape.role }, children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: field.name, className: "text-s text-grey-secondary flex flex-row gap-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: clsx({
                    "text-grey-disabled": access === "restricted"
                  }),
                  children: t("settings:users.role")
                }
              ),
              access === "allowed" ? null : /* @__PURE__ */ jsxRuntimeExports.jsx(Nudge, { content: t("settings:users.role.nudge"), className: "size-6", kind: access })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              SelectV2,
              {
                value: field.state.value,
                onChange: (value) => field.handleChange(value),
                disabled: !isAccessible(access),
                placeholder: t("settings:users.role"),
                options: userRoles.map((role) => ({
                  label: t(tKeyForUserRole(role)),
                  value: role
                }))
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
              label: t("settings:users.new_user.create"),
              type: "submit",
              name: "create",
              isLoading: createUserMutation.isPending
            }
          )
        ] })
      ]
    }
  );
}
const useDeleteUserMutation = () => {
  const deleteUser = useServerFn(deleteUserFn);
  return useMutation({
    mutationFn: async (payload) => deleteUser({ data: payload })
  });
};
function DeleteUser({ userId, currentUserId }) {
  const { t } = useTranslation(["common", "settings"]);
  const [open, setOpen] = reactExports.useState(false);
  const handleOnSuccess = () => {
    setOpen(false);
  };
  if (userId === currentUserId) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Icon,
      {
        icon: "delete",
        className: "group-hover:text-grey-disabled size-6 shrink-0 cursor-not-allowed",
        "aria-label": t("settings:users.delete_user")
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "delete", className: "size-6 shrink-0", "aria-label": t("settings:users.delete_user") }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteUserContent, { userId, onSuccess: handleOnSuccess }) })
  ] });
}
const DeleteUserContent = ({ userId, onSuccess }) => {
  const { t } = useTranslation(["common", "settings"]);
  const deleteUserMutation = useDeleteUserMutation();
  const revalidate = useLoaderRevalidator();
  const handleDeleteUser = () => {
    deleteUserMutation.mutateAsync({ userId }).then((res) => {
      onSuccess();
      revalidate();
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t("settings:users.delete_user.title") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-lg p-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-s flex flex-1 flex-col gap-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { name: "userId", value: userId, type: "hidden" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center", children: t("settings:users.delete_user.content") })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t("common:cancel") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Modal.FooterButton,
        {
          label: t("common:delete"),
          variant: "destructive",
          onClick: handleDeleteUser,
          disabled: deleteUserMutation.isPending,
          leadingIcon: "delete"
        }
      )
    ] })
  ] });
};
const useUpdateUserMutation = () => {
  const updateUser = useServerFn(updateUserFn);
  return useMutation({
    mutationFn: async (payload) => updateUser({ data: payload })
  });
};
function UpdateUser({
  user,
  userRoles,
  access
}) {
  const { t } = useTranslation(["common", "settings"]);
  const [open, setOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "edit-square", className: "size-6 shrink-0", "aria-label": t("settings:users.update_user") }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(UpdateUserContent, { user, userRoles, access, onSuccess: () => setOpen(false) }) })
  ] });
}
function UpdateUserContent({
  user,
  userRoles,
  access,
  onSuccess
}) {
  const { t } = useTranslation(["common", "settings"]);
  const updateUserMutation = useUpdateUserMutation();
  const revalidate = useLoaderRevalidator();
  const form = useForm({
    defaultValues: user,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        updateUserMutation.mutateAsync(value).then(() => {
          zt.success(t("common:success.save"));
          onSuccess();
          revalidate();
        }).catch(() => {
          zt.error(t("common:errors.unknown"));
        });
      }
    },
    validators: {
      onSubmit: updateUserPayloadSchema
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
        /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t("settings:users.update_user") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-lg p-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col gap-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "firstName", validators: { onChange: updateUserPayloadSchema.shape.firstName }, children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group flex w-full flex-col gap-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { name: field.name, children: t("settings:users.first_name") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                FormInput,
                {
                  type: "text",
                  name: field.name,
                  onChange: (e) => field.handleChange(e.currentTarget.value),
                  defaultValue: field.state.value,
                  valid: field.state.meta.errors.length === 0
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "lastName", validators: { onChange: updateUserPayloadSchema.shape.lastName }, children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group flex w-full flex-col gap-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { name: field.name, children: t("settings:users.last_name") }),
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
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "email", validators: { onChange: updateUserPayloadSchema.shape.email }, children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group flex flex-col gap-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { name: field.name, children: t("settings:users.email") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              FormInput,
              {
                type: "email",
                name: field.name,
                onChange: (e) => field.handleChange(e.currentTarget.value),
                defaultValue: field.state.value,
                valid: field.state.meta.errors.length === 0
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "role", validators: { onChange: updateUserPayloadSchema.shape.role }, children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group flex flex-col gap-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(FormLabel, { name: field.name, className: "flex flex-row gap-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: clsx({
                    "text-grey-disabled": access === "restricted"
                  }),
                  children: t("settings:users.role")
                }
              ),
              access === "allowed" ? null : /* @__PURE__ */ jsxRuntimeExports.jsx(Nudge, { content: t("settings:users.role.nudge"), className: "size-6", kind: access })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              SelectV2,
              {
                value: field.state.value,
                onChange: (value) => field.handleChange(value),
                disabled: !isAccessible(access),
                placeholder: t("settings:users.role"),
                options: userRoles.map((role) => ({
                  label: t(tKeyForUserRole(role)),
                  value: role
                }))
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
              label: t("common:save"),
              type: "submit",
              name: "update",
              isLoading: updateUserMutation.isPending
            }
          )
        ] })
      ]
    }
  );
}
const columnHelper = createColumnHelper();
function Users() {
  const {
    t
  } = useTranslation(["settings", "cases"]);
  const {
    inboxUsersByUserId,
    user,
    entitlements,
    userRoles,
    isCreateUserAvailable,
    isEditUserAvailable,
    isDeleteUserAvailable
  } = Route.useLoaderData();
  const {
    orgUsers
  } = useOrganizationUsers();
  const columns = reactExports.useMemo(() => {
    return [columnHelper.accessor((row) => `${row.firstName} ${row.lastName}`, {
      id: "name",
      header: t("settings:users.name"),
      size: 150
    }), columnHelper.accessor((row) => row.email, {
      id: "email",
      header: t("settings:users.email"),
      size: 150,
      cell: ({
        getValue
      }) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden text-ellipsis", children: getValue() })
    }), columnHelper.accessor((row) => row.role, {
      id: "role",
      header: t("settings:users.role"),
      size: 150,
      cell: ({
        getValue
      }) => t(tKeyForUserRole(getValue()))
    }), columnHelper.accessor((row) => row.userId, {
      id: "inbox_user_role",
      header: t("settings:users.inbox_user_role"),
      size: 200,
      cell: ({
        getValue
      }) => {
        const inboxUsers = inboxUsersByUserId[getValue()];
        if (!inboxUsers) return null;
        return /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { children: inboxUsers.map(([role, count]) => {
          return /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: t(tKeyForInboxUserRole(role), {
            count
          }) }, role);
        }) });
      }
    }), ...isDeleteUserAvailable || isEditUserAvailable ? [columnHelper.display({
      id: "actions",
      size: 50,
      cell: ({
        cell
      }) => {
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-sm", children: [
          isEditUserAvailable ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "group-hover:text-grey-primary focus-within:text-grey-primary text-transparent", children: /* @__PURE__ */ jsxRuntimeExports.jsx(UpdateUser, { user: cell.row.original, userRoles, access: entitlements.userRoles }) }) : null,
          isDeleteUserAvailable ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "group-hover:text-grey-primary focus-within:text-grey-primary text-transparent", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteUser, { userId: cell.row.original.userId, currentUserId: user.actorIdentity.userId }) }) : null
        ] });
      }
    })] : []];
  }, [inboxUsersByUserId, isDeleteUserAvailable, isEditUserAvailable, t, user.actorIdentity.userId, userRoles, entitlements.userRoles]);
  const {
    table,
    getBodyProps,
    rows,
    getContainerProps
  } = useTable({
    data: orgUsers,
    columns,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Page.Content, { width: "readable", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CollapsiblePaper.Container, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CollapsiblePaper.Title, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1", children: t("settings:users") }),
      isCreateUserAvailable ? /* @__PURE__ */ jsxRuntimeExports.jsx(CreateUser, { orgId: user.organizationId, access: entitlements.userRoles, userRoles }) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CollapsiblePaper.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table.Container, { ...getContainerProps(), className: "max-h-96", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Header, { headerGroups: table.getHeaderGroups() }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Body, { ...getBodyProps(), children: rows.map((row) => {
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Row, { className: "hover:bg-surface-row-hover group", row }, row.id);
      }) })
    ] }) })
  ] }) });
}
const tKeyForInboxUserRole = (role) => {
  switch (role) {
    case "admin":
      return "settings:users.inbox_user_role.admin_count";
    case "member":
      return "settings:users.inbox_user_role.member_count";
    default:
      return "settings:users.inbox_user_role.unknown";
  }
};
export {
  Users as component
};
