import { type ComponentType, createContext, useContext } from 'react';
import type { TracfinBlockAddress } from '../model/block-address';

export type TracfinBlockExtrasProps = {
  address: TracfinBlockAddress;
  /** The catalog block the instance belongs to. */
  catalogId: string;
};

/**
 * A component the generic block editor renders at the top of every block it shows, when a section
 * provides one. The Persons section uses it to show a block's selection from client data, its
 * diagnostics and the actions on them, without the block editor knowing about either.
 */
export const TracfinBlockExtrasContext = createContext<ComponentType<TracfinBlockExtrasProps> | null>(null);

export const useTracfinBlockExtras = () => useContext(TracfinBlockExtrasContext);
