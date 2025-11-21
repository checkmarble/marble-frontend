import { TooltipV2 } from 'ui-design-system';

export function AnalyticsTooltip({ children, content }: { children: React.ReactNode; content: React.ReactNode }) {
  return (
    <TooltipV2.Provider>
      <TooltipV2.Tooltip>
        <TooltipV2.TooltipTrigger asChild>{children}</TooltipV2.TooltipTrigger>
        <TooltipV2.TooltipContent>{content}</TooltipV2.TooltipContent>
      </TooltipV2.Tooltip>
    </TooltipV2.Provider>
  );
}
