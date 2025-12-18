import { R as jsxRuntimeExports, r as reactExports, _ as createServerFn } from "../server.js";
import { c as createSsrRpc } from "./createSsrRpc-ZXUHv2Er.js";
import { C as Callout } from "./Callout-DX4NBXlG.js";
import { u as useTranslation, eb as Collapsible, s as Trans, B as Button } from "./format-NPGUXq-g.js";
import { a1 as decisionsI18n, ab as scenarioI18n, aP as useDetectionScenarioIterationData, b5 as Route } from "./router-vb7i5euz.js";
import { S as ScoreOutcomeThresholds } from "./ScoreOutcomeThresholds-Co722Qdl.js";
import { E as ExternalLink } from "./ExternalLink-CG_77QdX.js";
import { F as FormErrorOrDescription } from "./FormErrorOrDescription-DO6Hdfmn.js";
import { F as FormInput } from "./FormInput-S5xzkMXf.js";
import { F as FormLabel } from "./FormLabel-DeCgtgtj.js";
import { E as EvaluationErrors } from "./ScenarioValidationError-DADb1taj.js";
import { u as useLoaderRevalidator } from "./LoaderRevalidatorContext-C9s56i-l.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { h as scenarioDecisionDocHref } from "./documentation-href-uAe88WFl.js";
import { u as useEditorMode } from "./editor-mode-BAuR_YJJ.js";
import { u as useGetScenarioErrorMessage } from "./scenario-validation-error-messages-CB3GcwJ8.js";
import { g as getFieldErrors } from "./form-D2XmDKeG.js";
import { u as useForm, a as useStore } from "./useForm-BwABQKAs.js";
import { u as useMutation } from "./useMutation-C5oG90Zs.js";
import { z as zt } from "./CopyToClipboardButton-CJNJJful.js";
import { n as number, o as object, f_ as record, s as string } from "./short-uuid-MIi3jWzx.js";
import { u as t, o as t$1, v as n, n as number$1 } from "./services-middleware-DR8Hua1Y.js";
import { O as OutcomeBadge } from "./OutcomeTag-BH_m80fa.js";
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
import "./i18n-instance-store-UssbGYOM.js";
import "./inboxes-D556s0BB.js";
import "./files-fO9wUXBf.js";
import "./case-detail-middleware-C3JS8Yme.js";
import "./input-validation-CU_reV2S.js";
import "./async-C3pYACua.js";
import "./decisions-B-2DmJW1.js";
import "./unique-CBeBxAXx.js";
import "./scenarios-8U74nJp4.js";
import "./index-x7n7VJTa.js";
import "./index-C_WgunUr.js";
import "./create-context-CYc8deix.js";
import "./array-BFSjnO9c.js";
import "node:crypto";
const MAX_THRESHOLD = 1e4;
const conflictingWithSchemaValidationErrors = ["SCORE_THRESHOLDS_MISMATCH", "SCORE_THRESHOLD_MISSING"];
function getFormSchema(t2) {
  return object({
    scoreReviewThreshold: number$1({
      message: t2("scenarios:validation.decision.score_threshold_missing")
    }).max(MAX_THRESHOLD, {
      message: t2("scenarios:validation.decision.score_threshold_max", {
        replace: {
          max: MAX_THRESHOLD
        }
      })
    }).min(-MAX_THRESHOLD, {
      message: t2("scenarios:validation.decision.score_threshold_min", {
        replace: {
          min: -MAX_THRESHOLD
        }
      })
    }).int(),
    scoreBlockAndReviewThreshold: number$1({
      message: t2("scenarios:validation.decision.score_threshold_missing")
    }).max(MAX_THRESHOLD, {
      message: t2("scenarios:validation.decision.score_threshold_max", {
        replace: {
          max: MAX_THRESHOLD
        }
      })
    }).min(-MAX_THRESHOLD, {
      message: t2("scenarios:validation.decision.score_threshold_min", {
        replace: {
          min: -MAX_THRESHOLD
        }
      })
    }).int(),
    scoreDeclineThreshold: number$1({
      message: t2("scenarios:validation.decision.score_threshold_missing")
    }).max(MAX_THRESHOLD, {
      message: t2("scenarios:validation.decision.score_threshold_max", {
        replace: {
          max: MAX_THRESHOLD
        }
      })
    }).min(-MAX_THRESHOLD, {
      message: t2("scenarios:validation.decision.score_threshold_min", {
        replace: {
          min: -MAX_THRESHOLD
        }
      })
    }).int()
  }).superRefine(({
    scoreReviewThreshold,
    scoreBlockAndReviewThreshold,
    scoreDeclineThreshold
  }, ctx) => {
    if (scoreBlockAndReviewThreshold < scoreReviewThreshold) {
      ctx.issues.push({
        code: "custom",
        path: ["scoreBlockAndReviewThreshold"],
        message: t2("scenarios:validation.decision.score_threshold_min", {
          replace: {
            min: scoreReviewThreshold
          }
        }),
        input: ""
      });
    }
    if (scoreDeclineThreshold < scoreBlockAndReviewThreshold) {
      ctx.issues.push({
        code: "custom",
        path: ["scoreDeclineThreshold"],
        message: t2("scenarios:validation.decision.score_threshold_min", {
          replace: {
            min: scoreBlockAndReviewThreshold
          }
        }),
        input: ""
      });
    }
  });
}
const handle = {
  i18n: [...decisionsI18n, ...scenarioI18n, "common"]
};
const saveDecisionInputSchema = object({
  params: record(string(), string()),
  scoreReviewThreshold: number(),
  scoreBlockAndReviewThreshold: number(),
  scoreDeclineThreshold: number()
});
const saveDecisionAction = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator((input) => saveDecisionInputSchema.parse(input)).handler(createSsrRpc("bdda9c0781c975539c593039fa8c7b3413d8e3550b1457c51cbe91dd66dbbb66"));
function Decision() {
  const {
    t: t2
  } = useTranslation(handle.i18n);
  const editorMode = useEditorMode();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Collapsible.Container, { className: "bg-surface-card max-w-3xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible.Title, { children: t2("scenarios:decision.score_based.title") }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Collapsible.Content, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { variant: "outlined", className: "mb-md lg:mb-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trans, { t: t2, i18nKey: "scenarios:decision.score_based.callout", components: {
        DocLink: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { href: scenarioDecisionDocHref })
      } }) }) }),
      editorMode === "view" ? /* @__PURE__ */ jsxRuntimeExports.jsx(ViewScoreThresholds, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(EditScoreThresholds, {})
    ] })
  ] });
}
function ViewScoreThresholds() {
  const {
    scenarioIteration: {
      scoreReviewThreshold,
      scoreBlockAndReviewThreshold,
      scoreDeclineThreshold
    }
  } = useDetectionScenarioIterationData();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ScoreOutcomeThresholds, { scoreReviewThreshold, scoreBlockAndReviewThreshold, scoreDeclineThreshold });
}
function EditScoreThresholds() {
  const {
    t: t$2
  } = useTranslation(handle.i18n);
  const params = Route.useParams();
  const {
    scenarioIteration,
    scenarioValidation
  } = useDetectionScenarioIterationData();
  const revalidate = useLoaderRevalidator();
  const getScenarioErrorMessage = useGetScenarioErrorMessage();
  const mutation = useMutation({
    mutationFn: (value) => {
      return saveDecisionAction({
        data: {
          params,
          ...value
        }
      });
    },
    onSuccess: (result) => {
      if (result.status === "success") {
        zt.success(t$2("common:success.save"));
        revalidate();
        return;
      }
      zt.error(t$2("common:errors.unknown"));
    },
    onError: () => {
      zt.error(t$2("common:errors.unknown"));
    }
  });
  const editorMode = useEditorMode();
  const schema = reactExports.useMemo(() => getFormSchema(t$2), [t$2]);
  const fieldValidators = reactExports.useMemo(() => {
    return {
      scoreReviewThreshold: number({
        message: t$2("scenarios:validation.decision.score_threshold_missing")
      }).max(MAX_THRESHOLD, {
        message: t$2("scenarios:validation.decision.score_threshold_max", {
          replace: {
            max: MAX_THRESHOLD
          }
        })
      }).min(-MAX_THRESHOLD, {
        message: t$2("scenarios:validation.decision.score_threshold_min", {
          replace: {
            min: -MAX_THRESHOLD
          }
        })
      }).int(),
      scoreBlockAndReviewThreshold: number({
        message: t$2("scenarios:validation.decision.score_threshold_missing")
      }).max(MAX_THRESHOLD, {
        message: t$2("scenarios:validation.decision.score_threshold_max", {
          replace: {
            max: MAX_THRESHOLD
          }
        })
      }).min(-MAX_THRESHOLD, {
        message: t$2("scenarios:validation.decision.score_threshold_min", {
          replace: {
            min: -MAX_THRESHOLD
          }
        })
      }).int(),
      scoreDeclineThreshold: number({
        message: t$2("scenarios:validation.decision.score_threshold_missing")
      }).max(MAX_THRESHOLD, {
        message: t$2("scenarios:validation.decision.score_threshold_max", {
          replace: {
            max: MAX_THRESHOLD
          }
        })
      }).min(-MAX_THRESHOLD, {
        message: t$2("scenarios:validation.decision.score_threshold_min", {
          replace: {
            min: -MAX_THRESHOLD
          }
        })
      }).int()
    };
  }, [t$2]);
  const form = useForm({
    defaultValues: {
      scoreReviewThreshold: scenarioIteration.scoreReviewThreshold ?? 0,
      scoreBlockAndReviewThreshold: scenarioIteration.scoreBlockAndReviewThreshold ?? 0,
      scoreDeclineThreshold: scenarioIteration.scoreDeclineThreshold ?? 0
    },
    validators: {
      onSubmit: schema
    },
    onSubmit: ({
      value,
      formApi
    }) => {
      if (formApi.state.isValid) {
        mutation.mutate(value);
      }
    }
  });
  const scoreReviewThreshold = useStore(form.store, (store) => store.values.scoreReviewThreshold);
  const scoreBlockAndReviewThreshold = useStore(form.store, (store) => store.values.scoreBlockAndReviewThreshold);
  const scoreDeclineThreshold = useStore(form.store, (store) => store.values.scoreDeclineThreshold);
  const serverErrors = t(scenarioValidation.decision.errors, n((error) => !conflictingWithSchemaValidationErrors.includes(error)), t$1(getScenarioErrorMessage));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "flex flex-col gap-sm", onSubmit: (e) => {
    e.preventDefault();
    e.stopPropagation();
    form.handleSubmit();
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[max-content_auto] items-center gap-x-1 gap-y-2 lg:gap-x-2 lg:gap-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(OutcomeBadge, { size: "md", outcome: "approve", className: "w-full justify-center" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "scoreReviewThreshold", validators: {
        onChange: fieldValidators.scoreReviewThreshold,
        onBlur: fieldValidators.scoreReviewThreshold
      }, children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row flex-wrap items-center gap-xs lg:gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { name: field.name, className: "sr-only", children: t$2("scenarios:decision.score_based.score_review_threshold") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trans, { t: t$2, i18nKey: "scenarios:decision.score_based.approve_condition", components: {
          ReviewThreshold: /* @__PURE__ */ jsxRuntimeExports.jsx(FormInput, { type: "number", name: field.name, onBlur: field.handleBlur, className: "relative w-fit", defaultValue: field.state.value, onChange: (e) => field.handleChange(+e.currentTarget.value), valid: field.state.meta.errors?.length === 0 })
        }, shouldUnescape: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors), errorClassName: style.errorMessage })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(OutcomeBadge, { size: "md", outcome: "review", className: "w-full justify-center" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "scoreBlockAndReviewThreshold", validators: {
        onChange: fieldValidators.scoreBlockAndReviewThreshold,
        onBlur: fieldValidators.scoreBlockAndReviewThreshold
      }, children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row flex-wrap items-center gap-xs lg:gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { name: field.name, className: "sr-only", children: t$2("scenarios:decision.score_based.score_block_and_review_threshold") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trans, { t: t$2, i18nKey: "scenarios:decision.score_based.review_condition", values: {
          reviewThreshold: scoreReviewThreshold
        }, components: {
          BlockAndReviewThreshold: /* @__PURE__ */ jsxRuntimeExports.jsx(FormInput, { type: "number", name: field.name, onBlur: field.handleBlur, min: scoreReviewThreshold, className: "relative w-fit", defaultValue: scoreBlockAndReviewThreshold, onChange: (e) => field.handleChange(+e.currentTarget.value), valid: field.state.meta.errors?.length === 0 })
        }, shouldUnescape: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors), errorClassName: style.errorMessage })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(OutcomeBadge, { size: "md", outcome: "block_and_review", className: "w-full justify-center" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "scoreDeclineThreshold", validators: {
        onChange: fieldValidators.scoreDeclineThreshold,
        onBlur: fieldValidators.scoreDeclineThreshold
      }, children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row flex-wrap items-center gap-xs lg:gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { name: field.name, className: "sr-only", children: t$2("scenarios:decision.score_based.score_decline_threshold") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trans, { t: t$2, i18nKey: "scenarios:decision.score_based.score_block_and_review_condition", values: {
          blockAndReviewThreshold: scoreBlockAndReviewThreshold
        }, components: {
          DeclineThreshold: /* @__PURE__ */ jsxRuntimeExports.jsx(FormInput, { type: "number", name: field.name, onBlur: field.handleBlur, className: "relative w-fit", min: scoreBlockAndReviewThreshold, defaultValue: scoreDeclineThreshold, onChange: (e) => field.handleChange(+e.currentTarget.value), valid: field.state.meta.errors?.length === 0 })
        }, shouldUnescape: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors), errorClassName: style.errorMessage })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(OutcomeBadge, { size: "md", outcome: "decline", className: "w-full justify-center" }),
      t$2("scenarios:decision.score_based.decline_condition", {
        replace: {
          declineThreshold: scoreDeclineThreshold
        }
      })
    ] }),
    editorMode === "edit" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row-reverse items-center justify-between gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "primary", type: "submit", children: t$2("common:save") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(EvaluationErrors, { errors: serverErrors })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(EvaluationErrors, { errors: serverErrors })
  ] });
}
const style = {
  errorMessage: "bg-red-background rounded-sm px-xs py-2xs h-8 flex items-center justify-center"
};
export {
  Decision as component
};
