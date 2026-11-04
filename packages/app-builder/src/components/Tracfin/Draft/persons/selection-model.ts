import type {
  TracfinContextRoot,
  TracfinDraft,
  TracfinMapping,
  TracfinPathStep,
  TracfinSelection,
} from '@app-builder/models/tracfin';
import type { TracfinCatalogIndex } from '@app-builder/models/tracfin/catalog-index';

/** Reserved by the contract: the id of the selection root, parent of the first step. */
export const ROOT_STEP_ID = 'root';

/** The mappings of the configuration copied into the draft (the live configuration is not what the draft follows). */
export const draftMappings = (draft: TracfinDraft): readonly TracfinMapping[] => draft.configuration.mappings ?? [];

/**
 * The ingested mappings whose target field is owned by the block (backend rule for `mapping_id`:
 * « target_field is owned by that block, source is ingested »). `ownerBlockOf` climbs through the
 * scalar parent of an attribute, like the backend `CompatibleParent`.
 */
export function mappingsOwnedBy(
  mappings: readonly TracfinMapping[],
  catalogIndex: TracfinCatalogIndex,
  blockCatalogId: string,
): TracfinMapping[] {
  return mappings.filter(
    (mapping) =>
      mapping.source.kind === 'ingested' &&
      !!mapping.source.table &&
      catalogIndex.ownerBlockOf(mapping.target_field) === blockCatalogId,
  );
}

/** The mappings that start from one table: choosing a root of that table makes all of them applicable. */
export type MappingGroup = {
  table: string;
  mappings: TracfinMapping[];
  /** The mapping a selection of this group names as `mapping_id`: the one it already has, else the first. */
  anchorMappingId: string;
};

export function groupByRootTable(mappings: readonly TracfinMapping[], currentMappingId?: string): MappingGroup[] {
  const groups = new Map<string, TracfinMapping[]>();
  for (const mapping of mappings) {
    const table = mapping.source.table;
    if (mapping.source.kind !== 'ingested' || !table) continue;
    const list = groups.get(table) ?? [];
    list.push(mapping);
    groups.set(table, list);
  }
  return [...groups].map(([table, list]) => ({
    table,
    mappings: list,
    anchorMappingId: list.find((mapping) => mapping.id === currentMappingId)?.id ?? list[0]!.id,
  }));
}

/** A step of the merged path, without a record. */
export type PathStepDefinition = Omit<TracfinPathStep, 'record_id'>;

export type MergedPath = {
  /** Parents before children (depth first, in the order the mappings list them). */
  steps: PathStepDefinition[];
  /** Ids that two mappings use for different hops: the configuration is inconsistent, the server refuses it. */
  inconsistent: string[];
};

const sameHop = (a: PathStepDefinition, b: PathStepDefinition) =>
  (a.parent_id ?? ROOT_STEP_ID) === (b.parent_id ?? ROOT_STEP_ID) &&
  a.table === b.table &&
  a.link === b.link &&
  a.direction === b.direction;

/**
 * The steps to walk to reach every record the mappings read: the union of their `source.path`
 * steps. The same step id in two mappings must denote the same hop (backend `selectionSteps`).
 */
export function mergePathSteps(mappings: readonly TracfinMapping[]): MergedPath {
  const byId = new Map<string, PathStepDefinition>();
  const inconsistent = new Set<string>();
  const order: string[] = [];
  for (const mapping of mappings) {
    for (const raw of mapping.source.path ?? []) {
      const { record_id: _recordId, ...step } = raw;
      const known = byId.get(step.id);
      if (!known) {
        byId.set(step.id, step);
        order.push(step.id);
      } else if (!sameHop(known, step)) {
        inconsistent.add(step.id);
      }
    }
  }
  // Depth first from the root, so that a step always comes after its parent.
  const steps: PathStepDefinition[] = [];
  const visit = (parentId: string) => {
    for (const id of order) {
      const step = byId.get(id)!;
      if ((step.parent_id ?? ROOT_STEP_ID) !== parentId) continue;
      steps.push(step);
      visit(id);
    }
  };
  visit(ROOT_STEP_ID);
  // A step whose parent is missing from the union is unreachable: kept at the end, flagged.
  for (const id of order) {
    if (!steps.some((step) => step.id === id)) {
      steps.push(byId.get(id)!);
      inconsistent.add(id);
    }
  }
  return { steps, inconsistent: [...inconsistent] };
}

