import { type RuleExecution } from '@app-builder/models/decision';
import * as Collapsible from '@radix-ui/react-collapsible';
import type * as React from 'react';
import { cn } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { RuleExecutionStatus } from './RuleExecutionStatus';

export function RulesExecutionsContainer({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return <div className={cn('grid grid-cols-[max-content_1fr_max-content] gap-sm', className)} {...props} />;
}

export function RuleExecutionCollapsible({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <Collapsible.Root asChild>
      <div
        className={cn(
          'border-grey-border col-span-full grid grid-cols-subgrid gap-sm overflow-hidden rounded-lg border bg-surface-card p-sm',
          className,
        )}
        {...props}
      />
    </Collapsible.Root>
  );
}

export function RuleExecutionTitle({ ruleExecution }: { ruleExecution: RuleExecution }) {
  return (
    <Collapsible.Trigger className="group col-span-full grid grid-cols-subgrid items-center outline-hidden">
      <Icon
        icon="smallarrow-up"
        aria-hidden
        className="size-5 rotate-90 transition-transform duration-200 group-aria-expanded:rotate-180 rtl:-rotate-90 group-aria-expanded:rtl:-rotate-180"
      />
      <span className="text-s line-clamp-1 text-start font-semibold">{ruleExecution.name}</span>
      <RuleExecutionStatus ruleExecution={ruleExecution} />
    </Collapsible.Trigger>
  );
}

export function RuleExecutionContent({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <Collapsible.Content className="radix-state-open:animate-slide-down radix-state-closed:animate-slide-up col-span-full overflow-hidden">
      <div className={cn('flex flex-col gap-md p-sm', className)} {...props} />
    </Collapsible.Content>
  );
}

export function RuleExecutionDescription({ description }: { description?: string }) {
  if (!description) return null;
  return (
    <div className="bg-purple-background-light border-purple-border flex flex-row gap-sm rounded-sm border p-sm dark:bg-transparent dark:border-purple-primary">
      <Icon icon="tip" className="text-purple-primary size-5 shrink-0" />
      <span className="text-s text-purple-primary font-normal">{description}</span>
    </div>
  );
}
