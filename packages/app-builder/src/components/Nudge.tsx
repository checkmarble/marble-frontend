import {
  HoverCard,
  HoverCardContent,
  HoverCardPortal,
  HoverCardTrigger,
} from '@radix-ui/react-hover-card';
import { type FeatureAccessLevelDto } from 'marble-api/generated/feature-access-api';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { CtaClassName, cn } from 'ui-design-system';
import { Icon, type IconName } from 'ui-icons';

type NudgeProps = {
  content: string;
  className?: string;
  iconClass?: string;
  link?: string;
  kind?: Exclude<FeatureAccessLevelDto, 'allowed'>;
};

export const Nudge = ({ content, link, className, kind = 'restricted', iconClass }: NudgeProps) => {
  const { t } = useTranslation(['common']);

  return (
    <HoverCard>
      <HoverCardTrigger
        tabIndex={-1}
        className={cn(
          'text-grey-100 flex flex-row items-center justify-center rounded-sm',
          { 'bg-purple-65': kind === 'test' },
          { 'bg-purple-82': kind === 'restricted' },
          { 'bg-yellow-50': kind === 'missing_configuration' },
          className,
        )}
      >
        <Icon
          icon={match<typeof kind, IconName>(kind)
            .with('restricted', () => 'lock')
            .with('test', () => 'unlock-right')
            .with('missing_configuration', () => 'warning')
            .exhaustive()}
          className={cn('size-3.5', iconClass)}
          aria-hidden
        />
      </HoverCardTrigger>
      <HoverCardPortal>
        <HoverCardContent
          side="right"
          align="start"
          sideOffset={8}
          alignOffset={-8}
          className={cn(
            'bg-grey-100 z-50 flex w-60 flex-col items-center gap-6 rounded-sm border p-4 pointer-events-auto shadow-lg',
            {
              'border-purple-82': kind !== 'missing_configuration',
              'border-yellow-50': kind === 'missing_configuration',
            },
          )}
        >
          <span className="text-m font-bold">
            {match<typeof kind, string>(kind)
              .with('missing_configuration', () => t('common:missing_configuration_title'))
              .otherwise(() => t('common:premium'))}
          </span>
          <div className="flex w-full flex-col items-center gap-2">
            <p className="text-s w-full text-center font-medium">
              {match<typeof kind, string>(kind)
                .with('missing_configuration', () => t('common:missing_configuration'))
                .otherwise(() => content)}
            </p>
            {link ? (
              <a
                className="text-s text-purple-65 inline-block w-full text-center hover:underline"
                target="_blank"
                rel="noreferrer"
                href={link}
              >
                {t('common:check_on_docs')}
              </a>
            ) : null}
          </div>
          {kind !== 'missing_configuration' ? (
            <a
              className={CtaClassName({
                variant: 'primary',
                color: 'purple',
                className: 'mt-4 text-center',
              })}
              href="https://checkmarble.com/upgrade"
              target="_blank"
              rel="noreferrer"
            >
              {t('common:upgrade')}
            </a>
          ) : null}
        </HoverCardContent>
      </HoverCardPortal>
    </HoverCard>
  );
};
