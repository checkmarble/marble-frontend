import { Callout, CollapsiblePaper, Page } from '@app-builder/components';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { CreateWebhook } from '@app-builder/components/Settings/Webhooks/CreateWebhook';
import { EventTypes } from '@app-builder/components/Webhooks/EventTypes';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { type Webhook } from '@app-builder/models/webhook';
import { webhooksSetupDocHref } from '@app-builder/services/documentation-href';
import {
  isCreateWebhookAvailable,
  isDeleteWebhookAvailable,
  isEditWebhookAvailable,
  isReadWebhookAvailable,
} from '@app-builder/services/feature-access';
import * as Sentry from '@sentry/react';
import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { createColumnHelper, getCoreRowModel } from '@tanstack/react-table';
import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, Table, useTable } from 'ui-design-system';
import { Icon } from 'ui-icons';

const webhooksLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async function webhooksLoader({ context }) {
    const { webhookRepository, user, entitlements } = context.authInfo;

    if (!isReadWebhookAvailable(user)) throw redirect({ to: '/' });

    const webhooks = await webhookRepository.listWebhooks();

    return {
      webhooks,
      isCreateWebhookAvailable: isCreateWebhookAvailable(user),
      isEditWebhookAvailable: isEditWebhookAvailable(user),
      isDeleteWebhookAvailable: isDeleteWebhookAvailable(user),
      webhooksStatus: entitlements.webhooks,
    };
  });

export const Route = createFileRoute('/_app/_builder/settings/webhooks')({
  loader: () => webhooksLoader(),
  component: Webhooks,
  errorComponent: WebhooksError,
});

const columnHelper = createColumnHelper<Webhook>();

function Webhooks() {
  const { t } = useTranslation(['settings']);
  const { webhooks, isCreateWebhookAvailable, webhooksStatus } = Route.useLoaderData();

  const columns = useMemo(() => {
    return [
      columnHelper.accessor((row) => row.url, {
        id: 'url',
        header: t('settings:webhooks.url'),
        size: 200,
      }),
      columnHelper.accessor((row) => row.eventTypes, {
        id: 'eventTypes',
        header: t('settings:webhooks.event_types'),
        size: 200,
        cell: ({ getValue }) => {
          const eventTypes = getValue();
          if (eventTypes.length === 0) {
            return <span className="text-grey-disabled text-s">{t('settings:webhooks.event_types.placeholder')}</span>;
          }
          return <EventTypes eventTypes={eventTypes} />;
        },
      }),
    ];
  }, [t]);

  const { table, getBodyProps, rows, getContainerProps } = useTable({
    data: webhooks,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false,
    rowLink: (webhook) => <Link to="/settings/webhooks/$webhookId" params={{ webhookId: webhook.id }} />,
  });

  return (
    <Page.Container>
      <Page.Content className="max-w-(--breakpoint-xl)">
        <CollapsiblePaper.Container>
          <CollapsiblePaper.Title>
            <span className="flex-1">{t('settings:webhooks')}</span>
            {isCreateWebhookAvailable ? (
              <span onClick={(e) => e.stopPropagation()}>
                <CreateWebhook webhookStatus={webhooksStatus}>
                  <Button variant="primary">
                    <Icon icon="plus" className="size-5" />
                    {t('settings:webhooks.new_webhook')}
                  </Button>
                </CreateWebhook>
              </span>
            ) : null}
          </CollapsiblePaper.Title>
          <CollapsiblePaper.Content>
            <Callout className="mb-4 lg:mb-6" variant="outlined">
              <p className="whitespace-pre-wrap">
                <Trans
                  t={t}
                  i18nKey="settings:webhooks.setup_documentation"
                  components={{
                    DocLink: <ExternalLink href={webhooksSetupDocHref} />,
                  }}
                />
              </p>
            </Callout>

            <Table.Container {...getContainerProps()} className="max-h-96">
              <Table.Header headerGroups={table.getHeaderGroups()} />
              <Table.Body {...getBodyProps()}>
                {rows.map((row) => {
                  return <Table.Row key={row.id} row={row} />;
                })}
              </Table.Body>
            </Table.Container>
          </CollapsiblePaper.Content>
        </CollapsiblePaper.Container>
      </Page.Content>
    </Page.Container>
  );
}

function WebhooksError({ error }: { error: unknown }) {
  Sentry.captureException(error);
  const { t } = useTranslation(['settings']);

  const columns = useMemo(() => {
    return [
      columnHelper.accessor((row) => row.url, {
        id: 'url',
        header: t('settings:webhooks.url'),
        size: 200,
      }),
      columnHelper.accessor((row) => row.eventTypes, {
        id: 'eventTypes',
        header: t('settings:webhooks.event_types'),
        size: 200,
        cell: ({ getValue }) => {
          const eventTypes = getValue();
          if (eventTypes.length === 0) {
            return <span className="text-grey-disabled text-s">{t('settings:webhooks.event_types.placeholder')}</span>;
          }
          return <EventTypes eventTypes={eventTypes} />;
        },
      }),
    ];
  }, [t]);

  const { table, getBodyProps, rows, getContainerProps } = useTable({
    data: [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false,
    enableColumnResizing: false,
  });

  return (
    <Page.Container>
      <Page.Content className="relative max-w-(--breakpoint-xl)">
        <div className="bg-grey-primary/20 absolute z-50 flex size-full items-center justify-center p-4 backdrop-blur-[2px] transition-all">
          <div className="bg-surface-card border-grey-border flex max-w-[500px] flex-col items-center rounded-sm border shadow-md">
            <h1 className="bg-grey-background text-grey-primary w-full p-8 text-center font-semibold">
              {t('settings:webhooks.configuration_error')}
            </h1>
            <div className="w-full p-12">
              <Callout variant="outlined">
                <p className="whitespace-pre-wrap">
                  <Trans
                    t={t}
                    i18nKey="settings:webhooks.convoy_error"
                    components={{
                      DocLink: <ExternalLink href={webhooksSetupDocHref} />,
                    }}
                  />
                </p>
              </Callout>
            </div>
          </div>
        </div>
        <CollapsiblePaper.Container>
          <CollapsiblePaper.Title>
            <span className="flex-1">{t('settings:webhooks')}</span>
            <Button variant="primary" disabled>
              <Icon icon="plus" className="size-5" />
              {t('settings:webhooks.new_webhook')}
            </Button>
          </CollapsiblePaper.Title>
          <CollapsiblePaper.Content>
            <Callout className="mb-4 lg:mb-6" variant="outlined">
              <p className="whitespace-pre-wrap">
                <Trans
                  t={t}
                  i18nKey="settings:webhooks.setup_documentation"
                  components={{
                    DocLink: <ExternalLink href={webhooksSetupDocHref} />,
                  }}
                />
              </p>
            </Callout>

            <Table.Container {...getContainerProps()} className="max-h-96">
              <Table.Header headerGroups={table.getHeaderGroups()} />
              <Table.Body {...getBodyProps()}>
                {rows.map((row) => {
                  return <Table.Row key={row.id} row={row} />;
                })}
              </Table.Body>
            </Table.Container>
          </CollapsiblePaper.Content>
        </CollapsiblePaper.Container>
      </Page.Content>
    </Page.Container>
  );
}
