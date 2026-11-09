import { useDatasetTitle } from '@app-builder/components/ListAndTopicConfiguration/dataset-utils';
import { EntityProperties } from '@app-builder/components/Screenings/EntityProperties';
import { Sanctions } from '@app-builder/components/Screenings/MatchCard/Sanctions';
import { TopicsDisplay } from '@app-builder/components/Screenings/TopicsDisplay';
import { RiskLevelBadge } from '@app-builder/components/UserScoring/RiskLevelBadge';
import {
  BirthdDateAverage,
  createPropertyTransformer,
  isScreeningEntityProperty,
} from '@app-builder/constants/screening-entity';
import { isMaxRiskLevelInRange } from '@app-builder/models/scoring';
import {
  SCREENING_CATEGORY_COLORS,
  type ScreeningCategory,
  type ScreeningSanctionEntity,
} from '@app-builder/models/screening';
import type {
  ScreeningReviewFieldComparison,
  ScreeningReviewFieldState,
  ScreeningReviewItem,
} from '@app-builder/models/screening-review';
import { useRiskLevelLatestQuery } from '@app-builder/queries/scoring/get-risk-level-latest';
import { useGetScoringSettingsQuery } from '@app-builder/queries/scoring/get-scoring-settings';
import { type ListConfigFilters, useListConfigQuery } from '@app-builder/queries/screening/lists-config';
import { useFormatLanguage } from '@app-builder/utils/format';
import { type ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn, Tag, type TagProps, Typo } from 'ui-design-system';

const MAX_VALUES = 3;
const IDENTITY_ID_PROPERTIES = [
  'idNumber',
  'passportNumber',
  'socialSecurityNumber',
  'registrationNumber',
  'imoNumber',
  'mmsi',
];

const STATE_COLORS: Record<ScreeningReviewFieldState, TagProps['color']> = {
  same: 'red',
  close: 'orange',
  different: 'grey',
  missing: 'grey',
};

// Motiva identifier features share one label: they don't say which identifier matched.
const MOTIVA_IDENTIFIER_SIGNALS = new Set([
  'lei_code_match',
  'isin_security_match',
  'ogrn_code_match',
  'inn_code_match',
  'bic_code_match',
  'vessel_imo_mmsi_match',
]);

interface ScreeningReviewHitProps {
  item: ScreeningReviewItem;
  comparisons: ScreeningReviewFieldComparison[];
  canViewRiskLevel: boolean;
}

/** The selected hit: the customer and the list record, compared in the same order whatever the trigger. */
export function ScreeningReviewHit({ item, comparisons, canViewRiskLevel }: ScreeningReviewHitProps) {
  const { t } = useTranslation(['cases']);
  return (
    <section
      aria-labelledby="screening-review-active-title"
      className="flex min-h-0 min-w-0 flex-col gap-md overflow-y-auto"
    >
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {item.customer.name} · {item.listRecord.caption || item.listRecord.id}
      </p>
      <div className="flex flex-col gap-xs">
        <div className="flex min-w-0 items-center gap-sm">
          <Typo variant="title2" id="screening-review-active-title" className="min-w-0 truncate">
            <bdi>{item.customer.name}</bdi>
          </Typo>
          <CustomerTypeTag customer={item.customer} />
        </div>
        <p className="text-s text-grey-secondary">{t('cases:screening_review.case_name', { name: item.caseName })}</p>
      </div>
      {/* The AI history strip of the second iteration goes here, above the identity cards. */}
      <div className="grid grid-cols-1 gap-md lg:grid-cols-2">
        <CustomerCard item={item} canViewRiskLevel={canViewRiskLevel} />
        <ListRecordCard item={item} />
      </div>
      <div className="flex flex-col gap-lg rounded-lg border border-grey-border bg-surface-card p-lg">
        <ComparisonTable comparisons={comparisons} />
        <AllHitInformation item={item} comparisons={comparisons} />
      </div>
    </section>
  );
}

