import { CollapsiblePaper, Page } from '@app-builder/components';
import { type BreadCrumbProps, BreadCrumbs } from '@app-builder/components/Breadcrumbs';
import { SecretValue } from '@app-builder/components/SecretValue';
import { CreateWebhookSecret } from '@app-builder/components/Settings/Webhooks/CreateWebhookSecret';
import { DeleteWebhook } from '@app-builder/components/Settings/Webhooks/DeleteWebhook';
import { RevokeWebhookSecret } from '@app-builder/components/Settings/Webhooks/RevokeWebhookSecret';
import { UpdateWebhook } from '@app-builder/components/Settings/Webhooks/UpdateWebhook';
import { EventTypes } from '@app-builder/components/Webhooks/EventTypes';
import { AppConfigContext } from '@app-builder/contexts/AppConfigContext';
import { type WebhookSecret } from '@app-builder/models/webhook';
import {
  isDeleteWebhookAvailable,
  isEditWebhookAvailable,
  isReadWebhookAvailable,
} from '@app-builder/services/feature-access';
import { initServerServices } from '@app-builder/services/init.server';
import { useFormatDateTime } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { json, type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { createColumnHelper, getCoreRowModel, getSortedRowModel } from '@tanstack/react-table';
import { type Namespace } from 'i18next';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import invariant from 'tiny-invariant';
import { Button, Table, useTable } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: ['common', 'settings'] satisfies Namespace,
  hideTabs: true,
  BreadCrumbs: [
    ({ isLast }: BreadCrumbProps) => {
      const { t } = useTranslation(['settings']);
      return <span className="text-s font-bold">{t('settings:webhook_details')}</span>;
    },
  ],
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { webhookRepository, user, entitlements } = await authService.isAuthenticated(request, {
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
  const { webhook, isEditWebhookAvailable, isDeleteWebhookAvailable, webhookStatus } = useLoaderData<typeof loader>();
  const { features } = AppConfigContext.useValue();
  const isWebhookSecretRotationAvailable = features.webhookSecretRotation && isEditWebhookAvailable;
  return (
    <>
      <Page.Header>
        <BreadCrumbs />
      </Page.Header>
      <Page.Container>
        <Page.Content className="max-w-(--breakpoint-xl)">
          <CollapsiblePaper.Container>
            <CollapsiblePaper.Title>
              <span className="flex-1">{t('settings:webhook_details')}</span>
              {isEditWebhookAvailable ? (
                // Necessary to prevent click events from propagating to the Collapsible
                <span onClick={(e) => e.stopPropagation()}>
                  <UpdateWebhook defaultValue={webhook} webhookStatus={webhookStatus}>
                    <Button variant="primary">
                      <Icon icon="plus" className="size-5" />
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
                  <span className="text-grey-disabled text-s">{t('settings:webhooks.event_types.placeholder')}</span>
                )}

                <WebhookLabel>{t('settings:webhooks.http_timeout')}</WebhookLabel>
                <WebhookValue>{webhook.httpTimeout}</WebhookValue>

                <WebhookLabel>{t('settings:webhooks.rate_limit')}</WebhookLabel>
                <WebhookValue>{webhook.rateLimit}</WebhookValue>

                <WebhookLabel>{t('settings:webhooks.rate_limit_duration')}</WebhookLabel>
                <WebhookValue>{webhook.rateLimitDuration}</WebhookValue>
              </div>
            </CollapsiblePaper.Content>
          </CollapsiblePaper.Container>
          <CollapsiblePaper.Container>
            <CollapsiblePaper.Title>
              <span className="flex-1">{t('settings:webhook_secrets')}</span>
              {isWebhookSecretRotationAvailable ? (
                <span onClick={(e) => e.stopPropagation()}>
                  <CreateWebhookSecret webhookId={webhook.id}>
                    <Button variant="primary">
                      <Icon icon="restart-alt" className="size-5" />
                      {t('settings:webhooks.create_secret')}
                    </Button>
                  </CreateWebhookSecret>
                </span>
              ) : null}
            </CollapsiblePaper.Title>
            <CollapsiblePaper.Content>
              <WebhookSecrets
                secrets={webhook.secrets}
                webhookId={webhook.id}
                isWebhookSecretRotationAvailable={isWebhookSecretRotationAvailable}
              />
            </CollapsiblePaper.Content>
          </CollapsiblePaper.Container>
          {isDeleteWebhookAvailable ? (
            <DeleteWebhook webhookId={webhook.id}>
              <Button variant="destructive" className="w-fit">
                <Icon icon="delete" className="size-5" />
                {t('settings:webhooks.delete_webhook')}
              </Button>
            </DeleteWebhook>
          ) : null}
        </Page.Content>
      </Page.Container>
    </>
  );
}

const WebhookLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="font-semibold first-letter:capitalize">{children}</span>
);

const WebhookValue = ({ children }: { children: React.ReactNode }) => {
  if (children === null || children === undefined) {
    return <span className="text-s text-grey-secondary">-</span>;
  }
  return <span className="text-s text-grey-primary">{children}</span>;
};

const columnHelper = createColumnHelper<WebhookSecret>();

function WebhookSecrets({
  secrets,
  webhookId,
  isWebhookSecretRotationAvailable,
}: {
  secrets: WebhookSecret[];
  webhookId: string;
  isWebhookSecretRotationAvailable: boolean;
}) {
  const { t } = useTranslation(['settings']);
  const formatDateTime = useFormatDateTime();

  const columns = React.useMemo(
    () => [
      columnHelper.accessor((row) => row.value, {
        id: 'value',
        header: t('settings:webhooks.secret.value'),
        size: 200,
        enableSorting: false,
        cell: ({ getValue, row }) => {
          const value = getValue();
          const isExpired = row.original.expiresAt ? new Date(row.original.expiresAt) < new Date() : false;
          const isDeactivated = !!row.original.deletedAt || isExpired;
          return <SecretValue value={value} alwaysVisible={isDeactivated} />;
        },
      }),
      columnHelper.accessor((row) => row.createdAt, {
        id: 'createdAt',
        header: t('settings:webhooks.secret.created_at'),
        size: 100,
        cell: ({ getValue }) => {
          const dateTime = getValue();
          return <time dateTime={dateTime}>{formatDateTime(dateTime, { dateStyle: 'short' })}</time>;
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
          return <time dateTime={dateTime}>{formatDateTime(dateTime, { dateStyle: 'short' })}</time>;
        },
      }),
      columnHelper.accessor((row) => row.deletedAt, {
        id: 'deletedAt',
        header: t('settings:webhooks.secret.deleted_at'),
        size: 200,
        cell: ({ getValue, row }) => {
          const dateTime = getValue();
          const isLastActiveNonExpiring =
            !row.original.deletedAt &&
            !row.original.expiresAt &&
            secrets.filter((s) => !s.deletedAt && !s.expiresAt).length <= 1;
          const showRevoke = isWebhookSecretRotationAvailable && !row.original.deletedAt && !isLastActiveNonExpiring;
          return (
            <div className="flex items-center justify-between gap-2">
              <span>
                {dateTime ? <time dateTime={dateTime}>{formatDateTime(dateTime, { dateStyle: 'short' })}</time> : '-'}
              </span>
              {showRevoke ? (
                <RevokeWebhookSecret webhookId={webhookId} secretId={row.original.id}>
                  <Button variant="secondary" size="small">
                    {t('settings:webhooks.revoke_secret')}
                  </Button>
                </RevokeWebhookSecret>
              ) : null}
            </div>
          );
        },
      }),
    ],
    [formatDateTime, t, isWebhookSecretRotationAvailable, webhookId, secrets],
  );

  const { table, getBodyProps, rows, getContainerProps } = useTable({
    data: secrets,
    columns,
    enableColumnResizing: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Table.Container {...getContainerProps()} className="max-h-96">
      <Table.Header headerGroups={table.getHeaderGroups()} />
      <Table.Body {...getBodyProps()}>
        {rows.map((row) => {
          const isExpired = row.original.expiresAt ? new Date(row.original.expiresAt) < new Date() : false;
          const isDeactivated = !!row.original.deletedAt || isExpired;
          return (
            <Table.Row key={row.id} row={row} className={isDeactivated ? 'text-grey-disabled opacity-50' : undefined} />
          );
        })}
      </Table.Body>
    </Table.Container>
  );
}
