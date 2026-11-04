import type { TracfinExport } from '@app-builder/models/tracfin';
import {
  downloadTracfinExport,
  TracfinDownloadError,
  type TracfinDownloadFailure,
  type TracfinDownloadResult,
} from '@app-builder/services/tracfin/download-export';
import { useRef, useState } from 'react';

export type ExportDownloadState =
  | { kind: 'idle' }
  | { kind: 'downloading' }
  /** The body had the published size, and its SHA-256 matched when the browser could compute it. */
  | { kind: 'done'; result: TracfinDownloadResult }
  | { kind: 'failed'; failure: TracfinDownloadFailure };

export function failureOf(error: unknown): TracfinDownloadFailure {
  if (error instanceof TracfinDownloadError) return error.failure;
  return { kind: 'network', message: error instanceof Error ? error.message : null };
}

/**
 * Downloads one export with the integrity checks of `downloadTracfinExport`. A failed download stays a
 * failure (a partial file is never a success) and « Réessayer » is the same call with the same export:
 * it never exports again. The state belongs to an export id; another export starts from idle.
 */
export function useExportDownload(tracfinExport: TracfinExport, caseId: string) {
  const [state, setState] = useState<{ exportId: string; value: ExportDownloadState }>({
    exportId: tracfinExport.id,
    value: { kind: 'idle' },
  });
  const running = useRef(false);

  const download = async () => {
    if (running.current) return;
    running.current = true;
    const exportId = tracfinExport.id;
    setState({ exportId, value: { kind: 'downloading' } });
    try {
      const result = await downloadTracfinExport(tracfinExport, caseId);
      setState({ exportId, value: { kind: 'done', result } });
    } catch (error) {
      setState({ exportId, value: { kind: 'failed', failure: failureOf(error) } });
    } finally {
      running.current = false;
    }
  };

  return { state: state.exportId === tracfinExport.id ? state.value : ({ kind: 'idle' } as const), download };
}
