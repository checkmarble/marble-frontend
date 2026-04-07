import {
  caseStatuses,
  finalOutcomes,
  qualificationLevels,
  type SuspiciousActivityReportStatus,
  suspiciousActivityReportStatuses,
} from '@app-builder/models/cases';
import { nonPendingReviewStatuses } from '@app-builder/models/decision';
import { protectArray } from '@app-builder/utils/schema/helpers/array';
import { Temporal } from 'temporal-polyfill';
import { z } from 'zod/v4';

// Close case

export const closeCasePayloadSchema = z.object({
  caseId: z.uuid(),
  outcome: z.enum(finalOutcomes).optional(),
  comment: z.string(),
});

export type CloseCasePayload = z.infer<typeof closeCasePayloadSchema>;

// Open case

export const openCasePayloadSchema = z.object({
  caseId: z.string(),
  comment: z.string(),
});

export type OpenCasePayload = z.infer<typeof openCasePayloadSchema>;

// Create case

export const createCasePayloadSchema = z.object({
  name: z.string().min(1),
  inboxId: z.uuid(),
});

export type CreateCasePayload = z.infer<typeof createCasePayloadSchema>;

// Escalate case

export const escalateCasePayloadSchema = z.object({ caseId: z.string(), inboxId: z.string() });

export type EscalateCasePayload = z.infer<typeof escalateCasePayloadSchema>;

// Snooze case

export const snoozeCasePayloadSchema = z.object({
  caseId: z.string(),
  snoozeUntil: z.string().nullable(),
});

export type SnoozeCasePayload = z.infer<typeof snoozeCasePayloadSchema>;

// Edit assignee

export const editAssigneePayloadSchema = z.object({
  assigneeId: z.string().nullable(),
  caseId: z.string(),
});

export type EditAssigneePayload = z.infer<typeof editAssigneePayloadSchema>;

// Edit inbox

export const editInboxPayloadSchema = z.object({ inboxId: z.string(), caseId: z.string() });

export type EditInboxPayload = z.infer<typeof editInboxPayloadSchema>;

// Edit name

export const editNamePayloadSchema = z.object({ name: z.string(), caseId: z.string() });

export type EditNamePayload = z.infer<typeof editNamePayloadSchema>;

// Edit tags

export const editTagsPayloadSchema = z.object({
  caseId: z.string(),
  tagIds: protectArray(z.array(z.string())),
});

export type EditTagsPayload = z.infer<typeof editTagsPayloadSchema>;

// Edit suspicion (FormData)

export const editSuspicionPayloadSchema = z.object({
  status: z.union([
    ...(suspiciousActivityReportStatuses.map((s) => z.literal(s)) as [
      z.ZodLiteral<SuspiciousActivityReportStatus>,
      z.ZodLiteral<SuspiciousActivityReportStatus>,
      ...z.ZodLiteral<SuspiciousActivityReportStatus>[],
    ]),
    z.literal('none'),
  ]),
  file: z.instanceof(File).optional(),
  caseId: z.string(),
  reportId: z.string().optional(),
});

export type EditSuspicionPayload = z.infer<typeof editSuspicionPayloadSchema>;

export type EditSuspicionResponse =
  | {
      success: true;
      errors: never[];
      data: import('@app-builder/models/cases').SuspiciousActivityReport | undefined;
    }
  | {
      success: false;
      errors: string[];
      data?: undefined;
    };

// Add comment (FormData)

export const addCommentPayloadSchema = z
  .object({
    caseId: z.uuid().nonempty(),
    comment: z.string(),
    files: protectArray(z.array(z.instanceof(File))),
  })
  .refine((data) => data.comment.trim() !== '' || data.files.length > 0);

export type AddCommentPayload = z.infer<typeof addCommentPayloadSchema>;

// Mass update cases

export const massUpdateCasesPayloadSchema = z.union([
  z
    .object({
      action: z.enum(['close', 'reopen']),
      caseIds: protectArray(z.array(z.string())),
    })
    .transform((data) => ({ case_ids: data.caseIds, action: data.action })),
  z
    .object({
      action: z.enum(['assign']),
      caseIds: protectArray(z.array(z.string())),
      assigneeId: z.string(),
    })
    .transform((data) => ({
      case_ids: data.caseIds,
      action: data.action,
      assign: { assignee_id: data.assigneeId },
    })),
  z
    .object({
      action: z.enum(['move_to_inbox']),
      caseIds: protectArray(z.array(z.string())),
      inboxId: z.string(),
    })
    .transform((data) => ({
      case_ids: data.caseIds,
      action: data.action,
      move_to_inbox: { inbox_id: data.inboxId },
    })),
]);

