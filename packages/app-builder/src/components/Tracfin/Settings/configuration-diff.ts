import * as R from 'remeda';
import type { TracfinConfigurationFormState } from './form-state';

/**
 * Differences between the administrator's edits and the version the server holds, read against the
 * baseline the edits started from (three-way). Without the baseline, « only locally » would also mean
 * « someone else deleted it on the server », and « only on the server » « you deleted it ».
 */
export type TracfinConfigurationKeyDiff = {
  /** Added in the local edits (not in the baseline, not on the server). */
  localOnly: string[];
  /** Added on the server by someone else (not in the baseline, not in the local edits). */
  serverOnly: string[];
  /** On both sides with different content. */
  changed: string[];
  /** In the baseline and in the local edits, gone from the server: deleted by someone else. Re-applying recreates it. */
  deletedOnServer: string[];
  /** In the baseline and on the server, gone from the local edits: deleted here. Re-applying deletes it on the server. */
  deletedLocally: string[];
};

export type TracfinConfigurationDiff = {
  mappings: TracfinConfigurationKeyDiff;
  settings: TracfinConfigurationKeyDiff;
};

function diffKeys<T>(
  local: ReadonlyMap<string, T>,
  server: ReadonlyMap<string, T>,
  baseline: ReadonlyMap<string, T>,
): TracfinConfigurationKeyDiff {
  const missingFromServer = [...local.keys()].filter((key) => !server.has(key));
  const missingFromLocal = [...server.keys()].filter((key) => !local.has(key));
  return {
    localOnly: missingFromServer.filter((key) => !baseline.has(key)),
    deletedOnServer: missingFromServer.filter((key) => baseline.has(key)),
    serverOnly: missingFromLocal.filter((key) => !baseline.has(key)),
    deletedLocally: missingFromLocal.filter((key) => baseline.has(key)),
    changed: [...local.keys()].filter((key) => server.has(key) && !R.isDeepEqual(local.get(key), server.get(key))),
  };
}

/** Compares at mapping id and setting field level. `baseline` is the version the edits were started from. */
export function diffConfigurationStates(
  local: TracfinConfigurationFormState,
  server: TracfinConfigurationFormState,
  baseline: TracfinConfigurationFormState,
): TracfinConfigurationDiff {
  const byId = (state: TracfinConfigurationFormState) =>
    new Map(state.mappings.map((mapping) => [mapping.id, mapping]));
  const settings = (state: TracfinConfigurationFormState) => new Map(Object.entries(state.settings));
  return {
    mappings: diffKeys(byId(local), byId(server), byId(baseline)),
    settings: diffKeys(settings(local), settings(server), settings(baseline)),
  };
}

export function isDiffEmpty(diff: TracfinConfigurationDiff): boolean {
  return (
    Object.values(diff.mappings).every((ids) => ids.length === 0) &&
    Object.values(diff.settings).every((ids) => ids.length === 0)
  );
}