export function CustomerTypeTag({ customer }: { customer: ScreeningReviewItem['customer'] }) {
  const { t } = useTranslation(['screenings']);
  const label = customer.schema
    ? t(`screenings:entity.schema.${customer.schema.toLowerCase()}`, { defaultValue: customer.schema })
    : customer.objectType;
  return (
    <Tag color="white" size="xs" appearance="monospace" className="h-5 shrink-0">
      {label}
    </Tag>
  );
}

function usePropertyValue() {
  const { i18n } = useTranslation();
  const formatLanguage = useFormatLanguage();
  return useMemo(() => {
    const TransformProperty = createPropertyTransformer({ language: i18n.language, formatLanguage });
    return function PropertyValue({ property, value }: { property: string; value: string }) {
      return isScreeningEntityProperty(property) ? <TransformProperty property={property} value={value} /> : value;
    };
  }, [i18n.language, formatLanguage]);
}

function firstValue(properties: Record<string, unknown>, keys: readonly string[]) {
  for (const key of keys) {
    const values = properties[key];
    const value = Array.isArray(values) ? values.find((entry) => typeof entry === 'string' && entry.trim()) : undefined;
    if (typeof value === 'string') return { property: key, value };
  }
  return undefined;
}

/** `DOB · nationality · ID`, skipping missing parts. */
function IdentitySummary({ properties }: { properties: Record<string, unknown> }) {
  const PropertyValue = usePropertyValue();
  const birthDates = Array.isArray(properties['birthDate'])
    ? properties['birthDate'].filter((value): value is string => typeof value === 'string' && !!value.trim())
    : [];
  const nationality = firstValue(properties, ['nationality', 'citizenship']);
  const identifier = firstValue(properties, IDENTITY_ID_PROPERTIES);
  const parts: ReactNode[] = [
    birthDates.length ? <BirthdDateAverage key="birthDate" values={birthDates} /> : null,
    nationality ? <PropertyValue key="nationality" {...nationality} /> : null,
    identifier ? <PropertyValue key="identifier" {...identifier} /> : null,
  ].filter(Boolean);
  if (!parts.length) return null;
  return (
    <p className="flex flex-wrap items-center gap-x-sm gap-y-xs text-s">
      {parts.map((part, index) => (
        <span key={index} className="inline-flex items-center gap-sm">
          {index > 0 ? <span aria-hidden="true">·</span> : null}
          {part}
        </span>
      ))}
    </p>
  );
}

function IdentityCard({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-sm rounded-lg border border-grey-border bg-surface-card p-md">
      <Tag color="grey" size="xs" className="self-start">
        {label}
      </Tag>
      {children}
    </div>
  );
}

function CustomerCard({ item, canViewRiskLevel }: { item: ScreeningReviewItem; canViewRiskLevel: boolean }) {
  const { t } = useTranslation(['cases']);
  return (
    <IdentityCard label={t('cases:screening_review.customer')}>
      <Typo variant="subtitle1" className="min-w-0 truncate">
        <bdi>{item.customer.name}</bdi>
      </Typo>
      <IdentitySummary properties={item.customer.properties} />
      {canViewRiskLevel ? (
        <CustomerRiskLevel objectType={item.customer.objectType} objectId={item.customer.objectId} />
      ) : null}
    </IdentityCard>
  );
}

/** Loads one score for the customer, without blocking the page. Shows nothing without a score. */
function CustomerRiskLevel({ objectType, objectId }: { objectType: string; objectId: string }) {
  const settingsQuery = useGetScoringSettingsQuery();
  const riskLevelQuery = useRiskLevelLatestQuery(objectType, objectId);
  const maxRiskLevel = settingsQuery.data?.settings?.maxRiskLevel;
  const riskLevel = riskLevelQuery.data?.riskLevel;
  if (maxRiskLevel == null || riskLevel == null || !isMaxRiskLevelInRange(maxRiskLevel)) return null;
  return (
    <span className="self-start">
      <RiskLevelBadge riskLevel={riskLevel} maxRiskLevel={maxRiskLevel} />
    </span>
  );
}

