import * as Ariakit from '@ariakit/react';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

interface TriggerObjectTagProps {
  children: React.ReactNode;
}

export function TriggerObjectTag({ children }: TriggerObjectTagProps) {
  const { t } = useTranslation(['scenarios']);
  return (
    <div className="text-s bg-purple-98 text-purple-65 flex items-center gap-2 rounded-v2-md py-xs px-sm font-normal">
      {children}

      <Ariakit.HovercardProvider showTimeout={0} hideTimeout={0} placement="bottom">
        <Ariakit.HovercardAnchor
          tabIndex={-1}
          className="hover:text-purple-65 text-purple-82 cursor-pointer transition-colors"
        >
          <Icon icon="tip" className="size-3.5" />
        </Ariakit.HovercardAnchor>
        <Ariakit.Hovercard
          portal
          gutter={16}
          className="bg-grey-100 border-grey-90 flex w-fit max-w-80 rounded-sm border p-2 z-50 shadow-md"
        >
          {t('scenarios:trigger_object.description')}
        </Ariakit.Hovercard>
      </Ariakit.HovercardProvider>
    </div>
  );
}
