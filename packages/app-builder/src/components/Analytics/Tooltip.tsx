import { cn, TooltipV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function AnalyticsTooltip({ className, content }: { className: string; content: React.ReactNode }) {
  return (
    <TooltipV2.Provider>
      <TooltipV2.Tooltip>
        <TooltipV2.TooltipTrigger asChild>
          <Icon
            icon="tip"
            className={cn(
              'text-grey-60 text-purple-primary hover:text-grey-placeholder cursor-pointer ml-v2-sm',
              className,
            )}
          />
        </TooltipV2.TooltipTrigger>
        <TooltipV2.TooltipContent>{content}</TooltipV2.TooltipContent>
      </TooltipV2.Tooltip>
    </TooltipV2.Provider>
  );
}
