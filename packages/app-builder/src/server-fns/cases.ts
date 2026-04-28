import { MY_INBOX_ID } from '@app-builder/constants/inboxes';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isNotFoundHttpError, isStatusBadRequestHttpError, isStatusConflictHttpError } from '@app-builder/models';
import { type AiSettingSchema } from '@app-builder/models/ai-settings';
import {
  type AiCaseReviewListItem,
  type CaseReview,
  caseStatuses,
  type SuspiciousActivityReport,
} from '@app-builder/models/cases';
import { Decision, DecisionDetails, DecisionForSnooze, RuleWithSnoozeData } from '@app-builder/models/decision';
import { KycCaseEnrichment } from '@app-builder/models/kyc-case-enrichment';
import { RuleSnoozeWithRuleId } from '@app-builder/models/rule-snooze';
import { ScenarioIterationRule } from '@app-builder/models/scenario/iteration-rule';
import { DecisionRepository } from '@app-builder/repositories/DecisionRepository';
import { ScenarioIterationRuleRepository } from '@app-builder/repositories/ScenarioIterationRuleRepository';
import {
  addCommentPayloadSchema,
  addRuleSnoozePayloadSchema,
  addToCasePayloadSchema,
  caseReviewReactionSchema,
  closeCasePayloadSchema,
  editAssigneePayloadSchema,
  editInboxPayloadSchema,
  editNamePayloadSchema,
  editSuspicionPayloadSchema,
  editTagsPayloadSchema,
  escalateCasePayloadSchema,
  listCaseDecisionsInputSchema,
  listCasesInputSchema,
  massUpdateCasesPayloadSchema,
  openCasePayloadSchema,
  reviewDecisionPayloadSchema,
  reviewScreeningMatchPayloadSchema,
  snoozeCasePayloadSchema,
  updateAutoAssignPayloadSchema,
  updateInboxEscalationPayloadSchema,
  updateInboxWorkflowPayloadSchema,
} from '@app-builder/schemas/cases';
import { useAuthSession } from '@app-builder/services/auth/auth-session.server';
import { getServerEnv } from '@app-builder/utils/environment';
import { getCaseFileUploadEndpoint } from '@app-builder/utils/files';
import { protectArray } from '@app-builder/utils/schema/helpers/array';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import * as Sentry from '@sentry/tanstackstart-react';
import { redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { decode } from 'decode-formdata';
import { tryit } from 'radash';
import * as R from 'remeda';
import { Temporal } from 'temporal-polyfill';
import { z } from 'zod/v4';

// ---- Case CRUD ----

export const createCaseFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(
    z.object({
      name: z.string().min(1),
      inboxId: z.uuid(),
    }),
  )
  .handler(async ({ context, data }) => {
    try {
      const createdCase = await context.authInfo.cases.createCase(data);
      throw redirect({ to: '/cases/$caseId', params: { caseId: fromUUIDtoSUUID(createdCase.id) } });
    } catch (error) {
      if (error instanceof Response && error.status >= 300 && error.status < 400) throw error;
      throw new Error('Failed to create case');
    }
  });

export const closeCaseFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(closeCasePayloadSchema)
  .handler(async ({ context, data }) => {
    const { caseId, outcome, comment } = data;
    try {
      const promises: Promise<unknown>[] = [
        context.authInfo.cases.updateCase({ caseId, body: { status: 'closed', outcome } }),
      ];
      if (comment !== '') {
        promises.push(context.authInfo.cases.addComment({ caseId, body: { comment } }));
      }
      await Promise.all(promises);
    } catch {
      throw new Error('Failed to close case');
    }
  });

export const openCaseFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(openCasePayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      const promises: Promise<unknown>[] = [];
      if (data.comment !== '') {
        promises.push(context.authInfo.cases.addComment({ caseId: data.caseId, body: { comment: data.comment } }));
      }
      promises.push(context.authInfo.cases.updateCase({ caseId: data.caseId, body: { status: 'investigating' } }));
      await Promise.allSettled(promises);
    } catch {
      throw new Error('Failed to open case');
    }
  });

export const escalateCaseFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(escalateCasePayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      await context.authInfo.cases.escalateCase({ caseId: data.caseId });
      throw redirect({ to: '/cases/inboxes/$inboxId', params: { inboxId: fromUUIDtoSUUID(data.inboxId) } });
    } catch (error) {
      if (error instanceof Response && error.status >= 300 && error.status < 400) throw error;
      throw new Error('Failed to escalate case');
    }
  });

