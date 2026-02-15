import { useGetCopyToClipboard } from '@app-builder/utils/use-get-copy-to-clipboard';
import clsx from 'clsx';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

interface SecretValueProps {
  value: string;
  alwaysVisible?: boolean;
  className?: string;
}

export function SecretValue({ value, alwaysVisible, className }: SecretValueProps) {
  const [show, setShow] = React.useState(false);
  const visible = alwaysVisible || show;

  const { t } = useTranslation(['common']);
  const getCopyToClipboardProps = useGetCopyToClipboard();

  return (
    <div className="flex min-w-0 items-center gap-2">
      {!alwaysVisible ? (
        <button className="shrink-0" onClick={() => setShow((prev) => !prev)}>
          <Icon icon={visible ? 'visibility' : 'visibility_off'} className="size-4" />
          <span className="sr-only">{visible ? t('common:hide') : t('common:show')}</span>
        </button>
      ) : null}
      <span className={clsx('truncate font-mono text-xs', className)}>
        {visible ? value : '••••••••••••••••••••••••'}
      </span>
      {visible ? (
        <button className="shrink-0" {...getCopyToClipboardProps(value)}>
          <Icon icon="copy" className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
