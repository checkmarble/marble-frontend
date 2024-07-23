import { CollapsiblePaper, Page } from '@app-builder/components';
import { EventTypes } from '@app-builder/components/Webhooks/EventTypes';
import { type Webhook } from '@app-builder/models/webhook';
import { CreateWebhook } from '@app-builder/routes/ressources+/settings+/webhooks+/create';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { json, type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { createColumnHelper, getCoreRowModel } from '@tanstack/react-table';
import clsx from 'clsx';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Table, useTable } from 'ui-design-system';
import { Icon } from 'ui-icons';

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService, featureAccessService } = serverServices;
  const { webhookRepository, user } = await authService.isAuthenticated(
    request,
    {
      failureRedirect: getRoute('/sign-in'),
    },
  );
  if (!featureAccessService.isReadWebhookAvailable(user)) {
    return redirect(getRoute('/'));
  }

  const webhooks = await webhookRepository.listWebhooks();

  return json({
    webhooks,
    isCreateWebhookAvailable:
      featureAccessService.isCreateWebhookAvailable(user),
    isEditWebhookAvailable: featureAccessService.isCreateWebhookAvailable(user),
    isDeleteWebhookAvailable:
      featureAccessService.isDeleteWebhookAvailable(user),
  });
}

const columnHelper = createColumnHelper<Webhook>();

export default function Webhooks() {
  const { t } = useTranslation(['settings']);
  const { webhooks, isCreateWebhookAvailable } = useLoaderData<typeof loader>();

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
              <span className="text-grey-25 text-s">
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
      <Page.Content>
        <CollapsiblePaper.Container>
          <CollapsiblePaper.Title>
            <span className="flex-1">{t('settings:webhooks')}</span>
            {isCreateWebhookAvailable ? (
              // Necessary to prevent click events from propagating to the Collapsible
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
              <span onClick={(e) => e.stopPropagation()}>
                <CreateWebhook>
                  <Button>
                    <Icon icon="plus" className="size-6" />
                    {t('settings:webhooks.new_webhook')}
                  </Button>
                </CreateWebhook>
              </span>
            ) : null}
          </CollapsiblePaper.Title>
          <CollapsiblePaper.Content>
            <Table.Container {...getContainerProps()} className="max-h-96">
              <Table.Header headerGroups={table.getHeaderGroups()} />
              <Table.Body {...getBodyProps()}>
                {rows.map((row) => {
                  return (
                    <Table.Row
                      key={row.id}
                      tabIndex={0}
                      className={clsx(
                        'hover:bg-grey-02 relative cursor-pointer',
                      )}
                      row={row}
                    />
                  );
                })}
              </Table.Body>
            </Table.Container>
          </CollapsiblePaper.Content>
        </CollapsiblePaper.Container>
      </Page.Content>
    </Page.Container>
  );
}
