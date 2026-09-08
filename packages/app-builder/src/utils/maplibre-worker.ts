import { setWorkerUrl } from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

// MapLibre GL JS v6 ships an ESM worker that Vite cannot resolve via import.meta.url.
// Without this call, the map canvas mounts but tiles never parse (blank gray map).
// See https://maplibre.org/maplibre-gl-js/docs/guides/v5-to-v6-migration-guide/
setWorkerUrl(maplibreWorkerUrl);
