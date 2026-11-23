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
  SCREENING_HIT_TYPE_T_KEYS,
  type ScreeningCategory,
  type ScreeningSanctionEntity,
} from '@app-builder/models/screening';
import {
  orderScreeningCategories,
  type ScreeningReviewFieldComparison,
  type ScreeningReviewFieldState,
  type ScreeningReviewItem,
  screeningReviewTopicFamilies,
} from '@app-builder/models/screening-review';
import { useRiskLevelLatestQuery } from '@app-builder/queries/scoring/get-risk-level-latest';
import { useGetScoringSettingsQuery } from '@app-builder/queries/scoring/get-scoring-settings';
import { type ListConfigFilters, useListConfigQuery } from '@app-builder/queries/screening/lists-config';
import { useFormatLanguage } from '@app-builder/utils/format';
import { type ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, cn, Tag, type TagProps, Typo } from 'ui-design-system';

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
  tags?: ReactNode;
  actions?: ReactNode;
}

export function ScreeningReviewHit({ item, comparisons, canViewRiskLevel, tags, actions }: ScreeningReviewHitProps) {
  const { t } = useTranslation(['cases']);
  return (
    <section
      aria-labelledby="screening-review-active-title"
      className="@container/review-hit flex min-h-0 min-w-0 flex-1 flex-col gap-md"
    >
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {item.customer.name} · {item.listRecord.caption || item.listRecord.id}
      </p>
      <div className="flex shrink-0 flex-col gap-xs">
        <div className="flex min-w-0 items-center gap-sm">
          <Typo variant="title2" id="screening-review-active-title" className="min-w-0 truncate">
            <bdi>{item.customer.name}</bdi>
          </Typo>
          <CustomerTypeTag customer={item.customer} />
          <div className="ms-auto flex min-w-0 items-center gap-sm">{tags}</div>
        </div>
        <p className="text-s text-grey-secondary">{t('cases:screening_review.case_name', { name: item.caseName })}</p>
        {actions ? <div className="flex flex-wrap items-center gap-xs">{actions}</div> : null}
      </div>
      {/* The AI history strip of the second iteration goes here, above the identity cards. */}
      <div className="grid shrink-0 grid-cols-1 gap-md @min-[1044px]/review:grid-cols-2">
        <CustomerCard item={item} canViewRiskLevel={canViewRiskLevel} />
        <ListRecordCard item={item} />
      </div>
      {/* Sized by the hit's column, which the list and the docked panel narrow, not by the page. */}
      <Card className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-md @min-[760px]/review-hit:p-lg">
        <div className="flex flex-col gap-lg">
          <ComparisonTable comparisons={comparisons} />
          <AllHitInformation item={item} comparisons={comparisons} />
        </div>
      </Card>
    </section>
  );
}

/** The list record's similarity score to the customer, from Motiva. */
export function SimilarityScore({ score }: { score: number }) {
  const { t } = useTranslation(['cases']);
  return (
    <Tag size="xs" title={t('cases:screening_review.similarity_score')} className="shrink-0 font-semibold tabular-nums">
      <bdi>{Math.round(score * 100)}%</bdi>
    </Tag>
  );
}

export function CustomerTypeTag({ customer }: { customer: ScreeningReviewItem['customer'] }) {
  return <SchemaTag schema={customer.schema} fallback={customer.objectType} />;
}

