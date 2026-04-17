import { useTranslation } from 'react-i18next';
import { Tag, TooltipV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';

interface TriggerObjectTagProps {
  children: React.ReactNode;
}

export function TriggerObjectTag({ children }: TriggerObjectTagProps) {
  const { t } = useTranslation(['scenarios']);
  return (
    <Tag size="small" color="grey" className="flex items-center gap-2">
      {children}

      <TooltipV2.Tooltip delayDuration={0}>
        <TooltipV2.TooltipTrigger tabIndex={-1} className="cursor-pointer transition-colors">
          <Icon icon="tip" className="size-3.5" />
        </TooltipV2.TooltipTrigger>
        <TooltipV2.TooltipContent
          side="bottom"
          align="start"
          sideOffset={8}
          className="bg-surface-card border-grey-border flex w-fit max-w-80 rounded-sm border p-2 z-50 shadow-md"
        >
          {t('scenarios:trigger_object.description')}
        </TooltipV2.TooltipContent>
      </TooltipV2.Tooltip>
    </Tag>
  );
}
