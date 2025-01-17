import { type SanctionCheckMatch } from '@app-builder/utils/faker/case-sanction';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';

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
  const { t } = useTranslation(['cases']);

  return (
    <Tag color={statusTagColors[status]} border="square" onClick={onClick} className={clsx('inline-flex h-8 gap-1', { 'cursor-pointer': !!onClick || !disabled })}>
      {t(`cases:sanctions.match.status.${status}`)}
      {!disabled ? <Icon icon="caret-down" className="size-5" /> : null}
    </Tag>
  );
}
