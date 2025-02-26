import { type RuleExecution } from '@app-builder/models/decision';
import clsx from 'clsx';
import type * as React from 'react';
import { CollapsibleV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { RuleExecutionStatus } from './RuleExecutionStatus';

export function RulesExecutionsContainer({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      className={clsx('grid grid-cols-[max-content_1fr_max-content] gap-2', className)}
      {...props}
    />
  );
}

export function RuleExecutionCollapsible({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <CollapsibleV2.Provider>
      <div
        className={clsx(
          'bg-grey-98 col-span-full grid grid-cols-subgrid gap-2 overflow-hidden rounded-lg p-2',
          className,
        )}
        {...props}
      />
    </CollapsibleV2.Provider>
  );
}

export function RuleExecutionTitle({ ruleExecution }: { ruleExecution: RuleExecution }) {
  return (
    <CollapsibleV2.Title className="bg-grey-98 group col-span-full grid grid-cols-subgrid items-center outline-none">
      <Icon
        icon="smallarrow-up"
        aria-hidden
        className="size-5 rotate-90 transition-transform duration-200 group-aria-expanded:rotate-180 group-data-[initial]:rotate-180 rtl:-rotate-90 rtl:group-aria-expanded:-rotate-180 rtl:group-data-[initial]:-rotate-180"
      />
      <span className="text-s line-clamp-1 text-start font-semibold">{ruleExecution.name}</span>
      <RuleExecutionStatus ruleExecution={ruleExecution} />
    </CollapsibleV2.Title>
  );
}

export function RuleExecutionContent({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <CollapsibleV2.Content className="col-span-full">
      <div className={clsx('flex flex-col gap-4 p-2', className)} {...props} />
    </CollapsibleV2.Content>
  );
}

export function RuleExecutionDescription({ description }: { description?: string }) {
  if (!description) return null;
  return (
    <div className="bg-purple-98 border-purple-96 flex flex-row gap-2 rounded border p-2">
      <Icon icon="tip" className="text-purple-65 size-5 shrink-0" />
      <span className="text-s text-purple-65 font-normal">{description}</span>
    </div>
  );
}
