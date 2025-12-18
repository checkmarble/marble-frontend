import { R as jsxRuntimeExports, r as reactExports, O as useRouter } from "../server.js";
import { F as FormErrorOrDescription } from "./FormErrorOrDescription-DO6Hdfmn.js";
import { P as Panel, a as PanelSharpFactory } from "./Panel-kj8Z2GDk.js";
import { v as newCaseSchema, w as existingCaseSchema } from "./cases-PZYcTUxr.js";
import { e as addToCaseFn } from "./cases-DJ9ABIdo.js";
import { y as useQueryClient } from "./QueryClientProvider-DYTpkCko.js";
import { u as useMutation } from "./useMutation-C5oG90Zs.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { z as zt } from "./CopyToClipboardButton-CJNJJful.js";
import { u as useGetInboxesQuery } from "./get-inboxes-6fSfvled.js";
import { g as getFieldErrors, h as handleSubmit } from "./form-D2XmDKeG.js";
import { b as fromUUIDtoSUUID } from "./short-uuid-MIi3jWzx.js";
import { u as useForm } from "./useForm-BwABQKAs.js";
import { a1 as decisionsI18n, b as useNavigate } from "./router-vb7i5euz.js";
import { u as useTranslation, dz as Switch, e1 as Input, dZ as SelectV2, q as useFormatLanguage, j as Tag, dA as formatNumber } from "./format-NPGUXq-g.js";
const useAddToCaseMutation = () => {
  const addToCase = useServerFn(addToCaseFn);
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["cases", "add-to-case"],
    mutationFn: async (payload) => addToCase({ data: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
    },
    onError: (error) => {
      zt.error(error.message);
    }
  });
};
function DecisionRightPanel({ decisionIds }) {
  const { t } = useTranslation(decisionsI18n);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Container, { size: "small", className: "max-w-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel.Content, { className: "gap-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Header, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "first-letter:capitalize", children: t("decisions:add_to_case") }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AddToCaseForm, { decisionIds })
  ] }) });
}
function AddToCaseForm({ decisionIds }) {
  const { t } = useTranslation(["decisions", "common"]);
  const inboxesQuery = useGetInboxesQuery();
  const [isNewCase, setIsNewCase] = reactExports.useState(false);
  const panelSharp = PanelSharpFactory.useSharp();
  const router = useRouter();
  const navigate = useNavigate();
  const handleSuccess = async (type, caseDetail) => {
    panelSharp.actions.close();
    await router.invalidate();
    if (type === "new_case") {
      navigate({ to: "/cases/s/$caseId", params: { caseId: fromUUIDtoSUUID(caseDetail.id) } });
    }
  };
  if (inboxesQuery.isPending) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: t("common:loading") });
  }
  if (inboxesQuery.isError) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: t("common:errors.backend_global_error.unknown") });
  }
  const inboxes = inboxesQuery.data?.inboxes ?? [];
  if (inboxes.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: t("decisions:add_to_case.new_case.no_inbox") });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "newCase", className: "text-xs first-letter:capitalize", children: t("decisions:add_to_case.create_new_case") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { id: "newCase", checked: isNewCase, onCheckedChange: (checked) => setIsNewCase(checked) })
      ] }),
      isNewCase ? /* @__PURE__ */ jsxRuntimeExports.jsx(NewCaseForm, { inboxes, decisionIds, onSuccess: handleSuccess }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ExistingCaseForm, { decisionIds, onSuccess: handleSuccess })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Footer, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Panel.FooterButton,
      {
        type: "submit",
        form: "add-to-case-form",
        leadingIcon: "plus",
        label: t("decisions:add_to_case")
      }
    ) })
  ] });
}
function NewCaseForm({
  inboxes,
  decisionIds,
  onSuccess
}) {
  const { t } = useTranslation(["decisions"]);
  const addToCaseMutation = useAddToCaseMutation();
  const form = useForm({
    defaultValues: {
      name: "",
      inboxId: ""
    },
    validators: {
      onSubmit: newCaseSchema.pick({ name: true, inboxId: true })
    },
    onSubmit: async ({ value, formApi }) => {
      if (!formApi.state.isValid) return;
      const caseDetail = await addToCaseMutation.mutateAsync({
        newCase: true,
        decisionIds,
        ...value
      });
      onSuccess("new_case", caseDetail);
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("form", { onSubmit: handleSubmit(form), id: "add-to-case-form", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-s text-grey-primary font-semibold first-letter:capitalize", children: t("decisions:add_to_case.new_case.informations") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      form.Field,
      {
        name: "name",
        validators: {
          onBlur: newCaseSchema.shape.name,
          onChange: newCaseSchema.shape.name
        },
        children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: field.name, className: "text-xs first-letter:capitalize", children: t("decisions:add_to_case.new_case.new_case_name") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "text",
              name: field.name,
              defaultValue: field.state.value,
              onChange: (e) => field.handleChange(e.currentTarget.value),
              onBlur: field.handleBlur,
              borderColor: field.state.meta.errors.length === 0 ? "greyfigma-90" : "redfigma-47"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      form.Field,
      {
        name: "inboxId",
        validators: {
          onBlur: newCaseSchema.shape.inboxId,
          onChange: newCaseSchema.shape.inboxId
        },
        children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col gap-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: field.name, className: "text-xs first-letter:capitalize", children: t("decisions:add_to_case.new_case.select_inbox") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            SelectV2,
            {
              className: "w-full overflow-hidden",
              value: field.state.value,
              onChange: (type) => {
                field.handleChange(type);
                field.handleBlur();
              },
              placeholder: t("decisions:add_to_case.new_case.select_inbox"),
              options: inboxes.map(({ name, id }) => ({
                label: name,
                value: id
              }))
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
        ] })
      }
    )
  ] }) });
}
function ExistingCaseForm({ decisionIds, onSuccess }) {
  const { t } = useTranslation(["decisions"]);
  const addToCaseMutation = useAddToCaseMutation();
  const form = useForm({
    defaultValues: {
      caseId: ""
    },
    validators: {
      onSubmit: existingCaseSchema.pick({ caseId: true })
    },
    onSubmit: async ({ value, formApi }) => {
      if (!formApi.state.isValid) return;
      const caseDetail = await addToCaseMutation.mutateAsync({
        newCase: false,
        decisionIds,
        ...value
      });
      onSuccess("existing_case", caseDetail);
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("form", { onSubmit: handleSubmit(form), id: "add-to-case-form", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-s text-grey-primary font-semibold first-letter:capitalize", children: t("decisions:add_to_case.new_case.attribution") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      form.Field,
      {
        name: "caseId",
        validators: {
          onBlur: existingCaseSchema.shape.caseId,
          onChange: existingCaseSchema.shape.caseId
        },
        children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: field.name, className: "text-xs first-letter:capitalize", children: t("decisions:add_to_case.new_case.case_id.label") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "text",
              id: field.name,
              name: field.name,
              defaultValue: field.state.value,
              onChange: (e) => field.handleChange(e.currentTarget.value),
              onBlur: field.handleBlur,
              borderColor: field.state.meta.errors.length === 0 ? "greyfigma-90" : "redfigma-47"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
        ] })
      }
    )
  ] }) });
}
const Score = ({ score }) => {
  const language = useFormatLanguage();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "purple", size: "big", className: "w-16", children: formatNumber(score, { language, signDisplay: "exceptZero" }) });
};
const ScorePanel = ({ score }) => {
  const { t } = useTranslation(decisionsI18n);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-grey-white bg-purple-primary flex flex-1 flex-col items-center justify-center gap-sm rounded-lg p-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: t("decisions:score") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-l font-semibold", children: score })
  ] });
};
export {
  DecisionRightPanel as D,
  Score as S,
  ScorePanel as a
};
