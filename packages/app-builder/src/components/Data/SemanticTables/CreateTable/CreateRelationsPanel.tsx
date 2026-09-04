import { CalloutV2 } from '@app-builder/components/Callout';
import {
  DatatypeIcon,
  DatatypeToPrimitiveType,
} from '@app-builder/components/Data/SemanticTables/Shared/DatatypeOption';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { CustomerGraphProvider } from '@app-builder/components/Graph/contexts/CustomerGraphProvider';
import { GraphOptionSelect } from '@app-builder/components/Graph/GraphOptionSelect';
import { Spinner } from '@app-builder/components/Spinner';
import { DataModel, DataModelField, SemanticTypeField, TableModel } from '@app-builder/models';
import { type GraphRelation } from '@app-builder/models/graph';
import { useCreateGraphRelationMutation } from '@app-builder/queries/graph/create-relation';
import { useDeleteGraphRelationMutation } from '@app-builder/queries/graph/delete-relation';
import { useDeleteGraphRelationsMutation } from '@app-builder/queries/graph/delete-relations';
import { useListGraphRelationsQuery } from '@app-builder/queries/graph/list-relations';
import { createGraphRelationPayloadSchema } from '@app-builder/schemas/graph';
import { useDataModel, useDataModelFeatureAccess } from '@app-builder/services/data/data-model';
import { getFieldErrors, handleSubmit } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { ReactFlowProvider } from '@xyflow/react';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button, Card, Input, Modal, Panel, Typo } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';
import { SampleGraph, useDefaultGraph, useRelationGraph } from './SampleGraph';

/**
 * Semantic types that can join across type boundaries (bidirectional).
 * Exact same-type matches still use `fieldSemanticKey` (including subtype).
 */
const COMPATIBLE_SEMANTIC_TYPES: ReadonlyArray<ReadonlySet<SemanticTypeField>> = [
  new Set(['foreign_key', 'unique_id']),
];

export function CreateRelationsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation(['data', 'common']);
  const { isCreateDataModelTableAvailable: canEdit } = useDataModelFeatureAccess();
  const relationsQuery = useListGraphRelationsQuery();
  const groups = useMemo(
    () => (relationsQuery.data ? groupRelationsByGroupId(relationsQuery.data) : []),
    [relationsQuery.data],
  );
  const [addAttribute, setAddAttribute] = useState(false);

  return (
    <Panel.Root
      open={open}
      onOpenChange={(state) => {
        if (!state) onClose();
      }}
    >
      <Panel.Container size="medium">
        <Panel.Content>
          <Panel.Header className="flex items-center justify-between">
            <Typo variant="title1">{t('data:create_relations.panel_title')}</Typo>
            {canEdit && !addAttribute ? (
              <Button variant="primary" appearance="stroked" onClick={() => setAddAttribute(true)}>
                {t('data:create_relations.panel_button')}
                <Icon icon="plus" className="size-4" />
              </Button>
            ) : null}
          </Panel.Header>
          {match(relationsQuery)
            .with({ isLoading: true }, () => <Spinner />)
            .with({ isError: true }, () => (
              <CalloutV2 className="text-red-primary">{t('data:create_relations.error')}</CalloutV2>
            ))
            .otherwise(() =>
              canEdit && addAttribute ? (
                <Card color="grey" className="p-md text-grey-primary">
                  <RelationGroupEdit />
                </Card>
              ) : groups.length > 0 ? (
                <div className="flex flex-col gap-md">
                  {groups.map((g) => (
                    <RelationGroupDisplay key={g.id} group={g} canEdit={canEdit} />
                  ))}
                </div>
              ) : (
                <EmptyState />
              ),
            )}
          {canEdit && addAttribute ? (
            <Panel.Footer>
              <Panel.FooterButton
                onClick={() => setAddAttribute(false)}
                variant="secondary"
                label={t('common:close')}
              />
            </Panel.Footer>
          ) : null}
        </Panel.Content>
      </Panel.Container>
    </Panel.Root>
  );
}

function EmptyState() {
  const { t } = useTranslation(['data']);
  const dataModel = useDataModel();
  const sampleGraphData = useDefaultGraph(dataModel);

  return (
    <div className="flex flex-col gap-md h-full">
      <p>{t('data:create_relations.empty_state.p1')}</p>
      <p>{t('data:create_relations.empty_state.p2')}</p>
      <CustomerGraphProvider showRiskScore showTags>
        <ReactFlowProvider>
          <div className="relative min-h-0 flex-1">
            <SampleGraph data={sampleGraphData} dataModel={dataModel} />
          </div>
        </ReactFlowProvider>
      </CustomerGraphProvider>
    </div>
  );
}

