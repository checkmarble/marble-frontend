import { aP as qualificationLevels, J as protectArray, Z as caseStatuses, T as Temporal, aQ as finalOutcomes, aR as suspiciousActivityReportStatuses, aS as nonPendingReviewStatuses } from "./services-middleware-DR8Hua1Y.js";
import { o as object, _ as _enum, s as string, k as array, l as discriminatedUnion, m as literal, gs as datetime, gk as union, p as boolean, j as uuid, fs as _instanceof, n as number, f_ as record, fO as _null } from "./short-uuid-MIi3jWzx.js";
const closeCasePayloadSchema = object({
  caseId: uuid(),
  outcome: _enum(finalOutcomes).optional(),
  comment: string()
});
const openCasePayloadSchema = object({
  caseId: string(),
  comment: string()
});
const createCasePayloadSchema = object({
  name: string().min(1),
  inboxId: uuid()
});
const escalateCasePayloadSchema = object({ caseId: string(), inboxId: string() });
const snoozeCasePayloadSchema = object({
  caseId: string(),
  snoozeUntil: string().nullable()
});
const editAssigneePayloadSchema = object({
  assigneeId: string().nullable(),
  caseId: string()
});
const editInboxPayloadSchema = object({ inboxId: string(), caseId: string() });
const editNamePayloadSchema = object({ name: string(), caseId: string() });
const editTagsPayloadSchema = object({
  caseId: string(),
  tagIds: protectArray(array(string()))
});
const editSuspicionPayloadSchema = object({
  status: union([
    ...suspiciousActivityReportStatuses.map((s) => literal(s)),
    literal("none")
  ]),
  file: _instanceof(File).optional(),
  caseId: string(),
  reportId: string().optional()
});
const addCommentPayloadSchema = object({
  caseId: uuid().nonempty(),
  comment: string(),
  files: protectArray(array(_instanceof(File)))
}).refine((data) => data.comment.trim() !== "" || data.files.length > 0);
const massUpdateCasesPayloadSchema = union([
  object({
    action: _enum(["close", "reopen"]),
    caseIds: protectArray(array(string()))
  }).transform((data) => ({ case_ids: data.caseIds, action: data.action })),
  object({
    action: _enum(["assign"]),
    caseIds: protectArray(array(string())),
    assigneeId: string()
  }).transform((data) => ({
    case_ids: data.caseIds,
    action: data.action,
    assign: { assignee_id: data.assigneeId }
  })),
  object({
    action: _enum(["move_to_inbox"]),
    caseIds: protectArray(array(string())),
    inboxId: string()
  }).transform((data) => ({
    case_ids: data.caseIds,
    action: data.action,
    move_to_inbox: { inbox_id: data.inboxId }
  }))
]);
const reviewDecisionPayloadSchema = object({
  decisionId: string(),
  reviewComment: string(),
  reviewStatus: _enum(nonPendingReviewStatuses)
});
const durationUnitOptions = ["hours", "days", "weeks"];
const addRuleSnoozePayloadSchema = object({
  decisionId: string(),
  ruleId: string(),
  comment: string().optional(),
  durationValue: number().min(1),
  durationUnit: _enum(durationUnitOptions)
});
const reviewScreeningMatchPayloadSchema = object({
  matchId: string(),
  status: union([literal("confirmed_hit"), literal("no_hit")]),
  comment: string().optional(),
  whitelist: boolean().optional()
});
const newCaseSchema = object({
  newCase: literal(true),
  name: string().min(1),
  decisionIds: protectArray(array(string())),
  inboxId: string().min(1)
});
const existingCaseSchema = object({
  newCase: literal(false),
  caseId: string().min(1),
  decisionIds: protectArray(array(string()))
});
const addToCasePayloadSchema = discriminatedUnion("newCase", [newCaseSchema, existingCaseSchema]);
const updateInboxEscalationPayloadSchema = object({
  updates: protectArray(
    array(
      object({
        inboxId: uuid(),
        escalationInboxId: union([uuid(), _null()])
      })
    )
  )
});
const updateAutoAssignPayloadSchema = object({
  inboxes: record(uuid(), boolean()),
  users: record(string(), boolean())
});
const updateInboxWorkflowPayloadSchema = object({
  updates: protectArray(
    array(
      object({
        inboxId: uuid(),
        caseReviewManual: boolean(),
        caseReviewOnCaseCreated: boolean(),
        caseReviewOnEscalate: boolean()
      })
    )
  )
});
const caseReviewReactionSchema = _enum(["ok", "ko"]);
const dateRangeSchema = discriminatedUnion("type", [
  object({
    type: literal("dynamic"),
    fromNow: string().refine((value) => {
      try {
        Temporal.Duration.from(value);
        return true;
      } catch {
        return false;
      }
    })
  }),
  object({
    type: literal("static"),
    startDate: datetime(),
    endDate: datetime()
  })
]);
const stringableBooleanSchema = union([boolean(), _enum(["true", "false"]).transform((val) => val === "true")]);
const filtersSchema = object({
  name: string().optional(),
  statuses: protectArray(array(_enum(caseStatuses))).optional(),
  includeSnoozed: stringableBooleanSchema.optional(),
  excludeAssigned: stringableBooleanSchema.optional(),
  assignee: string().optional(),
  dateRange: dateRangeSchema.optional(),
  tagId: string().optional(),
  qualification: _enum(qualificationLevels).optional()
});
const listCasesInputSchema = filtersSchema.extend({
  inboxId: string(),
  limit: number().optional(),
  order: _enum(["ASC", "DESC"]).optional(),
  offsetId: string().nullable().optional()
});
const listCaseDecisionsInputSchema = object({
  caseId: string(),
  limit: number().optional(),
  cursorId: string().optional()
});
export {
  editAssigneePayloadSchema as a,
  editInboxPayloadSchema as b,
  closeCasePayloadSchema as c,
  editNamePayloadSchema as d,
  escalateCasePayloadSchema as e,
  editTagsPayloadSchema as f,
  editSuspicionPayloadSchema as g,
  addCommentPayloadSchema as h,
  addRuleSnoozePayloadSchema as i,
  reviewScreeningMatchPayloadSchema as j,
  addToCasePayloadSchema as k,
  listCasesInputSchema as l,
  massUpdateCasesPayloadSchema as m,
  listCaseDecisionsInputSchema as n,
  openCasePayloadSchema as o,
  caseReviewReactionSchema as p,
  updateAutoAssignPayloadSchema as q,
  reviewDecisionPayloadSchema as r,
  snoozeCasePayloadSchema as s,
  updateInboxWorkflowPayloadSchema as t,
  updateInboxEscalationPayloadSchema as u,
  newCaseSchema as v,
  existingCaseSchema as w,
  createCasePayloadSchema as x,
  filtersSchema as y,
  durationUnitOptions as z
};
