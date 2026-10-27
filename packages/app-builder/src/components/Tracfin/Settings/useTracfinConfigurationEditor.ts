import type { TracfinConfiguration, TracfinFieldInput, TracfinMapping } from '@app-builder/models/tracfin';
import type { TracfinCatalogIndex } from '@app-builder/models/tracfin/catalog-index';
import { useTracfinPutConfigurationMutation } from '@app-builder/queries/tracfin/put-configuration';
import { useMemo, useState } from 'react';
import { diffConfigurationStates, type TracfinConfigurationDiff } from './configuration-diff';
import { classifySaveFailure, placeConfigurationErrors, type TracfinSaveFailure } from './configuration-errors';
import {
  buildConfigurationInput,
  configurationToFormState,
  isFormStateEqual,
  type TracfinConfigurationFormState,
} from './form-state';
import { createMapping, duplicateMapping, setPathHop } from './mapping-edits';
import type { TracfinPathHop } from './path-hops';
import { listSettingsFieldIds, type TracfinSettingsSection } from './settings-layout';

/** The server version fetched after a 409, set against the administrator's edits. */
export type TracfinConflictComparison = {
  server: TracfinConfiguration | null;
  diff: TracfinConfigurationDiff;
};

type Settings = Record<string, TracfinFieldInput>;

/**
 * The state of the configuration screen: the form, the revision the next PUT is guarded by, the
 * last rejected save and the 409 comparison. The form is initialised once from the loaded
 * configuration; later changes of the query cache never overwrite what is being edited.
 */
export function useTracfinConfigurationEditor({
  initialConfiguration,
  catalogIndex,
  settingsLayout,
  reloadConfiguration,
}: {
  initialConfiguration: TracfinConfiguration | null;
  catalogIndex: TracfinCatalogIndex;
  settingsLayout: TracfinSettingsSection[];
  /** Fetches the configuration the server holds now (`null` when there is none). */
  reloadConfiguration: () => Promise<TracfinConfiguration | null>;
}) {
  const putConfiguration = useTracfinPutConfigurationMutation();
  const [initialState] = useState(() => configurationToFormState(initialConfiguration));
  const [state, setState] = useState<TracfinConfigurationFormState>(initialState);
  const [baseline, setBaseline] = useState<TracfinConfigurationFormState>(initialState);
  const [revision, setRevision] = useState(initialConfiguration?.revision ?? 0);
  const [failure, setFailure] = useState<TracfinSaveFailure | null>(null);
  const [comparison, setComparison] = useState<TracfinConflictComparison | null>(null);
  const [reloadFailed, setReloadFailed] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  const dirty = !isFormStateEqual(state, baseline);

  const placement = useMemo(
    () =>
      placeConfigurationErrors({
        errors: failure?.kind === 'invalid' ? failure.errors : [],
        mappings: state.mappings,
        settingFieldIds: new Set([...listSettingsFieldIds(settingsLayout), ...Object.keys(state.settings)]),
      }),
    [failure, state.mappings, state.settings, settingsLayout],
  );

  const adopt = (configuration: TracfinConfiguration | null) => {
    const next = configurationToFormState(configuration);
    setState(next);
    setBaseline(next);
    setRevision(configuration?.revision ?? 0);
    setFailure(null);
    setComparison(null);
    setReloadFailed(false);
  };

  return {
    state,
    dirty,
    revision,
    failure,
    placement,
    comparison,
    reloadFailed,
    isReloading,
    isSaving: putConfiguration.isPending,

    setSettings: (updater: (settings: Settings) => Settings) =>
      setState((current) => ({ ...current, settings: updater(current.settings) })),

    updateMapping: (mapping: TracfinMapping) =>
      setState((current) => ({
        ...current,
        mappings: current.mappings.map((existing) => (existing.id === mapping.id ? mapping : existing)),
      })),

    /** Adds a mapping for `targetField` and returns its id. */
    addMapping: (targetField: string): string => {
      const mapping = createMapping({
        targetField,
        existingIds: state.mappings.map(({ id }) => id),
        catalogIndex,
      });
      setState((current) => ({ ...current, mappings: [...current.mappings, mapping] }));
      return mapping.id;
    },

    /** Inserts a copy right after the original and returns the id of the copy. */
    duplicateMapping: (mappingId: string): string => {
      const original = state.mappings.find(({ id }) => id === mappingId);
      if (!original) return mappingId;
      const copy = duplicateMapping(
        original,
        state.mappings.map(({ id }) => id),
      );
      setState((current) => {
        const index = current.mappings.findIndex(({ id }) => id === mappingId);
        const mappings = [...current.mappings];
        mappings.splice(index + 1, 0, copy);
        return { ...current, mappings };
      });
      return copy.id;
    },

    removeMapping: (mappingId: string) =>
      setState((current) => ({ ...current, mappings: current.mappings.filter(({ id }) => id !== mappingId) })),

    chooseHop: (mappingId: string, index: number, hop: Pick<TracfinPathHop, 'link' | 'direction' | 'table'>) =>
      setState((current) => ({
        ...current,
        mappings: setPathHop({ mappings: current.mappings, mappingId, index, hop }),
      })),

    /** Resolves to `true` when the server accepted the configuration. The form is kept on any failure. */
    save: async (): Promise<boolean> => {
      setFailure(null);
      try {
        const configuration = await putConfiguration.mutateAsync(
          buildConfigurationInput({ state, expectedRevision: revision, catalogIndex }),
        );
        adopt(configuration);
        return true;
      } catch (error) {
        setFailure(classifySaveFailure(error));
        return false;
      }
    },

    /** Drops the unsaved edits. */
    reset: () => {
      setState(baseline);
      setFailure(null);
      setComparison(null);
    },

    /** After a 409: fetches the server version and compares it with the edits. Nothing is overwritten. */
    reloadServerVersion: async () => {
      setIsReloading(true);
      setReloadFailed(false);
      try {
        const server = await reloadConfiguration();
        setComparison({ server, diff: diffConfigurationStates(state, configurationToFormState(server)) });
      } catch {
        setReloadFailed(true);
      } finally {
        setIsReloading(false);
      }
    },

    /**
     * Re-applies the edits on the server version: the next save is guarded by the server revision, so
     * it replaces what the server holds with the edits. The comparison was shown first.
     */
    keepLocalEdits: () => {
      if (!comparison) return;
      setBaseline(configurationToFormState(comparison.server));
      setRevision(comparison.server?.revision ?? 0);
      setFailure(null);
      setComparison(null);
    },

    /** Gives up the edits for the server version. */
    takeServerVersion: () => {
      if (comparison) adopt(comparison.server);
    },
  };
}
