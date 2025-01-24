import {
  Callout,
  CollapsiblePaper,
  CopyToClipboardButton,
  Page,
} from '@app-builder/components';
import { type ApiKey, type CreatedApiKey } from '@app-builder/models/api-keys';
import { CreateApiKey } from '@app-builder/routes/ressources+/settings+/api-keys+/create';
import { DeleteApiKey } from '@app-builder/routes/ressources+/settings+/api-keys+/delete';
import {
  isCreateApiKeyAvailable,
  isDeleteApiKeyAvailable,
  isReadApiKeyAvailable,
} from '@app-builder/services/feature-access';
import { tKeyForApiKeyRole } from '@app-builder/services/i18n/translation-keys/api-key';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { json, type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { createColumnHelper, getCoreRowModel } from '@tanstack/react-table';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, useTable } from 'ui-design-system';

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService, authSessionService } = serverServices;
  const { apiKey, user } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });
  if (!isReadApiKeyAvailable(user)) return redirect(getRoute('/'));
  const apiKeys = await apiKey.listApiKeys();

  const authSession = await authSessionService.getSession(request);
  const createdApiKey = authSession.get('createdApiKey');
  const headers = new Headers();
  if (createdApiKey) {
    headers.set(
      'Set-Cookie',
      await authSessionService.commitSession(authSession),
    );
  }

  return json(
    {
      apiKeys,
      createdApiKey,
      isCreateApiKeyAvailable: isCreateApiKeyAvailable(user),
      isDeleteApiKeyAvailable: isDeleteApiKeyAvailable(user),
    },
    {
      headers,
    },
  );
}

const columnHelper = createColumnHelper<ApiKey>();

export const BreadCrumb = () => {
  const { t } = useTranslation(['settings']);
  return <span>{t('settings:api_keys')}</span>;
};

export default function ApiKeys() {
  const { t } = useTranslation(['settings']);
  const {
    apiKeys,
    createdApiKey,
    isCreateApiKeyAvailable,
    isDeleteApiKeyAvailable,
  } = useLoaderData<typeof loader>();

  const columns = useMemo(() => {
    return [
      columnHelper.accessor((row) => row.prefix, {
        id: 'prefix',
        header: t('settings:api_keys.value'),
        size: 100,
        cell: ({ getValue }) => {
          return <span>{`${getValue()}*************`}</span>;
        },
      }),
      columnHelper.accessor((row) => row.description, {
        id: 'description',
        header: t('settings:api_keys.description'),
        size: 300,
      }),
      columnHelper.accessor((row) => row.role, {
        id: 'role',
        header: t('settings:api_keys.role'),
        size: 150,
        cell: ({ getValue }) => t(tKeyForApiKeyRole(getValue())),
      }),
      ...(isDeleteApiKeyAvailable
        ? [
            columnHelper.display({
              id: 'actions',
              size: 100,
              cell: ({ cell }) => {
                return (
                  // TODO: inject trigger inside <DeleteApiKey /> and use style directly on it (so we can remove the container div)
                  <div className="group-hover:text-grey-00 focus-within:text-grey-00 text-transparent">
                    <DeleteApiKey apiKey={cell.row.original} />
                  </div>
                );
              },
            }),
          ]
        : []),
    ];
  }, [isDeleteApiKeyAvailable, t]);

  const { table, getBodyProps, rows, getContainerProps } = useTable({
    data: apiKeys,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Page.Container>
      <Page.Content className="max-w-screen-xl">
        {createdApiKey ? <CreatedAPIKey createdApiKey={createdApiKey} /> : null}
        <CollapsiblePaper.Container>
          <CollapsiblePaper.Title>
            <span className="flex-1">{t('settings:api_keys')}</span>
            {isCreateApiKeyAvailable ? <CreateApiKey /> : null}
          </CollapsiblePaper.Title>
          <CollapsiblePaper.Content>
            <Table.Container {...getContainerProps()} className="max-h-96">
              <Table.Header headerGroups={table.getHeaderGroups()} />
              <Table.Body {...getBodyProps()}>
                {rows.map((row) => {
                  return (
                    <Table.Row
                      key={row.id}
                      className="hover:bg-purple-98 group"
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

function CreatedAPIKey({ createdApiKey }: { createdApiKey: CreatedApiKey }) {
  const { t } = useTranslation(['settings']);
  return (
    <Callout variant="outlined">
      <div className="flex flex-col gap-1">
        <span className="font-bold">{t('settings:api_keys.new_api_key')}</span>
        <span>{t('settings:api_keys.copy_api_key')}</span>
        <CopyToClipboardButton toCopy={createdApiKey.key}>
          <span className="text-s line-clamp-1 font-semibold">
            {createdApiKey.key}
          </span>
        </CopyToClipboardButton>
      </div>
    </Callout>
  );
}
