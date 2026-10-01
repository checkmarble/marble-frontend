import { formatDateRelative, useFormatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { differenceInDays } from 'date-fns';
import { type ReactNode } from 'react';
import { TooltipV2 } from 'ui-design-system';

export const EventTime = ({ time, children }: { time: string; children?: ReactNode }) => {
  const date = new Date(time);
  const language = useFormatLanguage();
  const formatDateTime = useFormatDateTime();
  const is6daysOld = Math.abs(differenceInDays(new Date(), date)) > 6;

  return (
    <TooltipV2.Provider>
      <TooltipV2.Tooltip>
        <TooltipV2.TooltipTrigger asChild>
          <span className="text-grey-secondary shrink-0 grow-0 text-xs font-normal">
            {formatDateRelative(date, { language })}
            {children ? <> {children}</> : null}
          </span>
        </TooltipV2.TooltipTrigger>
        <TooltipV2.TooltipContent>
          <span className="text-2xs font-normal">
            {formatDateTime(date, {
              timeStyle: is6daysOld ? 'short' : undefined,
              dateStyle: is6daysOld ? undefined : 'short',
            })}
          </span>
        </TooltipV2.TooltipContent>
      </TooltipV2.Tooltip>
    </TooltipV2.Provider>
  );
};
