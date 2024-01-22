import {
  type PaginatedResponse,
  type PaginationParams,
} from '@app-builder/models/pagination';
import { Trans, useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

export const paginationSchema = z.object({
  offsetId: z.string().optional(),
  next: z.coerce.boolean().optional(),
  previous: z.coerce.boolean().optional(),
  limit: z.number().optional(),
  order: z.enum(['ASC', 'DESC']).optional(),
  sorting: z.enum(['created_at']).optional(),
});

type ItemWithId = {
  id: string;
};

type PaginationsButtonsProps = PaginatedResponse<ItemWithId> & {
  onPaginationChange: (paginationParams: PaginationParams) => void;
};

export const PaginationButtons = ({
  items,
  totalCount: { value: total, isMaxCount },
  startIndex,
  endIndex,
  onPaginationChange,
}: PaginationsButtonsProps) => {
  const { t } = useTranslation(['common']);
  const start = Math.min(startIndex, endIndex);
  const end = Math.max(startIndex, endIndex);

  const fetchPrevious = () => {
    const pagination: PaginationParams = {
      previous: true,
      offsetId: items[0].id,
    };
    onPaginationChange(pagination);
  };

  const fetchNext = () => {
    const pagination: PaginationParams = {
      next: true,
      offsetId: items[items.length - 1].id,
    };
    onPaginationChange(pagination);
  };

  const nextDisabled = end === total && !isMaxCount;
  return (
    <div className="flex items-center justify-end gap-2">
      {isMaxCount ? (
        <Trans
          t={t}
          i18nKey="common:items_displayed_out_of_total_over_max"
          components={{ StartToEnd: <span style={{ fontWeight: 'bold' }} /> }}
          values={{ start, end, total }}
        />
      ) : (
        <Trans
          t={t}
          i18nKey="common:items_displayed_out_of_total"
          components={{ StartToEnd: <span style={{ fontWeight: 'bold' }} /> }}
          values={{ start, end, total }}
        />
      )}

      <Button
        onClick={fetchPrevious}
        variant="secondary"
        disabled={start === 1}
      >
        <Icon icon="arrow-left" className="size-4" />
      </Button>
      <Button onClick={fetchNext} variant="secondary" disabled={nextDisabled}>
        <Icon icon="arrow-right" className="size-4" />
      </Button>
    </div>
  );
};
