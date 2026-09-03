import { createSimpleContext } from '@app-builder/utils/create-context';
import { type ReactNode } from 'react';
import { type GraphIndex } from '../lib/graph-index';

const GraphIndexContext = createSimpleContext<GraphIndex>('GraphIndex');

/**
 * The adjacency index for the graph currently on screen. Node and edge
 * components read it on every mouse move, so the value has to stay
 * referentially stable between hovers — it is rebuilt only when the laid-out
 * graph changes.
 */
export const useGraphIndex = GraphIndexContext.useValue;

export function GraphIndexProvider({ index, children }: { index: GraphIndex; children: ReactNode }) {
  return <GraphIndexContext.Provider value={index}>{children}</GraphIndexContext.Provider>;
}