export const snoozeCaseFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(snoozeCasePayloadSchema)
  .handler(async ({ context, data }) => {
    await (data.snoozeUntil
      ? context.authInfo.cases.snoozeCase({ caseId: data.caseId, snoozeUntil: data.snoozeUntil })
      : context.authInfo.cases.unsnoozeCase(data));
  });

// ---- Case edits ----

export const editAssigneeFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(editAssigneePayloadSchema)
  .handler(async ({ context, data }) => {
    if (data.assigneeId) {
      await context.authInfo.cases.assignUser({ caseId: data.caseId, userId: data.assigneeId });
    } else {
      await context.authInfo.cases.unassignUser({ caseId: data.caseId });
    }
  });

export const editInboxFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(editInboxPayloadSchema)
  .handler(async ({ context, data }) => {
    await context.authInfo.cases.updateCase({ caseId: data.caseId, body: { inboxId: data.inboxId } });
  });

export const editNameFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(editNamePayloadSchema)
  .handler(async ({ context, data }) => {
    await context.authInfo.cases.updateCase({ caseId: data.caseId, body: { name: data.name } });
  });

export const editTagsFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(editTagsPayloadSchema)
  .handler(async ({ context, data }) => {
    await context.authInfo.cases.setTags(data);
  });

export const editSuspicionFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error('Expected FormData');
    return data;
  })
  .handler(async ({ context, data }) => {
    const [err, raw] = await tryit(() => Promise.resolve(data))();

    if (err) {
      throw new Error('FormData error');
    }

    const parsed = editSuspicionPayloadSchema.safeParse(decode(raw));
    if (!parsed.success) throw new Error('Invalid payload');

    const formData = parsed.data;

    try {
      let sar: SuspiciousActivityReport | undefined = undefined;

      if (formData.reportId && formData.status === 'none') {
        await context.authInfo.cases.deleteSuspiciousActivityReport({
          caseId: formData.caseId,
          reportId: formData.reportId,
        });
      } else if (formData.reportId && formData.status !== 'none') {
        sar = await context.authInfo.cases.updateSuspiciousActivityReport({
          caseId: formData.caseId,
          reportId: formData.reportId,
          body: { status: formData.status, ...(formData.file && { file: formData.file }) },
        });
      } else if (!formData.reportId && formData.status !== 'none') {
        sar = await context.authInfo.cases.createSuspiciousActivityReport({
          caseId: formData.caseId,
          body: { status: formData.status, ...(formData.file && { file: formData.file }) },
        });
      } else {
        throw new Error('Should not happen');
      }

      return { success: true as const, errors: [] as never[], data: sar };
    } catch (error) {
      return { success: false as const, errors: [(error as Error).message] };
    }
  });

export const massUpdateCasesFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(massUpdateCasesPayloadSchema)
  .handler(async ({ context, data }) => {
    await context.authInfo.cases.massUpdateCases({ body: data });
  });

// ---- Comments ----

export const addCommentFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error('Expected FormData');
    return data;
  })
  .handler(async ({ context, data }) => {
    const [err, raw] = await tryit(() => Promise.resolve(data))();

    if (err) {
      throw new Error('FormData error');
    }

    const authSession = await useAuthSession();
    const token = authSession.data.authToken?.access_token;
    if (!token) throw redirect({ to: '/sign-in', statusCode: 302 });

    const parsed = addCommentPayloadSchema.safeParse(decode(raw, { arrays: ['files'] }));
    if (!parsed.success) throw new Error('Invalid payload');

    const formData = parsed.data;

    try {
      const promises: Promise<unknown>[] = [];

      if (formData.comment !== '') {
        promises.push(
          context.authInfo.cases.addComment({ caseId: formData.caseId, body: { comment: formData.comment } }),
        );
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
  .inputValidator(reviewDecisionPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      await context.authInfo.cases.reviewDecision(data);
      return { status: 'success' as const };
    } catch {
      return { status: 'error' as const };
    }
  });

export const addRuleSnoozeFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(addRuleSnoozePayloadSchema)
  .handler(async ({ context, data }) => {
    const request = getRequest();
    const t = await context.services.i18nextService.getFixedT(request, ['common', 'cases']);

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
      await context.authInfo.decision.createSnoozeForDecision(decisionId, { ruleId, duration, comment });
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
  .inputValidator(reviewScreeningMatchPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      await context.authInfo.screening.updateMatchStatus(data);
    } catch {
      throw new Error('Failed to review screening match');
    }
  });

export const setAllMatchesToNoHitFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ matchIds: protectArray(z.string().array()) }))
  .handler(async ({ context, data }) => {
    try {
      await Promise.all(
        data.matchIds.map((matchId) => context.authInfo.screening.updateMatchStatus({ matchId, status: 'no_hit' })),
      );
    } catch {
      throw new Error('Failed to review screening match');
    }
  });

