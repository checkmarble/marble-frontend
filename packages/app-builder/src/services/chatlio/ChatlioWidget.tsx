import { sidebarLink } from '@app-builder/components';
import { type CurrentUser } from '@app-builder/models';
import { type Organization } from '@app-builder/models/organization';
import { useTranslation } from 'react-i18next';
import { Helpcenter } from 'ui-icons';

import { getFullName } from '../user';

export function ChatlioWidget({
  user,
  organization,
}: {
  user: CurrentUser;
  organization: Organization;
}) {
  const { t } = useTranslation(['navigation']);
  return (
    <>
      <button
        className={sidebarLink()}
        onClick={() => {
          window._chatlio?.configure?.({
            collapsedMode: 'hidden',
          });
          window._chatlio?.identify?.(
            user.actorIdentity.userId ?? `OrgID:${user.organizationId}`,
            {
              name: getFullName(user.actorIdentity),
              email: user.actorIdentity.email,
              organization: organization.name,
            },
          );
          window._chatlio?.showOrHide?.();
        }}
        data-chatlio-widget-button
      >
        <Helpcenter height="24px" width="24px" />
        {t('navigation:helpCenter')}
      </button>
      <chatlio-widget
        widgetid="4aef4109-4ac2-4499-590d-511078df07fd"
        data-start-hidden
      ></chatlio-widget>
    </>
  );
}
