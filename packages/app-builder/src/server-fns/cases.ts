import { MY_INBOX_ID } from '@app-builder/constants/inboxes';
import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import {
  isNotFoundHttpError,
  isStatusBadRequestHttpError,
  isStatusConflictHttpError,
  isUnprocessableEntityHttpError,
} from '@app-builder/models';
import { type AiSettingSchema, transformCaseReviewSetting } from '@app-builder/models/ai-settings';
import {
  type AiCaseReviewListItem,
  adaptAiCaseReviewListItem,
  adaptCase,
  adaptCaseReview,
  adaptSuspiciousActivityReport,
  type CaseReview,
  caseStatuses,
  type SuspiciousActivityReport,
} from '@app-builder/models/cases';
import { Decision, DecisionDetails, DecisionForSnooze, RuleWithSnoozeData } from '@app-builder/models/decision';
import { adaptUpdateInboxesSla } from '@app-builder/models/inbox';
import { adaptKycCaseEnrichment, KycCaseEnrichment } from '@app-builder/models/kyc-case-enrichment';
import { RuleSnoozeWithRuleId } from '@app-builder/models/rule-snooze';
import { ScenarioIterationRule } from '@app-builder/models/scenario/iteration-rule';
import {
  addCommentPayloadSchema,
  addObjectsToCasePayloadSchema,
  addRuleSnoozePayloadSchema,
  addToCasePayloadSchema,
  caseReviewReactionSchema,
  closeCasePayloadSchema,
  editAssigneePayloadSchema,
  editInboxPayloadSchema,
  editSuspicionPayloadSchema,
  editTagsPayloadSchema,
  escalateCasePayloadSchema,
  listCaseDecisionsInputSchema,
  listCasesInputSchema,
  massUpdateCasesPayloadSchema,
  openCasePayloadSchema,
  removeObjectsFromCasePayloadSchema,
  reviewDecisionPayloadSchema,
  reviewScreeningMatchPayloadSchema,
  snoozeCasePayloadSchema,
  updateAutoAssignPayloadSchema,
  updateInboxEscalationPayloadSchema,
  updateInboxesSlaPayloadSchema,
  updateInboxWorkflowPayloadSchema,
} from '@app-builder/schemas/cases';
import { getAiAssistSettings } from '@app-builder/server/ai-assist';
import {
  addCaseReviewFeedback,
  addComment,
  addDecisionsToCase,
  addObjectsToCase,
  assignUser,
  createCase,
  createCaseFromObjects,
  getCase,
  getNextUnassignedCaseId,
  getPivotRelatedCases,
  listCaseDecisions,
  listCases,
  removeObjectsFromCase,
  reviewDecision,
  setTags,
  snoozeCase,
  updateCase,
} from '@app-builder/server/cases';
import { createSnoozeForDecision, getDecisionActiveSnoozes, getDecisionById } from '@app-builder/server/decisions';
import { getInbox, listInboxesWithCaseCount, updateInbox, updateInboxUser } from '@app-builder/server/inboxes';
import { listRules } from '@app-builder/server/scenario-iteration-rules';
import { updateMatchStatus } from '@app-builder/server/screenings';
import { useAuthSession } from '@app-builder/services/auth/auth-session.server';
import { getFixedT } from '@app-builder/services/i18n/i18next.server';
import { getServerEnv } from '@app-builder/utils/environment';
import { getCaseFileUploadEndpoint } from '@app-builder/utils/files';
import { protectArray } from '@app-builder/utils/schema/helpers/array';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import * as Sentry from '@sentry/tanstackstart-react';
import { redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { decode } from 'decode-formdata';
import * as R from 'remeda';
import { Temporal } from 'temporal-polyfill';
import { z } from 'zod/v4';

// ---- Case CRUD ----

export const createCaseFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(
    z.object({
      name: z.string().min(1),
      inboxId: z.uuid(),
    }),
  )
  .handler(async ({ context, data }) => {
    try {
      const createdCase = await createCase(context.api, data);
      throw redirect({ to: '/cases/$caseId', params: { caseId: fromUUIDtoSUUID(createdCase.id) } });
    } catch (error) {
      if (error instanceof Response && error.status >= 300 && error.status < 400) throw error;
      throw new Error('Failed to create case');
    }
  });

export const closeCaseFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(closeCasePayloadSchema)
  .handler(async ({ context, data }) => {
    const { caseId, outcome, comment } = data;
    try {
      const promises: Promise<unknown>[] = [updateCase(context.api, { caseId, body: { status: 'closed', outcome } })];
      if (comment !== '') {
        promises.push(addComment(context.api, { caseId, body: { comment } }));
      }
      await Promise.all(promises);
    } catch {
      throw new Error('Failed to close case');
    }
  });

export const openCaseFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(openCasePayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      const promises: Promise<unknown>[] = [];
      if (data.comment !== '') {
        promises.push(addComment(context.api, { caseId: data.caseId, body: { comment: data.comment } }));
      }
      promises.push(updateCase(context.api, { caseId: data.caseId, body: { status: 'investigating' } }));
      await Promise.allSettled(promises);
    } catch {
      throw new Error('Failed to open case');
    }
  });

