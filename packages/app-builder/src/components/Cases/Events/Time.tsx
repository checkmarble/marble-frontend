import { formatDateRelative, formatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { differenceInDays } from 'date-fns';
import { TooltipV2 } from 'ui-design-system';

export const EventTime = ({ time }: { time: string }) => {
  const date = new Date(time);
  const language = useFormatLanguage();
  const is6daysOld = Math.abs(differenceInDays(new Date(), date)) > 6;

  return (
    <TooltipV2.Provider>
      <TooltipV2.Tooltip>
        <TooltipV2.TooltipTrigger>
          <span className="text-grey-50 shrink-0 grow-0 text-xs font-normal">
            {formatDateRelative(date, { language })}
          </span>
        </TooltipV2.TooltipTrigger>
        <TooltipV2.TooltipContent>
          <span className="text-2xs font-normal">
            {formatDateTime(date, {
              language,
              timeStyle: is6daysOld ? 'short' : undefined,
              dateStyle: is6daysOld ? undefined : 'short',
            })}
          </span>
        </TooltipV2.TooltipContent>
      </TooltipV2.Tooltip>
    </TooltipV2.Provider>
  );
};
