import { Hovercard, HovercardAnchor, HovercardProvider } from '@ariakit/react/hovercard';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { CtaClassName } from 'ui-design-system';
import { Icon } from 'ui-icons';

type NudgeProps = {
  content: string;
  className?: string;
  link?: string;
  kind?: 'test' | 'restricted';
};

export const Nudge = ({ content, link, className, kind = 'restricted' }: NudgeProps) => {
  const { t } = useTranslation(['scenarios', 'common']);

  return (
    <HovercardProvider showTimeout={0} hideTimeout={0} placement="right">
      <HovercardAnchor
        tabIndex={-1}
        className={clsx(
          'text-grey-100 flex flex-row items-center justify-center rounded',
          { 'bg-purple-65': kind === 'test' },
          { 'bg-purple-82': kind === 'restricted' },
          className,
        )}
      >
        <Icon
          icon={kind === 'restricted' ? 'lock' : 'unlock-right'}
          className="size-3.5"
          aria-hidden
        />
      </HovercardAnchor>
      <Hovercard
        portal
        gutter={8}
        className="bg-grey-100 border-purple-82 z-50 flex w-60 flex-col items-center gap-6 rounded border p-4 shadow-lg"
      >
        <span className="text-m font-bold">{t('common:premium')}</span>
        <div className="flex w-full flex-col items-center gap-2">
          <p className="text-s w-full text-center font-medium">{content}</p>
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
      </Hovercard>
    </HovercardProvider>
  );
};
