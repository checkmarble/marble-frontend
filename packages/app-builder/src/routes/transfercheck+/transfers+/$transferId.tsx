import { CopyToClipboardButton, ErrorComponent, Page } from '@app-builder/components';
import { TransferData } from '@app-builder/components/Transfers/TransferData';
import { transfersI18n } from '@app-builder/components/Transfers/transfers-i18n';
import {
  TransferStatusAlert,
  TransferStatusRadioButton,
} from '@app-builder/components/Transfers/TransferStatus';
import { isNotFoundHttpError } from '@app-builder/models';
import { transferStatuses } from '@app-builder/models/transfer';
import { serverServices } from '@app-builder/services/init.server';
import { handleParseParamError } from '@app-builder/utils/http/handle-errors';
import { notFound } from '@app-builder/utils/http/http-responses';
import { parseParamsSafe } from '@app-builder/utils/input-validation';
import { getRoute } from '@app-builder/utils/routes';
import { shortUUIDSchema } from '@app-builder/utils/schema/shortUUIDSchema';
import { getFormProps, useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { type ActionFunctionArgs, json, type LoaderFunctionArgs } from '@remix-run/node';
import { useFetcher, useLoaderData, useRouteError } from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Collapsible } from 'ui-design-system';
import { z } from 'zod';

export const handle = {
  i18n: ['common', 'navigation', ...transfersI18n] satisfies Namespace,
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const { transferRepository, transferAlertRepository } = await authService.isAuthenticated(
    request,
    {
      failureRedirect: getRoute('/sign-in'),
    },
  );

  const parsedParam = await parseParamsSafe(params, z.object({ transferId: shortUUIDSchema }));
  if (!parsedParam.success) {
    return handleParseParamError(request, parsedParam.error);
  }
  const { transferId } = parsedParam.data;

  try {
    const transfer = await transferRepository.getTransfer({
      transferId: transferId,
    });
    const alerts = await transferAlertRepository.listSentAlerts({
      transferId: transfer.id,
    });

    return json({
      transfer,
      transferAlert: alerts[0],
    });
  } catch (error) {
    if (isNotFoundHttpError(error)) {
      return notFound(null);
    } else {
      throw error;
    }
  }
}

const transferUpdateBodySchema = z.object({
  status: z.enum(transferStatuses),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const { authService } = serverServices;
  const { transferRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const parsedParam = await parseParamsSafe(params, z.object({ transferId: shortUUIDSchema }));
  if (!parsedParam.success) {
    return handleParseParamError(request, parsedParam.error);
  }
  const { transferId } = parsedParam.data;

  const formData = await request.formData();
  const submission = parseWithZod(formData, {
    schema: transferUpdateBodySchema,
  });

  if (submission.status !== 'success') {
    return json(submission.reply());
  }

  await transferRepository.updateTransfer({
    transferId,
    transferUpdateBody: submission.value,
  });

  return json(submission.reply());
}

export default function TransferDetailPage() {
  const { t } = useTranslation(handle.i18n);
  const { transfer, transferAlert } = useLoaderData<typeof loader>();

  const fetcher = useFetcher<typeof action>();

  const [form, fields] = useForm({
    defaultValue: { status: transfer.data.status },
    lastResult: fetcher.data,
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: transferUpdateBodySchema,
      });
    },
  });

  return (
    <Page.Main>
      <Page.Header className="justify-between">
        <div className="flex flex-row items-center gap-4">
          <Page.BackButton />
          <span className="line-clamp-1 text-start">
            {t('transfercheck:transfer_detail.title')}
          </span>
          <CopyToClipboardButton toCopy={transfer.id}>
            <span className="text-s line-clamp-1 max-w-40 font-normal">
              <span className="font-medium">ID</span> {transfer.id}
            </span>
          </CopyToClipboardButton>
        </div>
      </Page.Header>
      <Page.Container>
        <Page.Content className="max-w-3xl">
          <Collapsible.Container className="bg-grey-100 w-full">
            <Collapsible.Title>
              {t('transfercheck:transfer_detail.transfer_status.title')}
            </Collapsible.Title>
            <Collapsible.Content>
              <div className="flex flex-col gap-4">
                <fetcher.Form
                  {...getFormProps(form)}
                  onChange={(event) => fetcher.submit(event.currentTarget, { method: 'POST' })}
                >
                  <fieldset className="flex flex-row gap-2">
                    {transferStatuses.map((status) => {
                      return (
                        <TransferStatusRadioButton
                          key={status}
                          value={status}
                          name={fields.status.name}
                          defaultChecked={fields.status.initialValue === status}
                        />
                      );
                    })}
                  </fieldset>
                </fetcher.Form>
                <TransferStatusAlert
                  transferId={transfer.id}
                  transferStatus={transfer.data.status}
                  alertId={transferAlert?.id}
                  beneficiaryInNetwork={transfer.beneficiaryInNetwork}
                />
              </div>
            </Collapsible.Content>
          </Collapsible.Container>

          <Collapsible.Container className="bg-grey-100 w-full">
            <Collapsible.Title>
              {t('transfercheck:transfer_detail.transfer_data.title')}
            </Collapsible.Title>
            <Collapsible.Content>
              <TransferData {...transfer.data} />
            </Collapsible.Content>
          </Collapsible.Container>
        </Page.Content>
      </Page.Container>
    </Page.Main>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  captureRemixErrorBoundaryError(error);

  return <ErrorComponent error={error} />;
}
