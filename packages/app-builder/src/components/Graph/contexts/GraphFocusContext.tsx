import { createSimpleContext } from '@app-builder/utils/create-context';
import { type Dispatch, type ReactNode, type SetStateAction, useState } from 'react';
import type { PersonListItem } from '../lib/connected-person-list';
import type { GraphObjectRef } from '../lib/graph-keys';

/**
 * The node backing the settings panel's detail card. `persons` are the selection's
 * connected person and collapsed-cluster neighbours, or the folded members of a cluster.
 */
export type SelectedGraphObject = GraphObjectRef & { persons: PersonListItem[] } & (
    | { nodeType: 'person' | 'pivot' }
    | { nodeType: 'cluster'; nodeCount: number; internalEdgeCount: number }
    | { nodeType: 'hypernode'; hypernodeCount: number }
  );

const GraphFocusContext = createSimpleContext<SelectedGraphObject | null>('GraphFocus');
const SetGraphFocusContext = createSimpleContext<Dispatch<SetStateAction<SelectedGraphObject | null>>>('SetGraphFocus');

/** `useOptionalValue`, because "nothing selected" is a legitimate value here. */
export const useSelectedObject = GraphFocusContext.useOptionalValue;

/** Stable for the provider's lifetime; the person list writes but never reads. */
export const useSetSelectedObject = SetGraphFocusContext.useValue;

export function GraphFocusProvider({
  children,
  initialSelectedObject = null,
}: {
  children: ReactNode;
  initialSelectedObject?: SelectedGraphObject | null;
}) {
  const [selectedObject, setSelectedObject] = useState<SelectedGraphObject | null>(initialSelectedObject);

  return (
    <SetGraphFocusContext.Provider value={setSelectedObject}>
      <GraphFocusContext.Provider value={selectedObject}>{children}</GraphFocusContext.Provider>
    </SetGraphFocusContext.Provider>
  );
}
