import { Callout, CollapsiblePaper, Page } from '@app-builder/components';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { EventTypes } from '@app-builder/components/Webhooks/EventTypes';
import { type Webhook } from '@app-builder/models/webhook';
import { CreateWebhook } from '@app-builder/routes/ressources+/settings+/webhooks+/create';
import { webhooksSetupDocHref } from '@app-builder/services/documentation-href';
import {
  isCreateWebhookAvailable,
  isDeleteWebhookAvailable,
  isEditWebhookAvailable,
  isReadWebhookAvailable,
} from '@app-builder/services/feature-access';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { json, type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { createColumnHelper, getCoreRowModel } from '@tanstack/react-table';
import { type Namespace } from 'i18next';
import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, Table, useTable } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: ['common', 'settings'] satisfies Namespace,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { webhookRepository, user, entitlements } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  if (!isReadWebhookAvailable(user)) return redirect(getRoute('/'));

  const webhooks = await webhookRepository.listWebhooks();

  return json({
    webhooks,
    isCreateWebhookAvailable: isCreateWebhookAvailable(user),
    isEditWebhookAvailable: isEditWebhookAvailable(user),
    isDeleteWebhookAvailable: isDeleteWebhookAvailable(user),
    webhooksStatus: entitlements.webhooks,
  });
}

const columnHelper = createColumnHelper<Webhook>();

export default function Webhooks() {
  const { t } = useTranslation(['settings']);
  const { webhooks, isCreateWebhookAvailable, webhooksStatus } = useLoaderData<typeof loader>();

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
            return (
              <span className="text-grey-80 text-s">
                {t('settings:webhooks.event_types.placeholder')}
              </span>
            );
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
    rowLink: (webhook) => (
      <Link
        to={getRoute('/settings/webhooks/:webhookId', {
          webhookId: webhook.id,
        })}
      />
    ),
  });

  return (
    <Page.Container>
      <Page.Content className="max-w-screen-xl">
        <CollapsiblePaper.Container>
          <CollapsiblePaper.Title>
            <span className="flex-1">{t('settings:webhooks')}</span>
            {isCreateWebhookAvailable ? (
              // Necessary to prevent click events from propagating to the Collapsible
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
              <span onClick={(e) => e.stopPropagation()}>
                <CreateWebhook webhookStatus={webhooksStatus}>
                  <Button>
                    <Icon icon="plus" className="size-6" />
                    {t('settings:webhooks.new_webhook')}
                  </Button>
                </CreateWebhook>
              </span>
            ) : null}
          </CollapsiblePaper.Title>
          <CollapsiblePaper.Content>
            <Callout className="mb-4 lg:mb-6" variant="outlined">
              <p className="whitespace-pre text-wrap">
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

export function ErrorBoundary() {
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
            return (
              <span className="text-grey-80 text-s">
                {t('settings:webhooks.event_types.placeholder')}
              </span>
            );
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
      <Page.Content className="relative max-w-screen-xl">
        <div className="bg-grey-00/20 absolute z-50 flex size-full items-center justify-center p-4 backdrop-blur-[2px] transition-all">
          <div className="bg-grey-100 border-grey-90 flex max-w-[500px] flex-col items-center rounded border shadow-md">
            <h1 className="bg-grey-95 text-grey-00 w-full p-8 text-center font-semibold">
              {t('settings:webhooks.configuration_error')}
            </h1>
            <div className="w-full p-12">
              <Callout variant="outlined">
                <p className="whitespace-pre text-wrap">
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
            <Button disabled>
              <Icon icon="plus" className="size-6" />
              {t('settings:webhooks.new_webhook')}
            </Button>
          </CollapsiblePaper.Title>
          <CollapsiblePaper.Content>
            <Callout className="mb-4 lg:mb-6" variant="outlined">
              <p className="whitespace-pre text-wrap">
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