export function SchemaTag({ schema, fallback }: { schema: string | undefined; fallback?: string }) {
  const { t } = useTranslation(['screenings']);
  const label = schema ? t(`screenings:entity.schema.${schema.toLowerCase()}`, { defaultValue: schema }) : fallback;
  if (!label) return null;
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

// Customer: a grey stripe and source tag. List record: purple.
const IDENTITY_SIDE_CLASSES = {
  customer: { stripe: 'border-l-grey-placeholder', source: 'border-grey-placeholder text-grey-placeholder' },
  list_record: { stripe: 'border-l-purple-primary', source: 'border-purple-primary text-purple-primary' },
};

function IdentityCard({
  side,
  source,
  children,
}: {
  side: keyof typeof IDENTITY_SIDE_CLASSES;
  source: string;
  children: ReactNode;
}) {
  const classes = IDENTITY_SIDE_CLASSES[side];
  return (
    <Card className={cn('flex min-w-0 flex-col gap-sm p-md border-l-3', classes.stripe)}>
      <Tag size="xs" className={cn('h-5 self-start px-sm', classes.source)}>
        {source}
      </Tag>
      {children}
    </Card>
  );
}

function CustomerCard({ item, canViewRiskLevel }: { item: ScreeningReviewItem; canViewRiskLevel: boolean }) {
  const { t } = useTranslation(['cases']);
  return (
    <IdentityCard side="customer" source={t('cases:screening_review.identity_source.customer')}>
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
  const aliases = listRecordAliasCount(item);
  const listTitles = useListRecordListTitles(item.listRecord.datasets ?? []);
  const source =
    listTitles.length === 1
      ? t('cases:screening_review.identity_source.list_record_named', { list: listTitles[0] })
      : t('cases:screening_review.identity_source.list_record');
  return (
    <IdentityCard side="list_record" source={source}>
      <div className="flex min-w-0 flex-wrap items-center gap-sm">
        <Typo variant="subtitle1" className="min-w-0 truncate">
          <bdi>{item.listRecord.caption || item.listRecord.id}</bdi>
        </Typo>
        <ListCategoryTags item={item} />
        <SimilarityScore score={item.score} />
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

function ViaProperty({ property, value }: { property: string; value: string }) {
  const { t } = useTranslation(['cases', 'screenings']);
  const PropertyValue = usePropertyValue();
  return (
    <span className="flex flex-wrap items-center gap-x-xs text-xs text-grey-secondary">
      {t('cases:screening_review.via_property', {
        property: t(`screenings:entity.property.${property}`, { defaultValue: property }),
      })}
      <bdi>
        <PropertyValue property={property} value={value} />
      </bdi>
    </span>
  );
}

// Below 760px, which the hit's column reaches beside the list on 1100–1200px windows, the cells
// and the Match column, which only holds a pill, give their room to the compared values.
const COMPARISON_CELL = 'px-sm py-sm @min-[760px]/review-hit:px-md';

function ComparisonTable({ comparisons }: { comparisons: ScreeningReviewFieldComparison[] }) {
  const { t } = useTranslation(['cases']);
  return (
    <div className="overflow-x-auto rounded-md border border-grey-border">
      <table className="w-full table-fixed text-s">
        <thead className="bg-grey-background-light text-start text-grey-secondary">
          <tr>
            <th scope="col" className={cn('w-1/6 text-start font-normal', COMPARISON_CELL)}>
              {t('cases:screening_review.column.field')}
            </th>
            <th scope="col" className={cn('text-start font-normal', COMPARISON_CELL)}>
              {t('cases:screening_review.customer')}
            </th>
            <th scope="col" className={cn('text-start font-normal', COMPARISON_CELL)}>
              {t('cases:screening_review.list_record')}
            </th>
            <th
              scope="col"
              // A long label, as in French, hyphenates in the narrow column.
              className={cn(
                'w-24 text-start font-normal hyphens-auto wrap-break-word @min-[760px]/review-hit:w-36',
                COMPARISON_CELL,
              )}
            >
              {t('cases:screening_review.column.match')}
            </th>
          </tr>
        </thead>
        <tbody>
          {comparisons.map((comparison) => (
            <tr key={comparison.field} className="border-t border-grey-border align-top">
              <th scope="row" className={cn('text-start font-normal text-grey-secondary', COMPARISON_CELL)}>
                <FieldLabel field={comparison.field} />
              </th>
              <td className={cn('wrap-break-word', COMPARISON_CELL)}>
                <FieldValues field={comparison.field} values={comparison.customerValues} />
              </td>
              <td className={cn('wrap-break-word', COMPARISON_CELL)}>
                <FieldValues field={comparison.field} values={comparison.listRecordValues} />
                {comparison.viaAlias ? (
                  <span className="block text-xs text-grey-secondary">
                    <bdi>{t('cases:screening_review.via_alias', { alias: comparison.viaAlias })}</bdi>
                  </span>
                ) : null}
                {comparison.viaProperty ? <ViaProperty {...comparison.viaProperty} /> : null}
              </td>
              <td className={COMPARISON_CELL}>
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

export function listRecordAliasCount(item: ScreeningReviewItem) {
  const properties = item.listRecord.properties;
  return new Set([...(properties['alias'] ?? []), ...(properties['weakAlias'] ?? [])]).size;
}

/** The titles of the lists that hold the list record. */
export function useListRecordListTitles(datasets: readonly string[]) {
  const listConfigQuery = useListConfigQuery('continuous_monitoring');
  const { formatItemName } = useDatasetTitle();
  return datasets.map((name) =>
    formatItemName({ name, title: findDataset(listConfigQuery.data?.filters, name)?.title }),
  );
}

// The list tags colour adverse media orange, as the hit list's topic dots do.
const LIST_CATEGORY_COLORS: Record<ScreeningCategory, { tag: TagProps['color']; count: string }> = {
  sanctions: { tag: 'red', count: 'bg-red-background-light' },
  peps: { tag: 'blue', count: 'bg-blue-96' },
  'adverse-media': { tag: 'orange', count: 'bg-orange-background-light' },
  'third-parties': { tag: 'grey', count: 'bg-grey-background-light' },
  custom: { tag: 'grey', count: 'bg-grey-background-light' },
  global: { tag: 'green', count: 'bg-green-background-light' },
};
const MAX_LIST_CATEGORY_TAGS = 3;

/** One tag per list type, from its topics and lists, with the number of lists when several hit. */
function ListCategoryTags({ item }: { item: ScreeningReviewItem }) {
  const { t } = useTranslation(['scenarios']);
  const listConfigQuery = useListConfigQuery('continuous_monitoring');
  const listCounts = new Map<ScreeningCategory, number>();
  for (const name of item.listRecord.datasets ?? []) {
    const category = findDataset(listConfigQuery.data?.filters, name)?.category;
    if (category) listCounts.set(category, (listCounts.get(category) ?? 0) + 1);
  }
  const categories = orderScreeningCategories([
    ...screeningReviewTopicFamilies(item.topics),
    ...listCounts.keys(),
  ]).slice(0, MAX_LIST_CATEGORY_TAGS);
  return categories.map((category) => {
    const count = listCounts.get(category) ?? 0;
    return (
      <Tag key={category} size="xs" color={LIST_CATEGORY_COLORS[category].tag} className="h-5 shrink-0 px-sm">
        {t(SCREENING_HIT_TYPE_T_KEYS[category])}
        {count > 1 ? (
          <span
            className={cn(
              'flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-2xs font-semibold',
              LIST_CATEGORY_COLORS[category].count,
            )}
          >
            {count}
          </span>
        ) : null}
      </Tag>
    );
  });
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
          <Tag
            key={name}
            size="xs"
            color={found ? LIST_CATEGORY_COLORS[found.category].tag : 'grey'}
            className="h-5 px-sm"
          >
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
