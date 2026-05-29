import { SCREENING_CATEGORY_COLORS, type ScreeningCategory } from '@app-builder/models/screening';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Tag } from 'ui-design-system';

export const DatasetTag = ({ category }: { category: ScreeningCategory }) => {
  const { getLaTagLabel } = useDatasetTag();
  return <Tag color={SCREENING_CATEGORY_COLORS[category]}>{getLaTagLabel(category)}</Tag>;
};

export function useDatasetTag() {
  const { t } = useTranslation(['scenarios']);

  function getLaTagLabel(category: ScreeningCategory) {
    return match(category)
      .with('peps', () => t(`scenarios:sanction.lists.peps`))
      .with('third-parties', () => t(`scenarios:sanction.lists.third_parties`))
      .with('sanctions', () => t(`scenarios:sanction.lists.sanctions`))
      .with('adverse-media', () => t(`scenarios:sanction.lists.adverse_media`))
      .with('global', () => t(`scenarios:sanction.lists.global`))
      .otherwise(() => t(`scenarios:sanction.lists.other`));
  }

  return { getLaTagLabel };
}
