import { useTheme } from '@app-builder/contexts/ThemeContext';
import { Map as MapLibre, type MapRef, Marker } from '@vis.gl/react-maplibre';
import { useEffect, useRef } from 'react';
import { Icon } from 'ui-icons';
import { CARTO_BASEMAP } from './dataFieldsUtils';

import 'maplibre-gl/dist/maplibre-gl.css';

type MapViewProps = {
  latitude: number;
  longitude: number;
  mapHeight: number;
};

export function MapView({ latitude, longitude, mapHeight }: MapViewProps) {
  const { theme } = useTheme();
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({ center: [longitude, latitude], duration: 1000 });
  }, [latitude, longitude]);

  return (
    <div className="isolate overflow-hidden rounded-v2-lg border border-grey-border bg-surface-card">
      <MapLibre
        ref={mapRef}
        initialViewState={{ latitude, longitude, zoom: 5 }}
        style={{ width: '100%', height: mapHeight }}
        mapStyle={CARTO_BASEMAP[theme]}
      >
        <Marker longitude={longitude} latitude={latitude} anchor="bottom">
          <Icon icon="map-pin" className="size-4 text-red-primary" />
        </Marker>
      </MapLibre>
    </div>
  );
}
