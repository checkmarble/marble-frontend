import {
  DateBirthdateComponent,
  StringCountryComponent,
} from '@app-builder/components/Data/DataVisualisation/DataField';
import { findDatasetByName, useDatasetTitle } from '@app-builder/components/ListAndTopicConfiguration/dataset-utils';
import { HighlightText } from '@app-builder/components/Screenings/HighlightText';
import { screeningsI18n } from '@app-builder/components/Screenings/screenings-i18n';
import { type AvailableFeatures } from '@app-builder/models/screening';
import { useListConfigQuery } from '@app-builder/queries/screening/lists-config';
import { getDateFnsLocale } from '@app-builder/services/i18n/i18n-config';
import { useFormatLanguage } from '@app-builder/utils/format';
import { formatDuration as dateFnsFormatDuration } from 'date-fns/formatDuration';
import { useTranslation } from 'react-i18next';
import { cn, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import {
  type AddressEntity,
  type BirthDateRange,
  classifyBirthDate,
  detectNativeScript,
  formatBirthDateRange,
  getAgeYears,
  getBirthDateRange,
} from './match-card-utility-functions';

type EntityDatasetsListProps = {
  datasets: string[];
  useCase: AvailableFeatures;
  listClassName?: string;
  itemClassName?: string;
};

export function EntityDatasetsList({ datasets, useCase, listClassName, itemClassName }: EntityDatasetsListProps) {
  const listConfigQuery = useListConfigQuery(useCase);
  const { formatItemName } = useDatasetTitle();

  return (
    <ul className={listClassName}>
      {datasets.map((name, index) => {
        const found = findDatasetByName(listConfigQuery.data?.filters, name);
        const label = found ? formatItemName(found) : name;
        return (
          <li className={itemClassName} key={`dataset-${name}-${index}`}>
            {label}
          </li>
        );
      })}
    </ul>
  );
}

export function ParseAlias({ value, highlightText }: { value: string; highlightText?: string }) {
  const language = useFormatLanguage();
  const { t } = useTranslation(screeningsI18n);
  const script = detectNativeScript(value, language);

  return (
    <li className="flex items-center gap-v2-sm">
      {script ? (
        <Tag color="white" size="small" appearance="monospace">
          {t('screenings:entity.property.native_script', { script })}
        </Tag>
      ) : null}
      <HighlightText text={value} highlight={highlightText} />
    </li>
  );
}

export function ParseAddress({ address }: { address: AddressEntity }) {
  const { t } = useTranslation(screeningsI18n);
  const notesLabel =
    address.properties.notes ??
    t('screenings:entity.property.address.notes.associated', { defaultValue: 'Associated' });
  const cityLabel = [address.properties.postalCode, address.properties.city].filter(Boolean).join(' ').trim();

  const segments = [
    <Tag key="notes" color="white" size="small" appearance="monospace">
      {notesLabel}
    </Tag>,
    address.properties.street ? <span key="street">{address.properties.street}</span> : null,
    cityLabel ? <span key="city">{cityLabel}</span> : null,
    address.properties.country
      ? StringCountryComponent({ value: address.properties.country, withCountryName: true })
      : null,
  ].filter((segment): segment is NonNullable<typeof segment> => segment !== null);

  return (
    <li className="flex items-center">
      <IconDot dark spaced />
      {segments.map((segment, index) => (
        <div key={index} className="flex items-center gap-v2-sm me-v2-sm">
          {segment}
          {index < segments.length - 1 ? <IconDot /> : null}
        </div>
      ))}
    </li>
  );
}

export function IconDot({ dark, spaced }: { dark?: boolean; spaced?: boolean }) {
  return (
    <Icon
      icon="dot"
      className={cn(
        'text-grey-border size-1.5 shrink-0 inline-block',
        dark && 'text-grey-secondary opacity-100',
        spaced && 'mx-v2-sm',
        dark && spaced && 'ms-0',
      )}
    />
  );
}

function ApproximativeAge({ ageYears, range }: { ageYears: number; range: BirthDateRange | null }) {
  const language = useFormatLanguage();
  const { t } = useTranslation(screeningsI18n);
  const formatted = dateFnsFormatDuration(
    { years: Math.max(0, Math.round(ageYears)) },
    { locale: getDateFnsLocale(language) },
  );
  const rangeLabel = range ? formatBirthDateRange(range, language, t) : null;

  return (
    <span className="inline-flex items-center gap-1">
      <span className="text-grey-secondary text-xs">
        ~{formatted}
        {rangeLabel ? ` ${rangeLabel}` : null}
      </span>
    </span>
  );
}

export function BirthdDateAverage({ values }: { values: string[] }) {
  const classified = values
    .map((value) => ({ value, kind: classifyBirthDate(value) }))
    .filter(
      (entry): entry is { value: string; kind: NonNullable<ReturnType<typeof classifyBirthDate>> } =>
        entry.kind !== null,
    );

  if (classified.length === 0) {
    const fallback = values[0];
    return fallback ? DateBirthdateComponent({ value: fallback }) : null;
  }

  if (classified.length === 1) {
    const entry = classified[0]!;
    if (entry.kind === 'full') {
      return DateBirthdateComponent({ value: entry.value });
    }
    return <ApproximativeAge ageYears={getAgeYears(entry.value, entry.kind)} range={null} />;
  }

  const averageAge = classified.reduce((sum, { value, kind }) => sum + getAgeYears(value, kind), 0) / classified.length;

  return <ApproximativeAge ageYears={averageAge} range={getBirthDateRange(classified)} />;
}
