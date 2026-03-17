import { type DataModelField } from '@app-builder/models';
import { formatAge, formatCurrency, useFormatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { EUR } from '@dinero.js/currencies';
import CountryFlag from 'country-flag-emojis';
import cc from 'currency-codes';
import parsePhoneNumber from 'libphonenumber-js/min';
import { type ComponentType } from 'react';
import { cn } from 'ui-design-system';
import { useCurrency } from './currency-context';
import { type VALID_DATA_TYPE } from './data-type';

const codeClassName = 'font-mono border border-grey-border rounded-sm p-1';

type DataFieldProps = {
  field?: DataModelField;
  value?: string | number | boolean;
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
  'date-birthdate': DateBirthdate,
  'date-datetime': DateDatetime,
  'date-date': DateDatetime,
  'date-time': DateDatetime,
  'data-gps_coords': DataGpsCoords,
  'data-map': DataGpsCoords,
  'number-integer': NumberInteger,
  'number-float': NumberFloat,
  'number-currency': NumberCurrency,
  'number-percentile': NumberPercentile,
  'enum-key_value': StringFree,
  'enum-colors': StringFree,
  'enum-values': StringFree,
  'boolean-checkbox': BooleanCheckbox,
  'boolean-yes_no': BooleanYesNo,
} satisfies Record<VALID_DATA_TYPE, ComponentType<{ value?: string }>>;

export function DataField({ field, value }: DataFieldProps) {
  const fieldType = adaptFieldType(field);
  const Component = FIELD_TYPE_COMPONENTS[fieldType];
  return (
    <>
      <label htmlFor={field?.id}>{field?.name}</label>
      <div id={field?.id}>{value ? <Component value={value as string} /> : <span>{'-'}</span>}</div>
    </>
  );
}

/**
 * Adapt field type from old data type to new data type
 * @param field field definition
 * @returns new data type
 */
function adaptFieldType(field?: DataModelField): VALID_DATA_TYPE {
  const dataType = field?.dataType;
  if (dataType == null) return 'string-free';

  switch (dataType) {
    case 'String':
    case 'String[]':
    case 'IpAddress':
    case 'IpAddress[]':
    case 'DerivedData':
    case 'unknown':
      if (field?.name && /name/i.test(field.name)) return 'string-main';
      if (field?.name && /email/i.test(field.name)) return 'string-email';
      if (field?.name && /phone/i.test(field.name)) return 'string-phone';
      if (field?.name && /city/i.test(field.name)) return 'string-city';
      if (field?.name && /country/i.test(field.name)) return 'string-country';
      if (field?.name && /_id/i.test(field.name)) return 'string-code';
      if (field?.name && /iban/i.test(field.name)) return 'string-iban';
      if (field?.name && /currency/i.test(field.name)) return 'string-currency';
      if (field?.name && /url/i.test(field.name)) return 'string-link';
      if (field?.name && /code/i.test(field.name)) return 'string-code';
      if (field?.name && /vpn/i.test(field.name)) return 'string-vpn';
      return 'string-free';
    case 'Timestamp':
    case 'Timestamp[]':
      if (field?.name && /birthdate/i.test(field.name)) return 'date-birthdate';
      return 'date-datetime';
    case 'Coords':
    case 'Coords[]':
      return 'data-gps_coords';
    case 'Int':
    case 'Int[]':
      return 'number-integer';
    case 'Float':
    case 'Float[]':
      if (field?.name && /amount/i.test(field.name)) return 'number-currency';

      return 'number-float';
    case 'Bool':
    case 'Bool[]':
      if (field?.name && /vpn/i.test(field.name)) return 'boolean-yes_no';
      return 'boolean-checkbox';
    default:
      throw new Error(`Unhandled data type: ${dataType satisfies never}`);
  }
}

function StringMain({ value }: { value?: string }) {
  return <span className="font-semibold">{value ?? '-'}</span>;
}

function StringCode({ value }: { value?: string }) {
  return <span className={codeClassName}>{value ?? '-'}</span>;
}

function StringEmail({ value }: { value?: string }) {
  return (
    <a className="text-purple-primary" href={`mailto:${value}`}>
      {value ?? '-'}
    </a>
  );
}

function StringPhone({ value }: { value?: string }) {
  if (!value) return <span>{'-'}</span>;
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
  return <span>{value ?? '-'}</span>;
}

function StringCountry({ value }: { value?: string }) {
  if (!value) return <span>{'-'}</span>;
  const country = CountryFlag.byCountryCode(value.toUpperCase());
  return (
    <span className="inline-flex items-center gap-1">
      <span>{country.flag}</span>
      <span>{country.nameEnglish}</span>
    </span>
  );
}

function StringLink({ value }: { value?: string }) {
  return (
    <a className="text-purple-primary" href={value}>
      {value ?? '-'}
    </a>
  );
}

function StringVpn({ value }: { value?: string }) {
  return <span>{value ?? '-'}</span>;
}

function StringFree({ value }: { value?: string }) {
  return <span>{value ?? '-'}</span>;
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
  return <span>{'-'}</span>;
}

function StringIban({ value }: { value?: string }) {
  if (!value) return <span>{'-'}</span>;
  // Format the IBAN in groups of 4 characters separated by a space
  const strIban = value.replace(/(.{4})/g, '$1 ').trim();
  return <span className={codeClassName}>{strIban}</span>;
}

function StringCurrency({ value }: { value?: string }) {
  if (!value) return <span>{'-'}</span>;
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
  return <span>{value ?? '-'}</span>;
}

function DataGpsCoords({ value }: { value?: string }) {
  return <span>{value ?? '-'}</span>;
}

function NumberInteger({ value }: { value?: string }) {
  return <span>{value ?? '-'}</span>;
}

function NumberFloat({ value }: { value?: string }) {
  return <span>{value ?? '-'}</span>;
}

function NumberCurrency({ value }: { value?: string }) {
  const language = useFormatLanguage();
  const currency = useCurrency() ?? EUR;
  if (!value) return <span>{'-'}</span>;
  const valueAsNumber = Number(value);
  const formatNumber = formatCurrency(valueAsNumber, { language, currency });
  return <span>{formatNumber}</span>;
}

function NumberPercentile({ value }: { value?: string }) {
  return <span>{value ?? '-'}</span>;
}

function BooleanCheckbox({ value }: { value?: string }) {
  return <span>{value ?? '-'}</span>;
}

function BooleanYesNo({ value }: { value?: string }) {
  return <span>{value ?? '-'}</span>;
}
