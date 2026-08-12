import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { Panel } from '@app-builder/components/Panel';
import { CollapsiblePaper } from '@app-builder/components/Paper';
import { type DataModel, type DataModelField, type TableModel } from '@app-builder/models/data-model';
import { type GraphRelation } from '@app-builder/models/graph';
import { useCreateGraphRelationMutation } from '@app-builder/queries/graph/create-relation';
import { useDeleteGraphRelationMutation } from '@app-builder/queries/graph/delete-relation';
import { useDeleteGraphRelationsMutation } from '@app-builder/queries/graph/delete-relations';
import { useListGraphRelationsQuery } from '@app-builder/queries/graph/list-relations';
import { createGraphRelationPayloadSchema } from '@app-builder/schemas/graph';
import { getFieldErrors, handleSubmit } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { useMemo, useState } from 'react';
import { Button, Input, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';
import { GraphOptionSelect } from './GraphOptionSelect';
import { GraphTabSwitch } from './GraphTabSwitch';
import { useTestGraphSession } from './TestGraphSessionContext';

function fieldSemanticKey(field: DataModelField): string | null {
  if (!field.semanticType) return null;
  return `${field.semanticType}:${field.semanticSubType ?? ''}`;
}

/** Fields that can anchor a relation: only those carrying a semantic type. */
function semanticFields(table: TableModel | undefined): DataModelField[] {
  return (table?.fields ?? []).filter((field) => fieldSemanticKey(field) != null);
}

/** The right side can only join fields sharing the left side's semantic key. */
function joinableFields(rightTable: TableModel | undefined, leftField: DataModelField | undefined): DataModelField[] {
  if (!rightTable || !leftField) return [];
  const leftKey = fieldSemanticKey(leftField);
  if (!leftKey) return [];
  return rightTable.fields.filter((field) => fieldSemanticKey(field) === leftKey);
}

/** The relations sharing one label, which is what the settings UI calls a "setting". */
type RelationGroup = { label: string; relations: GraphRelation[] };

function groupRelationsByLabel(relations: GraphRelation[]): RelationGroup[] {
  const groups = new Map<string, GraphRelation[]>();
  for (const relation of relations) {
    const existing = groups.get(relation.label);
    if (existing) {
      existing.push(relation);
    } else {
      groups.set(relation.label, [relation]);
    }
  }
  return [...groups.entries()].map(([label, grouped]) => ({ label, relations: grouped }));
}

function isDuplicateRelation(
  relations: GraphRelation[],
  label: string,
  candidate: Pick<GraphRelation, 'leftType' | 'leftField' | 'rightType' | 'rightField'>,
): boolean {
  return relations.some(
    (relation) =>
      relation.label === label &&
      relation.leftType === candidate.leftType &&
      relation.leftField === candidate.leftField &&
      relation.rightType === candidate.rightType &&
      relation.rightField === candidate.rightField,
  );
}

const RELATION_SCOPE_OPTIONS = [
  { value: 'same-table', label: 'Same table' },
  { value: 'cross-table', label: 'Cross table' },
] as const;

type RelationScope = (typeof RELATION_SCOPE_OPTIONS)[number]['value'];

const createLabelSchema = z.object({
  label: z.string().trim().min(1),
});

const relationFormSchema = createGraphRelationPayloadSchema.omit({ label: true });

function TableFieldSelect({
  label,
  tables,
  tableName,
  fieldName,
  onTableChange,
  onFieldChange,
  fieldOptions,
  disabled,
  tableDisabled,
}: {
  label: string;
  tables: TableModel[];
  tableName: string;
  fieldName: string;
  onTableChange: (tableName: string) => void;
  onFieldChange: (fieldName: string) => void;
  fieldOptions: DataModelField[];
  disabled?: boolean;
  /** Lock the table select (e.g. same-table relations) while still allowing a field pick. */
  tableDisabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-xs">
      <span className="text-grey-secondary text-xs">{label}</span>
      <div className="flex flex-wrap gap-sm">
        <GraphOptionSelect
          className="min-w-40"
          value={tableName}
          placeholder="Table"
          disabled={disabled || tableDisabled}
          options={tables.map((table) => ({ value: table.name, label: table.name }))}
          onChange={onTableChange}
        />
        <GraphOptionSelect
          className="min-w-40"
          value={fieldName}
          placeholder="Field"
          disabled={disabled || !tableName}
          options={fieldOptions.map((field) => ({ value: field.name, label: field.alias || field.name }))}
          onChange={onFieldChange}
        />
      </div>
    </div>
  );
}

function RelationEndpoints({ relation }: { relation: GraphRelation }) {
  return (
    <div className="text-grey-secondary flex min-w-0 items-center gap-xs text-xs">
      <span className="truncate">
        {relation.leftType}.{relation.leftField}
      </span>
      <Icon icon="arrow-range" className="size-3.5 shrink-0 text-purple-primary" />
      <span className="truncate">
        {relation.rightType}.{relation.rightField}
      </span>
    </div>
  );
}

function CreateLabelModal({
  open,
  onOpenChange,
  onSubmitLabel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitLabel: (label: string) => void;
}) {
  const form = useForm({
    defaultValues: { label: '' },
    validators: { onSubmit: createLabelSchema },
    onSubmit: ({ value, formApi }) => {
      if (!formApi.state.isValid) return;
      const label = value.label.trim();
      formApi.reset();
      onOpenChange(false);
      onSubmitLabel(label);
    },
  });

  return (
    <Modal.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) form.reset();
        onOpenChange(next);
      }}
    >
      <Modal.Content>
        <form onSubmit={handleSubmit(form)}>
          <Modal.Title>Create setting</Modal.Title>
          <div className="flex flex-col gap-lg p-lg">
            <form.Field
              name="label"
              validators={{
                onBlur: createLabelSchema.shape.label,
                onChange: createLabelSchema.shape.label,
              }}
            >
              {(field) => (
                <div className="flex flex-col gap-xs">
                  <FormLabel name={field.name} className="text-grey-secondary text-xs">
                    Label
                  </FormLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.currentTarget.value)}
                    onBlur={field.handleBlur}
                    borderColor={field.state.meta.errors.length === 0 ? 'greyfigma-90' : 'redfigma-47'}
                    placeholder="e.g. iban"
                  />
                  <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                </div>
              )}
            </form.Field>
          </div>
          <Modal.Footer>
            <Modal.FooterButton isCloseButton label="Cancel" />
            <form.Subscribe selector={(state) => createLabelSchema.safeParse(state.values).success}>
              {(isValid) => <Modal.FooterButton type="submit" variant="primary" label="Continue" disabled={!isValid} />}
            </form.Subscribe>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}

