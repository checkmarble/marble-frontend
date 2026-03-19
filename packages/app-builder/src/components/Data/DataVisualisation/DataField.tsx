import { CopyToClipboardButton } from '@app-builder/components/CopyToClipboardButton';
import { Spinner } from '@app-builder/components/Spinner';
import { useTheme } from '@app-builder/contexts/ThemeContext';
import { type DataModelField, type DataModelObject, DataType } from '@app-builder/models';
import { formatAge, formatCurrency, useFormatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { EUR } from '@dinero.js/currencies';
import { useFetcher } from '@remix-run/react';
import { Map as MapLibre, type MapRef, Marker } from '@vis.gl/react-maplibre';
import CountryFlag from 'country-flag-emojis';
import cc from 'currency-codes';
import parsePhoneNumber from 'libphonenumber-js/min';
import { type ComponentType, Fragment, useEffect, useRef, useState } from 'react';
import { cn, Switch } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { type VALID_DATA_TYPE } from './data-type';
import { CARTO_BASEMAP, hasMetadataContent, MAP_HEIGHT, parseCoords } from './dataFieldsUtils';
import { useCurrency, useOptions } from './datafield-context';

import 'maplibre-gl/dist/maplibre-gl.css';
import { parseUnknownData } from '@app-builder/utils/parse';
import { useTranslation } from 'react-i18next';
import { DataFields, DataFieldsHeader } from './DataFields';

const codeClassName = 'font-mono border border-grey-border rounded-sm p-1 bg-surface-card';
const subClassName = 'grid gap-1 p-2 border border-grey-border bg-grey-background-light rounded-lg';

type MetadataType = ReturnType<typeof parseUnknownData>;

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
  'string-ip_address': StringIpAddress,
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
  'enum-values': EnumValues,
  'boolean-checkbox': BooleanCheckbox,
  'boolean-yes_no': BooleanYesNo,
} satisfies Record<VALID_DATA_TYPE, ComponentType<{ value?: string; metaData?: MetadataType }>>;

export function DataField({ field, value, linkedTo, metaData }: DataFieldProps) {
  const options = useOptions();
  const fieldType = adaptFieldType(field?.dataType, field?.name);

  const Component = FIELD_TYPE_COMPONENTS[fieldType];

  return (
    <div className="col-span-2 grid grid-cols-subgrid">
      <label htmlFor={field?.id} className="text-grey-secondary">
        {field?.name}
      </label>
      <div id={field?.id}>
        {value ? (
          <>
            {linkedTo ? (
              <LinkToValue value={`${value}`} linkedTo={linkedTo} />
            ) : (
              <Component value={`${value}`} metaData={options?.hideMetadata ? undefined : metaData} />
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
      return 'string-ip_address';
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

function DataGpsCoords({ value, metaData }: { value?: string; metaData?: MetadataType }) {
  const { theme } = useTheme();
  const mapRef = useRef<MapRef>(null);
  const opts = value ? parseCoords(value) : null;
  const options = useOptions();
  const mapHeight = options?.mapHeight ?? MAP_HEIGHT;

  useEffect(() => {
    if (!opts || !mapRef.current) return;
    mapRef.current.flyTo({ center: [opts.longitude, opts.latitude], duration: 1000 });
  }, [opts?.latitude, opts?.longitude]);

  if (!value || !opts) return <span className={codeClassName}>-</span>;

  return (
    <div className="grid gap-2">
      <CopyToClipboardButton toCopy={`${opts.latitude},${opts.longitude}`} className="w-fit">
        <span className="text-s line-clamp-1 font-semibold">
          {opts.latitude}, {opts.longitude}
        </span>
      </CopyToClipboardButton>

      <div className="isolate overflow-hidden rounded-v2-lg border border-grey-border bg-surface-card">
        <MapLibre
          ref={mapRef}
          initialViewState={opts}
          style={{ width: '100%', height: mapHeight }}
          mapStyle={CARTO_BASEMAP[theme]}
        >
          <Marker longitude={opts.longitude} latitude={opts.latitude} anchor="bottom">
            <Icon icon="map-pin" className="size-4 text-red-primary" />
          </Marker>
        </MapLibre>
      </div>
      {metaData ? (
        <div className="w-fit">
          <MetaData metaData={metaData} />
        </div>
      ) : null}
    </div>
  );
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
  return <Switch checked={value === 'true'} disabled />;
}

function BooleanYesNo({ value }: { value?: string }) {
  return <span>{value ?? '-'}</span>;
}

function EnumValues({ value }: { value?: string }) {
  return <span className={codeClassName}>{value ?? '-'}</span>;
}

function StringIpAddress({ value, metaData }: { value?: string; metaData?: MetadataType }) {
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
  if (!metaData) return null;
  let MetaDataComponent: ComponentType<{ value?: string }> = FIELD_TYPE_COMPONENTS['string-free'];
  const hasMetadata = hasMetadataContent(metaData);
  let metadataValue: string = '';

  if (hasMetadata) {
    let fieldType: VALID_DATA_TYPE = 'string-free';
    if (metaData?.type === 'number') {
      fieldType = 'number-integer';
      metadataValue = (metaData?.value as number).toString();
    } else if (metaData?.type === 'url') {
      fieldType = 'string-link';
      metadataValue = metaData?.value as string;
    } else if (metaData?.type === 'datetime') {
      fieldType = 'date-datetime';
      metadataValue = new Date(metaData?.value).toISOString();
    } else if (metaData?.type === 'DerivedData') {
      return <DataDerivedData metaData={metaData.value} />;
    }
    MetaDataComponent = FIELD_TYPE_COMPONENTS[fieldType];
  }
  return <MetaDataComponent value={metadataValue} />;
}

function DataDerivedData({ metaData }: { metaData?: Record<string, unknown> }) {
  if (!metaData) return null;

  return (
    <div className={cn(subClassName, 'grid-cols-2')}>
      {Object.entries(metaData).map(([key, value]) => {
        let MetaDataComponent = FIELD_TYPE_COMPONENTS['string-free'];
        if (typeof value === 'number') MetaDataComponent = FIELD_TYPE_COMPONENTS['number-integer'];
        if (typeof value === 'boolean') MetaDataComponent = FIELD_TYPE_COMPONENTS['boolean-checkbox'];
        const fieldType = adaptFieldType('String', key);
        MetaDataComponent = FIELD_TYPE_COMPONENTS[fieldType];
        return (
          <Fragment key={key}>
            <label className="font-semibold">{key}</label>
            <MetaDataComponent value={(value ?? '-') as string} />
          </Fragment>
        );
      })}
    </div>
  );
}

function LinkToValue({ value, linkedTo }: { value?: string; linkedTo?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const fetcher = useFetcher<{ objectDetails: DataModelObject | null }>();

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
              <DataFieldsHeader object={fetcher.data.objectDetails} />
              <DataFields
                table={linkedTo}
                object={fetcher.data.objectDetails}
                options={{ mapHeight: 200 }}
                className="max-w-3xl"
              />
            </>
          ) : (
            <span>{'-'}</span>
          )}
        </div>
      )}
    </div>
  );
}
