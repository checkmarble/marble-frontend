import { MY_INBOX_ID } from '@app-builder/constants/inboxes';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import {
  SCREENING_REVIEW_COMMENT_MAX,
  SCREENING_REVIEW_FILTERS,
  SCREENING_REVIEW_SEARCH_MAX,
} from '@app-builder/models/screening-review';
import { isContinuousScreeningAvailable } from '@app-builder/services/feature-access';
import {
  closeScreeningReviewCase,
  reviewScreeningReviewMatch,
  reviewScreeningReviewMatches,
} from '@app-builder/services/screening-review-decision';
import { readScreeningReviewPage } from '@app-builder/services/screening-review-page';
import { redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod/v4';

export const listScreeningReviewPageFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(
    z.object({
      limit: z.union([z.literal(25), z.literal(50), z.literal(100)]),
      cursor: z.uuid().nullable(),
      inboxId: z.union([z.literal(MY_INBOX_ID), z.uuid()]).default(MY_INBOX_ID),
      filter: z.enum(SCREENING_REVIEW_FILTERS).default('to_review'),
      name: z.string().trim().max(SCREENING_REVIEW_SEARCH_MAX).optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const { api, user, entitlements } = context;
    if (!isContinuousScreeningAvailable(entitlements) || !user.actorIdentity.userId) throw redirect({ to: '/cases' });
    const { limit, cursor, ...options } = data;
    return readScreeningReviewPage(api, user.actorIdentity.userId, limit, cursor, options);
  });

export const reviewScreeningReviewMatchFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(
    z.object({
      caseId: z.uuid(),
      screeningId: z.uuid(),
      matchId: z.uuid(),
      status: z.enum(['confirmed_hit', 'no_hit']),
      comment: z.string().max(SCREENING_REVIEW_COMMENT_MAX).optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const { api, user, entitlements } = context;
    if (!isContinuousScreeningAvailable(entitlements) || !user.actorIdentity.userId) throw redirect({ to: '/cases' });
    return reviewScreeningReviewMatch(api, user.actorIdentity.userId, data);
  });

/** The decisions of one case, written in one request. */
export const reviewScreeningReviewMatchesFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(
    z.object({
      caseId: z.uuid(),
      decisions: z
        .array(
          z.object({
            screeningId: z.uuid(),
            matchId: z.uuid(),
            status: z.enum(['confirmed_hit', 'no_hit']),
            comment: z.string().max(SCREENING_REVIEW_COMMENT_MAX).optional(),
          }),
        )
        .min(1)
        .max(1000),
    }),
  )
  .handler(async ({ context, data }) => {
    const { api, user, entitlements } = context;
    if (!isContinuousScreeningAvailable(entitlements) || !user.actorIdentity.userId) throw redirect({ to: '/cases' });
    return reviewScreeningReviewMatches(api, user.actorIdentity.userId, data);
  });

export const closeScreeningReviewCaseFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(z.object({ caseId: z.uuid(), screeningId: z.uuid() }))
  .handler(async ({ context, data }) => {
    const { api, user, entitlements } = context;
    if (!isContinuousScreeningAvailable(entitlements) || !user.actorIdentity.userId) throw redirect({ to: '/cases' });
    return closeScreeningReviewCase(api, user.actorIdentity.userId, data);
  });
