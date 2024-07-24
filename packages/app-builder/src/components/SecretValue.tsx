import clsx from 'clsx';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

interface SecretValueProps {
  value: string;
  className?: string;
}

export function SecretValue({ value, className }: SecretValueProps) {
  const [show, setShow] = React.useState(false);

  const toggleShow = () => {
    setShow((prev) => !prev);
  };

  const { t } = useTranslation(['common']);

  return (
    <div className="flex items-center gap-2">
      <button onClick={toggleShow}>
        <Icon
          icon={show ? 'visibility' : 'visibility_off'}
          className="size-4"
        />
        <span className="sr-only">
          {show ? t('common:hide') : t('common:show')}
        </span>
      </button>
      <span className={clsx('', className)}>
        {show ? value : '*'.repeat(value.length)}
      </span>
    </div>
  );
}