function ListRecordCard({ item }: { item: ScreeningReviewItem }) {
  const { t } = useTranslation(['cases']);
  const properties = item.listRecord.properties;
  const aliases = new Set([...(properties['alias'] ?? []), ...(properties['weakAlias'] ?? [])]).size;
  return (
    <IdentityCard label={t('cases:screening_review.list_record')}>
      <div className="flex min-w-0 flex-wrap items-center gap-sm">
        <Typo variant="subtitle1" className="min-w-0 truncate">
          <bdi>{item.listRecord.caption || item.listRecord.id}</bdi>
        </Typo>
        <TopicsDisplay entity={{ id: item.listRecord.id, properties: { topics: item.topics } }} />
        <span className="text-xs text-grey-secondary">{Math.round(item.score * 100)}%</span>
      </div>
      <IdentitySummary properties={properties} />
      <p className="flex flex-wrap gap-x-sm text-xs text-grey-secondary">
        {aliases ? <span>{t('cases:screening_review.aliases_count', { count: aliases })} ·</span> : null}
        <bdi className="font-mono">{item.listRecord.id}</bdi>
      </p>
    </IdentityCard>
  );
}

function FieldLabel({ field }: { field: string }) {
  const { t } = useTranslation(['screenings']);
  return t(`screenings:entity.property.${field}`, { defaultValue: field });
}

function FieldValues({ field, values }: { field: string; values: string[] }) {
  const PropertyValue = usePropertyValue();
  const [expanded, setExpanded] = useState(false);
  if (!values.length) return <span className="text-grey-secondary">—</span>;
  if (field === 'birthDate') return <BirthdDateAverage values={values} />;
  const rest = expanded ? 0 : values.length - MAX_VALUES;
  return (
    <span className="flex flex-wrap items-center gap-x-sm gap-y-xs">
      {(expanded ? values : values.slice(0, MAX_VALUES)).map((value, index) => (
        <span key={value} className="inline-flex items-center gap-sm">
          {index > 0 ? <span aria-hidden="true">·</span> : null}
          <bdi>
            <PropertyValue property={field} value={value} />
          </bdi>
        </span>
      ))}
      {rest > 0 ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="text-grey-secondary underline-offset-2 hover:underline"
        >
          +{rest}
        </button>
      ) : null}
    </span>
  );
}

function StatePill({ comparison }: { comparison: ScreeningReviewFieldComparison }) {
  const { t } = useTranslation(['cases']);
  const { signal } = comparison;
  const source =
    comparison.source === 'motiva' && signal
      ? t('cases:screening_review.source.motiva', {
          signal: t(
            `cases:screening_review.signal.${MOTIVA_IDENTIFIER_SIGNALS.has(signal) ? 'identifier_match' : signal}`,
            { defaultValue: signal },
          ),
        })
      : t('cases:screening_review.source.browser');
  return (
    <Tag
      color={STATE_COLORS[comparison.state]}
      size="xs"
      title={source}
      className={cn(comparison.state === 'missing' && 'border-dashed text-grey-placeholder')}
    >
      {t(`cases:screening_review.state.${comparison.state}`)}
    </Tag>
  );
}

