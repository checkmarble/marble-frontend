import { useTheme } from '@app-builder/contexts/ThemeContext';
import { type DataType } from '@app-builder/models';
import { formatNumber, useFormatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { Map as MapLibre, Marker } from '@vis.gl/react-maplibre';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { CopyToClipboardButton } from './CopyToClipboardButton';
import { ExternalLink } from './ExternalLink';

import 'maplibre-gl/dist/maplibre-gl.css';

const CARTO_BASEMAP = {
  light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
} as const;

type Data =
  | {
      type: 'url' | 'datetime';
      value: string;
    }
  | {
      type: 'number';
      value: number;
    }
  | {
      type: 'DerivedData';
      value: object;
    }
  | {
      type: 'unknown';
      value: unknown;
    };

export function FormatData({ type, data, className }: { type?: DataType; data?: Data; className?: string }) {
  const language = useFormatLanguage();
  const formatDateTime = useFormatDateTime();

  if (!data) {
    return <span className={className}>-</span>;
  }

  if (type === 'Coords') {
    return <CoordsMap value={data.value as string} />;
  }

  switch (data.type) {
    case 'DerivedData':
      return <DerivedDataDetails value={data.value} />;
    case 'url':
      return (
        <ExternalLink href={data.value} className={className}>
          {data.value}
        </ExternalLink>
      );
    case 'datetime':
      return (
        <time dateTime={data.value} className={className}>
          {formatDateTime(data.value, {
            dateStyle: 'short',
            timeStyle: 'short',
          })}
        </time>
      );
    case 'number':
      return <span className={className}>{formatNumber(data.value, { language })}</span>;
    case 'unknown':
      return <span className={className}>{data.value ? String(data.value) : '-'}</span>;
  }
}

function DerivedDataDetails({ value }: { value: object }) {
  const { t } = useTranslation(['scenarios']);

  return (
    <div className="col-start-2 grid w-full grid-cols-[auto_1fr] gap-x-4 rounded-v2-lg border border-grey-border bg-surface-card p-v2-md">
      {Object.entries(value).map(([k, v]) => (
        <Fragment key={k}>
          <span className="text-grey-secondary">{t(`scenarios:enriched_metadata.${k}`)}</span>
          <span>{String(v)}</span>
        </Fragment>
      ))}
    </div>
  );
}

function parseCoords(s: string) {
  const [lat, lng] = s.split(',');
  return {
    latitude: parseFloat(lat ?? '0.0'),
    longitude: parseFloat(lng ?? '0.0'),
    zoom: 5,
  };
}

function CoordsMap({ value }: { value: string }) {
  const opts = parseCoords(value);
  const { theme } = useTheme();

  return (
    <>
      <CopyToClipboardButton toCopy={`${opts.latitude},${opts.longitude}`}>
        <span className="text-s line-clamp-1 font-semibold">
          {opts.latitude}, {opts.longitude}
        </span>
      </CopyToClipboardButton>

      <div className="col-start-2 overflow-hidden rounded-v2-lg border border-grey-border bg-surface-card">
        <MapLibre initialViewState={opts} style={{ width: '100%', height: 400 }} mapStyle={CARTO_BASEMAP[theme]}>
          <Marker longitude={opts.longitude} latitude={opts.latitude} anchor="bottom">
            <MapPin />
          </Marker>
        </MapLibre>
      </div>
    </>
  );
}

const MAP_PIN_PATH = `M20.2,15.7L20.2,15.7c1.1-1.6,1.8-3.6,1.8-5.7c0-5.6-4.5-10-10-10S2,4.5,2,10c0,2,0.6,3.9,1.6,5.4c0,0.1,0.1,0.2,0.2,0.3
  c0,0,0.1,0.1,0.1,0.2c0.2,0.3,0.4,0.6,0.7,0.9c2.6,3.1,7.4,7.6,7.4,7.6s4.8-4.5,7.4-7.5c0.2-0.3,0.5-0.6,0.7-0.9
  C20.1,15.8,20.2,15.8,20.2,15.7z`;

function MapPin({ size = 20 }: { size?: number }) {
  return (
    <svg height={size} viewBox="0 0 24 24" style={{ cursor: 'pointer', fill: '#d00', stroke: 'none' }}>
      <path d={MAP_PIN_PATH} />
    </svg>
  );
}
