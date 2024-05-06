import {
  CopyToClipboardButton,
  ErrorComponent,
  Page,
} from '@app-builder/components';
import { TransferData } from '@app-builder/components/Transfers/TransferData';
import { transfersI18n } from '@app-builder/components/Transfers/transfers-i18n';
import { isNotFoundHttpError } from '@app-builder/models';
import { serverServices } from '@app-builder/services/init.server';
import { handleParseParamError } from '@app-builder/utils/http/handle-errors';
import { notFound } from '@app-builder/utils/http/http-responses';
import { parseParamsSafe } from '@app-builder/utils/input-validation';
import { getRoute } from '@app-builder/utils/routes';
import { shortUUIDSchema } from '@app-builder/utils/schema/shortUUIDSchema';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useRouteError } from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Collapsible } from 'ui-design-system';
import * as z from 'zod';

export const handle = {
  i18n: ['common', 'navigation', ...transfersI18n] satisfies Namespace,
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const { transferRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const parsedParam = await parseParamsSafe(
    params,
    z.object({ transferId: shortUUIDSchema }),
  );
  if (!parsedParam.success) {
    return handleParseParamError(request, parsedParam.error);
  }
  const { transferId } = parsedParam.data;

  try {
    const transfer = await transferRepository.getTransfer({
      transferId: transferId,
    });

    return json({
      transfer,
    });
  } catch (error) {
    if (isNotFoundHttpError(error)) {
      return notFound(null);
    } else {
      throw error;
    }
  }
}

export default function TransferDetailPage() {
  const { t } = useTranslation(handle.i18n);
  const { transfer } = useLoaderData<typeof loader>();

  return (
    <Page.Container>
      <Page.Header className="justify-between">
        <div className="flex flex-row items-center gap-4">
          <Page.BackButton />
          {t('transfercheck:transfer_detail.title')}
          <CopyToClipboardButton toCopy={transfer.id}>
            <span className="text-s font-normal">
              <span className="font-medium">ID</span> {transfer.id}
            </span>
          </CopyToClipboardButton>
        </div>
      </Page.Header>

      <Page.Content>
        <div className="flex max-w-3xl flex-col gap-4 lg:gap-6">
          <Collapsible.Container className="bg-grey-00 w-full">
            <Collapsible.Title>
              {t('transfercheck:transfer_detail.transfer_data.title')}
            </Collapsible.Title>
            <Collapsible.Content>
              <TransferData {...transfer.data} />
            </Collapsible.Content>
          </Collapsible.Container>
        </div>
      </Page.Content>
    </Page.Container>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  captureRemixErrorBoundaryError(error);

  return <ErrorComponent error={error} />;
}
