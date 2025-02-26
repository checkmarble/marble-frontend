import {
  createPropertyTransformer,
  getSanctionEntityProperties,
  type SanctionCheckEntityProperty,
} from '@app-builder/constants/sanction-check-entity';
import { type SanctionCheckMatch } from '@app-builder/models/sanction-check';
import { useFormatLanguage } from '@app-builder/utils/format';
import { Fragment, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { sanctionsI18n } from './sanctions-i18n';

export type MatchDetailsProps = {
  entity: SanctionCheckMatch['payload'];
};

export function MatchDetails({ entity }: MatchDetailsProps) {
  const { t, i18n } = useTranslation(sanctionsI18n);
  const language = useFormatLanguage();
  const [displayAll, setDisplayAll] = useState<
    Partial<Record<SanctionCheckEntityProperty, boolean>>
  >({});

  const TransformProperty = useMemo(
    () =>
      createPropertyTransformer({
        language: i18n.language,
        formatLanguage: language,
      }),
    [i18n.language, language],
  );

  const displayProperties = getSanctionEntityProperties(entity.schema);
  const entityPropertyList = displayProperties
    .map((property) => {
      const items = entity.properties[property] ?? [];
      const itemsToDisplay = displayAll[property] ? items : items.slice(0, 5);
      return {
        property,
        values: itemsToDisplay,
        restItemsCount: Math.max(0, items.length - itemsToDisplay.length),
      };
    })
    .filter((prop) => prop.values.length > 0);

  const handleShowMore = (prop: string) => {
    setDisplayAll((prev) => ({ ...prev, [prop]: true }));
  };

  return (
    <div className="grid grid-cols-[168px,_1fr] gap-2">
      {entityPropertyList.map(({ property, values, restItemsCount }) => {
        return (
          <Fragment key={property}>
            <span className="font-bold">{t(`sanctions:entity.property.${property}`)}</span>
            <span className="flex flex-wrap gap-1">
              {values.map((v, i) => (
                <Fragment key={i}>
                  <TransformProperty property={property} value={v} />
                  {i === values.length - 1 ? null : <span>·</span>}
                </Fragment>
              ))}
              {restItemsCount > 0 ? (
                <>
                  <span>·</span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleShowMore(property);
                    }}
                    className="text-purple-65 font-semibold"
                  >
                    + {restItemsCount} more
                  </button>
                </>
              ) : null}
            </span>
          </Fragment>
        );
      })}
    </div>
  );
}
