import { AppConfigContext } from '@app-builder/contexts/AppConfigContext';
import { isAdmin, isMarbleAdmin } from '@app-builder/models/user';
import { useUpdateUsageTrackingMutation, useUsageTrackingQuery } from '@app-builder/queries/usage-tracking';
import { useOrganizationDetails } from '@app-builder/services/organization/organization-detail';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Popover, Switch } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function BackendUsageTrackingSettings() {
  const appConfig = AppConfigContext.useValue();
  const { currentUser } = useOrganizationDetails();
  const { t } = useTranslation(['account']);

  if (appConfig.isManagedMarble || (!isAdmin(currentUser) && !isMarbleAdmin(currentUser))) {
    return null;
  }

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button type="button" variant="secondary" className="shadow-md">
          <Icon icon="settings" className="size-4" />
          {t('account:usage_tracking.title')}
        </Button>
      </Popover.Trigger>
      <Popover.Content
        side="top"
        align="end"
        sideOffset={8}
        aria-label={t('account:usage_tracking.title')}
        className="w-80 max-w-[calc(100vw-32px)] p-md"
      >
        <BackendUsageTrackingContent />
      </Popover.Content>
    </Popover.Root>
  );
}

function BackendUsageTrackingContent() {
  const { t } = useTranslation(['account', 'common']);
  const query = useUsageTrackingQuery();
  const mutation = useUpdateUsageTrackingMutation();
  const switchId = useId();
  const descriptionId = useId();

  return (
    <div className="flex flex-col gap-md">
      <p id={descriptionId} className="text-s text-grey-secondary">
        {t('account:usage_tracking.description')}
      </p>
      {query.isPending ? (
        <p className="text-s text-grey-secondary">{t('common:loading')}</p>
      ) : query.isError ? (
        <div className="flex flex-col gap-sm">
          <p role="alert" className="text-s text-grey-secondary">
            {t('common:generic_fetch_data_error')}
          </p>
          <Button type="button" variant="secondary" onClick={() => void query.refetch()}>
            {t('common:retry')}
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-md">
          <label htmlFor={switchId} className="text-s">
            {t('account:usage_tracking.enabled')}
          </label>
          <Switch
            id={switchId}
            aria-describedby={descriptionId}
            checked={query.data.enabled}
            disabled={mutation.isPending || query.isFetching}
            onCheckedChange={(enabled) => mutation.mutate(enabled)}
          />
        </div>
      )}
      <a
        href="https://www.checkmarble.com/privacy"
        target="_blank"
        rel="noopener noreferrer"
        className="text-purple-primary text-s underline"
      >
        {t('account:usage_tracking.privacy_policy')}
      </a>
    </div>
  );
}
