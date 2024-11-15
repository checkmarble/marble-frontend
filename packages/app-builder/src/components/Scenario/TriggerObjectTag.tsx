import * as Ariakit from '@ariakit/react';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

interface TriggerObjectTagProps {
  children: React.ReactNode;
}

export function TriggerObjectTag({ children }: TriggerObjectTagProps) {
  const { t } = useTranslation(['scenarios']);
  return (
    <div className="text-s bg-purple-05 flex h-10 items-center gap-2 rounded p-2 font-normal text-purple-100">
      {children}

      <Ariakit.HovercardProvider
        showTimeout={0}
        hideTimeout={0}
        placement="bottom"
      >
        <Ariakit.HovercardAnchor
          tabIndex={-1}
          className="cursor-pointer text-purple-50 transition-colors hover:text-purple-100"
        >
          <Icon icon="tip" className="size-5" />
        </Ariakit.HovercardAnchor>
        <Ariakit.Hovercard
          portal
          gutter={16}
          className="bg-grey-00 border-grey-10 flex w-fit max-w-80 rounded border p-2 shadow-md"
        >
          {t('scenarios:trigger_object.description')}
        </Ariakit.Hovercard>
      </Ariakit.HovercardProvider>
    </div>
  );
}
