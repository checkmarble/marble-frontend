import { R as jsxRuntimeExports, r as reactExports } from "../server.js";
import { F as FormErrorOrDescription } from "./FormErrorOrDescription-DO6Hdfmn.js";
import { F as FormInput } from "./FormInput-S5xzkMXf.js";
import { F as FormLabel } from "./FormLabel-DeCgtgtj.js";
import { u as useLoaderRevalidator } from "./LoaderRevalidatorContext-C9s56i-l.js";
import { B as tagColors, p as createTagPayloadSchema, r as updateTagPayloadSchema } from "./settings-CEpHMlp5.js";
import { e as createTagFn, f as deleteTagFn, h as updateTagFn } from "./settings-CPv2zx4k.js";
import { u as useMutation } from "./useMutation-C5oG90Zs.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { g as getFieldErrors } from "./form-D2XmDKeG.js";
import { u as useForm } from "./useForm-BwABQKAs.js";
import { z as zt } from "./CopyToClipboardButton-CJNJJful.js";
import { e8 as MenuCommand, B as Button, u as useTranslation, e4 as Modal, e as Icon } from "./format-NPGUXq-g.js";
const ColorPreview = ({ color }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-grey-disabled size-4 rounded-full border", style: { backgroundColor: color } });
};
const ColorSelect = ({ onChange, value }) => {
  const [open, setOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", className: "h-10 gap-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ColorPreview, { color: value }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Arrow, {})
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Content, { className: "mt-sm", sameWidth: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.List, { children: tagColors.map((color) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      MenuCommand.Item,
      {
        className: "cursor-pointer",
        value: color,
        onSelect: (c) => onChange(c),
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(ColorPreview, { color })
      },
      color
    )) }) })
  ] });
};
const useCreateTagMutation = () => {
  const createTag = useServerFn(createTagFn);
  return useMutation({
    mutationFn: async (payload) => createTag({ data: payload })
  });
};
function CreateTag() {
  const { t } = useTranslation(["common", "settings"]);
  const [open, setOpen] = reactExports.useState(false);
  const handleOnSuccess = () => {
    setOpen(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-5" }),
      t("settings:tags.new_tag")
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Content, { onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(CreateTagContent, { onSuccess: handleOnSuccess }) })
  ] });
}
const CreateTagContent = ({ onSuccess }) => {
  const { t } = useTranslation(["common", "settings"]);
  const createTagMutation = useCreateTagMutation();
  const revalidate = useLoaderRevalidator();
  const form = useForm({
    defaultValues: { name: "", color: tagColors[0], target: "case" },
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        createTagMutation.mutateAsync(value).then(() => {
          zt.success(t("common:success.save"));
          onSuccess();
          revalidate();
        }).catch(() => {
          zt.error(t("common:errors.unknown"));
        });
      }
    },
    validators: {
      onSubmit: createTagPayloadSchema
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
        /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t("settings:tags.new_tag") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-lg p-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            form.Field,
            {
              name: "name",
              validators: {
                onChange: createTagPayloadSchema.shape.name
              },
              children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group flex w-full flex-col gap-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { name: field.name, children: t("settings:tags.name") }),
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
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            form.Field,
            {
              name: "color",
              validators: {
                onChange: createTagPayloadSchema.shape.color
              },
              children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group flex flex-col gap-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { name: field.name, children: t("settings:tags.color") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ColorSelect, { onChange: field.handleChange, value: field.state.value }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            form.Field,
            {
              name: "target",
              validators: {
                onChange: createTagPayloadSchema.shape.target
              },
              children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group flex flex-col gap-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { name: field.name, children: t("settings:tags.target") }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.SelectButton, { children: t(`settings:tags.target.${field.state.value}`) }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Content, { sideOffset: 4, align: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.List, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Item, { onSelect: () => field.handleChange("case"), children: t("settings:tags.target.case") }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Item, { onSelect: () => field.handleChange("object"), children: t("settings:tags.target.object") })
                  ] }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
              ] })
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t("common:cancel") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Modal.FooterButton,
            {
              label: t("settings:tags.new_tag.create"),
              type: "submit",
              name: "create",
              disabled: createTagMutation.isPending
            }
          )
        ] })
      ]
    }
  );
};
const useDeleteTagMutation = () => {
  const deleteTag = useServerFn(deleteTagFn);
  return useMutation({
    mutationFn: async (payload) => deleteTag({ data: payload })
  });
};
function DeleteTag({ tag }) {
  const { t } = useTranslation(["common", "settings"]);
  const [open, setOpen] = reactExports.useState(false);
  const handleOnSuccess = () => {
    setOpen(false);
  };
  if (tag.cases_count !== 0 && tag.cases_count !== null) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Icon,
      {
        icon: "delete",
        className: "group-hover:text-grey-disabled size-6 shrink-0 cursor-not-allowed",
        "aria-label": t("settings:tags.delete_tag")
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "delete", className: "size-6 shrink-0", "aria-label": t("settings:tags.delete_tag") }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteTagContent, { tagId: tag.id, onSuccess: handleOnSuccess }) })
  ] });
}
const DeleteTagContent = ({ tagId, onSuccess }) => {
  const { t } = useTranslation(["common", "settings"]);
  const deleteTagMutation = useDeleteTagMutation();
  const revalidate = useLoaderRevalidator();
  const handleDeleteTag = () => {
    deleteTagMutation.mutateAsync({ tagId }).then((res) => {
      onSuccess();
      revalidate();
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t("settings:tags.delete_tag.title") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-lg p-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-s flex flex-1 flex-col gap-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { name: "tagId", value: tagId, type: "hidden" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center", children: t("settings:tags.delete_tag.content") })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t("common:cancel") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Modal.FooterButton,
        {
          label: t("common:delete"),
          variant: "destructive",
          onClick: handleDeleteTag,
          disabled: deleteTagMutation.isPending,
          leadingIcon: "delete"
        }
      )
    ] })
  ] });
};
const useUpdateTagMutation = () => {
  const updateTag = useServerFn(updateTagFn);
  return useMutation({
    mutationFn: async (payload) => updateTag({ data: payload })
  });
};
function UpdateTag({ tag }) {
  const { t } = useTranslation(["common", "settings"]);
  const [open, setOpen] = reactExports.useState(false);
  const handleOnSuccess = () => {
    setOpen(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "edit-square", className: "size-6 shrink-0", "aria-label": t("settings:tags.update_tag") }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(UpdateTagContent, { tag, onSuccess: handleOnSuccess }) })
  ] });
}
const UpdateTagContent = ({ tag, onSuccess }) => {
  const { t } = useTranslation(["common", "settings"]);
  const updateTagMutation = useUpdateTagMutation();
  const revalidate = useLoaderRevalidator();
  const form = useForm({
    defaultValues: tag,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        updateTagMutation.mutateAsync(value).then(() => {
          zt.success(t("common:success.save"));
          onSuccess();
          revalidate();
        }).catch(() => {
          zt.error(t("common:errors.unknown"));
        });
      }
    },
    validators: {
      onSubmit: updateTagPayloadSchema
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
        /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t("settings:tags.update_tag") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-lg p-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            form.Field,
            {
              name: "name",
              validators: {
                onChange: updateTagPayloadSchema.shape.name
              },
              children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group flex w-full flex-col gap-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { name: field.name, children: t("settings:tags.name") }),
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
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            form.Field,
            {
              name: "color",
              validators: {
                onChange: updateTagPayloadSchema.shape.color
              },
              children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group flex flex-col gap-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { name: field.name, children: t("settings:tags.color") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ColorSelect, { onChange: field.handleChange, value: field.state.value }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
              ] })
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t("common:cancel") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Modal.FooterButton,
            {
              label: t("common:save"),
              type: "submit",
              name: "update",
              disabled: updateTagMutation.isPending
            }
          )
        ] })
      ]
    }
  );
};
export {
  ColorPreview as C,
  DeleteTag as D,
  UpdateTag as U,
  CreateTag as a
};
