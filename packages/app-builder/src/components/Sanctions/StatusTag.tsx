import { type SanctionCheckMatch } from '@app-builder/models/sanction-check';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { sanctionsI18n } from './sanctions-i18n';

const statusTagColors = {
  pending: 'orange',
  no_hit: 'grey',
  confirmed_hit: 'red',
} as const;

export type StatusTagProps = {
  status: SanctionCheckMatch['status'];
  disabled?: boolean;
  onClick?: () => void;
};

export function StatusTag({ status, disabled, onClick }: StatusTagProps) {
  const { t } = useTranslation(sanctionsI18n);

  return (
    <Tag
      color={statusTagColors[status]}
      border="square"
      onClick={() => !disabled && onClick?.()}
      className={clsx('inline-flex h-8 gap-1', {
        'cursor-pointer': !!onClick && !disabled,
      })}
    >
      {t(`sanctions:match.status.${status}`)}
      {!disabled ? <Icon icon="caret-down" className="size-5" /> : null}
    </Tag>
  );
}
