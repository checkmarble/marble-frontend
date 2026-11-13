import { MY_INBOX_ID } from '@app-builder/constants/inboxes';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isContinuousScreeningAvailable } from '@app-builder/services/feature-access';
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
    }),
  )
  .handler(async ({ context, data }) => {
    const { cases, user, entitlements } = context.authInfo;
    if (!isContinuousScreeningAvailable(entitlements) || !user.actorIdentity.userId) throw redirect({ to: '/cases' });
    return readScreeningReviewPage(cases, user.actorIdentity.userId, data.limit, data.cursor, data.inboxId);
  });