export type MassUpdateCasesPayload = z.input<typeof massUpdateCasesPayloadSchema>;

// Review decision

export const reviewDecisionPayloadSchema = z.object({
  decisionId: z.string(),
  reviewComment: z.string(),
  reviewStatus: z.enum(nonPendingReviewStatuses),
});

export type ReviewDecisionPayload = z.infer<typeof reviewDecisionPayloadSchema>;

// Add rule snooze

export const durationUnitOptions = ['hours', 'days', 'weeks'] as const;

export const addRuleSnoozePayloadSchema = z.object({
  decisionId: z.string(),
  ruleId: z.string(),
  comment: z.string().optional(),
  durationValue: z.number().min(1),
  durationUnit: z.enum(durationUnitOptions),
});

export type AddRuleSnoozePayload = z.infer<typeof addRuleSnoozePayloadSchema>;

// Review screening match

export const reviewScreeningMatchPayloadSchema = z.object({
  matchId: z.string(),
  status: z.union([z.literal('confirmed_hit'), z.literal('no_hit')]),
  comment: z.string().optional(),
  whitelist: z.boolean().optional(),
});

export type ReviewScreeningMatchPayload = z.infer<typeof reviewScreeningMatchPayloadSchema>;

// Add to case

export const newCaseSchema = z.object({
  newCase: z.literal(true),
  name: z.string().min(1),
  decisionIds: protectArray(z.array(z.string())),
  inboxId: z.string().min(1),
});

export const existingCaseSchema = z.object({
  newCase: z.literal(false),
  caseId: z.string().min(1),
  decisionIds: protectArray(z.array(z.string())),
});

export const addToCasePayloadSchema = z.discriminatedUnion('newCase', [newCaseSchema, existingCaseSchema]);

export type AddToCasePayload = z.infer<typeof addToCasePayloadSchema>;

// Update inbox escalation

export const updateInboxEscalationPayloadSchema = z.object({
  updates: protectArray(
    z.array(
      z.object({
        inboxId: z.uuid(),
        escalationInboxId: z.union([z.uuid(), z.null()]),
      }),
    ),
  ),
});

export type UpdateInboxEscalationPayload = z.infer<typeof updateInboxEscalationPayloadSchema>;

// Update auto-assign

export const updateAutoAssignPayloadSchema = z.object({
  inboxes: z.record(z.uuid(), z.boolean()),
  users: z.record(z.string(), z.boolean()),
});

export type UpdateAutoAssignPayload = z.infer<typeof updateAutoAssignPayloadSchema>;

// Update inbox workflow

export const updateInboxWorkflowPayloadSchema = z.object({
  updates: protectArray(
    z.array(
      z.object({
        inboxId: z.uuid(),
        caseReviewManual: z.boolean(),
        caseReviewOnCaseCreated: z.boolean(),
        caseReviewOnEscalate: z.boolean(),
      }),
    ),
  ),
});

export type UpdateInboxWorkflowPayload = z.infer<typeof updateInboxWorkflowPayloadSchema>;

// Case review feedback

export const caseReviewReactionSchema = z.enum(['ok', 'ko']);

// List cases filters

const dateRangeSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('dynamic'),
    fromNow: z.string().refine((value) => {
      try {
        Temporal.Duration.from(value);
        return true;
      } catch {
        return false;
      }
    }),
  }),
  z.object({
    type: z.literal('static'),
    startDate: z.iso.datetime(),
    endDate: z.iso.datetime(),
  }),
]);

const stringableBooleanSchema = z.union([z.boolean(), z.enum(['true', 'false']).transform((val) => val === 'true')]);

export const filtersSchema = z.object({
  name: z.string().optional(),
  statuses: protectArray(z.array(z.enum(caseStatuses))).optional(),
  includeSnoozed: stringableBooleanSchema.optional(),
  excludeAssigned: stringableBooleanSchema.optional(),
  assignee: z.string().optional(),
  dateRange: dateRangeSchema.optional(),
  tagId: z.string().optional(),
  qualification: z.enum(qualificationLevels).optional(),
});

export type Filters = z.infer<typeof filtersSchema>;

// List cases pagination + filters input (for server fn)

export const listCasesInputSchema = filtersSchema.extend({
  inboxId: z.string(),
  limit: z.number().optional(),
  order: z.enum(['ASC', 'DESC']).optional(),
  offsetId: z.string().nullable().optional(),
});

export type ListCasesInput = z.infer<typeof listCasesInputSchema>;

// List case decisions pagination

export const listCaseDecisionsInputSchema = z.object({
  caseId: z.string(),
  limit: z.number().optional(),
  cursorId: z.string().optional(),
});

export type ListCaseDecisionsInput = z.infer<typeof listCaseDecisionsInputSchema>;
