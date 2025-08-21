import {
  createPropertyTransformer,
  getSanctionEntityProperties,
  type PropertyForSchema,
  type SanctionCheckEntityProperty,
} from '@app-builder/constants/sanction-check-entity';
import { type OpenSanctionEntity } from '@app-builder/models/sanction-check';
import { useFormatLanguage } from '@app-builder/utils/format';
import { Fragment, type ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { sanctionsI18n } from './sanctions-i18n';

export function EntityProperties<T extends OpenSanctionEntity>({
  entity,
  forcedProperties,
  showUnavailable = false,
  before,
  after,
}: {
  entity: T;
  forcedProperties?: PropertyForSchema<T['schema']>[];
  showUnavailable?: boolean;
  before?: ReactNode;
  after?: ReactNode;
}) {
  const [displayAll, setDisplayAll] = useState<
    Partial<Record<SanctionCheckEntityProperty, boolean>>
  >({});

  const displayProperties = forcedProperties ?? getSanctionEntityProperties(entity.schema);
  const { t, i18n } = useTranslation(sanctionsI18n);
  const language = useFormatLanguage();
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
    .filter((prop) => (showUnavailable ? true : prop.values.length > 0));

  const TransformProperty = useMemo(
    () =>
      createPropertyTransformer({
        language: i18n.language,
        formatLanguage: language,
      }),
    [i18n.language, language],
  );

  const handleShowMore = (prop: string) => {
    setDisplayAll((prev) => ({ ...prev, [prop]: true }));
  };

  return (
    <div className="grid grid-cols-[168px_1fr] gap-2">
      {before}
      {entityPropertyList.map(({ property, values, restItemsCount }) => {
        return (
          <Fragment key={property}>
            <span className="font-bold">
              {t(`sanctions:entity.property.${property}`, {
                defaultValue: property,
              })}
            </span>
            <span className="break-all">
              {values.length > 0 ? (
                <>
                  {values.map((v, i) => (
                    <Fragment key={i}>
                      <TransformProperty property={property} value={v} />
                      {i === values.length - 1 ? null : <span className="mx-1">·</span>}
                    </Fragment>
                  ))}
                  {restItemsCount > 0 ? (
                    <>
                      <span className="mx-1">·</span>
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
                </>
              ) : (
                <span className="text-grey-50">not available</span>
              )}
            </span>
          </Fragment>
        );
      })}
      {after}
    </div>
  );
}
