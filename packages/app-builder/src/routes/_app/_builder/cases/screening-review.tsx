import { ScreeningReviewPage } from '@app-builder/components/Cases/ScreeningReview/ScreeningReviewPage';
import { MY_INBOX_ID } from '@app-builder/constants/inboxes';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAdmin } from '@app-builder/models';
import { SCREENING_REVIEW_FILTERS } from '@app-builder/models/screening-review';
import { isAccessible, isContinuousScreeningAvailable, isInboxAdmin } from '@app-builder/services/feature-access';
import { createFileRoute, redirect, useLoaderData } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod/v4';

const searchSchema = z.object({
  inboxId: z
    .union([z.literal(MY_INBOX_ID), z.uuid()])
    .optional()
    .catch(undefined),
  filter: z.enum(SCREENING_REVIEW_FILTERS).catch('to_review'),
  q: z.string().trim().max(200).optional().catch(undefined),
  limit: z.union([z.literal(25), z.literal(50), z.literal(100)]).catch(50),
  cursors: z.array(z.uuid()).catch([]),
  hit: z.string().max(200).optional(),
});

const loader = createServerFn()
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { user, entitlements, inbox } = context.authInfo;
    if (!isContinuousScreeningAvailable(entitlements)) throw redirect({ to: '/cases' });
    const inboxes = await inbox.listInboxes();
    return {
      canViewAdminSections: isAdmin(user) || inboxes.some((item) => isInboxAdmin(user, item)),
      inboxes: inboxes.map(({ id, name }) => ({ id, name })),
    };
  });

export const Route = createFileRoute('/_app/_builder/cases/screening-review')({
  validateSearch: searchSchema,
  loader: () => loader(),
  component: ScreeningReviewRoute,
});

function ScreeningReviewRoute() {
  const search = Route.useSearch();
  const { canViewAdminSections, inboxes } = Route.useLoaderData();
  // Analysts are restricted to no user scoring access by the layout loader.
  const { featuresAccess } = useLoaderData({ from: '/_app/_builder' });
  const navigate = Route.useNavigate();
  return (
    <ScreeningReviewPage
      search={search}
      canViewAdminSections={canViewAdminSections}
      canViewRiskLevel={isAccessible(featuresAccess.userScoring)}
      // Every decision is written as final until the validation step exists.
      canValidate
      inboxes={inboxes}
      onSearchChange={(next) => {
        void navigate({ search: next, replace: true, resetScroll: false });
      }}
    />
  );
}
