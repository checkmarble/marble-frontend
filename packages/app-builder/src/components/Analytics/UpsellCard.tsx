import { useTranslation } from 'react-i18next';
import { CtaClassName, cn } from 'ui-design-system';
import { Icon } from 'ui-icons';

interface UpsellCardProps {
  title: string;
  description: string;
  benefits?: string[];
  className?: string;
}

export function UpsellCard({ title, description, benefits = [], className }: UpsellCardProps) {
  const { t } = useTranslation(['cases', 'common']);

  return (
    <div
      className={cn(
        'bg-surface-card border-purple-border flex flex-col items-center gap-v2-md rounded-v2-lg border-2 border-dashed p-v2-lg text-center',
        className,
      )}
    >
      <div className="bg-purple-background-light text-purple-primary flex size-12 items-center justify-center rounded-full">
        <Icon icon="lock" className="size-6" />
      </div>

      <div className="flex flex-col items-center gap-v2-xs">
        <h3 className="text-h3 font-semibold">{title}</h3>
        <p className="text-s text-grey-secondary max-w-md">{description}</p>
      </div>

      {benefits.length > 0 ? (
        <ul className="text-s text-grey-primary flex flex-col items-start gap-v2-xs">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-center gap-v2-xs">
              <Icon icon="tick" className="text-purple-primary size-4 shrink-0" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <a
        className={CtaClassName({ variant: 'primary', color: 'purple' })}
        href="https://checkmarble.com/upgrade"
        target="_blank"
        rel="noreferrer"
      >
        {t('common:upgrade')}
      </a>
    </div>
  );
}
