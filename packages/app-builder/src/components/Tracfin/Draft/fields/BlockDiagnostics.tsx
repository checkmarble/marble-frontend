import { DiagnosticNotice } from '../prefill/DiagnosticNotice';
import { isHandledByBlockExtras } from '../prefill/diagnostic-codes';
import { useBlockDiagnostics } from './block-diagnostics';
import { useTracfinBlockExtras } from './block-extras';

/**
 * The prefill diagnostics located on a block (when `fieldId` is omitted: those that name no field)
 * or on one of its fields, written in French and flagged « à recalculer » once stale. A section that
 * provides block extras shows the selection codes itself; they are left out here.
 */
export function BlockDiagnostics({ blockId, fieldId }: { blockId: string | null; fieldId?: string }) {
  const hasExtras = useTracfinBlockExtras() !== null;
  const diagnostics = useBlockDiagnostics(blockId).filter(
    (diagnostic) =>
      (diagnostic.field?.field_id || undefined) === fieldId && !isHandledByBlockExtras(diagnostic.code, hasExtras),
  );
  if (diagnostics.length === 0) return null;
  return (
    <div className="flex flex-col gap-xs">
      {diagnostics.map((diagnostic, index) => (
        <DiagnosticNotice key={`${diagnostic.code}-${index}`} diagnostic={diagnostic} />
      ))}
    </div>
  );
}
