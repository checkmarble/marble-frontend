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
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';
import { GraphOptionSelect } from './GraphOptionSelect';
import { useGraphSession } from './GraphSessionContext';
import { GraphTabSwitch } from './GraphTabSwitch';
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

const RELATION_SCOPE_OPTIONS = ['same-table', 'cross-table'] as const;

type RelationScope = (typeof RELATION_SCOPE_OPTIONS)[number];

const RELATION_SCOPE_KEYS = {
  'same-table': 'graph:settings.scope.same_table',
  'cross-table': 'graph:settings.scope.cross_table',
} as const satisfies Record<RelationScope, string>;

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
  const { t } = useTranslation(graphI18n);
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
          <Modal.Title>{t('graph:settings.create_label.title')}</Modal.Title>
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
                  />
                  <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                </div>
              )}
            </form.Field>
          </div>
          <Modal.Footer>
            <Modal.FooterButton isCloseButton label={t('common:cancel')} />
            <form.Subscribe selector={(state) => createLabelSchema.safeParse(state.values).success}>
              {(isValid) => (
                <Modal.FooterButton
                  type="submit"
                  variant="primary"
                  label={t('graph:settings.create_label.continue')}
                  disabled={!isValid}
                />
              )}
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
  dataModel,
  relations,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  label: string;
  dataModel: DataModel;
  relations: GraphRelation[];
}) {
  const { t } = useTranslation(graphI18n);
  const { reloadGraph } = useGraphSession();
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
              <h2 className="text-grey-primary text-sm font-semibold">{t('graph:settings.add_relation')}</h2>
              <GraphTabSwitch
                value={scope}
                options={RELATION_SCOPE_OPTIONS.map((value) => ({
                  value,
                  label: t(RELATION_SCOPE_KEYS[value]),
                }))}
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
                  const isDuplicate = isComplete && isDuplicateRelation(relations, label, values);

                  return (
                    <>
                      {isDuplicate ? <p className="text-red-primary text-xs">{t('graph:settings.duplicate')}</p> : null}
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
            <Panel.FooterButton variant="secondary" label={t('common:close')} isCloseButton />
          </Panel.Footer>
        </Panel.Content>
      </Panel.Container>
    </Panel.Root>
  );
}

export function GraphRelationsSettings({ dataModel }: { dataModel: DataModel }) {
  const { t } = useTranslation(graphI18n);
  const relationsQuery = useListGraphRelationsQuery();
  const { reloadGraph } = useGraphSession();
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
          <h2 className="text-grey-primary text-sm font-semibold">{t('graph:settings.configured_relations')}</h2>
          <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
            <Icon icon="plus" className="size-4" />
            {t('common:create')}
          </Button>
        </div>

        {relationsQuery.isPending ? (
          <p className="text-grey-secondary text-sm">{t('graph:settings.loading')}</p>
        ) : relationsQuery.isError ? (
          <div className="flex items-center gap-sm">
            <p className="text-grey-secondary text-sm">{t('graph:settings.load_error')}</p>
            <Button variant="secondary" onClick={() => relationsQuery.refetch()}>
              {t('common:retry')}
            </Button>
          </div>
        ) : groups.length === 0 ? (
          <p className="text-grey-secondary text-sm">{t('graph:settings.empty')}</p>
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
                      {t('common:edit')}
                    </Button>
                    <Button
                      variant="destructive"
                      appearance="stroked"
                      mode="icon"
                      aria-label={t('graph:settings.delete_group', { label: group.label })}
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
