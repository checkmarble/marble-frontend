import { Callout, CopyToClipboardButton, Page } from '@app-builder/components';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { Nudge } from '@app-builder/components/Nudge';
import { CreateApiKey } from '@app-builder/components/Settings/ApiKey/CreateApiKey';
import { DeleteApiKey } from '@app-builder/components/Settings/ApiKey/DeleteApiKey';
import { SettingCard } from '@app-builder/components/Settings/settingCard';
import { CreateWebhook } from '@app-builder/components/Settings/Webhooks/CreateWebhook';
import { EventTypes } from '@app-builder/components/Webhooks/EventTypes';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { type ApiKey, type CreatedApiKey } from '@app-builder/models/api-keys';
import { type Webhook } from '@app-builder/models/webhook';
import { useAuthSession } from '@app-builder/services/auth/auth-session.server';
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
import { downloadFile } from '@app-builder/utils/download-file';
import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { createColumnHelper } from '@tanstack/react-table';
import { type OpenApiSpec } from 'marble-api';
import { type FeatureAccessLevelDto } from 'marble-api/generated/feature-access-api';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';
import type { MarbleTableFeatures } from 'ui-design-system';
import { Button, Card, CtaV2ClassName, Typo, useTable } from 'ui-design-system';
import { Icon } from 'ui-icons';

const apiKeysLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async function apiKeysLoader({ context }) {
    const { apiKey, webhookRepository, dataModelRepository, user, entitlements } = context.authInfo;

    if (!isReadApiKeyAvailable(user)) throw redirect({ to: '/' });

    const [apiKeys, openapiV1] = await Promise.all([
      apiKey.listApiKeys(),
      dataModelRepository.getOpenApiSpecOfVersion('v1'),
    ]);

    const authSession = await useAuthSession();
    const createdApiKey = authSession.data.createdApiKey;
    if (createdApiKey) {
      await authSession.update({ createdApiKey: undefined });
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

    return {
      apiKeys,
      openapiV1,
      createdApiKey,
      isCreateApiKeyAvailable: isCreateApiKeyAvailable(user),
      isDeleteApiKeyAvailable: isDeleteApiKeyAvailable(user),
      webhooks,
      canReadWebhooks,
      webhooksError,
      isCreateWebhookAvailable: canReadWebhooks && !webhooksError && isCreateWebhookAvailable(user),
      webhooksStatus: entitlements.webhooks,
    };
  });

export const Route = createFileRoute('/_app/_builder/settings/api-keys')({
  loader: () => apiKeysLoader(),
  component: ApiKeys,
});

const apiKeyColumnHelper = createColumnHelper<MarbleTableFeatures, ApiKey>();
const webhookColumnHelper = createColumnHelper<MarbleTableFeatures, Webhook>();

