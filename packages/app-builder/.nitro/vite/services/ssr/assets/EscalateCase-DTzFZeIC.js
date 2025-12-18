import { O as useRouter, R as jsxRuntimeExports, r as reactExports } from "../server.js";
import { u as useDownloadFile, A as AlreadyDownloadingError, a as AuthRequestError } from "./DownloadFilesService-BW-xJtj3.js";
import { z as zt } from "./CopyToClipboardButton-CJNJJful.js";
import { u as useTranslation, B as Button, e as Icon, d as cn, e8 as MenuCommand, e4 as Modal, dD as Tooltip, s as Trans } from "./format-NPGUXq-g.js";
import { av as casesI18n, L as Link } from "./router-vb7i5euz.js";
import { F as FormErrorOrDescription } from "./FormErrorOrDescription-DO6Hdfmn.js";
import { u as useLoaderRevalidator } from "./LoaderRevalidatorContext-C9s56i-l.js";
import { d as editNamePayloadSchema, f as editTagsPayloadSchema, e as escalateCasePayloadSchema } from "./cases-PZYcTUxr.js";
import { l as editNameFn } from "./cases-DJ9ABIdo.js";
import { y as useQueryClient } from "./QueryClientProvider-DYTpkCko.js";
import { u as useMutation } from "./useMutation-C5oG90Zs.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { g as getFieldErrors, h as handleSubmit } from "./form-D2XmDKeG.js";
import { u as useForm } from "./useForm-BwABQKAs.js";
import { T as TagPreview } from "./TagPreview-CjmrrQF6.js";
import { u as useOrganizationTags } from "./organization-tags-CEJpwTHZ.js";
import { C as pick } from "./services-middleware-DR8Hua1Y.js";
import { t as toggle } from "./array-BFSjnO9c.js";
import { u as useEditTagsMutation, b as useEscalateCaseMutation } from "./escalate-case-CwnOzYrx.js";
import { t } from "./isDeepEqual-C0XXZLYo.js";
import { C as Callout } from "./Callout-DX4NBXlG.js";
import { u as useGetInboxesQuery } from "./get-inboxes-6fSfvled.js";
import { b as fromUUIDtoSUUID } from "./short-uuid-MIi3jWzx.js";
const CaseFileButton = ({ file, className, size }) => {
  const { t: t2 } = useTranslation(["cases"]);
  const router = useRouter();
  const downloadEndpoint = router.buildLocation({
    to: "/ressources/cases/download-file/$fileId",
    params: { fileId: file.id }
  });
  const { downloadCaseFile, downloadingCaseFile } = useDownloadFile(downloadEndpoint.href, {
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Button,
    {
      variant: "secondary",
      onClick: () => {
        void downloadCaseFile();
      },
      disabled: downloadingCaseFile,
      className,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Icon,
          {
            icon: downloadingCaseFile ? "spinner" : "download",
            className: cn("size-3.5", { "animate-spin": downloadingCaseFile })
          }
        ),
        file.fileName
      ]
    }
  );
};
const useEditNameMutation = () => {
  const editName = useServerFn(editNameFn);
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["cases", "edit-name"],
    mutationFn: async (payload) => editName({ data: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
    }
  });
};
const EditCaseName = ({ name, id }) => {
  const { t: t2 } = useTranslation(casesI18n);
  const editNameMutation = useEditNameMutation();
  const [isEditing, setIsEditing] = reactExports.useState(false);
  const revalidate = useLoaderRevalidator();
  const form = useForm({
    onSubmit: ({ value }) => {
      editNameMutation.mutateAsync(value).then(() => {
        setIsEditing(false);
        revalidate();
      });
    },
    defaultValues: { name, caseId: id },
    validators: {
      onSubmit: editNamePayloadSchema
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("form", { onSubmit: handleSubmit(form), className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    form.Field,
    {
      name: "name",
      validators: {
        onBlur: editNamePayloadSchema.shape.name,
        onChange: editNamePayloadSchema.shape.name
      },
      children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full flex-col gap-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-sm", children: !isEditing ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary text-s border-none bg-transparent font-medium outline-hidden", children: field.state.value || t2("cases:case.name") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              onClick: () => setIsEditing(true),
              className: "w-fit p-2xs",
              variant: "secondary",
              mode: "icon",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "edit-square", className: "text-grey-placeholder size-3.5" })
            }
          )
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: form.state.isSubmitting, variant: "primary", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "save", className: "size-3.5" }),
              t2("common:save")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                onClick: () => {
                  setIsEditing(false);
                  form.reset({ name, caseId: id });
                },
                variant: "secondary",
                mode: "icon",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "cross", className: "text-grey-placeholder size-3.5" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              name: field.name,
              autoFocus: true,
              value: field.state.value,
              onChange: (e) => field.handleChange(e.currentTarget.value),
              onBlur: field.handleBlur,
              className: "text-grey-primary text-s w-full border-none bg-transparent font-medium outline-hidden",
              placeholder: t2("cases:case.name")
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
      ] })
    }
  ) });
};
function TagSelector({
  selectedTagIds,
  onSelectedTagIdsChange,
  onOpenChange,
  maxVisibleTags,
  tagList
}) {
  const { t: t2 } = useTranslation(["workflows", "common"]);
  const { orgTags } = useOrganizationTags();
  const tags = tagList ?? orgTags;
  const formattedTags = reactExports.useMemo(
    () => tags.reduce(
      (acc, curr) => {
        acc[curr.id] = pick(curr, ["color", "id", "name"]);
        return acc;
      },
      {}
    ),
    [tags]
  );
  const handleToggleTag = (tagId) => {
    onSelectedTagIdsChange(toggle(selectedTagIds, tagId));
  };
  if (tags.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", disabled: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary text-xs", children: t2("workflows:action.tags.no_tags") }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
    (maxVisibleTags ? selectedTagIds.slice(0, maxVisibleTags) : selectedTagIds).map((id) => /* @__PURE__ */ jsxRuntimeExports.jsx(TagPreview, { name: formattedTags[id]?.name ?? id }, id)),
    maxVisibleTags && selectedTagIds.length > maxVisibleTags ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-grey-secondary text-xs", children: [
      "+",
      selectedTagIds.length - maxVisibleTags
    ] }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { persistOnSelect: true, onOpenChange, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", mode: selectedTagIds.length ? "icon" : "normal", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: selectedTagIds.length ? "edit-square" : "plus", className: "text-grey-secondary size-4" }),
        !selectedTagIds.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary text-xs", children: t2("common:add") }) : null
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Content, { className: "mt-sm min-w-[200px]", side: "bottom", align: "end", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Combobox, { placeholder: t2("workflows:action.tags.search_placeholder") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.List, { children: [
          tags.map(({ id: tagId }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            MenuCommand.Item,
            {
              value: formattedTags[tagId].name,
              className: "cursor-pointer",
              onSelect: () => handleToggleTag(tagId),
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex w-full justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TagPreview, { name: formattedTags[tagId].name }),
                selectedTagIds.includes(tagId) ? /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "tick", className: "text-purple-primary size-6" }) : null
              ] })
            },
            tagId
          )),
          /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Empty, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-md py-xs text-grey-60", children: t2("workflows:action.tags.no_result") }) })
        ] })
      ] })
    ] })
  ] });
}
const EditCaseTags = ({ id, tagIds }) => {
  const editTagsMutation = useEditTagsMutation();
  const revalidate = useLoaderRevalidator();
  const form = useForm({
    onSubmit: ({ value }) => {
      editTagsMutation.mutateAsync(value).then(() => {
        revalidate();
      });
    },
    defaultValues: {
      caseId: id,
      tagIds
    },
    validators: {
      onSubmit: editTagsPayloadSchema
    }
  });
  const handleOpenChange = (open) => {
    if (!open && form.state.isDirty && !t(form.options.defaultValues, form.state.values)) {
      form.handleSubmit();
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    form.Field,
    {
      name: "tagIds",
      validators: {
        onBlur: editTagsPayloadSchema.shape.tagIds,
        onChange: editTagsPayloadSchema.shape.tagIds
      },
      children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        TagSelector,
        {
          selectedTagIds: field.state.value,
          onSelectedTagIdsChange: field.handleChange,
          onOpenChange: handleOpenChange
        }
      )
    }
  );
};
const EscalateCase = ({ id, inboxId, isAdminUser }) => {
  const { t: t2 } = useTranslation([...casesI18n, "common"]);
  const escalateCaseMutation = useEscalateCaseMutation();
  const revalidate = useLoaderRevalidator();
  const inboxesQuery = useGetInboxesQuery();
  const inboxes = inboxesQuery.data?.inboxes ?? [];
  const inboxDetail = inboxes.find((inbox) => inbox.id === inboxId);
  const targetInbox = inboxes.find((inbox) => inbox.id === inboxDetail?.escalationInboxId);
  const canEscalate = !!inboxDetail?.escalationInboxId;
  const form = useForm({
    onSubmit: async ({ value }) => {
      escalateCaseMutation.mutateAsync(value).then(() => {
        revalidate();
      }).catch(() => {
        zt.error(t2("common:errors.unknown"));
      });
    },
    defaultValues: { caseId: id, inboxId },
    validators: {
      onSubmit: escalateCasePayloadSchema
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Tooltip.Default,
      {
        content: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pb-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: canEscalate ? t2("cases:escalate-button.hint", { inboxName: targetInbox?.name }) : isAdminUser ? t2("cases:escalate-button.forbidden.hint.admin") : t2("cases:escalate-button.forbidden.hint") }),
          !canEscalate && isAdminUser ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            Link,
            {
              to: "/settings/inboxes/$inboxId",
              params: { inboxId: fromUUIDtoSUUID(inboxId) },
              className: "hover:text-purple-hover focus:text-purple-hover text-purple-primary font-semibold hover:underline focus:underline",
              children: t2("cases:case.inbox_settings_link")
            }
          ) : null
        ] }),
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", disabled: !canEscalate, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "arrow-up", className: "size-3.5", "aria-hidden": true }),
          t2("cases:escalate-button.label")
        ] }) })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Content, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: "Escalate Case" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-xl p-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { className: "text-balance", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trans, { i18nKey: "cases:escalate-case.modal.callout" }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("form", { onSubmit: handleSubmit(form), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t2("common:cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { label: t2("cases:escalate-case.modal.submit-button.label"), type: "submit" })
      ] }) })
    ] })
  ] });
};
export {
  CaseFileButton as C,
  EditCaseName as E,
  EscalateCase as a,
  EditCaseTags as b
};