function ComparisonTable({ comparisons }: { comparisons: ScreeningReviewFieldComparison[] }) {
  const { t } = useTranslation(['cases']);
  return (
    <div className="overflow-x-auto rounded-lg border border-grey-border">
      <table className="w-full table-fixed text-s">
        <thead className="bg-grey-background-light text-start text-grey-secondary">
          <tr>
            <th scope="col" className="w-1/6 px-md py-sm text-start font-normal">
              {t('cases:screening_review.column.field')}
            </th>
            <th scope="col" className="px-md py-sm text-start font-normal">
              {t('cases:screening_review.customer')}
            </th>
            <th scope="col" className="px-md py-sm text-start font-normal">
              {t('cases:screening_review.list_record')}
            </th>
            <th scope="col" className="w-28 px-md py-sm text-start font-normal">
              {t('cases:screening_review.column.match')}
            </th>
          </tr>
        </thead>
        <tbody>
          {comparisons.map((comparison) => (
            <tr key={comparison.field} className="border-t border-grey-border align-top">
              <th scope="row" className="px-md py-sm text-start font-normal text-grey-secondary">
                <FieldLabel field={comparison.field} />
              </th>
              <td className="px-md py-sm wrap-break-word">
                <FieldValues field={comparison.field} values={comparison.customerValues} />
              </td>
              <td className="px-md py-sm wrap-break-word">
                <FieldValues field={comparison.field} values={comparison.listRecordValues} />
                {comparison.viaAlias ? (
                  <span className="block text-xs text-grey-secondary">
                    <bdi>{t('cases:screening_review.via_alias', { alias: comparison.viaAlias })}</bdi>
                  </span>
                ) : null}
              </td>
              <td className="px-md py-sm">
                <StatePill comparison={comparison} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function findDataset(filters: ListConfigFilters | undefined, name: string) {
  for (const [category, section] of Object.entries(filters ?? {})) {
    const dataset = section?.datasets?.flatMap((group) => group.datasets).find((entry) => entry.name === name);
    if (dataset) return { category: category as ScreeningCategory, title: dataset.title };
  }
  return undefined;
}

function ListRecordLists({ datasets }: { datasets: string[] }) {
  const listConfigQuery = useListConfigQuery('continuous_monitoring');
  const { formatItemName } = useDatasetTitle();
  if (!datasets.length) return <span className="text-grey-secondary">—</span>;
  return (
    <span className="flex flex-wrap gap-xs">
      {datasets.map((name) => {
        const found = findDataset(listConfigQuery.data?.filters, name);
        return (
          <Tag key={name} size="small" color={found ? SCREENING_CATEGORY_COLORS[found.category] : 'grey'}>
            {formatItemName({ name, title: found?.title })}
          </Tag>
        );
      })}
    </span>
  );
}

/** Tags, Lists, then every list record property the table doesn't already compare. */
function AllHitInformation({
  item,
  comparisons,
}: {
  item: ScreeningReviewItem;
  comparisons: ScreeningReviewFieldComparison[];
}) {
  const { t } = useTranslation(['cases']);
  const compared = new Set(
    comparisons.flatMap(({ field }) => (field === 'nationality' ? ['nationality', 'citizenship'] : [field])),
  );
  // Topics are shown as tags. EntityProperties leaves out the properties it no longer finds.
  const remaining = {
    ...item.listRecord,
    properties: Object.fromEntries(
      Object.entries(item.listRecord.properties).filter(
        ([property]) => !compared.has(property) && property !== 'topics',
      ),
    ),
  };
  const sanctions = (item.listRecord.properties as { sanctions?: ScreeningSanctionEntity[] }).sanctions;
  return (
    <div className="flex flex-col gap-md">
      <Typo variant="subtitle2" as="h3">
        {t('cases:screening_review.all_hit_information')}
      </Typo>
      <EntityProperties
        entity={remaining}
        before={
          <>
            <div className="opacity-50">{t('cases:screening_review.tags')}</div>
            <div>
              <TopicsDisplay entity={{ id: item.listRecord.id, properties: { topics: item.topics } }} />
            </div>
            <div className="opacity-50">{t('cases:screening_review.lists')}</div>
            <div>
              <ListRecordLists datasets={item.listRecord.datasets ?? []} />
            </div>
          </>
        }
      />
      <Sanctions sanctions={sanctions} />
    </div>
  );
}
