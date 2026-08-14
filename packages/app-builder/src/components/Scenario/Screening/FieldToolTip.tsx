import { Tooltip } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const FieldToolTip = ({ children }: { children: React.ReactNode }) => {
  return (
    <Tooltip.Default
      arrow={false}
      delayDuration={0}
      side="right"
      sideOffset={16}
      content={children}
      className="border-grey-border text-s flex w-fit max-w-80 border shadow-md"
    >
      <button type="button" className="hover:text-purple-primary text-purple-disabled cursor-pointer transition-colors">
        <Icon icon="tip" className="size-5" />
      </button>
    </Tooltip.Default>
  );
};
