import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { type DataModel, type DataModelField, type TableModel } from '@app-builder/models/data-model';
import { useCreateGraphRelationMutation } from '@app-builder/queries/graph/create-relation';
import { useDeleteGraphRelationMutation } from '@app-builder/queries/graph/delete-relation';
import { useListGraphRelationsQuery } from '@app-builder/queries/graph/list-relations';
import { createGraphRelationPayloadSchema } from '@app-builder/schemas/graph';
import { getFieldErrors, handleSubmit } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { Button, Input } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { GraphOptionSelect } from './GraphOptionSelect';
import { GraphTabSwitch } from './GraphTabSwitch';

function fieldSemanticKey(field: DataModelField): string | null {
  if (!field.semanticType) return null;
  return `${field.semanticType}:${field.semanticSubType ?? ''}`;
}

function defaultLabelForField(field: DataModelField): string {
  return field.semanticSubType || field.semanticType || field.name;
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

const RELATION_SCOPE_OPTIONS = [
  { value: 'same-table', label: 'Same table' },
  { value: 'cross-table', label: 'Cross table' },
] as const;

type RelationScope = (typeof RELATION_SCOPE_OPTIONS)[number]['value'];

function TableFieldSelect({
  label,
  tables,
  tableName,
  fieldName,
  onTableChange,
  onFieldChange,
  fieldOptions,
  disabled,
}: {
  label: string;
  tables: TableModel[];
  tableName: string;
  fieldName: string;
  onTableChange: (tableName: string) => void;
  onFieldChange: (fieldName: string) => void;
  fieldOptions: DataModelField[];
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-xs">
      <span className="text-grey-secondary text-xs">{label}</span>
      <div className="flex flex-wrap gap-sm">
        <GraphOptionSelect
          className="min-w-40"
          value={tableName}
          placeholder="Table"
          disabled={disabled}
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

export function GraphRelationsSettings({ dataModel }: { dataModel: DataModel }) {
  const relationsQuery = useListGraphRelationsQuery();
  const createMutation = useCreateGraphRelationMutation();
  const deleteMutation = useDeleteGraphRelationMutation();

  const [scope, setScope] = useState<RelationScope>('same-table');
  // Once the user edits the label we stop deriving it from the selected field.
  const [labelTouched, setLabelTouched] = useState(false);

  const form = useForm({
    defaultValues: { label: '', leftType: '', leftField: '', rightType: '', rightField: '' },
    validators: { onSubmit: createGraphRelationPayloadSchema },
    onSubmit: ({ value, formApi }) => {
      if (!formApi.state.isValid) return;
      createMutation.mutateAsync(value).then(() => {
        // Keep the selected tables so several relations can be added in a row.
        formApi.setFieldValue('label', '');
        formApi.setFieldValue('leftField', '');
        formApi.setFieldValue('rightField', '');
        setLabelTouched(false);
      });
    },
  });

  const isSelfRelation = scope === 'same-table';

  const onScopeChange = (next: RelationScope) => {
    setScope(next);
    if (next === 'same-table') {
      form.setFieldValue('rightType', form.state.values.leftType);
      form.setFieldValue('rightField', form.state.values.leftField);
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

  const onLeftFieldChange = (fieldName: string, field: DataModelField | undefined) => {
    form.setFieldValue('leftField', fieldName);
    if (!labelTouched && field) {
      form.setFieldValue('label', defaultLabelForField(field));
    }
    if (isSelfRelation) {
      form.setFieldValue('rightField', fieldName);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-lg overflow-y-auto p-md">
      <section className="flex flex-col gap-md">
        <h2 className="text-grey-primary text-sm font-semibold">Configured relations</h2>
        {relationsQuery.isPending ? (
          <p className="text-grey-secondary text-sm">Loading relations…</p>
        ) : relationsQuery.isError ? (
          <div className="flex items-center gap-sm">
            <p className="text-grey-secondary text-sm">Failed to load relations.</p>
            <Button variant="secondary" onClick={() => relationsQuery.refetch()}>
              Retry
            </Button>
          </div>
        ) : relationsQuery.data.length === 0 ? (
          <p className="text-grey-secondary text-sm">No relations configured yet.</p>
        ) : (
          <ul className="border-grey-border divide-grey-border flex flex-col divide-y rounded-md border">
            {relationsQuery.data.map((relation) => (
              <li key={relation.id} className="flex items-center justify-between gap-md px-md py-sm">
                <div className="min-w-0">
                  <div className="text-grey-primary truncate text-sm font-medium">{relation.label}</div>
                  <div className="text-grey-secondary text-xs">
                    {relation.leftType}.{relation.leftField}
                    {' ↔ '}
                    {relation.rightType}.{relation.rightField}
                  </div>
                </div>
                <Button
                  variant="secondary"
                  appearance="stroked"
                  mode="icon"
                  aria-label={`Delete ${relation.label}`}
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate({ relationId: relation.id })}
                >
                  <Icon icon="delete" className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <form onSubmit={handleSubmit(form)} className="border-grey-border flex flex-col gap-md rounded-md border p-md">
        <h2 className="text-grey-primary text-sm font-semibold">Create relation</h2>

        <GraphTabSwitch value={scope} options={RELATION_SCOPE_OPTIONS} onChange={onScopeChange} />

        <form.Field
          name="label"
          validators={{
            onBlur: createGraphRelationPayloadSchema.shape.label,
            onChange: createGraphRelationPayloadSchema.shape.label,
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
                onChange={(event) => {
                  setLabelTouched(true);
                  field.handleChange(event.currentTarget.value);
                }}
                onBlur={field.handleBlur}
                borderColor={field.state.meta.errors.length === 0 ? 'greyfigma-90' : 'redfigma-47'}
                placeholder="e.g. iban"
              />
              <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
            </div>
          )}
        </form.Field>

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
                  onFieldChange={(name) =>
                    onLeftFieldChange(
                      name,
                      leftFieldOptions.find((field) => field.name === name),
                    )
                  }
                />

                {isSelfRelation ? null : (
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
                    onFieldChange={(name) => form.setFieldValue('rightField', name)}
                    disabled={!selectedLeftField}
                  />
                )}
              </>
            );
          }}
        </form.Subscribe>

        <form.Subscribe
          selector={(state) => [createGraphRelationPayloadSchema.safeParse(state.values).success, state.isSubmitting]}
        >
          {([isComplete, isSubmitting]) => (
            <div>
              <Button
                variant="primary"
                type="submit"
                disabled={!isComplete || isSubmitting || createMutation.isPending}
              >
                <Icon icon="plus" className="size-4" />
                Create relation
              </Button>
            </div>
          )}
        </form.Subscribe>
      </form>
    </div>
  );
}
