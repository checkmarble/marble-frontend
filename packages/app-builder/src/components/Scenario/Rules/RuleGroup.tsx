import { cn, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const RuleGroup = ({
  ruleGroup,
  onClear,
  className,
}: {
  ruleGroup: string;
  onClear?: () => void;
  className?: string;
}) => (
  <Tag color="purple" size="small" className={cn('gap-2', className)}>
    {ruleGroup}
    {onClear ? <Icon onClick={onClear} icon="cross" className="size-4 cursor-pointer hover:opacity-70" /> : null}
  </Tag>
);
