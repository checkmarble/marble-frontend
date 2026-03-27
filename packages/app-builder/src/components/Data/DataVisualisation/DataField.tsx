import { CopyToClipboardButton } from '@app-builder/components/CopyToClipboardButton';
import { Spinner } from '@app-builder/components/Spinner';
import { type DataModelField, DataType } from '@app-builder/models';
import { objectDetailsQueryOptions } from '@app-builder/queries/data/get-object-details';
import { formatAge, formatNumber, useFormatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { tryCatch } from '@app-builder/utils/tryCatch';
import { useQuery } from '@tanstack/react-query';
import CountryFlag from 'country-flag-emojis';
import cc from 'currency-codes';
import parsePhoneNumber from 'libphonenumber-js/min';
import { type ComponentType, Fragment, lazy, Suspense, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isNonNullish } from 'remeda';
import { match, P } from 'ts-pattern';
import { cn, Switch } from 'ui-design-system';
import { Icon } from 'ui-icons';
import z from 'zod';
import { SemanticSubType, SemanticSubTypeMap, SemanticType } from '../UploadData/uploadData-types';
import { DataFields } from './DataFields';
import type { MetadataType, VALID_DATA_TYPE } from './data-type';
import { hasMetadataContent, MAP_HEIGHT, parseCoords } from './dataFieldsUtils';
import {
  DataFieldProvider,
  useCurrency,
  useDataField,
  useField,
  useFieldCurrency,
  useFieldMetaData,
  useFieldValue,
  useOptions,
} from './datafield-context';

const MapView = lazy(() => import('./MapView').then((m) => ({ default: m.MapView })));

const codeClassName = 'font-mono border border-grey-border rounded-sm p-1 bg-surface-card';
const subClassName = 'grid gap-1 px-2 py-1 border border-grey-border bg-grey-background-light rounded-lg';

type DataFieldProps = {
  field?: DataModelField;
  value?: string | number | boolean;
  linkedTo?: string;
  metaData?: MetadataType;
  currency?: string;
};

const FIELD_TYPE_COMPONENTS: Record<VALID_DATA_TYPE, ComponentType> = {
  'string-main': StringMain,
  'string-code': StringCode,
  'string-email': StringEmail,
  'string-phone': StringPhone,
  'string-city': StringCity,
  'string-country': StringCountry,
  'string-link': StringLink,
  'string-vpn': StringVpn,
  'string-free': StringFree,
  'string-iban': StringIban,
  'string-currency': StringCurrency,
  'string-id': StringId,
  'date-birthdate': DateBirthdate,
  'date-datetime': DateDatetime,
  'date-date': DateDatetime,
  'date-time': DateDatetime,
  'data-gps_coords': DataGpsCoords,
  'data-ip_address': DataIpAddress,
  'number-integer': NumberInteger,
  'number-float': NumberFloat,
  'number-currency': NumberCurrency,
  'number-percentile': NumberPercentile,
  'enum-key_value': StringFree,
  'enum-colors': StringFree,
  'enum-values': EnumValues,
  'boolean-checkbox': BooleanCheckbox,
  'boolean-yes_no': BooleanYesNo,
};

function RenderFieldComponent({
  fieldType,
  value,
  metaData,
}: {
  fieldType: VALID_DATA_TYPE;
  value: string | number | boolean;
  metaData?: MetadataType;
}) {
  const contextValue = useMemo(() => ({ field: undefined, value, metaData, fieldType }), [value, metaData, fieldType]);
  const Comp = FIELD_TYPE_COMPONENTS[fieldType];
  return (
    <DataFieldProvider value={contextValue}>
      <Comp />
    </DataFieldProvider>
  );
}

export function DataField({ field, value, linkedTo, metaData, currency }: DataFieldProps) {
  const options = useOptions();
  const fieldType = adaptFieldType(field?.dataType, field?.name, field?.semanticType, field?.semanticSubType);
  const resolvedMetaData = options?.hideMetadata ? undefined : metaData;

  const contextValue = useMemo(
    () => ({ field, value, metaData: resolvedMetaData, fieldType, currency }),
    [field, value, resolvedMetaData, fieldType, currency],
  );

  return (
    <DataFieldProvider value={contextValue}>
      <div className="col-span-2 grid grid-cols-subgrid items-start">
        <label htmlFor={field?.id} className="text-grey-secondary">
          {field?.name}
        </label>
        <div id={field?.id}>
          {isNonNullish(value) ? (
            <>{linkedTo ? <LinkToValue value={`${value}`} linkedTo={linkedTo} /> : <FieldRenderer />}</>
          ) : (
            <EmptyValue />
          )}
        </div>
      </div>
    </DataFieldProvider>
  );
}

function FieldRenderer() {
  const { fieldType } = useDataField();
  const Comp = FIELD_TYPE_COMPONENTS[fieldType];
  return <Comp />;
}

/**
 * Adapt field type from old data type to new data type
 * @param field field definition
 * @returns new data type
 */
function adaptFieldType(
  dataType?: DataType | null,
  name?: string,
  semanticType?: SemanticType,
  semanticSubType?: SemanticSubType,
): VALID_DATA_TYPE {
  if (!dataType || !name) return 'string-free';

  if (semanticType) {
    switch (semanticType) {
      case 'account_identifier':
        switch (semanticSubType as SemanticSubTypeMap['account_identifier']) {
          case 'account_number':
          case 'bic':
            return 'string-code';
          case 'iban':
            return 'string-iban';
          default:
            return 'string-free';
        }
      case 'address':
        return 'string-free';
      case 'country':
        return 'string-country';
      case 'creation_date':
      case 'last_update':
      case 'validation_date':
      case 'initiation_date':
      case 'deletion_date':
      case 'timestamp':
        return 'date-datetime';
      case 'date_of_birth':
        return 'date-birthdate';
      case 'unique_id':
        return 'string-id';
      case 'percentage':
        return 'number-percentile';
      case 'monetary_amount':
        return 'number-currency';
      case 'number':
        return 'number-integer';
      case 'enum':
        return 'enum-values';
      case 'link':
        switch (semanticSubType as SemanticSubTypeMap['link']) {
          case 'email':
            return 'string-email';
          case 'phone':
            return 'string-phone';
          case 'url':
            return 'string-link';
          default:
            return 'string-free';
        }
      case 'currency_code':
        return 'string-currency';
      case 'foreign_key':
        return 'string-code';
      case 'name':
        return 'string-main';
      case 'text':
        return 'string-free';
      default:
        return 'string-free';
    }
  }

  switch (dataType) {
    case 'String':
    case 'String[]':
    case 'DerivedData':
    case 'unknown':
      if (/name/i.test(name)) return 'string-main';
      if (/email/i.test(name)) return 'string-email';
      if (/phone/i.test(name)) return 'string-phone';
      if (/city/i.test(name)) return 'string-city';
      if (/country/i.test(name)) return 'string-country';
      if (/_id/i.test(name)) return 'string-id';
      if (/iban/i.test(name)) return 'string-iban';
      if (/currency/i.test(name)) return 'string-currency';
      if (/curr_/i.test(name)) return 'string-currency';
      if (/url/i.test(name)) return 'string-link';
      if (/code/i.test(name)) return 'string-code';
      if (/vpn/i.test(name)) return 'string-vpn';
      if (/status/i.test(name)) return 'enum-values';
      return 'string-free';
    case 'IpAddress':
    case 'IpAddress[]':
      return 'data-ip_address';
    case 'Timestamp':
    case 'Timestamp[]':
      if (/birthdate/i.test(name)) return 'date-birthdate';
      return 'date-datetime';
    case 'Coords':
    case 'Coords[]':
      return 'data-gps_coords';
    case 'Int':
    case 'Int[]':
      return 'number-integer';
    case 'Float':
    case 'Float[]':
      if (/amount/i.test(name)) return 'number-currency';
      return 'number-float';
    case 'Bool':
    case 'Bool[]':
      if (/vpn/i.test(name)) return 'boolean-yes_no';
      return 'boolean-checkbox';
    default:
      throw new Error(`Unhandled data type: ${dataType satisfies never}`);
  }
}

function useStringValue(): string | undefined {
  const value = useFieldValue();
  return value !== undefined && value !== null ? String(value) : undefined;
}

function useNumberValue(): number | undefined {
  const value = useFieldValue();
  if (value === undefined || value === null) return undefined;
  return typeof value === 'number' ? value : Number(value);
}

function useBooleanValue(): boolean | undefined {
  const value = useFieldValue();
  if (value === undefined || value === null) return undefined;
  return typeof value === 'boolean' ? value : value === 'true';
}

function EmptyValue({ className }: { className?: string }) {
  return <span className={className}>{'-'}</span>;
}

function StringMain() {
  const value = useStringValue();
  if (!value) return <EmptyValue />;
  return <span className="font-semibold">{value}</span>;
}

function StringCode() {
  const value = useStringValue();
  if (!value) return <EmptyValue />;
  return <span className={codeClassName}>{value}</span>;
}

function StringEmail() {
  const value = useStringValue();
  if (!value) return <EmptyValue />;
  const isValid = z.email().safeParse(value).success;
  if (!isValid) return <span>{value}</span>;
  return (
    <a className="text-purple-primary" href={`mailto:${value}`}>
      {value}
    </a>
  );
}

function StringPhone() {
  const value = useStringValue();
  if (!value) return <EmptyValue />;
  const phone = parsePhoneNumber(value);
  const strPhone = phone ? phone.formatInternational() : value;
  if (phone) {
    const phoneUri = phone.getURI();
    return (
      <a className="text-purple-primary" href={phoneUri}>
        {strPhone}
      </a>
    );
  }
  return <span>{value}</span>;
}

function StringCity() {
  const value = useStringValue();
  if (!value) return <EmptyValue />;
  return <span>{value}</span>;
}

function StringCountry() {
  const value = useStringValue();
  if (!value) return <EmptyValue />;
  const result = tryCatch(() => CountryFlag.byCountryCode(value.toUpperCase()));
  if (!result.ok) return <span>{value}</span>;
  const country = result.value;
  return (
    <span className="inline-flex items-center gap-1">
      <span>{country.flag}</span>
      <span>{country.nameEnglish}</span>
    </span>
  );
}

function StringLink() {
  const value = useStringValue();
  if (!value) return <EmptyValue />;
  const result = tryCatch(() => new URL(value));
  if (!result.ok || !['http:', 'https:'].includes(result.value.protocol)) return <span>{value}</span>;
  return (
    <a className="text-purple-primary" href={result.value.href}>
      {value}
    </a>
  );
}

function StringVpn() {
  const { t } = useTranslation(['data']);
  const value = useStringValue();
  if (!value) return <span>{t('data:no_vpn')}</span>;
  return (
    <span className={cn(codeClassName, 'flex gap-2 items-center')}>
      <span>{t('data:vpn')}</span>
      <span>{'-'}</span>
      <span>{value}</span>
    </span>
  );
}

function StringId() {
  const value = useStringValue();
  if (!value) return <EmptyValue className={codeClassName} />;
  return (
    <CopyToClipboardButton toCopy={value}>
      <span>{value}</span>
    </CopyToClipboardButton>
  );
}

function StringFree() {
  const value = useStringValue();
  if (!value) return <EmptyValue />;
  return <span>{value}</span>;
}

function DateBirthdate() {
  const value = useStringValue();
  const formatDateTime = useFormatDateTime();
  const language = useFormatLanguage();
  if (value) {
    const date = new Date(value);
    const age = formatAge(date, language);
    return (
      <span className="inline-flex items-center gap-1">
        <span className="text-grey-secondary text-xs">{age}</span>
        <span className={cn(codeClassName, 'text-sm')}>{formatDateTime(date, { dateStyle: 'short' })}</span>
      </span>
    );
  }
  return <EmptyValue />;
}

function StringIban() {
  const value = useStringValue();
  if (!value) return <EmptyValue />;
  // Format the IBAN in groups of 4 characters separated by a space
  const strIban = value.replace(/(.{4})/g, '$1 ').trim();
  return <span className={codeClassName}>{strIban}</span>;
}

function StringCurrency() {
  const value = useStringValue();
  if (!value) return <EmptyValue />;
  const currency = cc.code(value);
  if (!currency) return <span>{value}</span>;
  return (
    <span className={cn('inline-flex items-center gap-1', codeClassName)}>
      <span>{currency?.code}</span>
      <span>{'-'}</span>
      <span>{currency?.currency}</span>
    </span>
  );
}

function DateDatetime() {
  const value = useStringValue();
  const formatDateTime = useFormatDateTime();
  if (value) {
    const date = new Date(value);
    return <span>{formatDateTime(date, { dateStyle: 'short', timeStyle: 'short' })}</span>;
  }
  return <EmptyValue />;
}

function DataGpsCoords() {
  const value = useStringValue();
  const metaData = useFieldMetaData();
  const opts = value ? parseCoords(value) : null;
  const options = useOptions();
  const mapHeight = options?.mapHeight ?? MAP_HEIGHT;

  if (!value || !opts) return <span className={codeClassName}>-</span>;

  return (
    <div className="grid gap-2">
      <CopyToClipboardButton toCopy={`${opts.latitude},${opts.longitude}`} className="w-fit">
        <span className="text-s line-clamp-1 font-semibold">
          {opts.latitude}, {opts.longitude}
        </span>
      </CopyToClipboardButton>

      <Suspense
        fallback={
          <div
            className="isolate overflow-hidden rounded-v2-lg border border-grey-border bg-surface-card flex items-center justify-center"
            style={{ height: mapHeight }}
          >
            <Spinner className="size-4" />
          </div>
        }
      >
        <MapView latitude={opts.latitude} longitude={opts.longitude} mapHeight={mapHeight} />
      </Suspense>
      {metaData ? (
        <div className="w-fit">
          <MetaData metaData={metaData} />
        </div>
      ) : null}
    </div>
  );
}

function NumberInteger() {
  const value = useNumberValue();
  const language = useFormatLanguage();
  if (value === undefined || isNaN(value)) return <EmptyValue />;
  return <span>{formatNumber(value, { language })}</span>;
}

function NumberFloat() {
  const value = useNumberValue();
  const language = useFormatLanguage();
  if (value === undefined || isNaN(value)) return <EmptyValue />;
  return <span>{formatNumber(value, { language })}</span>;
}

function NumberCurrency() {
  const value = useNumberValue();
  const language = useFormatLanguage();
  const fieldCurrency = useFieldCurrency();
  const tableCurrency = useCurrency();
  const currency = fieldCurrency ?? tableCurrency;
  const field = useField();
  const currencyExponent = field?.currencyExponent ?? 0;
  const decimalPrecision = field?.decimalPrecision ?? 2;

  if (value === undefined || isNaN(value)) return <EmptyValue />;
  return (
    <span className="inline-flex items-baseline gap-2">
      {currency ? (
        <span className="text-xs text-grey-secondary border border-grey-border rounded-sm">{currency}</span>
      ) : null}
      <span>
        {formatNumber(value / 10 ** currencyExponent, {
          language,
          style: 'decimal',
          maximumFractionDigits: decimalPrecision,
          minimumFractionDigits: decimalPrecision,
        })}
      </span>
    </span>
  );
}

function NumberPercentile() {
  const value = useNumberValue();
  const language = useFormatLanguage();
  if (value === undefined || isNaN(value)) return <EmptyValue />;
  return <span>{formatNumber(value, { language, style: 'percent' })}</span>;
}

function BooleanCheckbox() {
  const value = useBooleanValue();
  return <Switch checked={value === true} disabled />;
}

function BooleanYesNo() {
  const { t } = useTranslation(['data']);
  const value = useBooleanValue();
  if (value === undefined) return <EmptyValue />;
  return <span>{t(`data:${value ? 'yes' : 'no'}`)}</span>;
}

function EnumValues() {
  const value = useStringValue();
  if (!value) return <EmptyValue className={codeClassName} />;
  return <span className={codeClassName}>{value}</span>;
}

function DataIpAddress() {
  const value = useStringValue();
  const metaData = useFieldMetaData();
  const [isOpen, setIsOpen] = useState(false);
  if (!value) return <EmptyValue className={codeClassName} />;
  if (!metaData) return <span className={codeClassName}>{value}</span>;

  return (
    <div className="grid gap-1">
      <button
        className={cn(codeClassName, 'w-fit flex gap-2 items-center cursor-pointer')}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{value}</span>
        <Icon icon="caret-down" className={cn('size-4 transition-transform duration-200', isOpen && 'rotate-180')} />
      </button>
      {isOpen && <MetaData metaData={metaData} />}
    </div>
  );
}

function MetaData({ metaData }: { metaData?: MetadataType }) {
  if (!metaData || !hasMetadataContent(metaData)) return <StringFree />;
  if (metaData.type === 'number')
    return <RenderFieldComponent fieldType="number-integer" value={metaData.value as number} />;
  if (metaData.type === 'url') return <RenderFieldComponent fieldType="string-link" value={metaData.value as string} />;
  if (metaData.type === 'datetime')
    return <RenderFieldComponent fieldType="date-datetime" value={new Date(metaData.value as string).toISOString()} />;
  if (metaData.type === 'DerivedData') return <DataDerivedData metaData={metaData.value as Record<string, unknown>} />;
  return <StringFree />;
}

function DataDerivedData({ metaData }: { metaData?: Record<string, unknown> }) {
  if (!metaData) return null;

  return (
    <div className={cn(subClassName, 'grid-cols-[max-content_1fr] gap-2')}>
      {Object.entries(metaData).map(([key, value]) => {
        let node: React.ReactNode;
        if (typeof value === 'number') {
          node = <RenderFieldComponent fieldType="number-integer" value={value} />;
        } else if (typeof value === 'boolean') {
          node = <RenderFieldComponent fieldType="boolean-checkbox" value={value} />;
        } else {
          const fieldType = adaptFieldType('String', key);
          node = <RenderFieldComponent fieldType={fieldType} value={(value ?? '-') as string} />;
        }
        return (
          <Fragment key={key}>
            <label className="font-semibold">{key}</label>
            {node}
          </Fragment>
        );
      })}
    </div>
  );
}

function LinkToValue({ value, linkedTo }: { value?: string; linkedTo?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const options = useOptions();
  const DetailsQueryOptions = useQuery({
    ...objectDetailsQueryOptions(linkedTo ?? '', value ?? ''),
    enabled: isOpen && !!linkedTo && !!value,
  });

  if (!linkedTo || !value) return <EmptyValue className={codeClassName} />;

  return (
    <div className="grid gap-1">
      <button
        className={cn(codeClassName, 'w-fit flex gap-2 items-center cursor-pointer')}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span>{value}</span>
        <Icon icon="caret-down" className={cn('size-4 transition-transform duration-200', isOpen && 'rotate-180')} />
      </button>
      {isOpen && (
        <div className={subClassName}>
          {match(DetailsQueryOptions)
            .with({ isFetching: true }, () => <Spinner className="size-4" />)
            .with({ data: P.not(undefined) }, ({ data }) => (
              <DataFields
                table={linkedTo}
                object={data}
                options={{ mapHeight: 200, showHeader: options?.showHeader }}
                className="max-w-3xl"
              />
            ))
            .otherwise(() => (
              <EmptyValue />
            ))}
        </div>
      )}
    </div>
  );
}