export const escalateCaseFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(escalateCasePayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      await context.api.escalateCase(data.caseId);
      throw redirect({ to: '/cases/inboxes/$inboxId', params: { inboxId: fromUUIDtoSUUID(data.inboxId) } });
    } catch (error) {
      if (error instanceof Response && error.status >= 300 && error.status < 400) throw error;
      throw new Error('Failed to escalate case');
    }
  });

export const snoozeCaseFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(snoozeCasePayloadSchema)
  .handler(async ({ context, data }) => {
    await (data.snoozeUntil
      ? snoozeCase(context.api, { caseId: data.caseId, snoozeUntil: data.snoozeUntil })
      : context.api.unsnoozeCase(data.caseId));
  });

// ---- Case edits ----

export const editAssigneeFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(editAssigneePayloadSchema)
  .handler(async ({ context, data }) => {
    if (data.assigneeId) {
      await assignUser(context.api, { caseId: data.caseId, userId: data.assigneeId });
    } else {
      await context.api.unassignUser(data.caseId);
    }
  });

export const editInboxFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(editInboxPayloadSchema)
  .handler(async ({ context, data }) => {
    await updateCase(context.api, { caseId: data.caseId, body: { inboxId: data.inboxId } });
  });

export const editTagsFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(editTagsPayloadSchema)
  .handler(async ({ context, data }) => {
    await setTags(context.api, data);
  });

export const editSuspicionFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error('Expected FormData');
    return data;
  })
  .handler(async ({ context, data }) => {
    const parsed = editSuspicionPayloadSchema.safeParse(decode(data));
    if (!parsed.success) throw new Error('Invalid payload');

    const formData = parsed.data;

    try {
      let sar: SuspiciousActivityReport | undefined = undefined;

      // `file` must be left out rather than set to undefined, or the client sends the string "undefined" as the file.
      if (formData.reportId && formData.status === 'none') {
        await context.api.sarDelete(formData.caseId, formData.reportId);
      } else if (formData.reportId && formData.status !== 'none') {
        sar = adaptSuspiciousActivityReport(
          await context.api.sarUpdate(formData.caseId, formData.reportId, {
            status: formData.status,
            ...(formData.file && { file: formData.file }),
          }),
        );
      } else if (!formData.reportId && formData.status !== 'none') {
        sar = adaptSuspiciousActivityReport(
          await context.api.sarCreate(formData.caseId, {
            status: formData.status,
            ...(formData.file && { file: formData.file }),
          }),
        );
      } else {
        throw new Error('Should not happen');
      }

      return { success: true as const, errors: [] as never[], data: sar };
    } catch (error) {
      return { success: false as const, errors: [(error as Error).message] };
    }
  });

export const listSuspicionActivityReportsFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(z.object({ caseId: z.string() }))
  .handler(async ({ context, data }) => {
    return R.map(await context.api.sarList(data.caseId), adaptSuspiciousActivityReport);
  });

export const massUpdateCasesFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(massUpdateCasesPayloadSchema)
  .handler(async ({ context, data }) => {
    await context.api.massUpdateCases(data);
  });

// ---- Comments ----

