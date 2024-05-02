import { SidebarButton } from '@app-builder/components';
import { type CurrentUser, type MarbleProduct } from '@app-builder/models';
import { type Organization } from '@app-builder/models/organization';
import { Icon } from 'ui-icons';

import { getFullName } from '../user';

export function ChatlioWidget({
  user,
  organization,
  widgetid,
  marbleProduct,
}: {
  user: CurrentUser;
  organization: Organization;
  widgetid: string;
  marbleProduct: MarbleProduct;
}) {
  return (
    <>
      <SidebarButton
        labelTKey="navigation:helpCenter"
        Icon={(props) => <Icon icon="helpcenter" {...props} />}
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
              marbleProduct,
            },
          );
          window._chatlio?.showOrHide?.();
        }}
        data-chatlio-widget-button
      />
      <div className="absolute">
        <chatlio-widget widgetid={widgetid} data-start-hidden></chatlio-widget>
      </div>
    </>
  );
}