function RelationGroupDisplay({ group, canEdit }: { group: RelationGroupDisplay; canEdit: boolean }) {
  const { t } = useTranslation('graph');
  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const dataModel = useDataModel();
  const showEdit = canEdit && isEditing;

  return (
    <Card color="grey" className="p-md text-grey-primary flex flex-col gap-md">
      <div className="flex items-start gap-xs justify-between">
        <div>
          <p className="text-xs ">{t('graph:settings.create_label.field')}</p>
          <p className="text-sm font-semibold">{group.label}</p>
        </div>
        {showEdit ? (
          <Button variant="primary" appearance="stroked" mode="icon" onClick={() => setIsEditing(false)}>
            <Icon icon="x" className="size-4" />
          </Button>
        ) : (
          <div className="flex gap-xs">
            <Button variant="primary" appearance="stroked" mode="icon" onClick={() => setIsViewing(!isViewing)}>
              <Icon icon={isViewing ? 'eye-slash' : 'eye'} className="size-4" />
            </Button>
            {canEdit ? (
              <>
                <Button variant="primary" appearance="stroked" mode="icon" onClick={() => setIsEditing(true)}>
                  <Icon icon="edit-square" className="size-4" />
                </Button>
                <DeleteSettingModal group={group} />
              </>
            ) : null}
          </div>
        )}
      </div>
      <div>
        {showEdit ? (
          <RelationGroupEdit group={group} />
        ) : (
          <>
            {isViewing && <RelationPreviewGraph relations={group.relations} dataModel={dataModel} />}
            <p className="text-xs ">{t('graph:settings.create_label.related-fields')}</p>
            <div className="grid gap-sm">
              <ul className="flex flex-col gap-sm">
                {group.relations.map((relation) => (
                  <li
                    key={`${relation.groupId}-${relation.id}`}
                    className="border-grey-border flex items-center justify-between gap-md rounded-md border px-md py-sm"
                  >
                    <RelationEndpoints relation={relation} />
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

/** One panel form covering the group label and the relation being added. */
const relationFormSchema = createGraphRelationPayloadSchema
  .omit({ groupId: true })
  .extend({ label: z.string().trim().min(1) });

const emptyRelationEndpoints = { leftType: '', leftField: '', rightType: '', rightField: '' };

function RelationGroupEdit({ group }: { group?: RelationGroupDisplay }) {
  const { t } = useTranslation(['graph', 'common']);
  const isNew = group === undefined;
  const createMutation = useCreateGraphRelationMutation();
  const deleteMutation = useDeleteGraphRelationMutation();
  const dataModel = useDataModel();
  const relationsQuery = useListGraphRelationsQuery();
  const [groupId, setGroupId] = useState<string | null>(group?.id ?? null);
  const [isAdding, setIsAdding] = useState(isNew);
  const groupIdRef = useRef(groupId);
  groupIdRef.current = groupId;

  const relations = useMemo(() => {
    if (!groupId) return [];
    const all = relationsQuery.data ?? group?.relations ?? [];
    return all.filter((relation) => relation.groupId === groupId);
  }, [groupId, relationsQuery.data, group?.relations]);
  const relationsRef = useRef(relations);
  relationsRef.current = relations;

  const form = useForm({
    defaultValues: { label: group?.label ?? '', ...emptyRelationEndpoints },
    validators: { onSubmit: relationFormSchema },
    onSubmit: ({ value, formApi }) => {
      if (!formApi.state.isValid || isDuplicateRelation(relationsRef.current, value)) return;
      const trimmedLabel = value.label.trim();
      createMutation.mutate(
        { ...value, label: trimmedLabel, groupId: groupIdRef.current ?? undefined },
        {
          onSuccess: (created) => {
            setGroupId(created.groupId);
            formApi.setFieldValue('label', trimmedLabel);
            formApi.setFieldValue('leftType', '');
            formApi.setFieldValue('leftField', '');
            formApi.setFieldValue('rightType', '');
            formApi.setFieldValue('rightField', '');
            setIsAdding(false);
          },
        },
      );
    },
  });

  const clearEndpoints = () => {
    form.setFieldValue('leftType', '');
    form.setFieldValue('leftField', '');
    form.setFieldValue('rightType', '');
    form.setFieldValue('rightField', '');
  };

  const discardDraft = () => {
    clearEndpoints();
    setIsAdding(false);
  };

  const isLabelLocked = groupId !== null;

  return (
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
            <label htmlFor={field.name} className="text-grey-secondary text-xs">
              {t('graph:settings.create_label.field')}
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onChange={(event) => field.handleChange(event.currentTarget.value)}
                onBlur={field.handleBlur}
                borderColor={field.state.meta.errors.length === 0 ? 'greyfigma-90' : 'redfigma-47'}
                placeholder={t('graph:settings.create_label.placeholder')}
                disabled={isLabelLocked}
                autoFocus={!isLabelLocked}
              />
            </label>
            <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
          </div>
        )}
      </form.Field>

      <section className="flex flex-col gap-md">
        <div className="flex items-center justify-between gap-sm">
          <h2 className="text-grey-primary text-sm font-semibold">{t('graph:settings.relations')}</h2>
          <Button
            variant="primary"
            appearance="stroked"
            mode="icon"
            aria-label={t('graph:settings.add_relation')}
            disabled={isAdding}
            onClick={() => setIsAdding(true)}
          >
            <Icon icon="plus" className="size-4" />
          </Button>
        </div>

        {relations.length === 0 && !isAdding ? (
          <p className="text-grey-secondary text-sm">{t('graph:settings.relations_empty')}</p>
        ) : (
          <ul className="flex flex-col gap-sm">
            {relations.map((relation) => (
              <li key={relation.id} className="flex items-center justify-between gap-md">
                <div className="border-grey-border  rounded-md border px-md py-sm flex-1">
                  <RelationEndpoints relation={relation} />
                </div>
                <Button
                  variant="secondary"
                  appearance="stroked"
                  mode="icon"
                  aria-label={t('graph:settings.delete_relation')}
                  disabled={deleteMutation.isPending}
                  onClick={() => {
                    const isLast = relations.length === 1;
                    deleteMutation.mutate(
                      { relationId: relation.id },
                      {
                        onSuccess: () => {
                          if (isNew && isLast) {
                            setGroupId(null);
                            setIsAdding(true);
                          }
                        },
                      },
                    );
                  }}
                >
                  <Icon icon="x" className="size-4" />
                </Button>
              </li>
            ))}
            {isAdding ? (
              <li className="border-grey-border flex flex-col gap-md rounded-md border p-md">
                <h2 className="text-grey-primary text-sm font-semibold">{t('graph:settings.add_relation')}</h2>
                <form.Subscribe selector={(state) => state.values}>
                  {(values) => {
                    const { leftType, leftField, rightType, rightField } = values;
                    const leftFieldOptions = semanticFields(dataModel.find((table) => table.name === leftType));
                    const selectedLeftField = leftFieldOptions.find((field) => field.name === leftField);
                    const isComplete = relationFormSchema.safeParse(values).success;
                    const isDuplicate = isComplete && isDuplicateRelation(relations, values);

                    return (
                      <>
                        {isDuplicate ? (
                          <p className="text-red-primary text-xs">{t('graph:settings.duplicate')}</p>
                        ) : null}
                        <div className="flex flex-wrap items-end gap-sm">
                          <div className="flex min-w-0 flex-1 flex-wrap gap-sm">
                            <TableFieldSelect
                              label={t('graph:settings.endpoint.left')}
                              tables={dataModel}
                              tableName={leftType}
                              fieldName={leftField}
                              fieldOptions={leftFieldOptions}
                              onTableChange={(name) => {
                                form.setFieldValue('leftType', name);
                                form.setFieldValue('leftField', '');
                              }}
                              onFieldChange={(name) => {
                                form.setFieldValue('leftField', name);
                                form.setFieldValue('rightField', '');
                              }}
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
                              disabled={!selectedLeftField}
                            />
                          </div>
                          <div className="flex shrink-0 gap-xs">
                            <Button
                              variant="secondary"
                              appearance="stroked"
                              mode="icon"
                              aria-label={t('common:cancel')}
                              disabled={createMutation.isPending}
                              onClick={discardDraft}
                            >
                              <Icon icon="x" className="size-4" />
                            </Button>
                            <Button
                              variant="primary"
                              mode="icon"
                              type="submit"
                              aria-label={t('graph:settings.create_relation')}
                              disabled={!isComplete || isDuplicate || createMutation.isPending}
                            >
                              <Icon icon="tick" className="size-4" />
                            </Button>
                          </div>
                        </div>
                      </>
                    );
                  }}
                </form.Subscribe>
              </li>
            ) : null}
          </ul>
        )}
        <RelationPreviewGraph relations={relations} dataModel={dataModel} />
      </section>
    </form>
  );
}

function RelationPreviewGraph({ relations, dataModel }: { relations: GraphRelation[]; dataModel: DataModel }) {
  const data = useRelationGraph(dataModel, relations);
  if (relations.length === 0) return null;

  return (
    <div
      className="relative h-[calc(7.5rem*var(--number-of-relations))]"
      style={{ '--number-of-relations': relations.length } as React.CSSProperties}
    >
      <CustomerGraphProvider showRiskScore showTags>
        <ReactFlowProvider>
          <div className="h-full min-h-0 w-full">
            <SampleGraph data={data} dataModel={dataModel} />
          </div>
        </ReactFlowProvider>
      </CustomerGraphProvider>
    </div>
  );
}

function DeleteSettingModal({ group }: { group: RelationGroupDisplay }) {
  const { t } = useTranslation(['graph', 'common']);
  const relationCount = group.relations.length;
  const deleteRelationsMutation = useDeleteGraphRelationsMutation();

  const onDeleteSetting = () => {
    deleteRelationsMutation.mutate(group.relations.map((relation) => relation.id));
  };

  return (
    <Modal.Root>
      <Modal.Trigger asChild>
        <Button variant="destructive" appearance="stroked" mode="icon">
          <Icon icon="delete" className="size-4" />
        </Button>
      </Modal.Trigger>
      <Modal.Content>
        <Modal.Title>{t('graph:settings.delete.title')}</Modal.Title>
        <div className="flex flex-col gap-lg p-lg">
          <p className="text-s text-grey-primary text-center">
            {t('graph:settings.delete.description', { label: group.label, count: relationCount })}
          </p>
        </div>
        <Modal.Footer>
          <Modal.FooterButton isCloseButton label={t('common:cancel')} disabled={deleteRelationsMutation.isPending} />
          <Modal.FooterButton
            variant="destructive"
            label={t('common:delete')}
            leadingIcon="delete"
            onClick={onDeleteSetting}
            disabled={deleteRelationsMutation.isPending}
          />
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}

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
  const { t } = useTranslation('graph');

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
          options={fieldOptions.map((field) => ({
            value: field.name,
            label: field.alias || field.name,
            dataType: field.dataType,
            semanticType: field.semanticType,
          }))}
          onChange={onFieldChange}
        />
      </div>
    </div>
  );
}

function RelationEndpoints({ relation }: { relation: GraphRelation }) {
  const dataModel = useDataModel();

  return (
    <div className="text-grey-secondary flex min-w-0 items-center gap-xs text-sm">
      <EndpointLabel dataModel={dataModel} tableName={relation.leftType} fieldName={relation.leftField} />
      <Icon icon="arrow-forward" className="size-4 shrink-0 text-purple-primary" />
      <EndpointLabel dataModel={dataModel} tableName={relation.rightType} fieldName={relation.rightField} />
    </div>
  );
}

function EndpointLabel({
  dataModel,
  tableName,
  fieldName,
}: {
  dataModel: DataModel;
  tableName: string;
  fieldName: string;
}) {
  const field = dataModel.find((table) => table.name === tableName)?.fields.find((f) => f.name === fieldName);

  return (
    <span className="flex min-w-0 items-center gap-xs">
      <span className="truncate">{tableName}.</span>
      <span className="flex items-center gap-xs bg-surface-card p-2xs rounded-xs border border-grey-border">
        {field ? <DatatypeIcon dataType={DatatypeToPrimitiveType(field.dataType)} size="small" /> : null}
        <span className="truncate">{fieldName}</span>
      </span>
    </span>
  );
}

function fieldSemanticKey(field: DataModelField): string | null {
  if (!field.semanticType) return null;
  return `${field.semanticType}:${field.semanticSubType ?? ''}`;
}

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
  if (left.semanticType === right.semanticType && left.semanticSubType !== right.semanticSubType) return false;
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
type RelationGroupDisplay = { id: string; label: string; relations: GraphRelation[] };

function groupRelationsByGroupId(relations: GraphRelation[]): RelationGroupDisplay[] {
  const groups = new Map<string, RelationGroupDisplay>();
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
