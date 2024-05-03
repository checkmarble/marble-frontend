import { CopyToClipboardButton, Page } from '@app-builder/components';
import { serverServices } from '@app-builder/services/init.server';
import { handleParseParamError } from '@app-builder/utils/http/handle-errors';
import { parseParamsSafe } from '@app-builder/utils/input-validation';
import { getRoute } from '@app-builder/utils/routes';
import { shortUUIDSchema } from '@app-builder/utils/schema/shortUUIDSchema';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';

export const handle = {
  i18n: ['common', 'transfercheck'] satisfies Namespace,
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

  const transfer = await transferRepository.getTransfer({
    transferId: transferId,
  });

  return json({
    transfer,
  });
}

export default function TransferDetailPage() {
  const { t } = useTranslation(handle.i18n);
  const { transfer } = useLoaderData<typeof loader>();

  return (
    <Page.Container>
      <Page.Header className="justify-between">
        <div className="flex flex-row items-center gap-4">
          <Page.BackButton />
          {t('transfercheck:transfer_detail')}
          <CopyToClipboardButton toCopy={transfer.id}>
            <span className="text-s font-normal">
              <span className="font-medium">ID</span> {transfer.id}
            </span>
          </CopyToClipboardButton>
        </div>
      </Page.Header>

      <Page.Content>
        <div>TODO</div>
      </Page.Content>
    </Page.Container>
  );
}
