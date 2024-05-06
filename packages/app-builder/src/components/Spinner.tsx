import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

interface SpinnerProps {
  className?: string;
}

export function Spinner({ className }: SpinnerProps) {
  const { t } = useTranslation(['common']);
  return (
    <div role="status">
      <div
        aria-hidden
        className={clsx(
          'border-purple-25 box-border shrink-0 animate-spin rounded-full border-2 border-solid border-r-purple-100',
          className,
        )}
      />
      <span className="sr-only">{t('common:loading')}</span>
    </div>
  );
}
