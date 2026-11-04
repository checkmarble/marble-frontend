import type { TracfinMapping, TracfinSelection } from '@app-builder/models/tracfin';

/**
 * The mapping an operation line's selection points to: any `decision_snapshot` mapping of the draft's
 * configuration with the same historical type (backend `CompatibleMapping`: for a selection that
 * holds a `decision_id`, `source.kind == "decision_snapshot"` and `source.historical_type ==
 * selection.historical_type`). The first one in configuration order, so that the choice is stable.
 * `null` when the configuration has none for that type.
 */
export function snapshotMappingFor(mappings: readonly TracfinMapping[], historicalType: string): TracfinMapping | null {
  return (
    mappings.find(
      (mapping) => mapping.source.kind === 'decision_snapshot' && mapping.source.historical_type === historicalType,
    ) ?? null
  );
}

/**
 * The `set_selection` body of a line built from a decision: `mapping_id`, the decision id exactly as
 * the server listed it (canonical lowercase UUID, never re-cased), and its historical type. The root
 * is not a record of the client's data (`load` refuses a decision selection that holds a bound root
 * record or bindings): it only carries the historical type, as a placeholder the server ignores.
 * No `bindings`, no `snapshot_field`.
 */
export function buildSnapshotSelection({
  mappingId,
  decisionId,
  historicalType,
}: {
  mappingId: string;
  decisionId: string;
  historicalType: string;
}): TracfinSelection {
  return {
    mapping_id: mappingId,
    root: { id: 'root', table: historicalType },
    decision_id: decisionId,
    historical_type: historicalType,
  };
}
