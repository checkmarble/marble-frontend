import { Callout, CollapsiblePaper, CopyToClipboardButton, Page } from '@app-builder/components';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { Nudge } from '@app-builder/components/Nudge';
import { CreateApiKey } from '@app-builder/components/Settings/ApiKey/CreateApiKey';
import { DeleteApiKey } from '@app-builder/components/Settings/ApiKey/DeleteApiKey';
import { CreateWebhook } from '@app-builder/components/Settings/Webhooks/CreateWebhook';
import { EventTypes } from '@app-builder/components/Webhooks/EventTypes';
import { type ApiKey, type CreatedApiKey } from '@app-builder/models/api-keys';
import { type Webhook } from '@app-builder/models/webhook';
import { webhooksSetupDocHref } from '@app-builder/services/documentation-href';
import {
  isAccessible,
  isCreateApiKeyAvailable,
  isCreateWebhookAvailable,
  isDeleteApiKeyAvailable,
  isReadApiKeyAvailable,
  isReadWebhookAvailable,
} from '@app-builder/services/feature-access';
import { tKeyForApiKeyRole } from '@app-builder/services/i18n/translation-keys/api-key';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { json, type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { createColumnHelper, getCoreRowModel } from '@tanstack/react-table';
import { type FeatureAccessLevelDto } from 'marble-api/generated/feature-access-api';
import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, Table, useTable } from 'ui-design-system';
import { Icon } from 'ui-icons';

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService, authSessionService } = initServerServices(request);
  const { apiKey, webhookRepository, user, entitlements } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });
  if (!isReadApiKeyAvailable(user)) return redirect(getRoute('/'));
  const apiKeys = await apiKey.listApiKeys();

  const authSession = await authSessionService.getSession(request);
  const createdApiKey = authSession.get('createdApiKey');
  const headers = new Headers();
  if (createdApiKey) {
    headers.set('Set-Cookie', await authSessionService.commitSession(authSession));
  }

  const canReadWebhooks = isReadWebhookAvailable(user);
  let webhooks: Webhook[] = [];
  let webhooksError = false;
  if (canReadWebhooks) {
    try {
      webhooks = await webhookRepository.listWebhooks();
    } catch {
      webhooksError = true;
    }
  }

  return json(
    {
      apiKeys,
      createdApiKey,
      isCreateApiKeyAvailable: isCreateApiKeyAvailable(user),
      isDeleteApiKeyAvailable: isDeleteApiKeyAvailable(user),
      webhooks,
      canReadWebhooks,
      webhooksError,
      isCreateWebhookAvailable: canReadWebhooks && !webhooksError && isCreateWebhookAvailable(user),
      webhooksStatus: entitlements.webhooks,
    },
    {
      headers,
    },
  );
}

const apiKeyColumnHelper = createColumnHelper<ApiKey>();
const webhookColumnHelper = createColumnHelper<Webhook>();