/** The ids of the steps below a step (its children, their children...). */
export function descendantIds(steps: readonly PathStepDefinition[], stepId: string): Set<string> {
  const below = new Set<string>();
  const queue = [stepId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const step of steps) {
      if ((step.parent_id ?? ROOT_STEP_ID) === current && !below.has(step.id)) {
        below.add(step.id);
        queue.push(step.id);
      }
    }
  }
  return below;
}

/** Bindings by step id. A binding is the step copied with the `record_id` that was chosen. */
export type Bindings = Readonly<Record<string, TracfinPathStep>>;

/**
 * Chooses a record for a step. The choices below it are dropped, as the server does when the
 * selection is saved: they were made under another parent and do not hold any more.
 * `dropped` lists the steps that lost their choice, so the screen can say so.
 */
export function chooseRecord(
  steps: readonly PathStepDefinition[],
  bindings: Bindings,
  step: PathStepDefinition,
  recordId: string,
): { bindings: Bindings; dropped: string[] } {
  const next: Record<string, TracfinPathStep> = { ...bindings };
  const dropped: string[] = [];
  const unchanged = bindings[step.id]?.record_id === recordId;
  if (!unchanged) {
    for (const id of descendantIds(steps, step.id)) {
      if (next[id]) {
        delete next[id];
        dropped.push(id);
      }
    }
  }
  next[step.id] = { ...step, record_id: recordId };
  return { bindings: next, dropped };
}

/** Un-choosing a step also drops what was chosen below it. */
export function clearRecord(steps: readonly PathStepDefinition[], bindings: Bindings, stepId: string) {
  const next: Record<string, TracfinPathStep> = { ...bindings };
  const dropped: string[] = [];
  for (const id of [stepId, ...descendantIds(steps, stepId)]) {
    if (next[id]) {
      delete next[id];
      if (id !== stepId) dropped.push(id);
    }
  }
  return { bindings: next, dropped };
}

/** The chosen records on the way from the root to a step (not the step itself), parents first. */
export function bindingsAbove(
  steps: readonly PathStepDefinition[],
  bindings: Bindings,
  stepId: string,
): TracfinPathStep[] {
  const chain: TracfinPathStep[] = [];
  let current = steps.find((step) => step.id === stepId);
  while (current && (current.parent_id ?? ROOT_STEP_ID) !== ROOT_STEP_ID) {
    const parent = steps.find((step) => step.id === current!.parent_id);
    const binding = parent ? bindings[parent.id] : undefined;
    if (!parent || !binding) return [];
    chain.unshift(binding);
    current = parent;
  }
  return chain;
}

/** A step can be walked once the record of its parent is chosen (the root always is). */
export function isStepReachable(step: PathStepDefinition, bindings: Bindings): boolean {
  const parentId = step.parent_id ?? ROOT_STEP_ID;
  return parentId === ROOT_STEP_ID || bindings[parentId] !== undefined;
}

export function rootStep(table: string, recordId: string): TracfinPathStep {
  return { id: ROOT_STEP_ID, table, record_id: recordId };
}

/** The selection to save (or to navigate with): the bindings in step order, only the chosen ones. */
export function buildSelection({
  mappingId,
  root,
  steps,
  bindings,
}: {
  mappingId: string;
  root: TracfinPathStep;
  steps: readonly PathStepDefinition[];
  bindings: Bindings;
}): TracfinSelection {
  const chosen = steps.flatMap((step) => (bindings[step.id] ? [bindings[step.id]!] : []));
  return { mapping_id: mappingId, root, ...(chosen.length > 0 ? { bindings: chosen } : {}) };
}

/** The bindings of a saved selection, by step id. */
export function bindingsOf(selection: TracfinSelection | undefined): Bindings {
  return Object.fromEntries((selection?.bindings ?? []).map((binding) => [binding.id, binding]));
}

/** `table · record`, then one `table · record` per chosen step: how a saved selection is read back. */
export function selectionPathLabel(selection: TracfinSelection): { table: string; recordId: string }[] {
  return [selection.root, ...(selection.bindings ?? [])].map((step) => ({
    table: step.table,
    recordId: step.record_id ?? '',
  }));
}

/** The context roots that are of the table the mappings start from. */
export function rootsOfTable(roots: readonly TracfinContextRoot[], table: string): TracfinContextRoot[] {
  return roots.filter((root) => root.table === table);
}

export const rootKey = (root: Pick<TracfinContextRoot, 'table' | 'record_id'>) =>
  `${root.table}\u0000${root.record_id}`;
