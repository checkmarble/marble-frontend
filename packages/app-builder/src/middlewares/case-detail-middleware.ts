import { MY_INBOX_ID } from '@app-builder/constants/inboxes';
import { isNotFoundHttpError } from '@app-builder/models';
import { setToast } from '@app-builder/services/toast.server';
import { parseIdParamSafe, parseQuerySafe } from '@app-builder/utils/input-validation';
import { redirect } from '@tanstack/react-router';
import { createMiddleware } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { tryit } from 'radash';
import { z } from 'zod/v4';
import { authMiddleware } from './auth-middleware';

export const caseDetailMiddleware = createMiddleware({ type: 'function' })
  .middleware([authMiddleware])
  .inputValidator((input: { params?: Record<string, string> } | undefined) => input)
  .server(async ({ next, context, data }) => {
    const request = getRequest();
    const { cases: caseRepository, inbox: inboxRepository } = context.authInfo;
    const { i18nextService } = context.services;

    const parsedResult = await parseIdParamSafe(data?.params ?? {}, 'caseId');
    if (!parsedResult.success) {
      throw redirect({ to: '/cases/inboxes' });
    }

    const [t, query] = await Promise.all([
      i18nextService.getFixedT(request, ['common', 'cases']),
      parseQuerySafe(request, z.object({ fromInbox: z.string() }).optional()),
    ]);

    const [error, caseDetail] = await tryit(async () => caseRepository.getCase({ caseId: parsedResult.data.caseId }))();

    if (error) {
      const destinationInboxId = query.data?.fromInbox ? query.data.fromInbox : MY_INBOX_ID;
      await setToast({
        type: 'error',
        message: isNotFoundHttpError(error) ? t('cases:errors.case_not_found') : t('common:errors.unknown'),
      });
      throw redirect({ to: '/cases/inboxes/$inboxId', params: { inboxId: destinationInboxId } });
    }

    const inboxes = await inboxRepository.listInboxes();
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
