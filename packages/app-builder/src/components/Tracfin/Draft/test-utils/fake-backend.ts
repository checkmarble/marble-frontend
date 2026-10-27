import type {
  TracfinApiError,
  TracfinBlock,
  TracfinChangeInput,
  TracfinDraft,
  TracfinDraftInput,
  TracfinPathStep,
  TracfinPrefillResult,
  TracfinResult,
  TracfinSelection,
  TracfinValue,
} from '@app-builder/models/tracfin';

const fail = (error: TracfinApiError): TracfinResult<TracfinDraft> => ({ ok: false, error });

function find(block: TracfinBlock, id: string): TracfinBlock | null {
  if (block.id === id) return block;
  for (const child of block.children ?? []) {
    const found = find(child, id);
    if (found) return found;
  }
  return null;
}

/**
 * `set_selection` of the backend (`draft.go`): a changed selection flags the whole block « à revoir »,
 * and a binding below a changed one is dropped when it is the same as before.
 */
function applySelection(block: TracfinBlock, next: TracfinSelection): void {
  const previous = block.selection;
  if (previous && JSON.stringify(previous) !== JSON.stringify(next)) {
    const changed = new Set<string>();
    if (
      JSON.stringify(previous.root) !== JSON.stringify(next.root) ||
      previous.mapping_id !== next.mapping_id ||
      previous.decision_id !== next.decision_id
    ) {
      changed.add('root');
    }
    const old = new Map((previous.bindings ?? []).map((step) => [step.id, step]));
    const kept: TracfinPathStep[] = [];
    for (const step of next.bindings ?? []) {
      const before = old.get(step.id);
      if (before && changed.has(step.parent_id ?? '') && JSON.stringify(before) === JSON.stringify(step)) {
        changed.add(step.id);
        continue;
      }
      if (!before || JSON.stringify(before) !== JSON.stringify(step)) changed.add(step.id);
      kept.push(step);
    }
    next.bindings = kept;
    const review = (target: TracfinBlock) => {
      for (const values of Object.values(target.fields ?? {})) {
        for (const value of values) {
          value.needs_review = true;
          if (value.origin && value.origin.source !== 'manual') value.origin.resolution = 'needs_review';
        }
      }
      target.children?.forEach(review);
    };
    review(block);
  }
  block.selection = next;
}

const STALE_MAPPING = 'stale-mapping-version';

/**
 * A stand-in for the PATCH endpoint, with the semantics of the backend `applyChange` that the editor
 * relies on: aliases are replaced by server ids, `set_field` without `value_id` appends, an attribute
 * needs a non-cleared owner, a stale revision is a 409. It records the bodies it received.
 */
export class FakeDraftBackend {
  draft: TracfinDraft;
  readonly bodies: TracfinDraftInput[] = [];
  /** Answers the next PATCH(es) with this result instead of applying them. */
  failures: TracfinApiError[] = [];
  /** The prefill the server would compute for a draft; `apply_prefill` recomputes it, like the backend. */
  prefill: ((draft: TracfinDraft) => TracfinPrefillResult) | null = null;
  private counter = 0;

  constructor(draft: TracfinDraft) {
    this.draft = structuredClone(draft);
  }

  /** Someone else saved a change: the revision moves on. */
  editElsewhere(change: (draft: TracfinDraft) => void): void {
    change(this.draft);
    this.draft.revision += 1;
  }

  get lastBody(): TracfinDraftInput {
    const body = this.bodies.at(-1);
    if (!body) throw new Error('No PATCH was sent');
    return body;
  }

  private id(): string {
    return `srv-${++this.counter}`;
  }

  patch(body: TracfinDraftInput): TracfinResult<TracfinDraft> {
    this.bodies.push(structuredClone(body));
    const failure = this.failures.shift();
    if (failure) return fail(failure);
    if (body.expected_revision !== this.draft.revision) {
      return fail({ kind: 'conflict', status: 409, message: 'stale revision' });
    }
    const next = structuredClone(this.draft);
    const aliases = new Map<string, string>();
    const resolve = (id: string | undefined) => (id ? (aliases.get(id) ?? id) : '');
    for (const change of body.changes) {
      const error = this.apply(next, change, aliases, resolve);
      if (error === STALE_MAPPING) return fail({ kind: 'conflict', status: 409, message: 'stale mapping version' });
      if (error) return fail({ kind: 'bad_request', status: 400, message: error });
    }
    next.revision += 1;
    this.draft = next;
    return { ok: true, data: structuredClone(next) };
  }

