import * as R from 'remeda';
import type { TracfinConfigurationFormState } from './form-state';

/** Differences between the administrator's edits and the version the server holds. */
export type TracfinConfigurationDiff = {
  mappings: {
    /** Only in the local edits. */
    localOnly: string[];
    /** Only on the server (added by someone else, or removed locally). */
    serverOnly: string[];
    /** On both sides with different content. */
    changed: string[];
  };
  settings: {
    localOnly: string[];
    serverOnly: string[];
    changed: string[];
  };
};

function diffKeys<T>(local: ReadonlyMap<string, T>, server: ReadonlyMap<string, T>) {
  const localOnly = [...local.keys()].filter((key) => !server.has(key));
  const serverOnly = [...server.keys()].filter((key) => !local.has(key));
  const changed = [...local.keys()].filter((key) => server.has(key) && !R.isDeepEqual(local.get(key), server.get(key)));
  return { localOnly, serverOnly, changed };
}

/** Compares at mapping id and setting field level. */
export function diffConfigurationStates(
  local: TracfinConfigurationFormState,
  server: TracfinConfigurationFormState,
): TracfinConfigurationDiff {
  const byId = (state: TracfinConfigurationFormState) =>
    new Map(state.mappings.map((mapping) => [mapping.id, mapping]));
  return {
    mappings: diffKeys(byId(local), byId(server)),
    settings: diffKeys(new Map(Object.entries(local.settings)), new Map(Object.entries(server.settings))),
  };
}

export function isDiffEmpty(diff: TracfinConfigurationDiff): boolean {
  return (
    Object.values(diff.mappings).every((ids) => ids.length === 0) &&
    Object.values(diff.settings).every((ids) => ids.length === 0)
  );
}
