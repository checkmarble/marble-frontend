import {
  IconDot,
  ParseAddress,
  ParseAlias,
} from '@app-builder/components/Screenings/MatchCard/match-card-entity-components';
import {
  type AddressEntity,
  mergeAddresses,
} from '@app-builder/components/Screenings/MatchCard/match-card-utility-functions';
import {
  BirthdDateAverage,
  createPropertyTransformer,
  getSanctionEntityProperties,
  isPropertyListed,
  isScriptTaggedProperty,
  type PropertyForSchema,
  type ScreeningEntityProperty,
} from '@app-builder/constants/screening-entity';
import { type OpenSanctionEntity } from '@app-builder/models/screening';
import { useFormatLanguage } from '@app-builder/utils/format';
import { Fragment, type ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { screeningsI18n } from './screenings-i18n';

type PropertyRow = {
  property: ScreeningEntityProperty;
  values: string[] | AddressEntity[];
  restItemsCount: number;
  isAddress?: boolean;
};

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

  const entityPropertyList = useMemo(() => {
    const rows: PropertyRow[] = displayProperties.map((property) => {
      const items = entity.properties?.[property] ?? [];
      const itemsToDisplay = displayAll[property] ? items : items.slice(0, 5);
      return {
        property,
        values: itemsToDisplay,
        restItemsCount: Math.max(0, items.length - itemsToDisplay.length),
      };
    });

    const hasAddress = displayProperties.includes('address');
    const hasAddressEntity = displayProperties.includes('addressEntity');

    if (!hasAddress && !hasAddressEntity) {
      return rows.filter((prop) => (showUnavailable ? true : prop.values.length > 0));
    }

    const addressStrings = (entity.properties?.['address'] ?? []).filter(
      (value): value is string => typeof value === 'string',
    );
    const rawAddressEntities = entity.properties?.['addressEntity'] ?? [];
    const mergedAddresses = mergeAddresses(addressStrings, rawAddressEntities);
    const displayProperty: ScreeningEntityProperty = hasAddress ? 'address' : 'addressEntity';
    const showAllAddresses = displayAll[displayProperty] ?? false;
    const addressesToDisplay = showAllAddresses ? mergedAddresses : mergedAddresses.slice(0, 5);

    const insertAt = displayProperties.findIndex((property) => property === 'address' || property === 'addressEntity');
    const insertPosition =
      insertAt >= 0
        ? displayProperties
            .slice(0, insertAt)
            .filter((property) => property !== 'address' && property !== 'addressEntity').length
        : rows.length;

    const withoutAddressRows = rows.filter((row) => row.property !== 'address' && row.property !== 'addressEntity');

    const mergedRow: PropertyRow = {
      property: displayProperty,
      values: addressesToDisplay,
      restItemsCount: Math.max(0, mergedAddresses.length - addressesToDisplay.length),
      isAddress: true,
    };

    const mergedList = [
      ...withoutAddressRows.slice(0, insertPosition),
      mergedRow,
      ...withoutAddressRows.slice(insertPosition),
    ];

    return mergedList.filter((prop) => (showUnavailable ? true : prop.values.length > 0));
  }, [displayProperties, entity.properties, displayAll, showUnavailable]);

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

  function deduplicationKey(value: string) {
    return value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
  }

  function deduplicatedStrings(values: string[]) {
    const seen = new Set<string>();
    return values.filter((value) => {
      const normalized = deduplicationKey(value);
      if (seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });
  }

  return (
    <div className="grid grid-cols-[146px_1fr] gap-md text-xs">
      {before}
      {entityPropertyList.map(({ property, values, restItemsCount, isAddress }) => {
        return (
          <Fragment key={property}>
            <div className="opacity-50">
              {t(`screenings:entity.property.${property}`, {
                defaultValue: property,
              })}
            </div>
            <div className="wrap-break-word">
              {property === 'birthDate' ? (
                <BirthdDateAverage values={values as string[]} />
              ) : isAddress ? (
                <PropertyContainer property={property}>
                  {(values as AddressEntity[]).map((address, index) => (
                    <ParseAddress key={index} address={address} />
                  ))}
                  {restItemsCount > 0 ? (
                    <li>
                      <Button
                        variant="primary"
                        appearance="link"
                        onClick={(e) => {
                          e.preventDefault();
                          handleShowMore(property);
                        }}
                      >
                        {t('common:more_remains', { count: restItemsCount })}
                      </Button>
                    </li>
                  ) : null}
                </PropertyContainer>
              ) : isScriptTaggedProperty(property) ? (
                <PropertyContainer property={property}>
                  {deduplicatedStrings(values as string[]).map((value, index) => (
                    <ParseAlias key={index} value={value} highlightText={highlightText} />
                  ))}
                  {restItemsCount > 0 ? (
                    <li>
                      <Button
                        variant="primary"
                        appearance="link"
                        onClick={(e) => {
                          e.preventDefault();
                          handleShowMore(property);
                        }}
                      >
                        {t('common:more_remains', { count: restItemsCount })}
                      </Button>
                    </li>
                  ) : null}
                </PropertyContainer>
              ) : values.length > 0 ? (
                <PropertyContainer property={property}>
                  {deduplicatedStrings(values as string[]).map((v, i, deduplicatedValues) => (
                    <Fragment key={i}>
                      <TransformProperty property={property} value={v} />
                      {i === deduplicatedValues.length - 1 || isPropertyListed(property) ? null : <IconDot spaced />}
                    </Fragment>
                  ))}
                  {restItemsCount > 0 ? (
                    <>
                      {isPropertyListed(property) ? null : <IconDot spaced />}
                      <Button
                        variant="primary"
                        appearance="link"
                        onClick={(e) => {
                          e.preventDefault();
                          handleShowMore(property);
                        }}
                      >
                        {t('common:more_remains', { count: restItemsCount })}
                      </Button>
                    </>
                  ) : null}
                </PropertyContainer>
              ) : (
                <span className="text-grey-secondary">{t('screenings:match.not_available')}</span>
              )}
            </div>
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
