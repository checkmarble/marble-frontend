import type { CaseFile } from '@app-builder/models/cases';
import { createContext, type ReactNode, useContext } from 'react';

/**
 * The files of the case, as the case detail loaded by the case route lists them (`caseDetail.files`).
 * The route provides them around the draft page; a page rendered without them (specs, other entry points)
 * gets `null` and the Pieces section says the list is not available instead of showing an empty case.
 */
export type TracfinCaseFiles = {
  files: readonly CaseFile[];
  /** Re-reads the case (after a file was added to it elsewhere); absent when the host cannot. */
  refresh?: () => void;
};

const TracfinCaseFilesContext = createContext<TracfinCaseFiles | null>(null);

export function TracfinCaseFilesProvider({ files, refresh, children }: TracfinCaseFiles & { children: ReactNode }) {
  return <TracfinCaseFilesContext.Provider value={{ files, refresh }}>{children}</TracfinCaseFilesContext.Provider>;
}

/** The case files, or `null` when the host did not provide them. */
export const useTracfinCaseFiles = (): TracfinCaseFiles | null => useContext(TracfinCaseFilesContext);
