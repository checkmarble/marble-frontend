import { SCREENING_CATEGORY_COLORS, type ScreeningCategory } from '@app-builder/models/screening';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { cn } from 'ui-design-system';

export const DatasetTag = ({ category }: { category: ScreeningCategory }) => {
  const { t } = useTranslation(['scenarios']);

  return (
    <span
      className={cn(
        'text-2xs shrink-0 rounded-full px-2 py-[3px] font-medium',
        SCREENING_CATEGORY_COLORS[category] ?? 'bg-grey-95 text-grey-50',
      )}
    >
      {match(category)
        .with('peps', () => t(`scenarios:sanction.lists.peps`))
        .with('third-parties', () => t(`scenarios:sanction.lists.third_parties`))
        .with('sanctions', () => t(`scenarios:sanction.lists.sanctions`))
        .with('adverse-media', () => t(`scenarios:sanction.lists.adverse_media`))
        .otherwise(() => t(`scenarios:sanction.lists.other`))}
    </span>
  );
};
