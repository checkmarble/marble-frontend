import { CalloutV2 } from '@app-builder/components/Callout';
import { getRoute } from '@app-builder/utils/routes';
import { Link } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { CtaV2ClassName } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function InboxEmptyState({ canManageInboxes }: { canManageInboxes: boolean }) {
  const { t } = useTranslation(['cases']);

  return (
    <div className="border-grey-border bg-surface-card flex flex-col items-center gap-4 rounded-lg border p-8">
      <div className="bg-purple-background-light flex size-12 items-center justify-center rounded-full">
        <Icon icon="inbox" className="text-purple-primary size-6" />
      </div>
      {canManageInboxes ? (
        <>
          <p className="text-grey-secondary text-center text-s font-medium">{t('cases:inbox.need_first_inbox')}</p>
          <Link to={getRoute('/settings/inboxes')} className={CtaV2ClassName({ variant: 'primary', size: 'default' })}>
            <Icon icon="settings" className="size-4" />
            {t('cases:inbox.go_to_inbox_settings')}
          </Link>
        </>
      ) : (
        <CalloutV2>{t('cases:inbox.need_inbox_contact_admin')}</CalloutV2>
      )}
    </div>
  );
}
