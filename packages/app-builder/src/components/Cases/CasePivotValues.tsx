import { type Pivot } from '@app-builder/models';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn, Tag, Tooltip } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { CopyToClipboardButton } from '../CopyToClipboardButton';
import { PivotDetails } from '../Data/PivotDetails';
import { casesI18n } from './cases-i18n';

export function CasePivotValues({
  pivotValues,
}: {
  pivotValues: {
    pivot: Pivot;
    value: string;
  }[];
}) {
  const { i18n } = useTranslation(casesI18n);

  return (
    <div className="grid grid-cols-[repeat(2,max-content)] items-center gap-sm">
      {pivotValues.map(({ pivot, value }) => {
        return (
          <React.Fragment key={pivot.id}>
            <Tag
              size="big"
              color={pivot.type === 'field' ? 'grey' : 'purple'}
              className="col-start-1 flex flex-row gap-sm"
            >
              <span className="flex-1">{pivot.type}</span>
              <Tooltip.Default
                arrow={false}
                delayDuration={0}
                side={i18n.dir() === 'ltr' ? 'right' : 'left'}
                sideOffset={16}
                content={<PivotDetails pivot={pivot} />}
                // PivotDetails is a multi-row table, so opt out of Tooltip.Default's
                // default max-h-40 clamp rather than squeezing it into a scrollbox.
                className="border-grey-border flex max-h-none w-fit border shadow-md"
              >
                <button
                  type="button"
                  className={cn(
                    'cursor-pointer transition-colors',
                    pivot.type === 'field' && 'text-grey-disabled hover:text-grey-secondary',
                    pivot.type === 'link' && 'hover:text-purple-primary text-purple-disabled',
                  )}
                >
                  <Icon icon="tip" className="size-5" />
                </button>
              </Tooltip.Default>
            </Tag>
            <CopyToClipboardButton toCopy={value} className="bg-surface-card">
              <span className="text-s line-clamp-1 max-w-40 font-normal">{value}</span>
            </CopyToClipboardButton>
          </React.Fragment>
        );
      })}
    </div>
  );
}
