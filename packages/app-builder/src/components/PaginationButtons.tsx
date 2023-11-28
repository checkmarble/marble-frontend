import { useTranslation } from 'react-i18next';
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

type ItemListWithId = {
  id: string;
}[];

export const PaginationButtons = ({
  items,
  total,
  startIndex,
  endIndex,
  navigate,
}: {
  items: ItemListWithId;
  total: number;
  startIndex: number;
  endIndex: number;
  navigate: (paginationParams: PaginationParams) => void;
}) => {
  const { t } = useTranslation(['common']);
  const start = Math.min(startIndex, endIndex);
  const end = Math.max(startIndex, endIndex);

  const fetchPrevious = () => {
    const pagination: PaginationParams = {
      previous: true,
      offsetId: items[0].id,
    };
    navigate(pagination);
  };

  const fetchNext = () => {
    const pagination: PaginationParams = {
      next: true,
      offsetId: items[items.length - 1].id,
    };
    navigate(pagination);
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <span className="font-semibold">
        {t('common:items_displayed', {
          start,
          end,
        })}
      </span>
      {t('common:items_total', { total })}
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
