import {
  Hovercard,
  HovercardAnchor,
  HovercardProvider,
} from '@ariakit/react/hovercard';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

type NudgeProps = {
  content: string;
  className?: string;
  link: string;
};

export const Nudge = ({ content, link, className }: NudgeProps) => {
  const { t } = useTranslation(['scenarios', 'common']);

  return (
    <HovercardProvider showTimeout={0} hideTimeout={0} placement="right">
      <HovercardAnchor
        tabIndex={-1}
        className={clsx(
          'text-grey-00 flex flex-row items-center justify-center rounded bg-purple-50',
          className,
        )}
      >
        <Icon icon="lock" className="size-3.5" aria-hidden />
      </HovercardAnchor>
      <Hovercard
        portal
        gutter={8}
        className="bg-grey-00 flex w-60 flex-col items-center gap-6 rounded border border-purple-50 p-4 shadow-lg"
      >
        <span className="text-m font-bold">{t('common:premium')}</span>
        <div className="flex flex-col items-center gap-2">
          <p className="text-s text-center font-medium">{t(content)}</p>
          <a
            className="text-s text-purple-100 hover:underline"
            target="_blank"
            rel="noreferrer"
            href={link}
          >
            {link}
          </a>
        </div>
        <Button variant="primary" className="mt-4">
          {t('common:upgrade')}
        </Button>
      </Hovercard>
    </HovercardProvider>
  );
};
