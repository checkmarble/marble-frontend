import type { TracfinValidation } from '@app-builder/models/tracfin';

/** The layers the backend always reports, in the order it documents them. `official_xsd` is last. */
export const REVIEW_LAYER_IDS = ['internal_structure', 'references', 'business', 'xml_syntax', 'official_xsd'] as const;

export const OFFICIAL_XSD_LAYER = 'official_xsd';

export type LayerStatus = 'passed' | 'failed' | 'incomplete' | 'unavailable';

const layerStatuses: readonly string[] = ['passed', 'failed', 'incomplete', 'unavailable'];

export const isLayerStatus = (value: string): value is LayerStatus => layerStatuses.includes(value);

export type LayerRow = {
  id: string;
  /** `null` for a layer the report does not mention (or a status this version does not know). */
  status: LayerStatus | null;
  /** The server's reason; shown in French when it is a known one. */
  reason: string | null;
};

/**
 * The rows of the layers table: the five known layers in a fixed order, then any other layer the
 * server reported. `official_xsd` is always there, even before any validation: the screen never lets
 * its absence read as a pass. Without a validation the other rows have no status.
 */
export function layerRows(validation: Pick<TracfinValidation, 'layers'> | null): LayerRow[] {
  const layers = validation?.layers ?? {};
  const known = new Set<string>(REVIEW_LAYER_IDS);
  const ids = [...REVIEW_LAYER_IDS, ...Object.keys(layers).filter((id) => !known.has(id))];
  return ids.map((id) => {
    const layer = layers[id];
    if (id === OFFICIAL_XSD_LAYER && !layer) return { id, status: 'unavailable', reason: null };
    return {
      id,
      status: layer && isLayerStatus(layer.status) ? layer.status : null,
      reason: layer?.reason?.trim() ? layer.reason : null,
    };
  });
}

/**
 * The state of the internal checks as a whole: the four internal layers (every layer but the official
 * XSD one, which is never run) and any other layer the server reports; the worst status wins. A layer
 * that is missing, or whose status this version does not know, was not seen to pass: it counts as
 * `incomplete`. `passed` therefore means that all four internal layers were reported and passed; it
 * never says anything about the official validation or about ERMES.
 */
export function internalChecksStatus(validation: Pick<TracfinValidation, 'layers'>): LayerStatus {
  const layers = validation.layers ?? {};
  if (Object.keys(layers).length === 0) return 'unavailable';
  const internal = REVIEW_LAYER_IDS.filter((id) => id !== OFFICIAL_XSD_LAYER);
  const ids = new Set<string>([...internal, ...Object.keys(layers).filter((id) => id !== OFFICIAL_XSD_LAYER)]);
  const statuses = [...ids].map((id): LayerStatus => {
    const status = layers[id]?.status;
    return status !== undefined && isLayerStatus(status) ? status : 'incomplete';
  });
  for (const worst of ['failed', 'incomplete', 'unavailable'] as const) {
    if (statuses.includes(worst)) return worst;
  }
  return 'passed';
}

/** The server reasons this screen knows how to say in French; the key is under `draft.review.layers.reasons`. */
const KNOWN_REASONS: readonly { startsWith: string; key: string }[] = [
  { startsWith: 'Some registered source rules have not been implemented', key: 'rules_not_implemented' },
  { startsWith: 'Draft validation does not read exported XML bytes', key: 'draft_has_no_xml' },
  { startsWith: 'No compatible official XSD engine', key: 'no_xsd_engine' },
];

export function knownReasonKey(reason: string): string | null {
  return KNOWN_REASONS.find((known) => reason.startsWith(known.startsWith))?.key ?? null;
}
