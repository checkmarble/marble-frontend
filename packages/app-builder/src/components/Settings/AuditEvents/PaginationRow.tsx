import { type FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { PaginationRow as SharedPaginationRow } from '../PaginationRow';

type PaginationRowProps = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  currentLimit: number;
  onNextPage: () => void;
  onPreviousPage: () => void;
  setLimit: (limit: number) => void;
  className?: string;
};

export const PaginationRow: FunctionComponent<PaginationRowProps> = (props) => {
  const { t } = useTranslation(['settings']);

  return <SharedPaginationRow {...props} perPageLabel={t('settings:audit.pagination.per_page')} />;
};