function ApiKeys() {
  const { t } = useTranslation(['common', 'settings', 'api']);
  const {
    apiKeys,
    openapiV1,
    createdApiKey,
    isCreateApiKeyAvailable,
    isDeleteApiKeyAvailable,
    webhooks,
    canReadWebhooks,
    webhooksError,
    isCreateWebhookAvailable,
    webhooksStatus,
  } = Route.useLoaderData();

  const apiKeyColumns = useMemo(() => {
    return [
      apiKeyColumnHelper.accessor((row) => row.prefix, {
        id: 'prefix',
        header: t('settings:api_keys.value'),
        size: 150,
        cell: ({ getValue }) => {
          return <span>{`${getValue()}*************`}</span>;
        },
      }),
      apiKeyColumnHelper.accessor((row) => row.description, {
        id: 'description',
        header: t('settings:api_keys.description'),
        size: 250,
      }),
      apiKeyColumnHelper.accessor((row) => row.roles, {
        id: 'role',
        header: t('settings:api_keys.role'),
        size: 150,
        cell: ({ getValue }) =>
          getValue()
            .map(({ role }) => t(tKeyForApiKeyRole(role)))
            .join(', '),
      }),
      apiKeyColumnHelper.display({
        id: 'actions',
        size: 300,
        cell: ({ cell }) => {
          if (!isDeleteApiKeyAvailable) return null;
          return (
            <div className="flex justify-end opacity-0 group-hover:opacity-100 focus-within:opacity-100">
              <DeleteApiKey apiKey={cell.row.original} />
            </div>
          );
        },
      }),
    ];
  }, [isDeleteApiKeyAvailable, t]);

  const apiKeyTable = useTable({
    data: apiKeys,
    columns: apiKeyColumns,
    columnResizeMode: 'onChange',
  });

  return (
    <Page.Content width="readable">
      {createdApiKey ? <CreatedAPIKey createdApiKey={createdApiKey} /> : null}

      <SettingCard
        title={t('settings:api_keys')}
        table={apiKeyTable}
        addButton={isCreateApiKeyAvailable ? <CreateApiKey /> : null}
        additionalButtons={<DownloadOpenApiSpecButton openapiV1={openapiV1} />}
      />

      {canReadWebhooks ? (
        <WebhooksSection
          webhooks={webhooks}
          webhooksError={webhooksError}
          isCreateWebhookAvailable={isCreateWebhookAvailable}
          webhooksStatus={webhooksStatus}
        />
      ) : null}
    </Page.Content>
  );
}

function DownloadOpenApiSpecButton({ openapiV1 }: { openapiV1: OpenApiSpec }) {
  const { t } = useTranslation(['common', 'api']);

  return (
    <Button
      variant="secondary"
      appearance="stroked"
      onClick={() => {
        try {
          const blob = new Blob([JSON.stringify(openapiV1)], {
            type: 'application/json;charset=utf-8,',
          });
          const url = URL.createObjectURL(blob);
          void downloadFile(url, 'openapi-v1.json');
        } catch (_error) {
          toast.error(t('common:errors.unknown'));
        }
      }}
    >
      <Icon icon="download" className="size-4" />
      {t('api:download_openapi_spec_v1')}
    </Button>
  );
}

function CreatedAPIKey({ createdApiKey }: { createdApiKey: CreatedApiKey }) {
  const { t } = useTranslation(['settings']);
  return (
    <Callout variant="outlined">
      <div className="flex flex-col gap-xs">
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

  const table = useTable({
    data: webhooks,
    columns,
    columnResizeMode: 'onChange',

    enableSorting: false,
    rowLink: (webhook) => <Link to="/settings/webhooks/$webhookId" params={{ webhookId: webhook.id }} />,
  });

  const webhooksTitleContent = (
    <Typo variant="title2" className="flex flex-1 items-center gap-sm">
      {t('settings:webhooks')}
      {webhooksStatus !== 'allowed' && !isAccessible(webhooksStatus) ? (
        <Nudge content="" kind={webhooksStatus} className="size-5" />
      ) : null}
    </Typo>
  );

  if (webhooksError || !isAccessible(webhooksStatus)) {
    return (
      <SettingCard
        title={webhooksTitleContent}
        table={table}
        addButton={
          <span className={CtaV2ClassName({ appearance: 'stroked', variant: 'primary' })} aria-disabled={true}>
            <Icon icon="plus" className="size-5" />
            {t('settings:webhooks.new_webhook')}
          </span>
        }
      >
        <Card className="flex flex-col items-center gap-md p-md">
          <Typo variant="title2" className="text-grey-primary">
            {t('settings:webhooks.configuration_error')}
          </Typo>
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
        </Card>
      </SettingCard>
    );
  }

  return (
    <SettingCard
      title={webhooksTitleContent}
      table={table}
      addButton={
        isCreateWebhookAvailable ? (
          <CreateWebhook webhookStatus={webhooksStatus}>
            <Button variant="primary" appearance="stroked">
              <Icon icon="plus" className="size-5" />
              {t('settings:webhooks.new_webhook')}
            </Button>
          </CreateWebhook>
        ) : null
      }
    >
      <Callout variant="outlined">
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
    </SettingCard>
  );
}
