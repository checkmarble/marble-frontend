import { Hovercard, HovercardAnchor, HovercardProvider } from '@ariakit/react/hovercard';
import clsx from 'clsx';
import { type FeatureAccessDto } from 'marble-api/generated/license-api';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { cn, CtaClassName } from 'ui-design-system';
import { Icon, type IconName } from 'ui-icons';

type NudgeProps = {
  content: string;
  className?: string;
  link?: string;
  kind?: Exclude<FeatureAccessDto, 'allowed'>;
};

export const Nudge = ({ content, link, className, kind = 'restricted' }: NudgeProps) => {
  const { t } = useTranslation(['common']);

  return (
    <HovercardProvider showTimeout={0} hideTimeout={0} placement="right">
      <HovercardAnchor
        tabIndex={-1}
        className={clsx(
          'text-grey-100 flex flex-row items-center justify-center rounded',
          { 'bg-purple-65': kind === 'test' },
          { 'bg-purple-82': kind === 'restricted' },
          { 'bg-yellow-50': kind === 'missing_configuration' },
          className,
        )}
        render={<div />}
      >
        <Icon
          icon={match<typeof kind, IconName>(kind)
            .with('restricted', () => 'lock')
            .with('test', () => 'unlock-right')
            .with('missing_configuration', () => 'warning')
            .exhaustive()}
          className="size-3.5"
          aria-hidden
        />
      </HovercardAnchor>
      <Hovercard
        portal
        gutter={8}
        className={cn(
          'bg-grey-100 z-50 flex w-60 flex-col items-center gap-6 rounded border p-4 shadow-lg',
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
              className: 'mt-4',
            })}
            href="https://checkmarble.com/upgrade"
            target="_blank"
            rel="noreferrer"
          >
            {t('common:upgrade')}
          </a>
        ) : null}
      </Hovercard>
    </HovercardProvider>
  );
};