export const addCommentFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error('Expected FormData');
    return data;
  })
  .handler(async ({ context, data }) => {
    const authSession = await useAuthSession();
    const token = authSession.data.authToken?.access_token;
    if (!token) throw redirect({ to: '/sign-in', statusCode: 302 });

    const parsed = addCommentPayloadSchema.safeParse(decode(data, { arrays: ['files'] }));
    if (!parsed.success) throw new Error('Invalid payload');

    const formData = parsed.data;

    try {
      const promises: Promise<unknown>[] = [];

      if (formData.comment !== '') {
        promises.push(addComment(context.api, { caseId: formData.caseId, body: { comment: formData.comment } }));
      }

      if (formData.files.length > 0) {
        const body = new FormData();
        formData.files.forEach((file) => {
          body.append('file[]', file);
        });
        promises.push(
          fetch(`${getServerEnv('MARBLE_API_URL')}${getCaseFileUploadEndpoint(formData.caseId)}`, {
            method: 'POST',
            body,
            headers: { Authorization: `Bearer ${token}` },
          }).then((res) => {
            if (!res.ok) {
              throw new Error('Failed to upload comment files');
            }
          }),
        );
      }

      await Promise.all(promises);
    } catch {
      throw new Error('Failed to add comment');
    }
  });

// ---- Reviews ----

export const reviewDecisionFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(reviewDecisionPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      await reviewDecision(context.api, data);
      return { status: 'success' as const };
    } catch {
      return { status: 'error' as const };
    }
  });

export const addRuleSnoozeFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(addRuleSnoozePayloadSchema)
  .handler(async ({ context, data }) => {
    const request = getRequest();
    const t = await getFixedT(request, ['common', 'cases']);

    const { decisionId, ruleId, comment, durationUnit, durationValue } = data;

    const duration = Temporal.Duration.from({ [durationUnit]: durationValue });

    if (
      Temporal.Duration.compare(duration, Temporal.Duration.from({ days: 180 }), {
        relativeTo: Temporal.Now.plainDateTimeISO(),
      }) >= 0
    ) {
      return {
        status: 'error' as const,
        errors: [{ durationValue: [t('cases:case_detail.add_rule_snooze.errors.max_duration')] }],
      };
    }

    try {
      await createSnoozeForDecision(context.api, decisionId, { ruleId, duration, comment });
      return { status: 'success' as const, errors: [] };
    } catch (error) {
      if (isStatusConflictHttpError(error)) {
        return { status: 'error' as const, errors: [], error: 'duplicate_rule_snooze' as const };
      }
      return { status: 'error' as const, errors: [] };
    }
  });

export const reviewScreeningMatchFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(reviewScreeningMatchPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      await updateMatchStatus(context.api, data);
    } catch {
      throw new Error('Failed to review screening match');
    }
  });

export const setAllMatchesToNoHitFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(
    z.object({
      matchIds: protectArray(z.string().array()),
      whitelist: z.boolean().optional(),
      comment: z.string().optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    try {
      await Promise.all(
        data.matchIds.map((matchId) =>
          updateMatchStatus(context.api, {
            matchId,
            status: 'no_hit',
            whitelist: data.whitelist,
            comment: data.comment,
          }),
        ),
      );
    } catch {
      throw new Error('Failed to review screening match');
    }
  });

export const addToCaseFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(addToCasePayloadSchema)
  .handler(async ({ context, data }) => {
    const request = getRequest();
    const t = await getFixedT(request, ['common', 'cases']);

    try {
      if (data.newCase) {
        return await createCase(context.api, data);
      } else {
        return await addDecisionsToCase(context.api, data);
      }
    } catch (error) {
      if (isStatusBadRequestHttpError(error)) {
        throw new Error(t('common:errors.add_to_case.invalid'));
      } else if (isNotFoundHttpError(error)) {
        throw new Error(t('cases:errors.case_not_found'));
      }
      throw new Error(t('common:errors.unknown'));
    }
  });

export const addObjectsToCaseFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(addObjectsToCasePayloadSchema)
  .handler(async ({ context, data }) => {
    const request = getRequest();
    const t = await getFixedT(request, ['common', 'cases']);

    try {
      if (data.newCase) {
        return await createCaseFromObjects(context.api, data);
      }
      return await addObjectsToCase(context.api, data);
    } catch (error) {
      if (isUnprocessableEntityHttpError(error)) {
        throw new Error(t('cases:errors.invalid_case_objects'));
      } else if (isStatusBadRequestHttpError(error)) {
        throw new Error(t('common:errors.add_to_case.invalid'));
      } else if (!data.newCase && isNotFoundHttpError(error)) {
        throw new Error(t('cases:errors.case_not_found'));
      }
      throw new Error(t('common:errors.unknown'));
    }
  });

export const removeObjectsFromCaseFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(removeObjectsFromCasePayloadSchema)
  .handler(async ({ context, data }) => {
    const request = getRequest();
    const t = await getFixedT(request, ['common', 'cases']);

    try {
      return await removeObjectsFromCase(context.api, data);
    } catch (error) {
      if (isUnprocessableEntityHttpError(error)) {
        throw new Error(t('cases:errors.invalid_case_objects'));
      } else if (isStatusBadRequestHttpError(error)) {
        throw new Error(t('common:errors.add_to_case.invalid'));
      } else if (isNotFoundHttpError(error)) {
        throw new Error(t('cases:errors.case_not_found'));
      }
      throw new Error(t('common:errors.unknown'));
    }
  });

// ---- AI review settings ----

export const getAiSettingsFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const settings = await getAiAssistSettings(context.api);
    return { settings };
  });

