import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { isStatusConflictHttpError } from '@app-builder/models';
import { createNavigationOptionSchema } from '@app-builder/queries/data/create-navigation-option';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/react';
import invariant from 'tiny-invariant';
import { z } from 'zod/v4';

export async function action({ request, params }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService,
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);
  const { dataModelRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const [session, data, t] = await Promise.all([
    getSession(request),
    request.json(),
    i18nextService.getFixedT(request, ['common', 'data']),
  ]);

  const options = createNavigationOptionSchema.safeParse(data);
  const sourceTableId = params['tableId'];

  invariant(sourceTableId, 'Expected tableId to be in URL');

  if (!options.success) {
    const { errors } = z.treeifyError(options.error);
    return { success: false, errors };
  }

  try {
    await dataModelRepository.createNavigationOption(sourceTableId, options.data);

    setToastMessage(session, {
      type: 'success',
      messageKey: 'common:success.save',
    });

    return json(
      { success: true },
      {
        headers: {
          'Set-Cookie': await commitSession(session),
        },
      },
    );
  } catch (err) {
    let message = t('common:errors.unknown');
    if (isStatusConflictHttpError(err)) {
      message = t('data:create_navigation_option.errors.duplicate_pivot_value');
    }

    setToastMessage(session, {
      type: 'error',
      message,
    });

    return json(
      { status: 'error', errors: [] },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }
}
