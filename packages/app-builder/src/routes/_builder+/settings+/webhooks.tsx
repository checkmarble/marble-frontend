import { CollapsiblePaper, Page } from '@app-builder/components';
import { type Webhook } from '@app-builder/models/webhook';
import { CreateWebhook } from '@app-builder/routes/ressources+/settings+/webhooks+/create';
import { DeleteWebhook } from '@app-builder/routes/ressources+/settings+/webhooks+/delete';
import { UpdateWebhook } from '@app-builder/routes/ressources+/settings+/webhooks+/update';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { json, type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import {
  type ColumnDef,
  createColumnHelper,
  getCoreRowModel,
} from '@tanstack/react-table';
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
  const isReadWebhookAvailable = featureAccessService.isReadWebhookAvailable({
    userPermissions: user.permissions,
  });
  if (!isReadWebhookAvailable) {
    return redirect(getRoute('/'));
  }

  const webhooks = await webhookRepository.listWebhooks();

  return json({
    webhooks,
    isCreateWebhookAvailable: featureAccessService.isCreateWebhookAvailable({
      userPermissions: user.permissions,
    }),
    isEditWebhookAvailable: featureAccessService.isCreateWebhookAvailable({
      userPermissions: user.permissions,
    }),
    isDeleteWebhookAvailable: featureAccessService.isDeleteWebhookAvailable({
      userPermissions: user.permissions,
    }),
  });
}

const columnHelper = createColumnHelper<Webhook>();

export default function Webhooks() {
  const { t } = useTranslation(['settings']);
  const {
    webhooks,
    isCreateWebhookAvailable,
    isEditWebhookAvailable,
    isDeleteWebhookAvailable,
  } = useLoaderData<typeof loader>();

  const columns = useMemo(() => {
    const columns: ColumnDef<Webhook, string>[] = [
      columnHelper.accessor((row) => row.url, {
        id: 'url',
        header: t('settings:webhooks.url'),
        size: 200,
      }),
    ];

    if (isDeleteWebhookAvailable || isEditWebhookAvailable) {
      columns.push(
        columnHelper.display({
          id: 'actions',
          size: 100,
          cell: ({ cell }) => {
            return (
              <div className="text-grey-00 group-hover:text-grey-100 flex gap-2">
                {isEditWebhookAvailable ? (
                  <UpdateWebhook defaultValue={cell.row.original}>
                    <button className="hover:text-purple-110 active:text-purple-120">
                      <Icon icon="edit" className="size-6 shrink-0" />
                      <span className="sr-only">
                        {t('settings:webhooks.update_webhook')}
                      </span>
                    </button>
                  </UpdateWebhook>
                ) : null}
                {isDeleteWebhookAvailable ? (
                  <DeleteWebhook webhookId={cell.row.original.id}>
                    <button className="hover:text-red-110 active:text-red-120">
                      <Icon icon="delete" className="size-6 shrink-0" />
                      <span className="sr-only">
                        {t('settings:webhooks.delete_webhook')}
                      </span>
                    </button>
                  </DeleteWebhook>
                ) : null}
              </div>
            );
          },
        }),
      );
    }

    return columns;
  }, [isDeleteWebhookAvailable, isEditWebhookAvailable, t]);

  const { table, getBodyProps, rows, getContainerProps } = useTable({
    data: webhooks,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false,
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
                      className={clsx('hover:bg-grey-02')}
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
