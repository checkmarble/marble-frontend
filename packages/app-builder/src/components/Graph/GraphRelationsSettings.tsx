import { type DataModel, type DataModelField, type TableModel } from '@app-builder/models/data-model';
import { useCreateGraphRelationMutation } from '@app-builder/queries/graph/create-relation';
import { useDeleteGraphRelationMutation } from '@app-builder/queries/graph/delete-relation';
import { useListGraphRelationsQuery } from '@app-builder/queries/graph/list-relations';
import { useEffect, useMemo, useState } from 'react';
import { Button, cn, Input, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

function fieldSemanticKey(field: DataModelField): string | null {
  if (!field.semanticType) return null;
  return `${field.semanticType}:${field.semanticSubType ?? ''}`;
}

function defaultLabelForField(field: DataModelField): string {
  return field.semanticSubType || field.semanticType || field.name;
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
  const [tableOpen, setTableOpen] = useState(false);
  const [fieldOpen, setFieldOpen] = useState(false);

  return (
    <div className="flex flex-col gap-xs">
      <span className="text-grey-secondary text-xs">{label}</span>
      <div className="flex flex-wrap gap-sm">
        <MenuCommand.Menu open={tableOpen} onOpenChange={setTableOpen}>
          <MenuCommand.Trigger>
            <MenuCommand.SelectButton className="min-w-40" disabled={disabled}>
              {tableName || 'Table'}
            </MenuCommand.SelectButton>
          </MenuCommand.Trigger>
          <MenuCommand.Content sameWidth>
            <MenuCommand.List>
              {tables.map((table) => (
                <MenuCommand.Item
                  key={table.id}
                  value={table.name}
                  onSelect={() => {
                    onTableChange(table.name);
                    setTableOpen(false);
                  }}
                >
                  {table.name}
                </MenuCommand.Item>
              ))}
            </MenuCommand.List>
          </MenuCommand.Content>
        </MenuCommand.Menu>

        <MenuCommand.Menu open={fieldOpen} onOpenChange={setFieldOpen}>
          <MenuCommand.Trigger>
            <MenuCommand.SelectButton className="min-w-40" disabled={disabled || !tableName}>
              {fieldName || 'Field'}
            </MenuCommand.SelectButton>
          </MenuCommand.Trigger>
          <MenuCommand.Content sameWidth>
            <MenuCommand.List>
              {fieldOptions.map((field) => (
                <MenuCommand.Item
                  key={field.id}
                  value={field.name}
                  onSelect={() => {
                    onFieldChange(field.name);
                    setFieldOpen(false);
                  }}
                >
                  {field.alias || field.name}
                </MenuCommand.Item>
              ))}
            </MenuCommand.List>
          </MenuCommand.Content>
        </MenuCommand.Menu>
      </div>
    </div>
  );
}

export function GraphRelationsSettings({ dataModel }: { dataModel: DataModel }) {
  const relationsQuery = useListGraphRelationsQuery();
  const createMutation = useCreateGraphRelationMutation();
  const deleteMutation = useDeleteGraphRelationMutation();

  const [selfRelation, setSelfRelation] = useState(true);
  const [label, setLabel] = useState('');
  const [labelTouched, setLabelTouched] = useState(false);
  const [leftType, setLeftType] = useState('');
  const [leftField, setLeftField] = useState('');
  const [rightType, setRightType] = useState('');
  const [rightField, setRightField] = useState('');

  const leftTable = useMemo(() => dataModel.find((table) => table.name === leftType), [dataModel, leftType]);
  const rightTable = useMemo(() => dataModel.find((table) => table.name === rightType), [dataModel, rightType]);

  const leftFieldOptions = useMemo(
    () => (leftTable?.fields ?? []).filter((field) => fieldSemanticKey(field) != null),
    [leftTable],
  );

  const selectedLeftField = useMemo(
    () => leftFieldOptions.find((field) => field.name === leftField),
    [leftField, leftFieldOptions],
  );

  const rightFieldOptions = useMemo(() => {
    if (!rightTable || !selectedLeftField) return [];
    const leftKey = fieldSemanticKey(selectedLeftField);
    if (!leftKey) return [];
    return rightTable.fields.filter((field) => fieldSemanticKey(field) === leftKey);
  }, [rightTable, selectedLeftField]);

  useEffect(() => {
    if (labelTouched || !selectedLeftField) return;
    setLabel(defaultLabelForField(selectedLeftField));
  }, [labelTouched, selectedLeftField]);

  useEffect(() => {
    if (!selfRelation) return;
    setRightType(leftType);
    setRightField(leftField);
  }, [selfRelation, leftType, leftField]);

  const canSubmit =
    label.trim().length > 0 && leftType && leftField && rightType && rightField && !createMutation.isPending;

  const onCreate = () => {
    if (!canSubmit) return;
    createMutation.mutate(
      {
        label: label.trim(),
        leftType,
        leftField,
        rightType: selfRelation ? leftType : rightType,
        rightField: selfRelation ? leftField : rightField,
      },
      {
        onSuccess: () => {
          setLabelTouched(false);
          setLeftField('');
          setRightField('');
        },
      },
    );
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

      <section className="border-grey-border flex flex-col gap-md rounded-md border p-md">
        <h2 className="text-grey-primary text-sm font-semibold">Create relation</h2>

        <div className="flex flex-wrap items-center gap-md">
          <button
            type="button"
            className={cn(
              'rounded-sm border px-sm py-xs text-sm',
              selfRelation
                ? 'border-purple-border bg-purple-background-light text-purple-primary'
                : 'border-grey-border text-grey-secondary',
            )}
            onClick={() => setSelfRelation(true)}
          >
            Same table
          </button>
          <button
            type="button"
            className={cn(
              'rounded-sm border px-sm py-xs text-sm',
              !selfRelation
                ? 'border-purple-border bg-purple-background-light text-purple-primary'
                : 'border-grey-border text-grey-secondary',
            )}
            onClick={() => setSelfRelation(false)}
          >
            Cross table
          </button>
        </div>

        <div className="flex flex-col gap-xs">
          <label htmlFor="relation-label" className="text-grey-secondary text-xs">
            Label
          </label>
          <Input
            id="relation-label"
            value={label}
            onChange={(event) => {
              setLabelTouched(true);
              setLabel(event.target.value);
            }}
            placeholder="e.g. iban"
          />
        </div>

        <TableFieldSelect
          label="Left"
          tables={dataModel}
          tableName={leftType}
          fieldName={leftField}
          fieldOptions={leftFieldOptions}
          onTableChange={(name) => {
            setLeftType(name);
            setLeftField('');
          }}
          onFieldChange={setLeftField}
        />

        {!selfRelation ? (
          <TableFieldSelect
            label="Right"
            tables={dataModel}
            tableName={rightType}
            fieldName={rightField}
            fieldOptions={rightFieldOptions}
            onTableChange={(name) => {
              setRightType(name);
              setRightField('');
            }}
            onFieldChange={setRightField}
            disabled={!selectedLeftField}
          />
        ) : null}

        {createMutation.isError ? <p className="text-red-primary text-xs">Failed to create relation.</p> : null}

        <div>
          <Button variant="primary" disabled={!canSubmit} onClick={onCreate}>
            <Icon icon="plus" className="size-4" />
            Create relation
          </Button>
        </div>
      </section>
    </div>
  );
}
