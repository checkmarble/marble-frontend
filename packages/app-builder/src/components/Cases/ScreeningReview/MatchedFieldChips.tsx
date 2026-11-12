import type { DataModel } from '@app-builder/models/data-model';
import {
  compareScreeningReviewFields,
  type ScreeningReviewItem,
  screeningReviewChipFields,
} from '@app-builder/models/screening-review';
import { useDataModelQuery } from '@app-builder/queries/data/get-data-model';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Tag } from 'ui-design-system';

export type MappedProperties = (objectType: string) => readonly string[] | undefined;

/** FTM properties mapped on each table, so the comparison follows the screening configuration. */
export function useMappedProperties(): MappedProperties {
  const dataModelQuery = useDataModelQuery();
  const byTable = useMemo(() => mappedPropertiesByTable(dataModelQuery.data?.dataModel), [dataModelQuery.data]);
  return (objectType) => byTable.get(objectType);
}

function mappedPropertiesByTable(dataModel: DataModel | undefined) {
  return new Map(
    (dataModel ?? []).flatMap((table) => {
      const properties = table.fields.flatMap((field) => (field.ftmProperty ? [field.ftmProperty] : []));
      return table.ftmEntity && properties.length ? [[table.name, properties] as const] : [];
    }),
  );
}

export function MatchedFieldChips({
  item,
  mappedProperties,
}: {
  item: ScreeningReviewItem;
  mappedProperties: MappedProperties;
}) {
  const { t } = useTranslation(['cases']);
  const fields = screeningReviewChipFields(
    compareScreeningReviewFields(item, mappedProperties(item.customer.objectType)),
  );
  if (!fields.length) return null;
  return (
    <span className="flex flex-wrap gap-xs">
      {fields.map((field) => (
        <Tag
          key={field}
          size="xs"
          className="h-5 px-sm"
          color="red"
          title={t(`cases:screening_review.matched_field.${field}_description`)}
        >
          {t(`cases:screening_review.matched_field.${field}`)}
        </Tag>
      ))}
    </span>
  );
}
