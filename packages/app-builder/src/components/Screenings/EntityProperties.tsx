import {
  createPropertyTransformer,
  getSanctionEntityProperties,
  IconDot,
  isPropertyListed,
  type PropertyForSchema,
  type ScreeningEntityProperty,
} from '@app-builder/constants/screening-entity';
import { type OpenSanctionEntity } from '@app-builder/models/screening';
import { useFormatLanguage } from '@app-builder/utils/format';
import { Fragment, type ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { screeningsI18n } from './screenings-i18n';

export function EntityProperties<T extends OpenSanctionEntity>({
  entity,
  forcedProperties,
  showUnavailable = false,
  before,
  after,
  highlightText,
}: {
  entity: T;
  forcedProperties?: PropertyForSchema<T['schema']>[];
  showUnavailable?: boolean;
  before?: ReactNode;
  after?: ReactNode;
  highlightText?: string;
}) {
  const [displayAll, setDisplayAll] = useState<Partial<Record<ScreeningEntityProperty, boolean>>>({});

  const displayProperties = forcedProperties ?? getSanctionEntityProperties(entity.schema);
  const { t, i18n } = useTranslation(screeningsI18n);
  const language = useFormatLanguage();
  const entityPropertyList = displayProperties
    .map((property) => {
      const items = entity.properties?.[property] ?? [];
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
        highlightText,
      }),
    [i18n.language, language, highlightText],
  );

  const handleShowMore = (prop: string) => {
    setDisplayAll((prev) => ({ ...prev, [prop]: true }));
  };

  return (
    <div className="grid grid-cols-[146px_1fr] gap-3 text-xs">
      {before}
      {entityPropertyList.map(({ property, values, restItemsCount }) => {
        return (
          <Fragment key={property}>
            <span className="opacity-50">
              {t(`screenings:entity.property.${property}`, {
                defaultValue: property,
              })}
            </span>
            <span className="wrap-break-word">
              {values.length > 0 ? (
                <PropertyContainer property={property}>
                  {values.map((v, i) => (
                    <Fragment key={i}>
                      <TransformProperty property={property} value={v} />
                      {i === values.length - 1 || property === 'address' ? null : <IconDot spaced />}
                    </Fragment>
                  ))}
                  {restItemsCount > 0 ? (
                    <>
                      {isPropertyListed(property) ? null : <IconDot spaced />}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleShowMore(property);
                        }}
                        className="text-purple-primary font-semibold cursor-pointer hover:text-purple-hover"
                      >
                        {t('common:more_remains', { count: restItemsCount })}
                      </button>
                    </>
                  ) : null}
                </PropertyContainer>
              ) : (
                <span className="text-grey-secondary">not available</span>
              )}
            </span>
          </Fragment>
        );
      })}
      {after}
    </div>
  );
}

function PropertyContainer({ property, children }: { property: ScreeningEntityProperty; children: ReactNode }) {
  if (isPropertyListed(property)) return <ul>{children}</ul>;
  return <Fragment>{children}</Fragment>;
}
