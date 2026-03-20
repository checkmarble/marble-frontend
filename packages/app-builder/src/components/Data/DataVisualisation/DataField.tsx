import { CopyToClipboardButton } from '@app-builder/components/CopyToClipboardButton';
import { Spinner } from '@app-builder/components/Spinner';
import { type DataModelField, type DataModelObject, DataType } from '@app-builder/models';
import {
  formatAge,
  formatCurrency,
  formatNumber,
  useFormatDateTime,
  useFormatLanguage,
} from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { tryCatch } from '@app-builder/utils/tryCatch';
import { EUR } from '@dinero.js/currencies';
import { useFetcher } from '@remix-run/react';
import CountryFlag from 'country-flag-emojis';
import cc from 'currency-codes';
import parsePhoneNumber from 'libphonenumber-js/min';
import { Fragment, lazy, Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isNonNullish } from 'remeda';
import { cn, Switch } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { DataFields } from './DataFields';
import type {
  BooleanKey,
  DataKey,
  FieldTypeComponentMap,
  MetadataType,
  NumberKey,
  StringKey,
  VALID_DATA_TYPE,
} from './data-type';
import { hasMetadataContent, MAP_HEIGHT, parseCoords } from './dataFieldsUtils';
import { useCurrency, useOptions } from './datafield-context';

const MapView = lazy(() => import('./MapView').then((m) => ({ default: m.MapView })));

const codeClassName = 'font-mono border border-grey-border rounded-sm p-1 bg-surface-card';
const subClassName = 'grid gap-1 p-2 border border-grey-border bg-grey-background-light rounded-lg';

type DataFieldProps = {
  field?: DataModelField;
  value?: string | number | boolean;
  linkedTo?: string;
  metaData?: MetadataType;
};

const FIELD_TYPE_COMPONENTS = {
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
} satisfies FieldTypeComponentMap;

function renderFieldComponent(fieldType: VALID_DATA_TYPE, value: string | number | boolean, metaData?: MetadataType) {
  if (fieldType.startsWith('number-')) {
    const Comp = FIELD_TYPE_COMPONENTS[fieldType as NumberKey];
    return <Comp value={typeof value === 'number' ? value : Number(value)} />;
  }
  if (fieldType.startsWith('boolean-')) {
    const Comp = FIELD_TYPE_COMPONENTS[fieldType as BooleanKey];
    return <Comp value={typeof value === 'boolean' ? value : value === 'true'} />;
  }
  if (fieldType.startsWith('data-')) {
    const Comp = FIELD_TYPE_COMPONENTS[fieldType as DataKey];
    return <Comp value={String(value)} metaData={metaData} />;
  }
  const Comp = FIELD_TYPE_COMPONENTS[fieldType as StringKey];
  return <Comp value={String(value)} />;
}

export function DataField({ field, value, linkedTo, metaData }: DataFieldProps) {
  const options = useOptions();
  const fieldType = adaptFieldType(field?.dataType, field?.name);

  return (
    <div className="col-span-2 grid grid-cols-subgrid">
      <label htmlFor={field?.id} className="text-grey-secondary">
        {field?.name}
      </label>
      <div id={field?.id}>
        {isNonNullish(value) ? (
          <>
            {linkedTo ? (
              <LinkToValue value={`${value}`} linkedTo={linkedTo} />
            ) : (
              renderFieldComponent(fieldType, value, options?.hideMetadata ? undefined : metaData)
            )}
          </>
        ) : (
          <span>{'-'}</span>
        )}
      </div>
    </div>
  );
}

/**
 * Adapt field type from old data type to new data type
 * @param field field definition
 * @returns new data type
 */
