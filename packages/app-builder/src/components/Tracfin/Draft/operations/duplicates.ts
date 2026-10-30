import type { TracfinBlock, TracfinDiagnostic } from '@app-builder/models/tracfin';
import { decisionOfLine } from './operations-model';

/**
 * The other lines (1-based positions) that a `POTENTIAL_DUPLICATE_OPERATION` diagnostic of a line
 * points to. The backend lists, in `sources`, the decision of every line that records the same
 * historical `object_id`; the diagnostic is read, never recomputed here.
 */
export function duplicatePeerPositions(
  diagnostic: Pick<TracfinDiagnostic, 'sources'>,
  line: TracfinBlock,
  lines: readonly TracfinBlock[],
): number[] {
  const own = decisionOfLine(line);
  const peers = new Set(
    (diagnostic.sources ?? []).flatMap((source) => (source.decision_id ? [source.decision_id] : [])),
  );
  const positions: number[] = [];
  lines.forEach((other, index) => {
    const decision = decisionOfLine(other);
    if (other.id !== line.id && decision && decision !== own && peers.has(decision)) positions.push(index + 1);
  });
  return positions;
}