export const updateAiSettingsFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator((data: unknown) => data as AiSettingSchema)
  .handler(async ({ context, data }) => {
    try {
      await context.api.upsertAiSettings(transformCaseReviewSetting.encode(data));
    } catch (error) {
      Sentry.captureException(error);
      throw new Error('Failed to update AI settings');
    }
  });

// ---- Case info ----

export const getInboxesFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const inboxes = await listInboxesWithCaseCount(context.api);
    return { inboxes };
  });

export const getCaseDetailFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(z.object({ caseId: z.string() }))
  .handler(async ({ context, data }) => {
    const caseDetail = await getCase(context.api, { caseId: data.caseId });
    return { caseDetail };
  });

export const getCaseNameFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(z.object({ caseId: z.string() }))
  .handler(async ({ context, data }) => {
    const c = await getCase(context.api, { caseId: data.caseId });
    return { name: c.name };
  });

export const getCasesFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(listCasesInputSchema)
  .handler(async ({ context, data }) => {
    const { inboxId, limit, order, offsetId, ...filters } = data;
    const { user } = context;

    const filterInboxIds = inboxId === MY_INBOX_ID ? undefined : [inboxId];
    const assigneeIdFilter = filters.assignee ? { assigneeId: filters.assignee } : {};
    const statusesFilter = filters.statuses ?? caseStatuses.filter((status) => status !== 'closed');

    return listCases(context.api, {
      ...filters,
      ...(limit ? { limit } : {}),
      ...(order ? { order } : {}),
      ...(offsetId ? { offsetId } : {}),
      statuses: statusesFilter,
      inboxIds: filterInboxIds,
      ...(filterInboxIds === undefined ? { assigneeId: user.actorIdentity.userId } : assigneeIdFilter),
    });
  });

export const getRelatedCasesByObjectFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(z.object({ objectType: z.string(), objectId: z.string() }))
  .handler(async ({ context, data }) => {
    const relatedCases = (await context.api.getObjectRelatedCases(data.objectType, data.objectId)).map((dto) =>
      adaptCase(dto),
    );
    return { cases: relatedCases };
  });

export const getPivotRelatedCasesFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(z.object({ pivotValue: z.string() }))
  .handler(async ({ context, data }) => {
    const cases = await getPivotRelatedCases(context.api, { pivotValue: data.pivotValue });
    return { cases };
  });

// ---- Case decisions ----

export const listCaseDecisionsFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(listCaseDecisionsInputSchema)
  .handler(async ({ context, data }) => {
    return listCaseDecisions(
      context.api,
      { caseId: data.caseId },
      { limit: data.limit ?? 200, cursorId: data.cursorId },
    );
  });

// ---- Rules by pivot ----

export const getRulesByPivotFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(z.object({ caseId: z.string() }))
  .handler(async ({ context, data }) => {
    const { api } = context;

    const caseDetail = await getCase(api, { caseId: data.caseId });
    const iterationRules = await getScenarioIterationsRules(caseDetail.decisions, api);

    const [decisionsDetails, snoozes] = await Promise.all([
      enrichDecisions(caseDetail.decisions, api, iterationRules),
      getDecisionsSnoozes(caseDetail.decisions, api),
    ]);

    const rulesByPivot = R.pipe(
      decisionsDetails,
      R.filter((decision) => !!decision.pivotValues[0]?.value),
      R.groupBy((decision) => decision.pivotValues[0]!.value!),
      R.mapValues((decisions, pivotValue) => {
        const snoozesForPivot = snoozes.filter((s) => s.pivotValue === pivotValue);
        return getRulesForSnooze(decisions, snoozesForPivot);
      }),
    );

    return { rulesByPivot };
  });

