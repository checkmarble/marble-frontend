import { CollapsiblePaper, Page } from '@app-builder/components';
import { EventTypes } from '@app-builder/components/Webhooks/EventTypes';
import { DeleteWebhook } from '@app-builder/routes/ressources+/settings+/webhooks+/delete';
import { UpdateWebhook } from '@app-builder/routes/ressources+/settings+/webhooks+/update';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { json, type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import invariant from 'tiny-invariant';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

export async function loader({ request, params }: LoaderFunctionArgs) {
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

  const webhookId = params['webhookId'];
  invariant(webhookId, `webhookId is required`);

  const webhook = await webhookRepository.getWebhook({ webhookId });

  return json({
    webhook,
    isEditWebhookAvailable: featureAccessService.isCreateWebhookAvailable(user),
    isDeleteWebhookAvailable:
      featureAccessService.isDeleteWebhookAvailable(user),
  });
}

export default function WebhookDetail() {
  const { t } = useTranslation(['settings']);
  const { webhook, isEditWebhookAvailable, isDeleteWebhookAvailable } =
    useLoaderData<typeof loader>();

  return (
    <Page.Container>
      <Page.Content>
        <CollapsiblePaper.Container>
          <CollapsiblePaper.Title>
            <span className="flex-1">{t('settings:webhook_details')}</span>
            {isEditWebhookAvailable ? (
              // Necessary to prevent click events from propagating to the Collapsible
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
              <span onClick={(e) => e.stopPropagation()}>
                <UpdateWebhook defaultValue={webhook}>
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
                <span className="text-grey-25 text-s">
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
  <span className="font-semibold capitalize">{children}</span>
);

const WebhookValue = ({ children }: { children: React.ReactNode }) => {
  if (children === null || children === undefined) {
    return <span className="text-s text-grey-50">-</span>;
  }
  return <span className="text-s text-grey-100">{children}</span>;
};
