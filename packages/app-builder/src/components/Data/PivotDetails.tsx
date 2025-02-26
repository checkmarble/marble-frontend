import { type Pivot } from '@app-builder/models/data-model';
import { getPivotDisplayValue } from '@app-builder/services/data/pivot';
import { useTranslation } from 'react-i18next';
import { Tag } from 'ui-design-system';

import { dataI18n } from './data-i18n';

export function PivotDetails({ pivot }: { pivot: Pivot }) {
  const { t } = useTranslation(dataI18n);

  if (pivot.type === 'field') {
    return (
      <div className="grid grid-cols-[max-content_max-content] items-center gap-x-6 gap-y-4">
        <span className="text-grey-50 text-s">{t('data:view_pivot.type')}</span>
        <PivotType type="field" />

        <span className="text-grey-50 text-s">{t('data:view_pivot.table')}</span>
        <span className="text-m text-grey-00">{pivot.baseTable}</span>

        <span className="text-grey-50 text-s">{t('data:view_pivot.definition')}</span>
        <span>{getPivotDisplayValue(pivot)}</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[max-content_max-content] items-center gap-x-6 gap-y-4">
      <span className="text-grey-50 text-s">{t('data:view_pivot.type')}</span>
      <PivotType type="link" />

      <span className="text-grey-50 text-s">{t('data:view_pivot.table')}</span>
      <span className="text-m text-grey-00">
        {pivot.baseTable}→{pivot.pivotTable}
      </span>

      <span className="text-grey-50 text-s">{t('data:view_pivot.definition')}</span>
      <span>{getPivotDisplayValue(pivot)}</span>
    </div>
  );
}

export function PivotType({ type }: { type: 'field' | 'link' }) {
  return (
    <Tag
      size="small"
      border="square"
      color={type === 'field' ? 'grey' : 'purple'}
      className="w-fit"
    >
      {type}
    </Tag>
  );
}