async function enrichDecisions(
  decisions: Decision[],
  api: MarbleCoreApi,
  iterationRules: ScenarioIterationRule[],
): Promise<DecisionForSnooze[]> {
  return Promise.all(
    decisions.map((decision) =>
      getDecisionById(api, decision.id).then((decisionDetail) => enrichRules(decisionDetail, iterationRules)),
    ),
  );
}

async function enrichRules(
  decisionDetail: DecisionDetails,
  iterationRules: ScenarioIterationRule[],
): Promise<DecisionForSnooze> {
  return {
    ...decisionDetail,
    rules: decisionDetail.rules.map((rule) => ({
      ...rule,
      ruleGroup: iterationRules.find((r) => r.id === rule.ruleId)?.ruleGroup,
    })),
  };
}

async function getDecisionsSnoozes(decisions: Decision[], api: MarbleCoreApi): Promise<RuleSnoozeWithRuleId[]> {
  return Promise.all(
    decisions.map((decision) => getDecisionActiveSnoozes(api, decision.id).then((r) => r.ruleSnoozes)),
  ).then((ruleSnoozesArrays) => R.flat(ruleSnoozesArrays));
}

async function getScenarioIterationsRules(decisions: Decision[], api: MarbleCoreApi): Promise<ScenarioIterationRule[]> {
  const uniqueScenarioIterationIds = R.unique(decisions.map((decision) => decision.scenario.scenarioIterationId));
  return Promise.all(
    uniqueScenarioIterationIds.map((scenarioIterationId) => listRules(api, { scenarioIterationId })),
  ).then((rulesArrays) => R.flat(rulesArrays));
}

function getRulesForSnooze(decisions: DecisionForSnooze[], snoozes: RuleSnoozeWithRuleId[]): RuleWithSnoozeData[] {
  const enrichedRulesArray = R.map(decisions, (decision) =>
    decision.rules.map((rule) => ({ ...rule, hitAt: decision.createdAt, decisionId: decision.id })),
  );

  const enrichedRules = R.pipe(
    R.flat(enrichedRulesArray),
    R.uniqueBy((rule) => rule.ruleId),
  );

  return R.map(enrichedRules, (rule) => {
    const ruleSnooze = snoozes.find((s) => s.ruleId === rule.ruleId);
    if (ruleSnooze) {
      return {
        ...rule,
        isSnoozed: true,
        start: ruleSnooze.startsAt,
        end: ruleSnooze.endsAt,
      } satisfies RuleWithSnoozeData;
    }
    return { ...rule, isSnoozed: false, start: undefined, end: undefined } satisfies RuleWithSnoozeData;
  });
}

// ---- Case reviews ----

export const listCaseReviewsFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(z.object({ caseId: z.string() }))
  .handler(async ({ context, data }) => {
    const reviews = (await context.api.listCaseReviews(data.caseId)).map(adaptAiCaseReviewListItem);
    return { reviews } as { reviews: AiCaseReviewListItem[] };
  });

export const getCaseReviewFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(z.object({ caseId: z.string(), reviewId: z.string() }))
  .handler(async ({ context, data }) => {
    const review = adaptCaseReview(await context.api.getCaseReviewById(data.caseId, data.reviewId));
    return { review } as { review: CaseReview };
  });

export const enqueueReviewFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(z.object({ caseId: z.string() }))
  .handler(async ({ context, data }) => {
    await context.api.enqueueReviewForCase(data.caseId);
  });

export const addCaseReviewFeedbackFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(z.object({ caseId: z.string(), reviewId: z.string(), reaction: caseReviewReactionSchema }))
  .handler(async ({ context, data }) => {
    await addCaseReviewFeedback(context.api, {
      caseId: data.caseId,
      reviewId: data.reviewId,
      reaction: data.reaction,
    });
  });

export const addReviewToCaseCommentsFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(z.object({ caseId: z.string(), reviewId: z.string() }))
  .handler(async ({ context, data }) => {
    const caseReviews = (await context.api.getMostRecentCaseReview(data.caseId)).map(adaptCaseReview);
    const caseReview = caseReviews.find((review) => review.id === data.reviewId);

    if (!caseReview) throw new Error('Review not found');
    if (!caseReview.review) throw new Error('Review has no content');

    try {
      await addComment(context.api, { caseId: data.caseId, body: { comment: caseReview.review.output } });
    } catch {
      throw new Error('Failed to add review to case comments');
    }
  });