export const addToCaseFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(addToCasePayloadSchema)
  .handler(async ({ context, data }) => {
    const request = getRequest();
    const t = await context.services.i18nextService.getFixedT(request, ['common', 'cases']);

    try {
      if (data.newCase) {
        return await context.authInfo.cases.createCase(data);
      } else {
        return await context.authInfo.cases.addDecisionsToCase(data);
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

// ---- AI review settings ----

export const getAiSettingsFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const settings = await context.authInfo.aiAssistSettings.getAiAssistSettings();
    return { settings };
  });

export const updateAiSettingsFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator((data: unknown) => data as AiSettingSchema)
  .handler(async ({ context, data }) => {
    try {
      await context.authInfo.aiAssistSettings.updateAiAssistSettings(data);
    } catch (error) {
      Sentry.captureException(error);
      throw new Error('Failed to update AI settings');
    }
  });

// ---- Case info ----

export const getInboxesFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const inboxes = await context.authInfo.inbox.listInboxesWithCaseCount();
    return { inboxes };
  });

export const getCaseDetailFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ caseId: z.string() }))
  .handler(async ({ context, data }) => {
    const caseDetail = await context.authInfo.cases.getCase({ caseId: data.caseId });
    return { caseDetail };
  });

export const getCaseNameFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ caseId: z.string() }))
  .handler(async ({ context, data }) => {
    const c = await context.authInfo.cases.getCase({ caseId: data.caseId });
    return { name: c.name };
  });

export const getCasesFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(listCasesInputSchema)
  .handler(async ({ context, data }) => {
    const { inboxId, limit, order, offsetId, ...filters } = data;
    const { user, cases: caseRepository } = context.authInfo;

    const filterInboxIds = inboxId === MY_INBOX_ID ? undefined : [inboxId];
    const assigneeIdFilter = filters.assignee ? { assigneeId: filters.assignee } : {};
    const statusesFilter = filters.statuses ?? caseStatuses.filter((status) => status !== 'closed');

    return caseRepository.listCases({
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
  .inputValidator(z.object({ objectType: z.string(), objectId: z.string() }))
  .handler(async ({ context, data }) => {
    const relatedCases = await context.authInfo.cases.getObjectRelatedCases(data);
    return { cases: relatedCases };
  });

export const getPivotRelatedCasesFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ pivotValue: z.string() }))
  .handler(async ({ context, data }) => {
    const cases = await context.authInfo.cases.getPivotRelatedCases({ pivotValue: data.pivotValue });
    return { cases };
  });

// ---- Case decisions ----

export const listCaseDecisionsFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(listCaseDecisionsInputSchema)
  .handler(async ({ context, data }) => {
    return context.authInfo.cases.listCaseDecisions(
      { caseId: data.caseId },
      { limit: data.limit ?? 200, cursorId: data.cursorId },
    );
  });

// ---- Rules by pivot ----

export const getRulesByPivotFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ caseId: z.string() }))
  .handler(async ({ context, data }) => {
    const { cases: caseRepository, decision: decisionRepository, scenarioIterationRuleRepository } = context.authInfo;

    const caseDetail = await caseRepository.getCase({ caseId: data.caseId });
    const iterationRules = await getScenarioIterationsRules(caseDetail.decisions, scenarioIterationRuleRepository);

    const [decisionsDetails, snoozes] = await Promise.all([
      enrichDecisions(caseDetail.decisions, decisionRepository, iterationRules),
      getDecisionsSnoozes(caseDetail.decisions, decisionRepository),
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
  repository: DecisionRepository,
  iterationRules: ScenarioIterationRule[],
): Promise<DecisionForSnooze[]> {
  return Promise.all(
    decisions.map((decision) =>
      repository.getDecisionById(decision.id).then((decisionDetail) => enrichRules(decisionDetail, iterationRules)),
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

async function getDecisionsSnoozes(
  decisions: Decision[],
  repository: DecisionRepository,
): Promise<RuleSnoozeWithRuleId[]> {
  return Promise.all(
    decisions.map((decision) => repository.getDecisionActiveSnoozes(decision.id).then((r) => r.ruleSnoozes)),
  ).then((ruleSnoozesArrays) => R.flat(ruleSnoozesArrays));
}

async function getScenarioIterationsRules(
  decisions: Decision[],
  repository: ScenarioIterationRuleRepository,
): Promise<ScenarioIterationRule[]> {
  const uniqueScenarioIterationIds = R.unique(decisions.map((decision) => decision.scenario.scenarioIterationId));
  return Promise.all(
    uniqueScenarioIterationIds.map((scenarioIterationId) => repository.listRules({ scenarioIterationId })),
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
  .inputValidator(z.object({ caseId: z.string() }))
  .handler(async ({ context, data }) => {
    const reviews = await context.authInfo.cases.listCaseReviews({ caseId: data.caseId });
    return { reviews } as { reviews: AiCaseReviewListItem[] };
  });

export const getCaseReviewFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ caseId: z.string(), reviewId: z.string() }))
  .handler(async ({ context, data }) => {
    const review = await context.authInfo.cases.getCaseReviewById({ caseId: data.caseId, reviewId: data.reviewId });
    return { review } as { review: CaseReview };
  });

export const enqueueReviewFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ caseId: z.string() }))
  .handler(async ({ context, data }) => {
    await context.authInfo.cases.enqueueReviewForCase({ caseId: data.caseId });
  });

export const addCaseReviewFeedbackFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ caseId: z.string(), reviewId: z.string(), reaction: caseReviewReactionSchema }))
  .handler(async ({ context, data }) => {
    await context.authInfo.cases.addCaseReviewFeedback({
      caseId: data.caseId,
      reviewId: data.reviewId,
      reaction: data.reaction,
    });
  });

export const addReviewToCaseCommentsFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ caseId: z.string(), reviewId: z.string() }))
  .handler(async ({ context, data }) => {
    const caseReviews = await context.authInfo.cases.getMostRecentCaseReview({ caseId: data.caseId });
    const caseReview = caseReviews.find((review) => review.id === data.reviewId);

    if (!caseReview) throw new Error('Review not found');

    try {
      await context.authInfo.cases.addComment({ caseId: data.caseId, body: { comment: caseReview.review.output } });
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
  .inputValidator(z.object({ caseId: z.string() }))
  .handler(async ({ context, data }) => {
    try {
      const kycCaseEnrichments = await context.authInfo.cases.enrichPivotObjectOfCaseWithKyc({ caseId: data.caseId });
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
  .inputValidator(updateInboxEscalationPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      await Promise.all(
        data.updates.map(async (update) => {
          const inboxData = await context.authInfo.inbox.getInbox(update.inboxId);
          return context.authInfo.inbox.updateInbox(update.inboxId, {
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
  .inputValidator(updateAutoAssignPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      const inboxEntries = Object.entries(data.inboxes) as [string, boolean][];
      await Promise.all(
        inboxEntries.map(async ([inboxId, autoAssignEnabled]) => {
          const inboxData = await context.authInfo.inbox.getInbox(inboxId);
          return context.authInfo.inbox.updateInbox(inboxId, {
            name: inboxData.name,
            escalationInboxId: inboxData.escalationInboxId,
            autoAssignEnabled,
          });
        }),
      );

      const userEntries = Object.entries(data.users) as [string, boolean][];
      await Promise.all(
        userEntries.map(([userId, autoAssignable]) =>
          context.authInfo.inbox.updateInboxUser(userId, { autoAssignable }),
        ),
      );
    } catch {
      throw new Error('Failed to update auto-assign');
    }
  });

export const updateInboxWorkflowFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(updateInboxWorkflowPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      await Promise.all(
        data.updates.map(async (update) => {
          const inboxData = await context.authInfo.inbox.getInbox(update.inboxId);
          return context.authInfo.inbox.updateInbox(update.inboxId, {
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

export const getNextUnassignedCaseFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ caseId: z.string() }))
  .handler(async ({ context, data }) => {
    try {
      const nextCaseId = await context.authInfo.cases.getNextUnassignedCaseId({ caseId: data.caseId });
      if (!nextCaseId) {
        throw redirect({ to: '/cases/inboxes/$inboxId', params: { inboxId: MY_INBOX_ID } });
      }
      throw redirect({ to: '/cases/$caseId', params: { caseId: fromUUIDtoSUUID(nextCaseId) } });
    } catch (error) {
      if (error instanceof Response && error.status >= 300 && error.status < 400) throw error;
      throw redirect({ href: `/cases/inboxes/${MY_INBOX_ID}` });
    }
  });