export default function ApiKeys() {
  const { t } = useTranslation(['settings']);
  const {
    apiKeys,
    createdApiKey,
    isCreateApiKeyAvailable,
    isDeleteApiKeyAvailable,
    webhooks,
    canReadWebhooks,
    webhooksError,
    isCreateWebhookAvailable,
    webhooksStatus,
  } = useLoaderData<typeof loader>();

  const apiKeyColumns = useMemo(() => {
    return [
      apiKeyColumnHelper.accessor((row) => row.prefix, {
        id: 'prefix',
        header: t('settings:api_keys.value'),
        size: 100,
        cell: ({ getValue }) => {
          return <span>{`${getValue()}*************`}</span>;
        },
      }),
      apiKeyColumnHelper.accessor((row) => row.description, {
        id: 'description',
        header: t('settings:api_keys.description'),
        size: 300,
      }),
      apiKeyColumnHelper.accessor((row) => row.role, {
        id: 'role',
        header: t('settings:api_keys.role'),
        size: 150,
        cell: ({ getValue }) => t(tKeyForApiKeyRole(getValue())),
      }),
      ...(isDeleteApiKeyAvailable
        ? [
            apiKeyColumnHelper.display({
              id: 'actions',
              size: 100,
              cell: ({ cell }) => {
                return (
                  // TODO: inject trigger inside <DeleteApiKey /> and use style directly on it (so we can remove the container div)
                  <div className="group-hover:text-grey-primary focus-within:text-grey-primary text-transparent">
                    <DeleteApiKey apiKey={cell.row.original} />
                  </div>
                );
              },
            }),
          ]
        : []),
    ];
  }, [isDeleteApiKeyAvailable, t]);

  const apiKeyTable = useTable({
    data: apiKeys,
    columns: apiKeyColumns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Page.Container>
      <Page.Content className="max-w-(--breakpoint-xl)">
        {createdApiKey ? <CreatedAPIKey createdApiKey={createdApiKey} /> : null}
        <CollapsiblePaper.Container>
          <CollapsiblePaper.Title>
            <span className="flex-1">{t('settings:api_keys')}</span>
            {isCreateApiKeyAvailable ? <CreateApiKey /> : null}
          </CollapsiblePaper.Title>
          <CollapsiblePaper.Content>
            <Table.Container {...apiKeyTable.getContainerProps()} className="max-h-96">
              <Table.Header headerGroups={apiKeyTable.table.getHeaderGroups()} />
              <Table.Body {...apiKeyTable.getBodyProps()}>
                {apiKeyTable.rows.map((row) => {
                  return <Table.Row key={row.id} className="hover:bg-purple-background-light group" row={row} />;
                })}
              </Table.Body>
            </Table.Container>
          </CollapsiblePaper.Content>
        </CollapsiblePaper.Container>
        {canReadWebhooks ? (
          <WebhooksSection
            webhooks={webhooks}
            webhooksError={webhooksError}
            isCreateWebhookAvailable={isCreateWebhookAvailable}
            webhooksStatus={webhooksStatus}
          />
        ) : null}
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
          <span className="text-s line-clamp-1 font-semibold">{createdApiKey.key}</span>
        </CopyToClipboardButton>
      </div>
    </Callout>
  );
}

function WebhooksSection({
  webhooks,
  webhooksError,
  isCreateWebhookAvailable,
  webhooksStatus,
}: {
  webhooks: Webhook[];
  webhooksError: boolean;
  isCreateWebhookAvailable: boolean;
  webhooksStatus: FeatureAccessLevelDto;
}) {
  const { t } = useTranslation(['settings']);

  const columns = useMemo(() => {
    return [
      webhookColumnHelper.accessor((row) => row.url, {
        id: 'url',
        header: t('settings:webhooks.url'),
        size: 200,
      }),
      webhookColumnHelper.accessor((row) => row.eventTypes, {
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
    rowLink: (webhook) => (
      <Link
        to={getRoute('/settings/webhooks/:webhookId', {
          webhookId: webhook.id,
        })}
      />
    ),
  });

  const webhooksTitleContent = (
    <span className="flex flex-1 items-center gap-2">
      {t('settings:webhooks')}
      {webhooksStatus !== 'allowed' && !isAccessible(webhooksStatus) ? (
        <Nudge content="" kind={webhooksStatus} className="size-5" />
      ) : null}
    </span>
  );

  if (webhooksError || !isAccessible(webhooksStatus)) {
    return (
      <CollapsiblePaper.Container defaultOpen={false}>
        <CollapsiblePaper.Title>
          {webhooksTitleContent}
          <Button variant="primary" disabled>
            <Icon icon="plus" className="size-5" />
            {t('settings:webhooks.new_webhook')}
          </Button>
        </CollapsiblePaper.Title>
        <CollapsiblePaper.Content>
          <div className="flex flex-col items-center gap-4 py-8">
            <h2 className="text-grey-primary font-semibold">{t('settings:webhooks.configuration_error')}</h2>
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
        </CollapsiblePaper.Content>
      </CollapsiblePaper.Container>
    );
  }

  return (
    <CollapsiblePaper.Container>
      <CollapsiblePaper.Title>
        {webhooksTitleContent}
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
  );
}
