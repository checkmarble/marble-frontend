import { TranslationObject } from '@app-builder/types/i18n';
import clsx from 'clsx';
import { useSpinDelay } from 'spin-delay';
import { Icon, type IconName } from 'ui-icons';

interface SpinnerProps {
  className?: string;
  translationObject: TranslationObject<['common']>;
}

export function Spinner({ className, translationObject }: SpinnerProps) {
  const { tCommon } = translationObject;
  return (
    <div role="status">
      <div
        aria-hidden
        className={clsx(
          'border-purple-96 border-r-purple-65 box-border shrink-0 animate-spin rounded-full border-2 border-solid',
          className,
        )}
      />
      <span className="sr-only">{tCommon('loading')}</span>
    </div>
  );
}

export function LoadingIcon({
  className,
  loading,
  icon,
  translationObject,
}: {
  className?: string;
  icon: IconName;
  loading: boolean;
  translationObject: TranslationObject<['common']>;
}) {
  const showSpinner = useSpinDelay(loading);
  return showSpinner ? (
    <Spinner className={className} translationObject={translationObject} />
  ) : (
    <Icon icon={icon} className={className} />
  );
}
