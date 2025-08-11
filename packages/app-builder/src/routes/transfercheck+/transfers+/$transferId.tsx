import { CopyToClipboardButton, ErrorComponent, Page } from '@app-builder/components';
import { TransferData } from '@app-builder/components/Transfers/TransferData';
import {
  TransferStatusAlert,
  TransferStatusRadioButton,
} from '@app-builder/components/Transfers/TransferStatus';
import { transfersI18n } from '@app-builder/components/Transfers/transfers-i18n';
import { isNotFoundHttpError } from '@app-builder/models';
import { transferStatuses } from '@app-builder/models/transfer';
import { initServerServices } from '@app-builder/services/init.server';
import { handleParseParamError } from '@app-builder/utils/http/handle-errors';
import { notFound } from '@app-builder/utils/http/http-responses';
import { parseParamsSafe } from '@app-builder/utils/input-validation';
import { getRoute } from '@app-builder/utils/routes';
import { shortUUIDSchema } from '@app-builder/utils/schema/shortUUIDSchema';
import { type ActionFunctionArgs, json, type LoaderFunctionArgs } from '@remix-run/node';
import { useFetcher, useLoaderData, useRouteError } from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import { useForm } from '@tanstack/react-form';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Collapsible } from 'ui-design-system';
import { z } from 'zod/v4';

export const handle = {
  i18n: ['common', 'navigation', ...transfersI18n] satisfies Namespace,
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
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
  const { authService } = initServerServices(request);
  const parsedParam = await parseParamsSafe(params, z.object({ transferId: shortUUIDSchema }));
  const { transferRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  if (!parsedParam.success) {
    return handleParseParamError(request, parsedParam.error);
  }

  const { transferId } = parsedParam.data;

  const formData = await request.json();
  const { error, success, data } = transferUpdateBodySchema.safeParse(formData);

  if (!success) return json({ status: 'success', errors: z.treeifyError(error) });

  await transferRepository.updateTransfer({
    transferId,
    transferUpdateBody: data,
  });

  return json({ status: 'success', errors: [] });
}

export default function TransferDetailPage() {
  const { t } = useTranslation(handle.i18n);
  const { transfer, transferAlert } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();

  const form = useForm({
    defaultValues: { status: transfer.data.status },
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        fetcher.submit(value, {
          method: 'POST',
          encType: 'application/json',
        });
      }
    },
    validators: {
      onSubmitAsync: transferUpdateBodySchema,
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
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                  }}
                >
                  <form.Field
                    name="status"
                    validators={{
                      onChange: transferUpdateBodySchema.shape.status,
                      onBlur: transferUpdateBodySchema.shape.status,
                    }}
                  >
                    {(field) => (
                      <fieldset name={field.name} className="flex flex-row gap-2">
                        {transferStatuses.map((status) => (
                          <TransferStatusRadioButton
                            key={status}
                            value={status}
                            name={field.name}
                            onBlur={field.handleBlur}
                            onChange={(v) => {
                              field.handleChange(v);
                              form.handleSubmit();
                            }}
                            defaultChecked={field.state.value === status}
                          />
                        ))}
                      </fieldset>
                    )}
                  </form.Field>
                </form>
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