  private apply(
    draft: TracfinDraft,
    change: TracfinChangeInput,
    aliases: Map<string, string>,
    resolve: (id: string | undefined) => string,
  ): string | null {
    const root = draft.document.root;
    switch (change.action) {
      case 'add_block': {
        const parent = find(root, resolve(change.parent_block_id));
        if (!parent || !change.catalog_id) return 'invalid block parent or catalogue';
        // `maximum 30 principal operations` (draft.go): the 31st operation is a 400.
        if (
          change.catalog_id === '/ds/operations/operation' &&
          (parent.children ?? []).filter((child) => child.catalog_id === change.catalog_id).length >= 30
        ) {
          return 'maximum 30 principal operations';
        }
        const id = this.id();
        if (change.block_id) aliases.set(change.block_id, id);
        parent.children = [...(parent.children ?? []), { id, catalog_id: change.catalog_id }];
        return null;
      }
      case 'remove_block': {
        const target = resolve(change.block_id);
        const prune = (block: TracfinBlock) => {
          block.children = (block.children ?? []).filter((child) => child.id !== target);
          block.children.forEach(prune);
        };
        prune(root);
        return null;
      }
      case 'refresh_configuration': {
        draft.configuration = { ...draft.configuration, revision: draft.configuration.revision + 1 };
        const review = (block: TracfinBlock) => {
          for (const values of Object.values(block.fields ?? {})) for (const value of values) value.needs_review = true;
          block.children?.forEach(review);
        };
        review(root);
        return null;
      }
      case 'set_selection': {
        const block = find(root, resolve(change.block_id));
        if (!block || !change.selection) return 'selection requires a block and selection';
        // `decision already selected` (draft.go): one decision, one principal operation line.
        const decisionId = change.selection.decision_id;
        if (block.catalog_id === '/ds/operations/operation' && decisionId) {
          let duplicate = false;
          const visit = (other: TracfinBlock) => {
            if (
              other.id !== block.id &&
              other.catalog_id === block.catalog_id &&
              other.selection?.decision_id === decisionId
            ) {
              duplicate = true;
            }
            other.children?.forEach(visit);
          };
          visit(root);
          if (duplicate) return 'decision already selected';
        }
        applySelection(block, structuredClone(change.selection));
        return null;
      }
      case 'set_field':
      case 'set_relation':
      case 'clear_field': {
        const block = find(root, resolve(change.field?.block_id));
        const fieldId = change.field?.field_id;
        if (!block || !fieldId) return 'field is not editable in this block';
        const values = (block.fields ??= {})[fieldId] ?? [];
        const existing = change.field?.value_id ? values.find((value) => value.id === change.field?.value_id) : null;
        if (change.field?.value_id && !existing) return 'unknown value occurrence';
        const parentValueId = existing ? existing.parent_value_id : change.value?.parent_value_id;
        if (
          parentValueId &&
          !Object.values(block.fields ?? {})
            .flat()
            .some((v) => v.id === parentValueId && v.kind !== 'cleared')
        ) {
          return 'attribute requires its scalar owner';
        }
        const input =
          change.action === 'set_relation' ? { kind: 'reference' as const, reference: change.relation } : change.value;
        const value: TracfinValue =
          change.action === 'clear_field'
            ? { id: existing?.id ?? this.id(), kind: 'cleared', origin: { source: 'manual', resolution: 'cleared' } }
            : {
                id: existing?.id ?? this.id(),
                ...input!,
                origin: { source: 'manual', resolution: 'resolved' },
              };
        if (parentValueId) value.parent_value_id = parentValueId;
        if (existing) values[values.indexOf(existing)] = value;
        else values.push(value);
        block.fields[fieldId] = values;
        if (change.action === 'clear_field') {
          // Clearing an owner deletes its attributes.
          for (const [id, attributes] of Object.entries(block.fields)) {
            block.fields[id] = attributes.filter((attribute) => attribute.parent_value_id !== value.id);
          }
        }
        return null;
      }
      case 'apply_prefill': {
        // The server recomputes the proposals on the draft as it stands and refuses a stale or forged choice.
        const result = this.prefill?.(draft);
        if (!result) return 'no prefill';
        if (!change.mapping_version || change.mapping_version !== result.mapping_version) return STALE_MAPPING;
        const proposal = (result.proposals ?? []).find((entry) => entry.id === change.proposal_id);
        const candidate = proposal?.candidates.find((entry) => entry.id === change.candidate_id);
        if (!proposal || !candidate) return 'prefill candidate is stale or unknown';
        const block = find(root, proposal.field.block_id);
        if (!block) return 'field is not editable in this block';
        const values = (block.fields ??= {})[proposal.field.field_id] ?? [];
        const existing = proposal.field.value_id ? values.find((value) => value.id === proposal.field.value_id) : null;
        const value: TracfinValue = {
          ...candidate,
          id: existing?.id ?? this.id(),
          origin: { ...candidate.origin!, resolution: 'resolved' },
        };
        if (candidate.needs_review) value.needs_review = true;
        if (existing) values[values.indexOf(existing)] = value;
        else values.push(value);
        block.fields[proposal.field.field_id] = values;
        return null;
      }
      default:
        return 'unsupported draft change';
    }
  }
}
