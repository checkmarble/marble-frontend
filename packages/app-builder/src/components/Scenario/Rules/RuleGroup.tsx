import { type ComponentProps } from 'react';
import { Icon } from 'ui-icons';

export const RuleGroup = ({
  ruleGroup,
  onClear,
  ...rest
}: ComponentProps<'div'> & { ruleGroup: string; onClear?: () => void }) => (
  <div {...rest} className="bg-purple-96 flex size-fit flex-row items-center gap-2 rounded-full px-2 py-1">
    <span className="text-purple-65 text-xs">{ruleGroup}</span>
    {onClear ? (
      <Icon onClick={onClear} icon="cross" className="text-purple-65 hover:text-purple-60 size-4 cursor-pointer" />
    ) : null}
  </div>
);
