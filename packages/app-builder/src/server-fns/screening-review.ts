import { MY_INBOX_ID } from '@app-builder/constants/inboxes';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { SCREENING_REVIEW_FILTERS } from '@app-builder/models/screening-review';
import { isContinuousScreeningAvailable } from '@app-builder/services/feature-access';
import { reviewScreeningReviewMatch } from '@app-builder/services/screening-review-decision';
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
      name: z.string().trim().max(200).optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const { cases, user, entitlements } = context.authInfo;
    if (!isContinuousScreeningAvailable(entitlements) || !user.actorIdentity.userId) throw redirect({ to: '/cases' });
    const { limit, cursor, ...options } = data;
    return readScreeningReviewPage(cases, user.actorIdentity.userId, limit, cursor, options);
  });

export const reviewScreeningReviewMatchFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(
    z.object({
      caseId: z.uuid(),
      screeningId: z.uuid(),
      matchId: z.uuid(),
      status: z.enum(['confirmed_hit', 'no_hit']),
      comment: z.string().max(5000).optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const { cases, continuousScreening, user, entitlements } = context.authInfo;
    if (!isContinuousScreeningAvailable(entitlements) || !user.actorIdentity.userId) throw redirect({ to: '/cases' });
    return reviewScreeningReviewMatch({ cases, continuousScreening }, user.actorIdentity.userId, data);
  });
