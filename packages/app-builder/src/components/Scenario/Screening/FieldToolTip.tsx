import { Hovercard, HovercardAnchor, HovercardProvider } from '@ariakit/react';
import { Icon } from 'ui-icons';

export const FieldToolTip = ({ children }: { children: React.ReactNode }) => {
  return (
    <HovercardProvider showTimeout={0} hideTimeout={0} placement="right">
      <HovercardAnchor
        tabIndex={-1}
        className="hover:text-purple-primary text-purple-disabled cursor-pointer transition-colors"
      >
        <Icon icon="tip" className="size-5" />
      </HovercardAnchor>
      <Hovercard
        portal
        gutter={16}
        className="bg-surface-card border-grey-border flex w-fit max-w-80 rounded-sm border p-2 shadow-md"
      >
        {children}
      </Hovercard>
    </HovercardProvider>
  );
};
