import type { TracfinDraft, TracfinMapping, TracfinResult, TracfinSelection } from '@app-builder/models/tracfin';
import { useTracfinContextQuery } from '@app-builder/queries/tracfin/get-context';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Radio } from 'ui-design-system';
import { useTracfinDraftEditorContext } from '../editor/TracfinDraftEditorContext';
import { fieldLabel } from '../fields/labels';
import { NavigationStepPicker } from './NavigationStepPicker';
import { RecordLabel, RootOrigins } from './RecordLabel';
import {
  type Bindings,
  bindingsAbove,
  bindingsOf,
  buildSelection,
  chooseRecord,
  clearRecord,
  groupByRootTable,
  isStepReachable,
  mergePathSteps,
  rootKey,
  rootStep,
  rootsOfTable,
} from './selection-model';

export type TracfinSelectionEditorProps = {
  /**
   * Sends the selection. For an existing block that is `editor.setSelection(address, selection)`; for
   * a block that does not exist yet it is the whole PATCH (`add_block` + `set_selection`), so that
   * nothing is created if the analyst gives up.
   */
  save: (selection: TracfinSelection) => Promise<TracfinResult<TracfinDraft>>;
  /** The mappings that can fill this block from client data (target owned by the block, ingested source). */
  mappings: readonly TracfinMapping[];
  /** The selection the block already has. */
  current?: TracfinSelection;
  /** The root is imposed (a support of a person is read from that person's record): no root to choose. */
  fixedRoot?: { table: string; recordId: string };
  onDone: () => void;
  onCancel: () => void;
};

/**
 * Attaches a block to a record of the client base: the table to start from (the mappings that
 * apply to it are listed), the root record among the roots of the case, then one record per step of
 * the path, each chosen in a paginated list. Choosing a record again drops the choices below it
 * at once, as the server would when saving. Reusable for any block whose mappings are ingested.
 */