// ---- KYC enrichment ----

function enrichAnalysisWithLinks(enrichments: KycCaseEnrichment[]): KycCaseEnrichment[] {
  return enrichments.map((enrichment) => {
    let updatedAnalysis = enrichment.analysis;
    updatedAnalysis = updatedAnalysis.replace(/\[(\d+)\]/g, (match, numStr: string) => {
      const index = parseInt(numStr, 10) - 1;
      const citation = enrichment.citations[index];
      if (citation && citation.url) {
        const safeTitle = citation.title.replace(/"/g, "'");
        return `[\[${numStr}\]](${citation.url} "${safeTitle}")`;
      }
      return match;
    });
    return { ...enrichment, analysis: updatedAnalysis };
  });
}

export const enrichKycFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(z.object({ caseId: z.string() }))
  .handler(async ({ context, data }) => {
    try {
      const kycCaseEnrichments =
        (await context.api.enrichPivotObjectOfCaseWithKyc(data.caseId)).results?.map(adaptKycCaseEnrichment) ?? [];
      if (!kycCaseEnrichments) throw new Error('KYC enrichment not found');
      return { success: true as const, kycCaseEnrichments: enrichAnalysisWithLinks(kycCaseEnrichments) };
    } catch (error) {
      console.error('Error enriching KYC', error);
      const status = (error as any)?.status || 500;
      const message = (error as any)?.message || 'Error enriching KYC';
      throw new Error(JSON.stringify({ code: status, message }));
    }
  });

// ---- Inbox escalation / workflow / auto-assign ----

export const updateInboxEscalationFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(updateInboxEscalationPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      await Promise.all(
        data.updates.map(async (update) => {
          const inboxData = await getInbox(context.api, update.inboxId);
          return updateInbox(context.api, update.inboxId, {
            name: inboxData.name,
            escalationInboxId: update.escalationInboxId,
          });
        }),
      );
    } catch {
      throw new Error('Failed to update inbox escalation');
    }
  });

export const updateAutoAssignFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(updateAutoAssignPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      const inboxEntries = Object.entries(data.inboxes) as [string, boolean][];
      await Promise.all(
        inboxEntries.map(async ([inboxId, autoAssignEnabled]) => {
          const inboxData = await getInbox(context.api, inboxId);
          return updateInbox(context.api, inboxId, {
            name: inboxData.name,
            escalationInboxId: inboxData.escalationInboxId,
            autoAssignEnabled,
          });
        }),
      );

      const userEntries = Object.entries(data.users) as [string, boolean][];
      await Promise.all(
        userEntries.map(([userId, autoAssignable]) => updateInboxUser(context.api, userId, { autoAssignable })),
      );
    } catch {
      throw new Error('Failed to update auto-assign');
    }
  });

export const updateInboxWorkflowFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(updateInboxWorkflowPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      await Promise.all(
        data.updates.map(async (update) => {
          const inboxData = await getInbox(context.api, update.inboxId);
          return updateInbox(context.api, update.inboxId, {
            name: inboxData.name,
            caseReviewManual: update.caseReviewManual,
            caseReviewOnCaseCreated: update.caseReviewOnCaseCreated,
            caseReviewOnEscalate: update.caseReviewOnEscalate,
          });
        }),
      );
    } catch {
      throw new Error('Failed to update inbox workflow');
    }
  });

export const updateInboxesSlaFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(updateInboxesSlaPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      await context.api.putInboxesSla(adaptUpdateInboxesSla(data));
    } catch {
      throw new Error('Failed to update inboxes sla');
    }
  });

export const getNextUnassignedCaseFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(z.object({ caseId: z.string() }))
  .handler(async ({ context, data }) => {
    try {
      const nextCaseId = await getNextUnassignedCaseId(context.api, { caseId: data.caseId });
      if (!nextCaseId) {
        throw redirect({ to: '/cases/inboxes/$inboxId', params: { inboxId: MY_INBOX_ID } });
      }
      throw redirect({ to: '/cases/$caseId', params: { caseId: fromUUIDtoSUUID(nextCaseId) } });
    } catch (error) {
      if (error instanceof Response && error.status >= 300 && error.status < 400) throw error;
      throw redirect({ href: `/cases/inboxes/${MY_INBOX_ID}` });
    }
  });
