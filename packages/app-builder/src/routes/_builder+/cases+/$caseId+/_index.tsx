import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { caseDetailMiddleware } from '@app-builder/middlewares/case-detail-middleware';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { redirect } from '@remix-run/react';

export const loader = createServerFn(
  [authMiddleware, caseDetailMiddleware],
  async function caseDetailLoader({ request, context }) {
    const { detail: caseDetail } = context.case;

    if (caseDetail.type === 'continuous_screening') {
      return redirect(getRoute('/cases/m/:caseId', { caseId: fromUUIDtoSUUID(caseDetail.id) }));
    }

    return redirect(getRoute('/cases/s/:caseId', { caseId: fromUUIDtoSUUID(caseDetail.id) }));
  },
);
