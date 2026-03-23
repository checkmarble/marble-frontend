import { useTheme } from '@app-builder/contexts/ThemeContext';
import { type DataType } from '@app-builder/models';
import { formatNumber, useFormatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { Map as MapLibre, Marker } from '@vis.gl/react-maplibre';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { cn, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { CopyToClipboardButton } from './CopyToClipboardButton';
import { ExternalLink } from './ExternalLink';

import 'maplibre-gl/dist/maplibre-gl.css';
import { CARTO_BASEMAP, parseCoords, resolveCoords } from './Data/DataVisualisation/dataFieldsUtils';

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

export function FormatData({
  type,
  data,
  className,
  mapHeight,
  compact,
}: {
  type?: DataType;
  data?: Data;
  className?: string;
  mapHeight?: number;
  compact?: boolean;
}) {
  const language = useFormatLanguage();
  const formatDateTime = useFormatDateTime();

  if (!data) {
    return <span className={className}>-</span>;
  }

  if (type === 'Coords') {
    const opts = resolveCoords(data.value);
    if (!opts) {
      return <span className={className}>-</span>;
    }
    if (compact) {
      return <CompactCoordsField latitude={opts.latitude} longitude={opts.longitude} className={className} />;
    }
    return <CoordsMap value={`${opts.latitude},${opts.longitude}`} height={mapHeight} />;
  }

  if (type === 'IpAddress' && typeof data.value === 'string') {
    const display = data.value.replace(/\/(32|128)$/, '');
    return <span className={className}>{display}</span>;
  }

  switch (data.type) {
    case 'DerivedData':
      if (compact) {
        return <CompactDerivedDataField value={data.value} />;
      }
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

function CompactDerivedDataField({ value }: { value: object }) {
  const { t } = useTranslation(['scenarios']);

  return (
    <Modal.Root>
      <Modal.Trigger asChild>
        <button type="button" className="text-purple-primary hover:text-purple-hover shrink-0">
          <Icon icon="eye" className="size-4" />
        </button>
      </Modal.Trigger>
      <Modal.Content>
        <Modal.Title className="sr-only">{t('scenarios:enriched_metadata.title')}</Modal.Title>
        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 p-6">
          {Object.entries(value).map(([k, v]) => (
            <Fragment key={k}>
              <span className="text-grey-secondary">{t(`scenarios:enriched_metadata.${k}`)}</span>
              <span>{String(v)}</span>
            </Fragment>
          ))}
        </div>
      </Modal.Content>
    </Modal.Root>
  );
}

function CompactCoordsField({
  latitude,
  longitude,
  className,
}: {
  latitude: number;
  longitude: number;
  className?: string;
}) {
  const { theme } = useTheme();

  return (
    <div className={cn('inline-flex items-center gap-1', className)}>
      <span className="truncate">
        {latitude}, {longitude}
      </span>
      <Modal.Root>
        <Modal.Trigger asChild>
          <button type="button" className="text-purple-primary hover:text-purple-hover shrink-0">
            <Icon icon="world" className="size-4" />
          </button>
        </Modal.Trigger>
        <Modal.Content size="medium">
          <Modal.Title>
            <CopyToClipboardButton toCopy={`${latitude},${longitude}`}>
              <span className="text-s font-semibold">
                {latitude}, {longitude}
              </span>
            </CopyToClipboardButton>
          </Modal.Title>
          <div className="p-4">
            <div className="isolate overflow-hidden rounded-v2-lg border border-grey-border">
              <MapLibre
                initialViewState={{ latitude, longitude, zoom: 5 }}
                style={{ width: '100%', height: 400 }}
                mapStyle={CARTO_BASEMAP[theme]}
              >
                <Marker longitude={longitude} latitude={latitude} anchor="bottom">
                  <Icon icon="map-pin" className="size-4" />
                </Marker>
              </MapLibre>
            </div>
          </div>
        </Modal.Content>
      </Modal.Root>
    </div>
  );
}

function CoordsMap({ value, height = 400 }: { value: string; height?: number }) {
  const opts = parseCoords(value);
  const { theme } = useTheme();

  if (!opts) {
    return <span>-</span>;
  }

  return (
    <div className="col-start-2 flex w-full min-w-0 flex-col gap-2">
      <CopyToClipboardButton toCopy={`${opts.latitude},${opts.longitude}`}>
        <span className="text-s line-clamp-1 font-semibold">
          {opts.latitude}, {opts.longitude}
        </span>
      </CopyToClipboardButton>

      <div className="isolate overflow-hidden rounded-v2-lg border border-grey-border bg-surface-card">
        <MapLibre initialViewState={opts} style={{ width: '100%', height }} mapStyle={CARTO_BASEMAP[theme]}>
          <Marker longitude={opts.longitude} latitude={opts.latitude} anchor="bottom">
            <Icon icon="map-pin" className="size-4" />
          </Marker>
        </MapLibre>
      </div>
    </div>
  );
}
