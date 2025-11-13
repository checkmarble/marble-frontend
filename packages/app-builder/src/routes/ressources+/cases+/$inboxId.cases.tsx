import { paginationSchema } from '@app-builder/components';
import { MY_INBOX_ID } from '@app-builder/constants/inboxes';
import { createServerFn, data } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import { filtersSchema } from '@app-builder/queries/cases/get-cases';
import { badRequest } from '@app-builder/utils/http/http-responses';
import { parseQuerySafe } from '@app-builder/utils/input-validation';
import invariant from 'tiny-invariant';

export const loader = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function resourcesInboxCasesLoader({ request, params, context }) {
    const { user, cases: caseRepository } = context.authInfo;
    const inboxId = params['inboxId'];
    invariant(inboxId, 'inboxId is required');

    const parsedQuery = await parseQuerySafe(request, filtersSchema);
    const parsedPagination = await parseQuerySafe(request, paginationSchema);

    if (!parsedQuery.success || !parsedPagination.success) {
      throw badRequest('Invalid query');
    }
    const filterInboxIds = inboxId === MY_INBOX_ID ? undefined : [inboxId];
    const assigneeIdFilter = parsedQuery.data.assignee ? { assigneeId: parsedQuery.data.assignee } : {};

    const cases = await caseRepository.listCases({
      ...parsedQuery.data,
      ...parsedPagination.data,
      inboxIds: filterInboxIds,
      ...(filterInboxIds === undefined ? { assigneeId: user.actorIdentity.userId } : assigneeIdFilter),
    });

    return data({ data: cases });
  },
);
