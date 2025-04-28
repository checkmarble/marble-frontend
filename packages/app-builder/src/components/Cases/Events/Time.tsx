import { formatDateRelative, formatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { differenceInDays } from 'date-fns';
import { Tooltip } from 'ui-design-system';

export const EventTime = ({ time }: { time: string }) => {
  const date = new Date(time);
  const language = useFormatLanguage();
  const is6daysOld = Math.abs(differenceInDays(new Date(), date)) > 6;

  return (
    <Tooltip.Default
      arrow={false}
      className="border-grey-90 flex items-center border px-1.5 py-1"
      content={
        <span className="text-2xs font-normal">
          {formatDateTime(date, {
            language,
            timeStyle: is6daysOld ? 'short' : undefined,
            dateStyle: is6daysOld ? undefined : 'short',
          })}
        </span>
      }
    >
      <span className="text-grey-50 shrink-0 grow-0 text-xs font-normal">
        {formatDateRelative(date, { language })}
      </span>
    </Tooltip.Default>
  );
};