export function TracfinSelectionEditor({
  save: saveSelection,
  mappings,
  current,
  fixedRoot,
  onDone,
  onCancel,
}: TracfinSelectionEditorProps) {
  const { t } = useTranslation(['tracfin']);
  const editor = useTracfinDraftEditorContext();
  const context = useTracfinContextQuery(editor.caseId);

  const groups = useMemo(
    () =>
      groupByRootTable(mappings, current?.mapping_id).filter((group) => !fixedRoot || group.table === fixedRoot.table),
    [mappings, current?.mapping_id, fixedRoot],
  );
  const [table, setTable] = useState<string | null>(
    fixedRoot?.table ?? current?.root.table ?? (groups.length === 1 ? groups[0]!.table : null),
  );
  const [rootId, setRootId] = useState<string | null>(fixedRoot?.recordId ?? current?.root.record_id ?? null);
  const [bindings, setBindings] = useState<Bindings>(() => bindingsOf(current));
  const [dropped, setDropped] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  const group = groups.find((entry) => entry.table === table);
  const merged = useMemo(() => mergePathSteps(group?.mappings ?? []), [group]);
  const roots = useMemo(() => rootsOfTable(context.data?.roots ?? [], table ?? ''), [context.data, table]);
  const root = table && rootId ? rootStep(table, rootId) : null;

  const tableOf = (stepIds: string[]) => stepIds.map((id) => merged.steps.find((step) => step.id === id)?.table ?? id);
  const reset = (stepIds: string[] = []) => {
    setBindings({});
    setDropped(tableOf(stepIds));
  };

  const chooseRoot = (recordId: string) => {
    if (recordId === rootId) return;
    setRootId(recordId);
    reset(Object.keys(bindings));
  };

  const selection: TracfinSelection | null =
    group && root ? buildSelection({ mappingId: group.anchorMappingId, root, steps: merged.steps, bindings }) : null;

  const save = async () => {
    if (!selection) return;
    setSaving(true);
    setFailed(false);
    try {
      const result = await saveSelection(selection);
      if (result.ok) onDone();
      else setFailed(true);
    } finally {
      setSaving(false);
    }
  };

  const rootInContext = roots.some((entry) => entry.record_id === rootId);

  return (
    <div className="border-grey-border bg-surface-card flex min-w-0 flex-col gap-md rounded-lg border p-md">
      {groups.length === 0 ? (
        <p className="text-s text-grey-secondary">
          {fixedRoot
            ? t('tracfin:draft.persons.selection.no_mapping_for_table', { table: fixedRoot.table })
            : t('tracfin:draft.persons.selection.no_mapping')}
        </p>
      ) : (
        <>
          {groups.length > 1 && !fixedRoot ? (
            <fieldset className="flex flex-col gap-xs">
              <legend className="text-s font-medium">{t('tracfin:draft.persons.selection.table')}</legend>
              <Radio.Root
                aria-label={t('tracfin:draft.persons.selection.table')}
                size="small"
                value={table ?? ''}
                onValueChange={(next) => {
                  if (next === table) return;
                  setTable(next);
                  setRootId(null);
                  reset(Object.keys(bindings));
                }}
                className="flex-col gap-xs"
              >
                {groups.map((entry) => (
                  <Radio.Item key={entry.table} value={entry.table}>
                    <span className="text-s">
                      {entry.table}
                      <span className="text-grey-secondary ms-xs text-xs">
                        {t('tracfin:draft.persons.selection.mapping_count', { count: entry.mappings.length })}
                      </span>
                    </span>
                  </Radio.Item>
                ))}
              </Radio.Root>
            </fieldset>
          ) : null}

          {group ? (
            <details className="text-xs">
              <summary className="text-grey-secondary cursor-pointer">
                {t('tracfin:draft.persons.selection.mappings_title', { table: group.table })}
              </summary>
              <ul className="mt-xs flex flex-col gap-2xs">
                {group.mappings.map((mapping) => {
                  const target = editor.catalogIndex.field(mapping.target_field);
                  const via = (mapping.source.path ?? []).map((step) => step.table).join(' › ');
                  return (
                    <li key={mapping.id}>
                      <span className="font-mono">
                        {[group.table, via, mapping.source.field].filter(Boolean).join(' › ')}
                      </span>
                      {' → '}
                      {target ? fieldLabel(t, target) : mapping.target_field}
                    </li>
                  );
                })}
              </ul>
            </details>
          ) : null}

          {table ? (
            <section className="flex flex-col gap-xs" aria-label={t('tracfin:draft.persons.selection.root_title')}>
              <p className="text-s font-medium">{t('tracfin:draft.persons.selection.root_title')}</p>
              {fixedRoot ? (
                <p className="text-s">
                  <RecordLabel table={fixedRoot.table} recordId={fixedRoot.recordId} />
                </p>
              ) : context.isPending ? (
                <p className="text-grey-secondary text-xs">{t('tracfin:draft.persons.selection.loading')}</p>
              ) : context.isError ? (
                <p role="alert" className="text-s text-red-primary">
                  {t('tracfin:draft.persons.context.load_failed')}
                </p>
              ) : roots.length === 0 && !rootId ? (
                <p className="text-grey-secondary text-s">{t('tracfin:draft.persons.selection.no_root', { table })}</p>
              ) : (
                <Radio.Root
                  aria-label={t('tracfin:draft.persons.selection.root_title')}
                  size="small"
                  value={rootId ?? ''}
                  onValueChange={chooseRoot}
                  className="flex-col gap-xs"
                >
                  {roots.map((entry) => (
                    <Radio.Item key={rootKey(entry)} value={entry.record_id}>
                      <span className="flex min-w-0 flex-col gap-2xs">
                        <RecordLabel table={entry.table} recordId={entry.record_id} />
                        <RootOrigins origins={entry.origins} />
                      </span>
                    </Radio.Item>
                  ))}
                  {rootId && !rootInContext ? (
                    <Radio.Item value={rootId}>
                      <span className="flex min-w-0 flex-col gap-2xs">
                        <RecordLabel table={table} recordId={rootId} />
                        <span className="text-xs text-orange-primary">
                          {t('tracfin:draft.persons.selection.root_left_context')}
                        </span>
                      </span>
                    </Radio.Item>
                  ) : null}
                </Radio.Root>
              )}
            </section>
          ) : null}

          {merged.inconsistent.length > 0 ? (
            <p role="alert" className="text-s text-red-primary">
              {t('tracfin:draft.persons.selection.inconsistent', { steps: merged.inconsistent.join(', ') })}
            </p>
          ) : null}

          {root && merged.inconsistent.length === 0 && merged.steps.length > 0 ? (
            <ol className="flex flex-col gap-md" aria-label={t('tracfin:draft.persons.selection.steps_title')}>
              {merged.steps.map((step) => {
                const reachable = isStepReachable(step, bindings);
                const above = bindingsAbove(merged.steps, bindings, step.id);
                return (
                  <li key={step.id} className="ms-md border-grey-border border-s ps-md">
                    {reachable ? (
                      <NavigationStepPicker
                        step={step}
                        selection={{
                          mapping_id: group!.anchorMappingId,
                          root,
                          ...(above.length > 0 ? { bindings: above } : {}),
                        }}
                        chosen={bindings[step.id]}
                        onChoose={(recordId) => {
                          const next = chooseRecord(merged.steps, bindings, step, recordId);
                          setBindings(next.bindings);
                          setDropped(tableOf(next.dropped));
                        }}
                        onClear={() => {
                          const next = clearRecord(merged.steps, bindings, step.id);
                          setBindings(next.bindings);
                          setDropped(tableOf(next.dropped));
                        }}
                      />
                    ) : (
                      <div className="flex flex-col gap-xs">
                        <p className="text-s font-medium">{step.table}</p>
                        <p className="text-grey-secondary text-xs">
                          {t('tracfin:draft.persons.selection.choose_parent_first')}
                        </p>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          ) : null}

          {dropped.length > 0 ? (
            <p role="status" className="text-s text-orange-primary">
              {t('tracfin:draft.persons.selection.dropped', { steps: dropped.join(', ') })}
            </p>
          ) : null}
          {failed ? (
            <p role="alert" className="text-s text-red-primary">
              {t('tracfin:draft.persons.selection.save_failed')}
            </p>
          ) : null}
          {selection && merged.steps.some((step) => !bindings[step.id]) ? (
            <p className="text-grey-secondary text-xs">{t('tracfin:draft.persons.selection.unbound_hint')}</p>
          ) : null}
        </>
      )}

      <div className="flex flex-wrap gap-sm">
        <Button
          variant="primary"
          size="small"
          disabled={!selection || saving || merged.inconsistent.length > 0}
          onClick={() => void save()}
        >
          {t('tracfin:draft.persons.selection.save')}
        </Button>
        <Button variant="secondary" appearance="stroked" size="small" onClick={onCancel}>
          {t('tracfin:draft.persons.selection.cancel')}
        </Button>
      </div>
    </div>
  );
}
