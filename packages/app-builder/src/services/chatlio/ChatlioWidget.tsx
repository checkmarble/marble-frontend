import { createSimpleContext } from '@app-builder/utils/create-context';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, type ButtonProps } from 'ui-design-system';

type Chatlio =
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

const ChatlioContext = createSimpleContext<Chatlio | undefined>('chatlio');

interface ChatlioProviderProps {
  chatlio?: Chatlio;
  children: React.ReactNode;
}

export function ChatlioProvider({ chatlio, children }: ChatlioProviderProps) {
  return (
    <ChatlioContext.Provider value={chatlio}>
      {children}
      {chatlio ? (
        <div className="absolute">
          <chatlio-widget
            widgetid={chatlio.widgetid}
            data-start-hidden
          ></chatlio-widget>
        </div>
      ) : null}
    </ChatlioContext.Provider>
  );
}

export const ChatlioButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function ChatlioWidget(props, ref) {
    const { t } = useTranslation(['common']);
    const chatlio = ChatlioContext.useOptionalValue();

    if (!chatlio) return null;

    let id;
    let customData;
    if (chatlio.marbleProduct === 'transfercheck') {
      const { user, partner } = chatlio;
      id = user.id ?? `PartnerID:${partner.id}`;
      customData = {
        name: user.name,
        email: user.email,
        partnerId: partner.id,
        marbleProduct: 'transfercheck',
      };
    } else if (chatlio.marbleProduct === 'marble-core') {
      const { user, organization } = chatlio;
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
      <Button
        ref={ref}
        {...props}
        onClick={(event) => {
          window._chatlio?.configure?.({
            collapsedMode: 'hidden',
          });
          window._chatlio?.identify?.(id, customData);
          window._chatlio?.showOrHide?.();
          props.onClick?.(event);
        }}
        data-chatlio-widget-button
      >
        {t('common:help_center.chat_with_us')}
      </Button>
    );
  },
);
