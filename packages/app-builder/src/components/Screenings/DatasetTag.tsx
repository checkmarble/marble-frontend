import { SCREENING_CATEGORY_COLORS, type ScreeningCategory } from '@app-builder/models/screening';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Tag } from 'ui-design-system';

export const DatasetTag = ({ category }: { category: ScreeningCategory }) => {
  const { t } = useTranslation(['scenarios']);

  return (
    <Tag color={SCREENING_CATEGORY_COLORS[category]}>
      {match(category)
        .with('peps', () => t(`scenarios:sanction.lists.peps`))
        .with('third-parties', () => t(`scenarios:sanction.lists.third_parties`))
        .with('sanctions', () => t(`scenarios:sanction.lists.sanctions`))
        .with('adverse-media', () => t(`scenarios:sanction.lists.adverse_media`))
        .otherwise(() => t(`scenarios:sanction.lists.other`))}
    </Tag>
  );
};
