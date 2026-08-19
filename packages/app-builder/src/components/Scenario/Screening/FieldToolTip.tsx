import { Tooltip } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const FieldToolTip = ({ children, label }: { children: React.ReactNode; label: string }) => {
  return (
    <Tooltip.Default
      arrow={false}
      delayDuration={0}
      side="right"
      sideOffset={16}
      content={children}
      className="border-grey-border text-s flex w-fit max-w-80 border shadow-md"
    >
      <button
        type="button"
        aria-label={label}
        className="hover:text-purple-primary text-purple-disabled cursor-pointer transition-colors"
      >
        <Icon icon="tip" className="size-5" />
      </button>
    </Tooltip.Default>
  );
};
