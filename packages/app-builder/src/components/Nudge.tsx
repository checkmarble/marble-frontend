import { HoverCard, HoverCardContent, HoverCardPortal, HoverCardTrigger } from '@radix-ui/react-hover-card';
import { cva } from 'class-variance-authority';
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
  collapsed?: boolean;
};

const triggerClassName = cva('flex items-center justify-center text-white ', {
  variants: {
    kind: {
      test: 'bg-purple-65',
      restricted: 'bg-purple-82',
      missing_configuration: 'bg-yellow-50',
    },
    collapsed: {
      true: 'absolute top-v2-sm right-v2-sm translate-x-[50%] -translate-y-[50%] rounded-full',
      false: 'rounded-sm size-6',
    },
  },
  defaultVariants: {
    collapsed: false,
  },
});

const iconClassName = cva('', {
  variants: {
    collapsed: {
      true: 'size-2.5',
      false: 'size-3',
    },
  },
  defaultVariants: {
    collapsed: false,
  },
});

export const Nudge = ({ content, link, className, kind = 'restricted', iconClass, collapsed = false }: NudgeProps) => {
  const { t } = useTranslation(['common']);
  return (
    <HoverCard>
      <HoverCardTrigger tabIndex={-1} asChild>
        <span className={triggerClassName({ kind, collapsed, className })}>
          <Icon
            icon={match<typeof kind, IconName>(kind)
              .with('restricted', () => 'lock')
              .with('test', () => 'unlock-right')
              .with('missing_configuration', () => 'warning')
              .exhaustive()}
            className={iconClassName({ collapsed, className: iconClass })}
            aria-hidden
          />
        </span>
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
          onClick={(e) => e.stopPropagation()}
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
