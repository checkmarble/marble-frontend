import { Trans, useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { ArrowLeft, ArrowRight } from 'ui-icons';
import { z } from 'zod';

export const paginationSchema = z.object({
  offsetId: z.string().optional(),
  next: z.coerce.boolean().optional(),
  previous: z.coerce.boolean().optional(),
  limit: z.number().optional(),
  order: z.enum(['ASC', 'DESC']).optional(),
  sorting: z.enum(['created_at']).optional(),
});

export type PaginationParams = {
  next?: true | false;
  previous?: true | false;
  offsetId: string;
  order?: 'ASC' | 'DESC';
  sorting?: 'created_at';
  limit?: number;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  startIndex: number;
  endIndex: number;
};

type ItemWithId = {
  id: string;
};

type PaginationsButtonsProps = PaginatedResponse<ItemWithId> & {
  onPaginationChange: (paginationParams: PaginationParams) => void;
};

export const PaginationButtons = ({
  items,
  total,
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

  return (
    <div className="flex items-center justify-end gap-2">
      <Trans
        t={t}
        i18nKey="common:items_displayed_out_of_total"
        components={{ StartToEnd: <span style={{ fontWeight: 'bold' }} /> }}
        values={{ start, end, total }}
      />
      <Button
        onClick={fetchPrevious}
        variant="secondary"
        disabled={start === 1}
      >
        <ArrowLeft />
      </Button>
      <Button onClick={fetchNext} variant="secondary" disabled={end === total}>
        <ArrowRight />
      </Button>
    </div>
  );
};
