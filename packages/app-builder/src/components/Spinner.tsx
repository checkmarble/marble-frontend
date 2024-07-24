import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Icon, type IconName } from 'ui-icons';

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

export function LoadingIcon({
  className,
  loading,
  icon,
}: {
  className?: string;
  icon: IconName;
  loading: boolean;
}) {
  return loading ? (
    <Spinner className={className} />
  ) : (
    <Icon icon={icon} className={className} />
  );
}
