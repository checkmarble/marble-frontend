import { type Pivot } from '@app-builder/models/data-model';
import { getPivotDisplayValue } from '@app-builder/services/data/pivot';
import Code from 'packages/ui-design-system/src/Code/Code';
import { Trans, useTranslation } from 'react-i18next';

import { dataI18n } from './data-i18n';

export function PivotDetails({ pivot }: { pivot: Pivot }) {
  const { t } = useTranslation(dataI18n);

  return (
    <div className="flex flex-col items-start gap-4">
      <div className="text-wrap">
        <PivotDescription {...{ pivot }} />
      </div>
      <div className="flex flex-row items-center gap-4">
        <span className="text-grey-50 text-s min-w-[90px]">{t('data:view_pivot.table')}</span>
        <span className="text-m text-grey-00">
          {pivot.type === 'link' ? pivot.pivotTable : pivot.baseTable}
        </span>
      </div>
      <div className="flex flex-row items-center gap-4">
        <span className="text-grey-50 text-s min-w-[90px]">{t('data:view_pivot.definition')}</span>
        <span>{getPivotDisplayValue(pivot)}</span>
      </div>
    </div>
  );
}

export function PivotDescription({ pivot }: { pivot: Pivot }) {
  const { t } = useTranslation(dataI18n);
  if (pivot.type === 'link') {
    return (
      <Trans
        i18nKey="data:view_pivot.link.description"
        values={{
          child: pivot.baseTable,
          parent: pivot.pivotTable,
          link: getPivotDisplayValue(pivot),
        }}
        components={{
          Code: <Code />,
        }}
      />
    );
  }

  if (pivot.type === 'field' && pivot.field === 'object_id') {
    return (
      <Trans
        t={t}
        i18nKey="data:view_pivot.self_link.description"
        values={{ table: pivot.baseTable }}
        components={{
          Code: <Code />,
        }}
      />
    );
  }

  return (
    <Trans
      t={t}
      i18nKey="data:view_pivot.field.description"
      values={{ table: pivot.baseTable, field: pivot.field }}
      components={{
        Code: <Code />,
      }}
    />
  );
}
