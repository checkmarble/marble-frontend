import { useTranslation } from 'react-i18next';
import { AIText, cn } from 'ui-design-system';
import { Icon } from 'ui-icons';

type AiDescriptionProps = {
  isPending: boolean;
  description: string | undefined;
  className?: string;
};

export function AiDescription({ isPending, description, className }: AiDescriptionProps) {
  const { t } = useTranslation(['scenarios']);

  return (
    <div
      className={cn(
        'text-default rounded-md border border-purple-border bg-purple-background-light text-purple-primary flex flex-col gap-sm p-md dark:border-grey-border',
        className,
      )}
    >
      <div className="flex items-center gap-xs">
        <Icon icon="ai-review" className="size-5" />
        <div>{t('scenarios:rules.ai_description.title')}</div>
      </div>
      {description ? <AIText text={description} /> : null}
      {isPending && description ? <div>{t('scenarios:rules.ai_description.check_reformulation')}</div> : null}
    </div>
  );
}
