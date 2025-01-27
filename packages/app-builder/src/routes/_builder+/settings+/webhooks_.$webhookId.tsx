import { CollapsiblePaper, Page } from '@app-builder/components';
import { SecretValue } from '@app-builder/components/SecretValue';
import { EventTypes } from '@app-builder/components/Webhooks/EventTypes';
import { type WebhookSecret } from '@app-builder/models/webhook';
import { DeleteWebhook } from '@app-builder/routes/ressources+/settings+/webhooks+/delete';
import { UpdateWebhook } from '@app-builder/routes/ressources+/settings+/webhooks+/update';
import {
  isDeleteWebhookAvailable,
  isEditWebhookAvailable,
  isReadWebhookAvailable,
} from '@app-builder/services/feature-access';
import { serverServices } from '@app-builder/services/init.server';
import { formatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { json, type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
import { type Namespace } from 'i18next';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import invariant from 'tiny-invariant';
import { Button, Table, useTable } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: ['common', 'settings'] satisfies Namespace,
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const { webhookRepository, user, entitlements } =
    await authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    });

  if (!isReadWebhookAvailable(user)) return redirect(getRoute('/'));

  const webhookId = params['webhookId'];
  invariant(webhookId, `webhookId is required`);
  const webhook = await webhookRepository.getWebhook({ webhookId });

  return json({
    webhook,
    isEditWebhookAvailable: isEditWebhookAvailable(user),
    isDeleteWebhookAvailable: isDeleteWebhookAvailable(user),
    webhookStatus: entitlements.webhooks,
  });
}

export default function WebhookDetail() {
  const { t } = useTranslation(['settings']);
  const {
    webhook,
    isEditWebhookAvailable,
    isDeleteWebhookAvailable,
    webhookStatus,
  } = useLoaderData<typeof loader>();

  return (
    <Page.Container>
      <Page.Content className="max-w-screen-xl">
        <CollapsiblePaper.Container>
          <CollapsiblePaper.Title>
            <span className="flex-1">{t('settings:webhook_details')}</span>
            {isEditWebhookAvailable ? (
              // Necessary to prevent click events from propagating to the Collapsible
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
              <span onClick={(e) => e.stopPropagation()}>
                <UpdateWebhook
                  defaultValue={webhook}
                  webhookStatus={webhookStatus}
                >
                  <Button>
                    <Icon icon="plus" className="size-6" />
                    {t('settings:webhooks.update_webhook')}
                  </Button>
                </UpdateWebhook>
              </span>
            ) : null}
          </CollapsiblePaper.Title>
          <CollapsiblePaper.Content>
            <div className="grid auto-rows-fr grid-cols-[max-content_1fr] items-center gap-x-10 gap-y-2">
              <WebhookLabel>{t('settings:webhooks.url')}</WebhookLabel>
              <WebhookValue>{webhook.url}</WebhookValue>

              <WebhookLabel>{t('settings:webhooks.event_types')}</WebhookLabel>
              {webhook.eventTypes.length > 0 ? (
                <EventTypes eventTypes={webhook.eventTypes} />
              ) : (
                <span className="text-grey-80 text-s">
                  {t('settings:webhooks.event_types.placeholder')}
                </span>
              )}

              <WebhookLabel>{t('settings:webhooks.http_timeout')}</WebhookLabel>
              <WebhookValue>{webhook.httpTimeout}</WebhookValue>

              <WebhookLabel>{t('settings:webhooks.rate_limit')}</WebhookLabel>
              <WebhookValue>{webhook.rateLimit}</WebhookValue>

              <WebhookLabel>
                {t('settings:webhooks.rate_limit_duration')}
              </WebhookLabel>
              <WebhookValue>{webhook.rateLimitDuration}</WebhookValue>
            </div>
          </CollapsiblePaper.Content>
        </CollapsiblePaper.Container>
        <CollapsiblePaper.Container>
          <CollapsiblePaper.Title>
            <span className="flex-1">{t('settings:webhook_secrets')}</span>
          </CollapsiblePaper.Title>
          <CollapsiblePaper.Content>
            <WebhookSecrets secrets={webhook.secrets} />
          </CollapsiblePaper.Content>
        </CollapsiblePaper.Container>
        {isDeleteWebhookAvailable ? (
          <DeleteWebhook webhookId={webhook.id}>
            <Button color="red" className="w-fit">
              <Icon icon="delete" className="size-6" />
              {t('settings:webhooks.delete_webhook')}
            </Button>
          </DeleteWebhook>
        ) : null}
      </Page.Content>
    </Page.Container>
  );
}

const WebhookLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="font-semibold first-letter:capitalize">{children}</span>
);

const WebhookValue = ({ children }: { children: React.ReactNode }) => {
  if (children === null || children === undefined) {
    return <span className="text-s text-grey-50">-</span>;
  }
  return <span className="text-s text-grey-00">{children}</span>;
};

const columnHelper = createColumnHelper<WebhookSecret>();

function WebhookSecrets({ secrets }: { secrets: WebhookSecret[] }) {
  const { t } = useTranslation(['settings']);
  const language = useFormatLanguage();

  const columns = React.useMemo(() => {
    return [
      columnHelper.accessor((row) => row.value, {
        id: 'value',
        header: t('settings:webhooks.secret.value'),
        size: 200,
        enableSorting: false,
        cell: ({ getValue }) => {
          const value = getValue();
          return <SecretValue value={value} />;
        },
      }),
      columnHelper.accessor((row) => row.createdAt, {
        id: 'createdAt',
        header: t('settings:webhooks.secret.created_at'),
        size: 100,
        cell: ({ getValue }) => {
          const dateTime = getValue();
          return (
            <time dateTime={dateTime}>
              {formatDateTime(dateTime, { language, timeStyle: undefined })}
            </time>
          );
        },
      }),
      columnHelper.accessor((row) => row.expiresAt, {
        id: 'expiresAt',
        header: t('settings:webhooks.secret.expires_at'),
        size: 100,
        cell: ({ getValue }) => {
          const dateTime = getValue();
          if (!dateTime) {
            return '-';
          }
          return (
            <time dateTime={dateTime}>
              {formatDateTime(dateTime, { language, timeStyle: undefined })}
            </time>
          );
        },
      }),
      columnHelper.accessor((row) => row.deletedAt, {
        id: 'deletedAt',
        header: t('settings:webhooks.secret.deleted_at'),
        size: 100,
        cell: ({ getValue }) => {
          const dateTime = getValue();
          if (!dateTime) {
            return '-';
          }
          return (
            <time dateTime={dateTime}>
              {formatDateTime(dateTime, { language, timeStyle: undefined })}
            </time>
          );
        },
      }),
    ];
  }, [language, t]);

  const { table, getBodyProps, rows, getContainerProps } = useTable({
    data: secrets,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Table.Container {...getContainerProps()} className="max-h-96">
      <Table.Header headerGroups={table.getHeaderGroups()} />
      <Table.Body {...getBodyProps()}>
        {rows.map((row) => {
          return <Table.Row key={row.id} row={row} />;
        })}
      </Table.Body>
    </Table.Container>
  );
}
