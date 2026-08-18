import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { Panel } from '@app-builder/components/Panel';
import { CollapsiblePaper } from '@app-builder/components/Paper';
import { type DataModel, type DataModelField, type TableModel } from '@app-builder/models/data-model';
import { type GraphRelation } from '@app-builder/models/graph';
import { type SemanticTypeField } from '@app-builder/models/semantic-types';
import { useCreateGraphRelationMutation } from '@app-builder/queries/graph/create-relation';
import { useDeleteGraphRelationMutation } from '@app-builder/queries/graph/delete-relation';
import { useDeleteGraphRelationsMutation } from '@app-builder/queries/graph/delete-relations';
import { useListGraphRelationsQuery } from '@app-builder/queries/graph/list-relations';
import { createGraphRelationPayloadSchema } from '@app-builder/schemas/graph';
import { getFieldErrors, handleSubmit } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { createColumnHelper, getCoreRowModel } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Modal, Table, useTable } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';
import { GraphOptionSelect } from './GraphOptionSelect';
import { GraphTabSwitch, tabSwitchOptions } from './GraphTabSwitch';
import { graphI18n } from './graph-i18n';

function fieldSemanticKey(field: DataModelField): string | null {
  if (!field.semanticType) return null;
  return `${field.semanticType}:${field.semanticSubType ?? ''}`;
}

/**
 * Semantic types that can join across type boundaries (bidirectional).
 * Exact same-type matches still use `fieldSemanticKey` (including subtype).
 */
const COMPATIBLE_SEMANTIC_TYPES: ReadonlyArray<ReadonlySet<SemanticTypeField>> = [
  new Set(['foreign_key', 'unique_id']),
];

function areSemanticTypesCompatible(left: SemanticTypeField, right: SemanticTypeField): boolean {
  if (left === right) return true;
  return COMPATIBLE_SEMANTIC_TYPES.some((group) => group.has(left) && group.has(right));
}

function areFieldsJoinable(left: DataModelField, right: DataModelField): boolean {
  const leftKey = fieldSemanticKey(left);
  const rightKey = fieldSemanticKey(right);
  if (!leftKey || !rightKey || !left.semanticType || !right.semanticType) return false;
  if (leftKey === rightKey) return true;
  // Same semantic type with a different subtype is not joinable.
  if (left.semanticType === right.semanticType) return false;
  return areSemanticTypesCompatible(left.semanticType, right.semanticType);
}

/** Fields that can anchor a relation: only those carrying a semantic type. */
function semanticFields(table: TableModel | undefined): DataModelField[] {
  return (table?.fields ?? []).filter((field) => fieldSemanticKey(field) != null);
}

/** Right-side fields that share the left field's semantic key, or a compatible semantic type. */
function joinableFields(rightTable: TableModel | undefined, leftField: DataModelField | undefined): DataModelField[] {
  if (!rightTable || !leftField) return [];
  return rightTable.fields.filter((field) => areFieldsJoinable(leftField, field));
}

/** The relations sharing one server-side group id, which is what the settings UI calls a "setting". */
type RelationGroup = { id: string; label: string; relations: GraphRelation[] };

const relationGroupColumnHelper = createColumnHelper<RelationGroup>();

function groupRelationsByGroupId(relations: GraphRelation[]): RelationGroup[] {
  const groups = new Map<string, RelationGroup>();
  for (const relation of relations) {
    const existing = groups.get(relation.groupId);
    if (existing) {
      existing.relations.push(relation);
    } else {
      groups.set(relation.groupId, { id: relation.groupId, label: relation.label, relations: [relation] });
    }
  }
  return [...groups.values()];
}

/** `relations` is already scoped to one group, so only the endpoints are compared. */
function isDuplicateRelation(
  relations: GraphRelation[],
  candidate: Pick<GraphRelation, 'leftType' | 'leftField' | 'rightType' | 'rightField'>,
): boolean {
  return relations.some(
    (relation) =>
      relation.leftType === candidate.leftType &&
      relation.leftField === candidate.leftField &&
      relation.rightType === candidate.rightType &&
      relation.rightField === candidate.rightField,
  );
}

const RELATION_SCOPE_OPTIONS = ['same-table', 'cross-table'] as const;

type RelationScope = (typeof RELATION_SCOPE_OPTIONS)[number];