function DeleteSettingModal({
  group,
  onOpenChange,
  onConfirm,
  isPending,
}: {
  group: RelationGroup;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
}) {
  const relationCount = group.relations.length;

  return (
    <Modal.Root open onOpenChange={onOpenChange}>
      <Modal.Content>
        <Modal.Title>Delete setting</Modal.Title>
        <div className="flex flex-col gap-lg p-lg">
          <p className="text-s text-grey-primary text-center">
            Delete setting “{group.label}” and its {relationCount} relation{relationCount === 1 ? '' : 's'}? This cannot
            be undone.
          </p>
        </div>
        <Modal.Footer>
          <Modal.FooterButton isCloseButton label="Cancel" disabled={isPending} />
          <Modal.FooterButton
            variant="destructive"
            label="Delete"
            leadingIcon="delete"
            onClick={onConfirm}
            disabled={isPending}
            isLoading={isPending}
          />
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}

function RelationSettingPanel({
  open,
  onOpenChange,
  label,
  dataModel,
  relations,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  label: string;
  dataModel: DataModel;
  relations: GraphRelation[];
}) {
  const { reloadGraph } = useTestGraphSession();
  const createMutation = useCreateGraphRelationMutation();
  const deleteMutation = useDeleteGraphRelationMutation();
  const [scope, setScope] = useState<RelationScope>('same-table');

  const form = useForm({
    defaultValues: { leftType: '', leftField: '', rightType: '', rightField: '' },
    validators: { onSubmit: relationFormSchema },
    onSubmit: ({ value, formApi }) => {
      if (!formApi.state.isValid || isDuplicateRelation(relations, label, value)) return;
      createMutation.mutate(
        { ...value, label },
        {
          onSuccess: () => {
            reloadGraph();
            formApi.setFieldValue('leftField', '');
            formApi.setFieldValue('rightField', '');
          },
        },
      );
    },
  });

  const isSelfRelation = scope === 'same-table';

  const onScopeChange = (next: RelationScope) => {
    setScope(next);
    if (next === 'same-table') {
      form.setFieldValue('rightType', form.state.values.leftType);
      form.setFieldValue('rightField', '');
    }
  };

  const onLeftTableChange = (tableName: string) => {
    form.setFieldValue('leftType', tableName);
    form.setFieldValue('leftField', '');
    if (isSelfRelation) {
      form.setFieldValue('rightType', tableName);
      form.setFieldValue('rightField', '');
    }
  };

  const onLeftFieldChange = (fieldName: string) => {
    form.setFieldValue('leftField', fieldName);
    // Same-table relations still join two (possibly different) fields; clear right so the user re-picks.
    if (isSelfRelation) {
      form.setFieldValue('rightField', '');
    }
  };

  return (
    <Panel.Root open={open} onOpenChange={onOpenChange}>
      <Panel.Container size="small">
        <Panel.Content>
          <Panel.Header>{label}</Panel.Header>
          <div className="flex min-h-0 flex-1 flex-col gap-lg overflow-y-auto p-md">
            <form
              onSubmit={handleSubmit(form)}
              className="border-grey-border flex flex-col gap-md rounded-md border p-md"
            >
              <h2 className="text-grey-primary text-sm font-semibold">Add relation</h2>
              <GraphTabSwitch value={scope} options={RELATION_SCOPE_OPTIONS} onChange={onScopeChange} />

              <form.Subscribe selector={(state) => state.values}>
                {({ leftType, leftField, rightType, rightField }) => {
                  const leftFieldOptions = semanticFields(dataModel.find((table) => table.name === leftType));
                  const selectedLeftField = leftFieldOptions.find((field) => field.name === leftField);

                  return (
                    <>
                      <TableFieldSelect
                        label="Left"
                        tables={dataModel}
                        tableName={leftType}
                        fieldName={leftField}
                        fieldOptions={leftFieldOptions}
                        onTableChange={onLeftTableChange}
                        onFieldChange={onLeftFieldChange}
                      />

                      <TableFieldSelect
                        label="Right"
                        tables={dataModel}
                        tableName={rightType}
                        fieldName={rightField}
                        fieldOptions={joinableFields(
                          dataModel.find((table) => table.name === rightType),
                          selectedLeftField,
                        )}
                        onTableChange={(name) => {
                          form.setFieldValue('rightType', name);
                          form.setFieldValue('rightField', '');
                        }}
                        onFieldChange={(name) => {
                          form.setFieldValue('rightField', name);
                        }}
                        tableDisabled={isSelfRelation}
                        disabled={!selectedLeftField}
                      />
                    </>
                  );
                }}
              </form.Subscribe>

              <form.Subscribe selector={(state) => state.values}>
                {(values) => {
                  const isComplete = relationFormSchema.safeParse(values).success;
                  const isDuplicate = isComplete && isDuplicateRelation(relations, label, values);

                  return (
                    <>
                      {isDuplicate ? (
                        <p className="text-red-primary text-xs">This relation already exists for this label.</p>
                      ) : null}
                      <div>
                        <Button
                          variant="primary"
                          type="submit"
                          disabled={!isComplete || isDuplicate || createMutation.isPending}
                        >
                          <Icon icon="plus" className="size-4" />
                          Create relation
                        </Button>
                      </div>
                    </>
                  );
                }}
              </form.Subscribe>
            </form>

            <section className="flex flex-col gap-md">
              <h2 className="text-grey-primary text-sm font-semibold">Relations</h2>
              {relations.length === 0 ? (
                <p className="text-grey-secondary text-sm">No relations yet. Add one above.</p>
              ) : (
                <ul className="flex flex-col gap-sm">
                  {relations.map((relation) => (
                    <li
                      key={relation.id}
                      className="border-grey-border flex items-center justify-between gap-md rounded-md border px-md py-sm"
                    >
                      <RelationEndpoints relation={relation} />
                      <Button
                        variant="secondary"
                        appearance="stroked"
                        mode="icon"
                        aria-label="Delete relation"
                        disabled={deleteMutation.isPending}
                        onClick={() => deleteMutation.mutate({ relationId: relation.id }, { onSuccess: reloadGraph })}
                      >
                        <Icon icon="delete" className="size-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
          <Panel.Footer>
            <Panel.FooterButton variant="secondary" label="Close" isCloseButton />
          </Panel.Footer>
        </Panel.Content>
      </Panel.Container>
    </Panel.Root>
  );
}

export function GraphRelationsSettings({ dataModel }: { dataModel: DataModel }) {
  const relationsQuery = useListGraphRelationsQuery();
  const { reloadGraph } = useTestGraphSession();
  const deleteRelationsMutation = useDeleteGraphRelationsMutation();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [panelLabel, setPanelLabel] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RelationGroup | null>(null);

  const groups = useMemo(
    () => (relationsQuery.data ? groupRelationsByLabel(relationsQuery.data) : []),
    [relationsQuery.data],
  );

  const panelRelations = useMemo(() => {
    if (!panelLabel || !relationsQuery.data) return [];
    return relationsQuery.data.filter((relation) => relation.label === panelLabel);
  }, [panelLabel, relationsQuery.data]);

  // On failure the modal stays open, so the user can retry what is left of the setting.
  const onDeleteSetting = (group: RelationGroup) => {
    deleteRelationsMutation.mutate(
      group.relations.map((relation) => relation.id),
      {
        onSuccess: () => {
          reloadGraph();
          if (panelLabel === group.label) setPanelLabel(null);
          setDeleteTarget(null);
        },
      },
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-lg overflow-y-auto">
      <section className="flex flex-col gap-md">
        <div className="flex items-center justify-between gap-md">
          <h2 className="text-grey-primary text-sm font-semibold">Configured relations</h2>
          <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
            <Icon icon="plus" className="size-4" />
            Create
          </Button>
        </div>

        {relationsQuery.isPending ? (
          <p className="text-grey-secondary text-sm">Loading relations…</p>
        ) : relationsQuery.isError ? (
          <div className="flex items-center gap-sm">
            <p className="text-grey-secondary text-sm">Failed to load relations.</p>
            <Button variant="secondary" onClick={() => relationsQuery.refetch()}>
              Retry
            </Button>
          </div>
        ) : groups.length === 0 ? (
          <p className="text-grey-secondary text-sm">No relations configured yet.</p>
        ) : (
          <div className="flex flex-col gap-md">
            {groups.map((group) => (
              <CollapsiblePaper.Container key={group.label} defaultOpen={false}>
                <CollapsiblePaper.Title size="small" iconPosition="left">
                  <span className="text-grey-primary min-w-0 flex-1 truncate text-sm font-medium">{group.label}</span>
                  <div
                    className="flex shrink-0 items-center gap-sm"
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                  >
                    <Button variant="secondary" appearance="stroked" onClick={() => setPanelLabel(group.label)}>
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      appearance="stroked"
                      mode="icon"
                      aria-label={`Delete ${group.label}`}
                      onClick={() => setDeleteTarget(group)}
                    >
                      <Icon icon="delete" className="size-4" />
                    </Button>
                  </div>
                </CollapsiblePaper.Title>
                <CollapsiblePaper.Content>
                  <ul className="divide-grey-border flex flex-col divide-y">
                    {group.relations.map((relation) => (
                      <li key={relation.id} className="py-sm first:pt-0 last:pb-0">
                        <RelationEndpoints relation={relation} />
                      </li>
                    ))}
                  </ul>
                </CollapsiblePaper.Content>
              </CollapsiblePaper.Container>
            ))}
          </div>
        )}
      </section>

      <CreateLabelModal open={createModalOpen} onOpenChange={setCreateModalOpen} onSubmitLabel={setPanelLabel} />

      {deleteTarget ? (
        <DeleteSettingModal
          group={deleteTarget}
          onOpenChange={(open) => {
            if (!open && !deleteRelationsMutation.isPending) setDeleteTarget(null);
          }}
          onConfirm={() => onDeleteSetting(deleteTarget)}
          isPending={deleteRelationsMutation.isPending}
        />
      ) : null}

      {panelLabel ? (
        <RelationSettingPanel
          key={panelLabel}
          open
          onOpenChange={(open) => {
            if (!open) setPanelLabel(null);
          }}
          label={panelLabel}
          dataModel={dataModel}
          relations={panelRelations}
        />
      ) : null}
    </div>
  );
}
