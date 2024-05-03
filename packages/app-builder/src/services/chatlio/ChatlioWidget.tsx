import { SidebarButton } from '@app-builder/components';
import { Icon } from 'ui-icons';

type ChatlioWidget =
  | {
      user: {
        id?: string;
        name?: string;
        email?: string;
      };
      partner: {
        // TODO: add more fields when available
        id?: string;
      };
      widgetid: string;
      marbleProduct: 'transfercheck';
    }
  | {
      user: {
        id?: string;
        name?: string;
        email?: string;
      };
      organization: {
        id: string;
        name: string;
      };
      widgetid: string;
      marbleProduct: 'marble-core';
    };

export function ChatlioWidget(props: ChatlioWidget) {
  let id;
  let customData;
  if (props.marbleProduct === 'transfercheck') {
    const { user, partner } = props;
    id = user.id ?? `PartnerID:${partner.id}`;
    customData = {
      name: user.name,
      email: user.email,
      partnerId: partner.id,
      marbleProduct: 'transfercheck',
    };
  } else if (props.marbleProduct === 'marble-core') {
    const { user, organization } = props;
    id = user.id ?? `OrgID:${organization.id}`;
    customData = {
      name: user.name,
      email: user.email,
      organizationId: organization.id,
      organizationName: organization.name,
      marbleProduct: 'marble-core',
    };
  } else {
    return null;
  }

  return (
    <>
      <SidebarButton
        labelTKey="navigation:helpCenter"
        Icon={(props) => <Icon icon="helpcenter" {...props} />}
        onClick={() => {
          window._chatlio?.configure?.({
            collapsedMode: 'hidden',
          });
          window._chatlio?.identify?.(id, customData);
          window._chatlio?.showOrHide?.();
        }}
        data-chatlio-widget-button
      />
      <div className="absolute">
        <chatlio-widget
          widgetid={props.widgetid}
          data-start-hidden
        ></chatlio-widget>
      </div>
    </>
  );
}