const RELATION_SCOPE_KEYS = {
  'same-table': 'graph:settings.scope.same_table',
  'cross-table': 'graph:settings.scope.cross_table',
} as const satisfies Record<RelationScope, string>;

/** One panel form covering the group label and the relation being added. */
const relationFormSchema = createGraphRelationPayloadSchema
  .omit({ groupId: true })
  .extend({ label: z.string().trim().min(1) });

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
  const { t } = useTranslation(graphI18n);

  return (
    <div className="flex flex-col gap-xs">
      <span className="text-grey-secondary text-xs">{label}</span>
      <div className="flex flex-wrap gap-sm">
        <GraphOptionSelect
          className="min-w-40"
          value={tableName}
          placeholder={t('graph:settings.placeholder.table')}
          disabled={disabled || tableDisabled}
          options={tables.map((table) => ({ value: table.name, label: table.name }))}
          onChange={onTableChange}
        />
        <GraphOptionSelect
          className="min-w-40"
          value={fieldName}
          placeholder={t('graph:settings.placeholder.field')}
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
    <div className="text-grey-secondary flex min-w-0 items-center gap-xs text-sm">
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
  const { t } = useTranslation(graphI18n);
  const relationCount = group.relations.length;

  return (
    <Modal.Root open onOpenChange={onOpenChange}>
      <Modal.Content>
        <Modal.Title>{t('graph:settings.delete.title')}</Modal.Title>
        <div className="flex flex-col gap-lg p-lg">
          <p className="text-s text-grey-primary text-center">
            {t('graph:settings.delete.description', { label: group.label, count: relationCount })}
          </p>
        </div>
        <Modal.Footer>
          <Modal.FooterButton isCloseButton label={t('common:cancel')} disabled={isPending} />
          <Modal.FooterButton
            variant="destructive"
            label={t('common:delete')}
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
  groupId,
  onGroupCreated,
  onGroupEmptied,
  dataModel,
  relations,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Empty for a group that does not exist yet, where the user still has to name it. */
  label: string;
  /** `null` until the first relation is created: the API then mints the group id. */
  groupId: string | null;
  onGroupCreated: (group: { id: string; label: string }) => void;
  onGroupEmptied: () => void;
  dataModel: DataModel;
  relations: GraphRelation[];
}) {
  const { t } = useTranslation(graphI18n);
  const createMutation = useCreateGraphRelationMutation();
  const deleteMutation = useDeleteGraphRelationMutation();
  const [scope, setScope] = useState<RelationScope>('same-table');

  const form = useForm({
    defaultValues: { label, leftType: '', leftField: '', rightType: '', rightField: '' },
    validators: { onSubmit: relationFormSchema },
    onSubmit: ({ value, formApi }) => {
      if (!formApi.state.isValid || isDuplicateRelation(relations, value)) return;
      const trimmedLabel = value.label.trim();
      createMutation.mutate(
        // No group id yet means "create a new group"; the response tells us which one it became.
        { ...value, label: trimmedLabel, groupId: groupId ?? undefined },
        {
          onSuccess: (created) => {
            if (!groupId) onGroupCreated({ id: created.groupId, label: created.label });
            formApi.setFieldValue('label', trimmedLabel);
            formApi.setFieldValue('leftField', '');
            formApi.setFieldValue('rightField', '');
          },
        },
      );
    },
  });

  // The label belongs to the group, so it is frozen as soon as the group exists.
  const isLabelLocked = groupId !== null;
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
          <Panel.Header>{label || t('graph:settings.create_label.title')}</Panel.Header>
          <div className="flex min-h-0 flex-1 flex-col gap-lg overflow-y-auto p-md">
            <form onSubmit={handleSubmit(form)} className="flex flex-col gap-lg">
              <form.Field
                name="label"
                validators={{
                  onBlur: relationFormSchema.shape.label,
                  onChange: relationFormSchema.shape.label,
                }}
              >
                {(field) => (
                  <div className="flex flex-col gap-xs">
                    <FormLabel name={field.name} className="text-grey-secondary text-xs">
                      {t('graph:settings.create_label.field')}
                    </FormLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(event) => field.handleChange(event.currentTarget.value)}
                      onBlur={field.handleBlur}
                      borderColor={field.state.meta.errors.length === 0 ? 'greyfigma-90' : 'redfigma-47'}
                      placeholder={t('graph:settings.create_label.placeholder')}
                      disabled={isLabelLocked}
                      // Naming the setting is the first step of a creation, so start there.
                      autoFocus={!isLabelLocked}
                    />
                    <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                  </div>
                )}
              </form.Field>

              <div className="border-grey-border flex flex-col gap-md rounded-md border p-md">
                <h2 className="text-grey-primary text-sm font-semibold">{t('graph:settings.add_relation')}</h2>
                <GraphTabSwitch
                  value={scope}
                  options={tabSwitchOptions(RELATION_SCOPE_OPTIONS, (value) => t(RELATION_SCOPE_KEYS[value]))}
                  onChange={onScopeChange}
                />

                <form.Subscribe selector={(state) => state.values}>
                  {({ leftType, leftField, rightType, rightField }) => {
                    const leftFieldOptions = semanticFields(dataModel.find((table) => table.name === leftType));
                    const selectedLeftField = leftFieldOptions.find((field) => field.name === leftField);

                    return (
                      <>
                        <TableFieldSelect
                          label={t('graph:settings.endpoint.left')}
                          tables={dataModel}
                          tableName={leftType}
                          fieldName={leftField}
                          fieldOptions={leftFieldOptions}
                          onTableChange={onLeftTableChange}
                          onFieldChange={onLeftFieldChange}
                        />

                        <TableFieldSelect
                          label={t('graph:settings.endpoint.right')}
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
                    const isDuplicate = isComplete && isDuplicateRelation(relations, values);

                    return (
                      <>
                        {isDuplicate ? (
                          <p className="text-red-primary text-xs">{t('graph:settings.duplicate')}</p>
                        ) : null}
                        <div>
                          <Button
                            variant="primary"
                            type="submit"
                            disabled={!isComplete || isDuplicate || createMutation.isPending}
                          >
                            <Icon icon="plus" className="size-4" />
                            {t('graph:settings.create_relation')}
                          </Button>
                        </div>
                      </>
                    );
                  }}
                </form.Subscribe>
              </div>
            </form>

            <section className="flex flex-col gap-md">
              <h2 className="text-grey-primary text-sm font-semibold">{t('graph:settings.relations')}</h2>
              {relations.length === 0 ? (
                <p className="text-grey-secondary text-sm">{t('graph:settings.relations_empty')}</p>
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
                        aria-label={t('graph:settings.delete_relation')}
                        disabled={deleteMutation.isPending}
                        onClick={() =>
                          deleteMutation.mutate(
                            { relationId: relation.id },
                            {
                              // Removing the last relation removes the group itself: forget its id so
                              // the next relation starts a new group instead of a dead one.
                              onSuccess: () => {
                                if (relations.length === 1) onGroupEmptied();
                              },
                            },
                          )
                        }
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
            <Panel.FooterButton variant="secondary" label={t('common:close')} isCloseButton />
          </Panel.Footer>
        </Panel.Content>
      </Panel.Container>
    </Panel.Root>
  );
}

/**
 * The setting the panel is editing. `groupId` is `null` while a brand new group has no relation yet
 * (its label is then still empty and editable); `key` stays stable across that transition so filling
 * it in does not remount (and reset) the panel.
 */
type PanelTarget = { key: string; label: string; groupId: string | null };

const NEW_GROUP_TARGET: PanelTarget = { key: 'new-group', label: '', groupId: null };

export function GraphRelationsSettings({ dataModel }: { dataModel: DataModel }) {
  const { t } = useTranslation(graphI18n);
  const relationsQuery = useListGraphRelationsQuery();
  const deleteRelationsMutation = useDeleteGraphRelationsMutation();

  const [panelTarget, setPanelTarget] = useState<PanelTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RelationGroup | null>(null);

  const groups = useMemo(
    () => (relationsQuery.data ? groupRelationsByGroupId(relationsQuery.data) : []),
    [relationsQuery.data],
  );

  const panelRelations = useMemo(() => {
    const groupId = panelTarget?.groupId;
    if (!groupId || !relationsQuery.data) return [];
    return relationsQuery.data.filter((relation) => relation.groupId === groupId);
  }, [panelTarget?.groupId, relationsQuery.data]);

  const columns = useMemo(
    () => [
      relationGroupColumnHelper.accessor((row) => row.label, {
        id: 'label',
        header: t('graph:settings.create_label.field'),
        size: 200,
      }),
      relationGroupColumnHelper.accessor((row) => row.relations, {
        id: 'relations',
        header: t('graph:settings.relations'),
        size: 400,
        cell: ({ getValue }) => {
          const relations = getValue();
          if (relations.length === 0) return null;

          return (
            <ul className="flex flex-col gap-xs py-xs">
              {relations.map((relation) => (
                <li key={relation.id}>
                  <RelationEndpoints relation={relation} />
                </li>
              ))}
            </ul>
          );
        },
      }),
      relationGroupColumnHelper.display({
        id: 'actions',
        size: 80,
        cell: ({ cell }) => {
          const group = cell.row.original;
          const buttonClass = 'group-hover:visible invisible';
          return (
            <div className="flex gap-sm">
              <div className={buttonClass}>
                <Button
                  type="button"
                  variant="secondary"
                  appearance="stroked"
                  mode="icon"
                  aria-label={t('common:edit')}
                  onClick={() => setPanelTarget({ key: group.id, label: group.label, groupId: group.id })}
                >
                  <Icon icon="edit-square" className="size-6 shrink-0" />
                </Button>
              </div>
              <div className={buttonClass}>
                <Button
                  type="button"
                  variant="secondary"
                  appearance="stroked"
                  mode="icon"
                  aria-label={t('graph:settings.delete_group', { label: group.label })}
                  onClick={() => setDeleteTarget(group)}
                >
                  <Icon icon="delete" className="size-6 shrink-0" />
                </Button>
              </div>
            </div>
          );
        },
      }),
    ],
    [t],
  );

  const { table, getBodyProps, rows, getContainerProps } = useTable({
    data: groups,
    columns,
    getRowId: (row) => row.id,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false,
  });

  // On failure the modal stays open, so the user can retry what is left of the setting.
  const onDeleteSetting = (group: RelationGroup) => {
    deleteRelationsMutation.mutate(
      group.relations.map((relation) => relation.id),
      {
        onSuccess: () => {
          if (panelTarget?.groupId === group.id) setPanelTarget(null);
          setDeleteTarget(null);
        },
      },
    );
  };

  return (
    <>
      <CollapsiblePaper.Container>
        <CollapsiblePaper.Title>
          <span className="flex-1">{t('graph:settings.configured_relations')}</span>
          <Button
            onClick={(event) => {
              event.stopPropagation();
              setPanelTarget(NEW_GROUP_TARGET);
            }}
          >
            <Icon icon="plus" className="size-5" />
            {t('common:create')}
          </Button>
        </CollapsiblePaper.Title>
        <CollapsiblePaper.Content>
          {relationsQuery.isPending ? (
            <p className="text-grey-secondary text-sm">{t('graph:settings.loading')}</p>
          ) : relationsQuery.isError ? (
            <div className="flex items-center gap-sm">
              <p className="text-grey-secondary text-sm">{t('graph:settings.load_error')}</p>
              <Button variant="secondary" onClick={() => relationsQuery.refetch()}>
                {t('common:retry')}
              </Button>
            </div>
          ) : (
            <Table.Container {...getContainerProps()} className="max-h-96">
              <Table.Header headerGroups={table.getHeaderGroups()} />
              <Table.Body {...getBodyProps()}>
                {rows.map((row) => (
                  <Table.Row key={row.id} className="hover:bg-surface-row-hover group" row={row} />
                ))}
              </Table.Body>
            </Table.Container>
          )}
        </CollapsiblePaper.Content>
      </CollapsiblePaper.Container>

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

      {panelTarget ? (
        <RelationSettingPanel
          key={panelTarget.key}
          open
          onOpenChange={(open) => {
            if (!open) setPanelTarget(null);
          }}
          label={panelTarget.label}
          groupId={panelTarget.groupId}
          onGroupCreated={(group) =>
            setPanelTarget((current) => (current ? { ...current, groupId: group.id, label: group.label } : current))
          }
          onGroupEmptied={() => setPanelTarget((current) => (current ? { ...current, groupId: null } : current))}
          dataModel={dataModel}
          relations={panelRelations}
        />
      ) : null}
    </>
  );
}
