import { MY_INBOX_ID } from '@app-builder/constants/inboxes';
import { isNotFoundHttpError } from '@app-builder/models';
import { getCase } from '@app-builder/server/cases';
import { listInboxes } from '@app-builder/server/inboxes';
import { getFixedT } from '@app-builder/services/i18n/i18next.server';
import { setToast } from '@app-builder/services/toast.server';
import { parseIdParamSafe, parseQuerySafe } from '@app-builder/utils/input-validation';
import { tryCatch } from '@app-builder/utils/tryCatch';
import { redirect } from '@tanstack/react-router';
import { createMiddleware } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { z } from 'zod/v4';
import { authMiddleware } from './auth-middleware';

export const caseDetailMiddleware = createMiddleware({ type: 'function' })
  .middleware([authMiddleware])
  .validator((input: { params?: Record<string, string> } | undefined) => input)
  .server(async ({ next, context, data }) => {
    const request = getRequest();

    const parsedResult = await parseIdParamSafe(data?.params ?? {}, 'caseId');
    if (!parsedResult.success) {
      throw redirect({ to: '/cases/inboxes' });
    }

    const [t, query] = await Promise.all([
      getFixedT(request, ['common', 'cases']),
      parseQuerySafe(request, z.object({ fromInbox: z.string() }).optional()),
    ]);

    const caseDetailResult = await tryCatch(() => getCase(context.api, { caseId: parsedResult.data.caseId }));

    if (!caseDetailResult.ok) {
      const destinationInboxId = query.data?.fromInbox ? query.data.fromInbox : MY_INBOX_ID;
      await setToast({
        type: 'error',
        message: isNotFoundHttpError(caseDetailResult.error)
          ? t('cases:errors.case_not_found')
          : t('common:errors.unknown'),
      });
      throw redirect({ to: '/cases/inboxes/$inboxId', params: { inboxId: destinationInboxId } });
    }
    const caseDetail = caseDetailResult.value;

    const inboxes = await listInboxes(context.api);
    const caseInbox = inboxes.find((inbox) => inbox.id === caseDetail.inboxId);
    if (!caseInbox) {
      throw redirect({ to: '/cases/inboxes' });
    }

    return next({
      context: {
        inboxes,
        case: { detail: caseDetail, inbox: caseInbox },
      },
    });
  });
