import { R as jsxRuntimeExports, O as useRouter, U as useHydrated, r as reactExports } from "../server.js";
import { as as createDraftIterationFn, b as useNavigate, ak as BackButton, at as TriggerObjectTag } from "./router-vb7i5euz.js";
import { u as useMutation } from "./useMutation-C5oG90Zs.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { b as fromUUIDtoSUUID } from "./short-uuid-MIi3jWzx.js";
import { z as zt } from "./CopyToClipboardButton-CJNJJful.js";
import { u as useTranslation, B as Button, e as Icon, e4 as Modal, b as clsx } from "./format-NPGUXq-g.js";
import { F as FormErrorOrDescription } from "./FormErrorOrDescription-DO6Hdfmn.js";
import { u as useLoaderRevalidator } from "./LoaderRevalidatorContext-C9s56i-l.js";
import { u as useUpdateScenarioMutation } from "./update-scenario-BLeSCsGD.js";
import { g as getFieldErrors, h as handleSubmit } from "./form-D2XmDKeG.js";
import { u as useForm } from "./useForm-BwABQKAs.js";
import { a as updateScenarioPayloadSchema } from "./scenarios-8U74nJp4.js";
const useCreateDraftIterationMutation = (scenarioId, iterationId) => {
  const createDraftIteration = useServerFn(createDraftIterationFn);
  return useMutation({
    mutationKey: ["scenarios", "iteration", "create-draft", scenarioId, iterationId],
    mutationFn: async () => createDraftIteration({ data: { scenarioId, iterationId } })
  });
};
function CreateDraftIteration({
  iterationId,
  scenarioId,
  draftId
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    draftId === void 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(NewDraftButton, { iterationId, scenarioId }) : null,
    draftId ? /* @__PURE__ */ jsxRuntimeExports.jsx(ExistingDraftModal, { iterationId, scenarioId, draftId }) : null
  ] });
}
const NewDraftButton = ({ iterationId, scenarioId }) => {
  const { t } = useTranslation(["common", "scenarios"]);
  const createDraftIterationMutation = useCreateDraftIterationMutation(scenarioId, iterationId);
  const router = useRouter();
  const navigate = useNavigate();
  const handleNewDraft = async () => {
    try {
      const newIteration = await createDraftIterationMutation.mutateAsync();
      await router.invalidate();
      navigate({
        to: "/detection/scenarios/$scenarioId/i/$iterationId/trigger",
        params: {
          scenarioId: fromUUIDtoSUUID(scenarioId),
          iterationId: fromUUIDtoSUUID(newIteration.id)
        }
      });
    } catch (error) {
      console.error("Failed to create draft iteration:", error);
      zt.error(t("common:errors.unknown"));
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleNewDraft, size: "medium", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-5" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-clamp-1 hidden shrink-0 lg:block", children: t("scenarios:create_iteration.title") })
  ] });
};
const ExistingDraftModal = ({
  iterationId,
  scenarioId,
  draftId
}) => {
  const { t } = useTranslation(["common", "scenarios"]);
  const createDraftIterationMutation = useCreateDraftIterationMutation(scenarioId, iterationId);
  const router = useRouter();
  const navigate = useNavigate();
  const handleOverrideDraft = async () => {
    try {
      const newIteration = await createDraftIterationMutation.mutateAsync();
      await router.invalidate();
      navigate({
        to: "/detection/scenarios/$scenarioId/i/$iterationId/trigger",
        params: {
          scenarioId: fromUUIDtoSUUID(scenarioId),
          iterationId: fromUUIDtoSUUID(newIteration.id)
        }
      });
    } catch (error) {
      console.error("Failed to override draft iteration:", error);
      zt.error(t("common:errors.unknown"));
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "medium", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-clamp-1 hidden shrink-0 lg:block", children: t("scenarios:create_iteration.title") })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Content, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t("scenarios:create_iteration.title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-lg p-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-s flex flex-1 flex-col gap-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center", children: t("scenarios:create_rule.draft_already_exist") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center", children: t("scenarios:create_rule.draft_already_exist_possibility") })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Modal.FooterButton,
          {
            label: t("scenarios:create_draft.keep_existing_draft"),
            isCloseButton: true,
            onClick: () => navigate({
              to: "../$iterationId",
              from: "/detection/scenarios/$scenarioId/i/$iterationId",
              params: {
                iterationId: fromUUIDtoSUUID(draftId)
              }
            })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Modal.FooterButton,
          {
            label: t("scenarios:create_draft.override_existing_draft"),
            onClick: handleOverrideDraft,
            isLoading: createDraftIterationMutation.isPending,
            name: "create"
          }
        )
      ] })
    ] })
  ] });
};
const handle = {
  i18n: ["common", "scenarios"]
};
function ScenarioHeader({ isEditScenarioAvailable, scenario }) {
  const hydrated = useHydrated();
  const { t } = useTranslation(handle.i18n);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row items-center gap-xs", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(BackButton, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      EditableScenarioField,
      {
        scenarioId: scenario.id,
        name: scenario.name,
        description: scenario.description ?? "",
        fieldName: "name",
        placeholder: t("scenarios:create_scenario.name"),
        editLabel: t("scenarios:update_scenario.title"),
        disabled: !isEditScenarioAvailable || !hydrated,
        displayValueClassName: "text-h2 truncate",
        inputClassName: "text-h2 min-w-0 flex-1 border-none bg-transparent font-normal outline-hidden"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TriggerObjectTag, { children: scenario.triggerObjectType })
  ] });
}
function ScenarioDescriptionEditable({
  isEditScenarioAvailable,
  scenario
}) {
  const hydrated = useHydrated();
  const { t } = useTranslation(handle.i18n);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    EditableScenarioField,
    {
      scenarioId: scenario.id,
      name: scenario.name,
      description: scenario.description ?? "",
      fieldName: "description",
      placeholder: t("scenarios:create_scenario.description_placeholder"),
      editLabel: t("scenarios:update_scenario.title"),
      disabled: !isEditScenarioAvailable || !hydrated,
      formClassName: "w-full",
      containerClassName: "w-full items-center gap-md",
      displayValueClassName: "min-w-0",
      emptyValueClassName: "text-grey-placeholder",
      inputClassName: "text-s text-grey-secondary min-w-0 flex-1 border-none bg-transparent font-normal outline-hidden"
    }
  );
}
function EditableScenarioField({
  scenarioId,
  name,
  description,
  fieldName,
  placeholder,
  editLabel,
  disabled,
  formClassName,
  containerClassName,
  displayValueClassName,
  emptyValueClassName,
  inputClassName
}) {
  const [isEditing, setIsEditing] = reactExports.useState(false);
  const { t } = useTranslation(["common"]);
  const updateScenarioMutation = useUpdateScenarioMutation();
  const revalidate = useLoaderRevalidator();
  const fieldSchema = fieldName === "name" ? updateScenarioPayloadSchema.shape.name : updateScenarioPayloadSchema.shape.description;
  const form = useForm({
    defaultValues: {
      scenarioId,
      name,
      description
    },
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        updateScenarioMutation.mutateAsync(value).then(() => {
          setIsEditing(false);
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
  reactExports.useEffect(() => {
    form.reset({
      scenarioId,
      name,
      description
    });
  }, [description, form, name, scenarioId]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("form", { onSubmit: handleSubmit(form), className: clsx("min-w-0", formClassName), children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    form.Field,
    {
      name: fieldName,
      validators: {
        onBlur: fieldSchema,
        onChange: fieldSchema
      },
      children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 flex-col gap-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: clsx("flex min-w-0 items-center gap-sm", containerClassName), children: isEditing ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            name: field.name,
            autoFocus: true,
            value: field.state.value,
            onChange: (e) => field.handleChange(e.currentTarget.value),
            onBlur: field.handleBlur,
            onKeyDown: (e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                form.handleSubmit();
              }
              if (e.key === "Escape") {
                e.preventDefault();
                setIsEditing(false);
                form.reset({ scenarioId, name, description });
              }
            },
            className: inputClassName,
            placeholder,
            "aria-label": placeholder
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: clsx(displayValueClassName, !field.state.value && emptyValueClassName), children: field.state.value || placeholder }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "secondary",
              mode: "icon",
              disabled,
              "aria-label": editLabel,
              title: editLabel,
              onClick: () => setIsEditing(true),
              className: "text-grey-secondary",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "edit", className: "size-4" })
            }
          )
        ] }) }),
        isEditing ? /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) }) : null
      ] })
    }
  ) });
}
export {
  CreateDraftIteration as C,
  ScenarioHeader as S,
  ScenarioDescriptionEditable as a
};