function adaptFieldType(dataType?: DataType | null, name?: string): VALID_DATA_TYPE {
  if (!dataType || !name) return 'string-free';

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

function EmptyValue() {
  return <span>{'-'}</span>;
}

function StringMain({ value }: { value?: string }) {
  if (!value) return <EmptyValue />;
  return <span className="font-semibold">{value}</span>;
}

function StringCode({ value }: { value?: string }) {
  if (!value) return <EmptyValue />;
  return <span className={codeClassName}>{value}</span>;
}

function StringEmail({ value }: { value?: string }) {
  return (
    <a className="text-purple-primary" href={`mailto:${value}`}>
      {value ?? '-'}
    </a>
  );
}

function StringPhone({ value }: { value?: string }) {
  if (!value) return <EmptyValue />;
  const phone = parsePhoneNumber(value);
  const strPhone = phone ? phone.formatInternational() : value;
  const phoneUri = phone ? phone.getURI() : value;
  return (
    <a className="text-purple-primary" href={phoneUri}>
      {strPhone}
    </a>
  );
}

function StringCity({ value }: { value?: string }) {
  if (!value) return <EmptyValue />;
  return <span>{value}</span>;
}

function StringCountry({ value }: { value?: string }) {
  if (!value) return <EmptyValue />;
  const result = tryCatch(() => CountryFlag.byCountryCode(value.toUpperCase()));
  if (!result.ok) return <EmptyValue />;
  const country = result.value;
  return (
    <span className="inline-flex items-center gap-1">
      <span>{country.flag}</span>
      <span>{country.nameEnglish}</span>
    </span>
  );
}

function StringLink({ value }: { value?: string }) {
  if (!value) return <EmptyValue />;
  const result = tryCatch(() => new URL(value));
  if (!result.ok || !['http:', 'https:'].includes(result.value.protocol)) return <EmptyValue />;
  return (
    <a className="text-purple-primary" href={result.value.href}>
      {value}
    </a>
  );
}

function StringVpn({ value }: { value?: string }) {
  const { t } = useTranslation(['data']);
  if (!value) return <span>{t('data:no_vpn')}</span>;
  return (
    <span className={cn(codeClassName, 'flex gap-2 items-center')}>
      <span>{t('data:vpn')}</span>
      <span>{'-'}</span>
      <span>{value}</span>
    </span>
  );
}

function StringId({ value }: { value?: string }) {
  if (!value) return <span className={codeClassName}>{'-'}</span>;
  return (
    <CopyToClipboardButton toCopy={value}>
      <span>{value}</span>
    </CopyToClipboardButton>
  );
}

function StringFree({ value }: { value?: string }) {
  if (!value) return <EmptyValue />;
  return <span>{value}</span>;
}

function DateBirthdate({ value }: { value?: string }) {
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

function StringIban({ value }: { value?: string }) {
  if (!value) return <EmptyValue />;
  // Format the IBAN in groups of 4 characters separated by a space
  const strIban = value.replace(/(.{4})/g, '$1 ').trim();
  return <span className={codeClassName}>{strIban}</span>;
}

function StringCurrency({ value }: { value?: string }) {
  if (!value) return <EmptyValue />;
  const currency = cc.code(value);
  return (
    <span className={cn('inline-flex items-center gap-1', codeClassName)}>
      <span>{currency?.code}</span>
      <span>{'-'}</span>
      <span>{currency?.currency}</span>
    </span>
  );
}

function DateDatetime({ value }: { value?: string }) {
  const formatDateTime = useFormatDateTime();
  if (value) {
    const date = new Date(value);
    return <span>{formatDateTime(date, { dateStyle: 'short', timeStyle: 'short' })}</span>;
  }
  return <EmptyValue />;
}

function DataGpsCoords({ value, metaData }: { value?: string; metaData?: MetadataType }) {
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

function NumberInteger({ value }: { value?: number }) {
  const language = useFormatLanguage();
  if (value === undefined || isNaN(value)) return <EmptyValue />;
  return <span>{formatNumber(value, { language })}</span>;
}

function NumberFloat({ value }: { value?: number }) {
  const language = useFormatLanguage();
  if (value === undefined || isNaN(value)) return <EmptyValue />;
  return <span>{formatNumber(value, { language })}</span>;
}

function NumberCurrency({ value }: { value?: number }) {
  const language = useFormatLanguage();
  const currency = useCurrency() ?? EUR;
  if (value === undefined) return <EmptyValue />;
  return <span>{formatCurrency(value, { language, currency })}</span>;
}

function NumberPercentile({ value }: { value?: number }) {
  const language = useFormatLanguage();
  if (value === undefined || isNaN(value)) return <EmptyValue />;
  return <span>{formatNumber(value / 100, { language, style: 'percent' })}</span>;
}

function BooleanCheckbox({ value }: { value?: boolean }) {
  return <Switch checked={value === true} disabled />;
}

function BooleanYesNo({ value }: { value?: boolean }) {
  if (value === undefined) return <EmptyValue />;
  return <span>{String(value)}</span>;
}

function EnumValues({ value }: { value?: string }) {
  return <span className={codeClassName}>{value ?? '-'}</span>;
}

function DataIpAddress({ value, metaData }: { value?: string; metaData?: MetadataType }) {
  const [isOpen, setIsOpen] = useState(false);
  if (!metaData) return <span className={codeClassName}>{value ?? '-'}</span>;

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
  if (metaData.type === 'number') return renderFieldComponent('number-integer', metaData.value as number);
  if (metaData.type === 'url') return renderFieldComponent('string-link', metaData.value as string);
  if (metaData.type === 'datetime')
    return renderFieldComponent('date-datetime', new Date(metaData.value as string).toISOString());
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
          node = renderFieldComponent('number-integer', value);
        } else if (typeof value === 'boolean') {
          node = renderFieldComponent('boolean-checkbox', value);
        } else {
          const fieldType = adaptFieldType('String', key);
          node = renderFieldComponent(fieldType, (value ?? '-') as string);
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
  const fetcher = useFetcher<{ objectDetails: DataModelObject | null }>();
  const options = useOptions();

  if (!linkedTo || !value) return <span className={codeClassName}>{'-'}</span>;

  const handleToggle = () => {
    if (!isOpen && !fetcher.data) {
      fetcher.load(
        getRoute('/ressources/data/object/:objectType/:objectId', {
          objectType: linkedTo,
          objectId: value,
        }),
      );
    }
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="grid gap-1">
      <button className={cn(codeClassName, 'w-fit flex gap-2 items-center cursor-pointer')} onClick={handleToggle}>
        <span>{value}</span>
        <Icon icon="caret-down" className={cn('size-4 transition-transform duration-200', isOpen && 'rotate-180')} />
      </button>
      {isOpen && (
        <div className={subClassName}>
          {fetcher.state === 'loading' ? (
            <Spinner className="size-4" />
          ) : fetcher.data?.objectDetails ? (
            <>
              <DataFields
                table={linkedTo}
                object={fetcher.data.objectDetails}
                options={{ mapHeight: 200, showHeader: options?.showHeader }}
                className="max-w-3xl"
              />
            </>
          ) : (
            <EmptyValue />
          )}
        </div>
      )}
    </div>
  );
}
