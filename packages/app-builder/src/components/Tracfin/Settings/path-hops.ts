import type { DataModel, LinkToSingle, TableModel } from '@app-builder/models/data-model';
import type { TracfinMapping, TracfinPathStep } from '@app-builder/models/tracfin';

/** Reserved by the contract: the id of the selection root, parent of the first step. */
export const TRACFIN_ROOT_STEP_ID = 'root';

/** The backend refuses a path of more than 20 jumps. */
export const TRACFIN_MAX_PATH_STEPS = 20;

export type TracfinPathDirection = 'forward' | 'inverse';

/**
 * One named edge of the data model, seen from the table the path is currently on:
 * - `forward`: the current table is the child of the link, the step goes to its single parent;
 * - `inverse`: the current table is the parent of the link, the step goes to the collection of children.
 */
export type TracfinPathHop = {
  link: string;
  direction: TracfinPathDirection;
  /** The table the step leads to. */
  table: string;
  /**
   * Inverse hops need a valid navigation option on the current table, otherwise the server answers
   * `NAVIGATION_INDEX_UNAVAILABLE`. Always `true` for a forward hop.
   */
  indexed: boolean;
};

function findTable(dataModel: DataModel, name: string): TableModel | undefined {
  return dataModel.find((table) => table.name === name);
}

/** The exact option `linkFields` (backend) looks for to walk a link from its parent to its children. */
function hasValidNavigation(from: TableModel, link: LinkToSingle): boolean {
  return (
    from.navigationOptions?.some(
      (option) =>
        option.sourceFieldName === link.parentFieldName &&
        option.targetTableName === link.childTableName &&
        option.filterFieldName === link.childFieldName &&
        option.status === 'valid',
    ) ?? false
  );
}

/** Every hop that leaves `fromTable`: the links it is the child of, then the links it is the parent of. */
export function listAvailableHops(dataModel: DataModel, fromTable: string): TracfinPathHop[] {
  const from = findTable(dataModel, fromTable);
  if (!from) return [];

  const forward: TracfinPathHop[] = from.linksToSingle
    .filter((link) => link.childTableName === fromTable)
    .map((link) => ({ link: link.name, direction: 'forward', table: link.parentTableName, indexed: true }));

  const inverse: TracfinPathHop[] = dataModel.flatMap((table) =>
    table.linksToSingle
      .filter((link) => link.parentTableName === fromTable && link.childTableName === table.name)
      .map(
        (link): TracfinPathHop => ({
          link: link.name,
          direction: 'inverse',
          table: link.childTableName,
          indexed: hasValidNavigation(from, link),
        }),
      ),
  );

  return [...forward, ...inverse];
}

export type TracfinStepStatus =
  /** The link exists in the data model, and the step can be walked. */
  | 'ok'
  /** The link is not in the data model (any more), or does not join these tables in this direction. */
  | 'unknown_link'
  /** The link exists, but the inverse hop has no valid navigation option. */
  | 'not_indexed';

/** Checks one stored step against the data model, walking from `fromTable`. */
export function getStepStatus(dataModel: DataModel, fromTable: string, step: TracfinPathStep): TracfinStepStatus {
  const hop = listAvailableHops(dataModel, fromTable).find(
    (candidate) =>
      candidate.link === step.link && candidate.direction === step.direction && candidate.table === step.table,
  );
  if (!hop) return 'unknown_link';
  return hop.indexed ? 'ok' : 'not_indexed';
}

/** The table a path ends on: the last step's table, or the root table for an empty path. */
export function getPathEndTable(rootTable: string, path: readonly TracfinPathStep[]): string {
  return path.at(-1)?.table ?? rootTable;
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug === '' ? 'step' : slug;
}

/** Steps already defined by the other ingested mappings that start from the same root table. */
function stepsOfSameRoot(mappings: readonly TracfinMapping[], excludedMappingId: string, rootTable: string) {
  return mappings
    .filter(
      (mapping) =>
        mapping.id !== excludedMappingId && mapping.source.kind === 'ingested' && mapping.source.table === rootTable,
    )
    .flatMap((mapping) => mapping.source.path ?? []);
}

/**
 * The step to append after `kept` for `hop`. A step id denotes one hop for every mapping of a root
 * table (`INCONSISTENT_MAPPING_PATH`), so an identical hop (same parent step, link, direction and
 * table) already defined by another mapping of the same root table keeps its id; otherwise the id is
 * the slug of the target table (or of table and link when that is taken), unique among the steps of
 * that root table.
 */
export function buildPathStep({
  mappings,
  mappingId,
  rootTable,
  kept,
  hop,
}: {
  mappings: readonly TracfinMapping[];
  mappingId: string;
  rootTable: string;
  kept: readonly TracfinPathStep[];
  hop: Pick<TracfinPathHop, 'link' | 'direction' | 'table'>;
}): TracfinPathStep {
  const parentId = kept.at(-1)?.id ?? TRACFIN_ROOT_STEP_ID;
  const others = stepsOfSameRoot(mappings, mappingId, rootTable);
  const keptIds = new Set(kept.map((step) => step.id));

  const identical = others.find(
    (step) =>
      step.parent_id === parentId &&
      step.link === hop.link &&
      step.direction === hop.direction &&
      step.table === hop.table &&
      !keptIds.has(step.id),
  );

  let id = identical?.id;
  if (id === undefined) {
    const used = new Set([TRACFIN_ROOT_STEP_ID, ...keptIds, ...others.map((step) => step.id)]);
    // The table names the step; two different hops to the same table are told apart by their link.
    id = [slugify(hop.table), slugify(`${hop.table}-${hop.link}`)].find((candidate) => !used.has(candidate));
    if (id === undefined) {
      const base = slugify(`${hop.table}-${hop.link}`);
      let suffix = 2;
      while (used.has(`${base}-${suffix}`)) suffix += 1;
      id = `${base}-${suffix}`;
    }
  }

  return { id, parent_id: parentId, link: hop.link, direction: hop.direction, table: hop.table };
}
