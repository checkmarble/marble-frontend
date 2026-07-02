import { type ComponentProps, type ReactNode } from 'react';
import { Icon } from 'ui-icons';
import { Button } from '../../Button/Button';
import { useI18n } from '../../contexts/I18nContext';
import { Popover } from '../../Popover/Popover';

export const filterPopoverContentProps = {
  side: 'bottom',
  align: 'start',
  sideOffset: 8,
  collisionPadding: 10,
  className: 'animate-slideUpAndFade p-0 shadow-md',
} satisfies Pick<
  ComponentProps<typeof Popover.Content>,
  'side' | 'align' | 'sideOffset' | 'collisionPadding' | 'className'
>;

export function FilterTrigger({
  children,
  className,
  id,
  onClear,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  onClear?: () => void;
}) {
  const { t } = useI18n();

  return (
    <div className="inline-flex items-center">
      <Popover.Trigger asChild>
        <Button appearance="filter" size="large" className={className} id={id}>
          {children}
        </Button>
      </Popover.Trigger>
      {onClear ? (
        <Button
          appearance="filter"
          mode="icon"
          size="large"
          className="-ms-xs"
          onClick={onClear}
          aria-label={t('filters:ds.clear_button.label')}
        >
          <Icon icon="cross" className="text-purple-primary size-5 shrink-0" />
        </Button>
      ) : null}
    </div>
  );
}
